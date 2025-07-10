import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { generateImageUrl } from "../utils/imageUrl";
import defaultProfileImg from "../assets/images/default-profile.svg";
import imageUploadIcon from "../assets/images/upload-file.png";
import removeIcon from "../assets/images/x.png";
import "../styles/PostUploadPage.css";

const PostUploadPage = () => {
  const navigate = useNavigate();
  // useUser()가 null을 반환하더라도 || {} 덕분에 에러가 나지 않습니다.
  const { user } = useUser() || {};
  const fileInputRef = useRef(null);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // File 객체 배열
  const [imagePreviews, setImagePreviews] = useState([]); // 미리보기 URL 배열
  const [isFormValid, setIsFormValid] = useState(false);

  // 사용자 정보가 없으면 로그인 페이지로 리디렉션하는 로직 추가
  useEffect(() => {
    // user 객체가 아직 로드되지 않았을 수 있으므로 확인합니다.
    if (!user) {
      // useUser Context의 초기 상태가 null일 수 있으므로,
      // 로딩이 완료될 때까지 기다리거나, 즉시 리디렉션 할 수 있습니다.
      // 여기서는 user가 없으면 로그인하지 않은 것으로 간주합니다.
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login"); // 로그인 페이지 경로가 다를 경우 수정해주세요.
    }
  }, [user, navigate]);

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

  // 4. 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!isFormValid) return;

    let uploadedImageNames = "";
    const token = localStorage.getItem("token");

    // Step 1: 이미지가 있으면 서버에 업로드
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("image", image);
      });

      // 이미지 업로드 로직 부분 수정
      try {
        const res = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfiles",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        console.log("이미지 업로드 응답:", data); // 응답 구조 확인용

        // 단일 이미지와 다중 이미지를 모두 처리
        if (Array.isArray(data)) {
          // 여러 이미지일 경우 (배열)
          uploadedImageNames = data.map((item) => item.filename).join(",");
        } else if (data && typeof data === "object" && data.filename) {
          // 단일 이미지일 경우 (객체)
          uploadedImageNames = data.filename;
        } else {
          console.error("알 수 없는 응답 형식:", data);
          alert("이미지 업로드 응답 형식이 올바르지 않습니다.");
          return;
        }
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    // Step 2: 게시글 데이터 전송
    const postData = {
      post: {
        content: content,
        image: uploadedImageNames,
      },
    };

    try {
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
      if (data.post) {
        navigate(`/profile/${user.accountname}`);
      } else {
        alert(data.message || "게시글 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 업로드 실패:", error);
    }
  };

  const handleImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  // user 데이터가 로드되기 전에는 UI 렌더링을 시도하지 않습니다.
  if (!user) {
    return null; // 또는 로딩 스피너 컴포넌트를 보여줄 수 있습니다.
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
