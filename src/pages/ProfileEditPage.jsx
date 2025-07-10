import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageUrl } from "../utils/imageUrl";
import uploadIcon from "../assets/images/upload-file.png";
import { useUser } from "../context/UserContext"; // 1. useUser 훅 import
import "../styles/ProfileEditPage.css";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { updateUserProfile } = useUser(); // 2. Context의 업데이트 함수 가져오기

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [username, setUsername] = useState("");
  const [accountname, setAccountname] = useState("");
  const [intro, setIntro] = useState("");

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

    // 계정 ID 유효성 검사 후 API 에러 메시지는 초기화
    if (accountnameError === "이미 사용중인 계정 ID입니다.") {
      setAccountnameError("");
    }

    setIsFormValid(isUsernameValid && isAccountnameValid);
  }, [username, accountname]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 3. API 명세에 맞춘 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    let finalImageUrl = image.startsWith("https://")
      ? image.split("/").pop()
      : image;
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      try {
        const res = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        finalImageUrl = data.filename;
      } catch (error) {
        console.error("이미지 업로드에 실패했습니다.", error);
        return;
      }
    }

    const token = localStorage.getItem("token");
    const profileData = {
      user: {
        username,
        accountname,
        intro,
        image: finalImageUrl,
      },
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

      if (data.user) {
        // 3. 수정 성공 시, Context를 통해 전역 프로필 정보 업데이트
        updateUserProfile({
          image: data.user.image,
          accountname: data.user.accountname,
        });
        navigate(`/profile/${data.user.accountname}`);
      } else {
        // FAIL: 실패 시 메시지 확인
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
                className="profile-image-preview"
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
            {username.length > 0 &&
              (username.length < 2 || username.length > 10) && (
                <p className="error-message">
                  사용자 이름은 2~10자 이내여야 합니다.
                </p>
              )}
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
            {accountname.length > 0 && accountname.length < 2 && (
              <p className="error-message">계정 ID는 2자 이상이어야 합니다.</p>
            )}
            {accountname.length > 0 &&
              !/^[a-zA-Z0-9._]+$/.test(accountname) && (
                <p className="error-message">
                  계정 ID는 영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.
                </p>
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
