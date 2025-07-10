import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // useLocation, useParams 추가
import { useUser } from "../context/UserContext";
import { generateImageUrl } from "../utils/imageUrl";
import defaultProfileImg from "../assets/images/default-profile.svg";
import imageUploadIcon from "../assets/images/upload-file.png";
import removeIcon from "../assets/images/x.png";
import "../styles/PostUploadPage.css";

const PostUploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // location 훅으로 state 데이터 접근
  const { postId } = useParams(); // URL 파라미터에서 postId 가져오기

  // 수정 모드인지, 새로 작성하는 모드인지 확인
  const isEditMode = !!postId;
  const postToEdit = location.state?.postToEdit;

  // useUser()가 로딩 상태를 포함하도록 수정했다고 가정합니다.
  const { user, isLoading } = useUser(); // ◀◀ isLoading 상태 추가
  const fileInputRef = useRef(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // 수정 모드일 경우, 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && postToEdit) {
      setContent(postToEdit.content);
      if (postToEdit.image) {
        const imageUrls = postToEdit.image
          .split(",")
          .map((img) => generateImageUrl(img));
        setImagePreviews(imageUrls);
      }
    }
  }, [isEditMode, postToEdit]);

  // 사용자 정보가 없으면 로그인 페이지로 리디렉션
  useEffect(() => {
    // 로딩이 끝났는데도 user 정보가 없으면 로그인 페이지로 이동
    if (!isLoading && !user) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [user, isLoading, navigate]); // ◀◀ 의존성 배열에 isLoading 추가

  // 1. 폼 유효성 검사 (내용 또는 이미지가 있으면 업로드 버튼 활성화)
  useEffect(() => {
    setIsFormValid(content.trim().length > 0 || images.length > 0);
  }, [content, images]);

  // 2. 이미지 선택 핸들러 (최대 3장)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("이미지는 최대 3장까지 업로드할 수 있습니다.");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 3. 이미지 미리보기에서 특정 이미지 제거
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 이미지 업로드 로직을 별도 함수로 분리
  const uploadImages = async (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("image", file);
    });

    try {
      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/image/uploadfiles",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "이미지 업로드에 실패했습니다.");
      }

      const data = await res.json();
      console.log("서버 응답 데이터:", data); // 이 부분을 추가하여 실제 응답을 확인하세요.

      // 실제 서버 응답 형식(data.info)을 먼저 확인하도록 수정
      if (data && Array.isArray(data.info)) {
        return data.info.map((item) => item.filename).join(",");
      }
      if (Array.isArray(data)) {
        return data.map((item) => item.filename).join(",");
      }
      if (data && data.filename) {
        return data.filename;
      }
      throw new Error("이미지 업로드 응답 형식이 올바르지 않습니다.");
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      // 오류를 다시 던져서 handleSubmit에서 처리하도록 함
      throw error;
    }
  };

  // 4. 폼 제출 핸들러 (수정/생성 분기 처리)
  const handleSubmit = async () => {
    if (!isFormValid) return;

    // isEditMode가 true이면 수정 API를, false이면 생성 API를 호출
    if (isEditMode) {
      await handleUpdatePost();
    } else {
      await handleCreatePost();
    }
  };

  // 기존 게시글 생성 로직
  const handleCreatePost = async () => {
    const token = localStorage.getItem("token");
    let uploadedImageNames = "";
    try {
      if (images.length > 0) {
        uploadedImageNames = await uploadImages(images);
      }
      const postData = {
        post: {
          content: content,
          image: uploadedImageNames,
        },
      };

      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/post",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      const data = await res.json();
      if (res.ok && data.post) {
        navigate(`/profile/${user.accountname}`);
      } else {
        throw new Error(data.message || "게시글 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert(error.message);
    }
  };

  // 새로운 게시글 수정 로직
  const handleUpdatePost = async () => {
    const token = localStorage.getItem("token");
    // 참고: 이 예제에서는 텍스트만 수정합니다. 이미지 수정은 더 복잡한 로직이 필요합니다.
    const postData = {
      post: {
        content: content,
        image: postToEdit.image, // 이미지는 기존 값 그대로 사용
      },
    };

    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}`,
        {
          method: "PUT", // 수정은 PUT 메소드 사용
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("게시글이 수정되었습니다.");
        navigate(`/post/${data.post.id}`); // 수정된 게시글 상세 페이지로 이동
      } else {
        throw new Error(data.message || "게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert(error.message);
    }
  };

  const handleImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  // 로딩 중이거나, 로딩이 끝났는데 유저가 없으면 UI를 렌더링하지 않음
  if (isLoading || !user) {
    return <div>로딩 중...</div>; // 또는 null을 반환
  }

  return (
    <div className="post-upload-container">
      <header className="post-upload-header">
        <button onClick={() => navigate(-1)} className="back-button" />
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="upload-button"
        >
          업로드
        </button>
      </header>
      <main className="post-upload-main">
        <img
          src={generateImageUrl(user.image)}
          onError={handleImgError}
          alt="내 프로필"
          className="my-profile-image"
          crossOrigin="anonymous" // CORS 처리를 위한 속성 추가
        />
        <div className="post-form-area">
          <textarea
            placeholder="게시글 입력하기..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-textarea"
          />
          <div className="image-preview-container">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt="미리보기" className="preview-image" />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="remove-image-button"
                >
                  <img src={removeIcon} alt="삭제" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="image-upload-fab"
      >
        <img src={imageUploadIcon} alt="이미지 업로드" />
      </button>
    </div>
  );
};

export default PostUploadPage;
