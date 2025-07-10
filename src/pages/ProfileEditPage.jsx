import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageUrl } from "../utils/imageUrl";
import uploadIcon from "../assets/images/upload-file.png";
import { useUser } from "../context/UserContext";
import "../styles/ProfileEditPage.css";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { updateUserProfile } = useUser();

  const [image, setImage] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [username, setUsername] = useState("");
  const [accountname, setAccountname] = useState("");
  const [intro, setIntro] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [accountnameError, setAccountnameError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // 1. 초기 프로필 데이터 불러오기
  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = localStorage.getItem("token");
      const myAccountname = localStorage.getItem("accountname");
      if (!token || !myAccountname) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(
          `https://dev.wenivops.co.kr/services/mandarin/profile/${myAccountname}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.profile) {
          setUsername(data.profile.username);
          setAccountname(data.profile.accountname);
          setIntro(data.profile.intro);
          setImage(data.profile.image);
        }
      } catch (error) {
        console.error("프로필 정보를 불러오는데 실패했습니다.", error);
      }
    };
    fetchMyProfile();
  }, [navigate]);

  // 2. 유효성 검사 로직
  useEffect(() => {
    const isUsernameValid = username.length >= 2 && username.length <= 10;
    const isAccountnameValid = /^[a-zA-Z0-9._]+$/.test(accountname);

    setUsernameError(
      isUsernameValid ? "" : "사용자 이름은 2~10자 이내여야 합니다."
    );
    setAccountnameError(
      isAccountnameValid
        ? ""
        : "계정 ID는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다."
    );

    setIsFormValid(isUsernameValid && isAccountnameValid);
  }, [username, accountname]);

  // 3. 이미지 변경 핸들러
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // 미리보기를 위해 Data URL로 설정
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const token = localStorage.getItem("token");
    // 'image' 상태를 그대로 사용하도록 수정합니다. URL을 자르는 로직을 제거합니다.
    let finalImageUrl = image;

    if (newImageFile) {
      const formData = new FormData();
      formData.append("image", newImageFile);
      try {
        const res = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        const data = await res.json();
        console.log("이미지 업로드 서버 응답:", data); // 이미지 업로드 응답 출력
        if (!res.ok) throw new Error("이미지 업로드 실패");
        // data.filename이 아닌 data.info.filename을 사용하도록 수정합니다.
        finalImageUrl = data.info.filename;
      } catch (error) {
        console.error("이미지 업로드에 실패했습니다.", error);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    const profileData = {
      user: { username, accountname, intro, image: finalImageUrl },
    };

    try {
      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );
      const data = await res.json();
      console.log("프로필 수정 서버 응답:", data); // 프로필 수정 응답 출력

      if (data.user) {
        updateUserProfile({
          image: data.user.image,
          accountname: data.user.accountname,
        });
        localStorage.setItem("accountname", data.user.accountname); // 계정 ID 변경 시 localStorage도 업데이트
        navigate(`/profile/${data.user.accountname}`);
      } else {
        if (data.message === "이미 사용중인 계정 ID입니다.") {
          setAccountnameError(data.message);
        } else {
          alert(`프로필 수정에 실패했습니다: ${data.message}`);
        }
      }
    } catch (error) {
      console.error("프로필 수정 중 오류가 발생했습니다.", error);
    }
  };

  return (
    <div className="profile-edit-container">
      <header className="profile-edit-header">
        <button onClick={() => navigate(-1)} className="back-button"></button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="save-button"
        >
          저장
        </button>
      </header>
      <main className="profile-edit-main">
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="image-upload-section">
            <label
              htmlFor="profile-image-upload"
              className="image-upload-label"
            >
              <img
                src={
                  image.startsWith("data:") ? image : generateImageUrl(image)
                }
                alt="프로필 미리보기"
                className="profile-image-preview"
                crossOrigin="anonymous"
              />
              <img
                src={uploadIcon}
                alt="업로드"
                className="image-upload-icon"
              />
            </label>
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden-file-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2~10자 이내여야 합니다."
            />
            {usernameError && <p className="error-message">{usernameError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="accountname">계정 ID</label>
            <input
              type="text"
              id="accountname"
              value={accountname}
              onChange={(e) => setAccountname(e.target.value)}
              placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
            />
            {accountnameError && (
              <p className="error-message">{accountnameError}</p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="intro">소개</label>
            <input
              type="text"
              id="intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="자신과 판매할 상품에 대해 소개해 주세요!"
            />
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfileEditPage;
