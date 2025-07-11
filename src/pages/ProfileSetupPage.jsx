import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth/ProfileSetupPage.css";
import uploadIcon from "../assets/images/upload-file.png"; // 업로드 아이콘 import 추가

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  const defaultImageUrl =
    "https://dev.wenivops.co.kr/services/mandarin/Ellipse.png";
  const [image, setImage] = useState(defaultImageUrl);
  const [imageFile, setImageFile] = useState(null);

  const [username, setUsername] = useState("");
  const [accountname, setAccountname] = useState("");
  const [intro, setIntro] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [accountnameError, setAccountnameError] = useState("");

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isAccountnameValid, setIsAccountnameValid] = useState(false);

  useEffect(() => {
    if (!email || !password) {
      alert("잘못된 접근입니다. 회원가입을 다시 진행해주세요.");
      navigate("/signup/email");
    }
  }, [email, password, navigate]);

  const validateUsername = () => {
    if (username.length >= 2 && username.length <= 10) {
      setUsernameError("");
      setIsUsernameValid(true);
    } else {
      setUsernameError("사용자 이름은 2~10자 이내여야 합니다.");
      setIsUsernameValid(false);
    }
  };

  const validateAccountname = async () => {
    const accountnameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!accountnameRegex.test(accountname)) {
      setAccountnameError("영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.");
      setIsAccountnameValid(false);
      return;
    }

    try {
      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user/accountnamevalid",
        {
          method: "POST", // 요청 메소드
          headers: { "Content-Type": "application/json" }, // 헤더
          body: JSON.stringify({ user: { accountname } }), // 요청 본문
        }
      );
      const data = await res.json();

      // "사용 가능한 계정ID 입니다." 메시지를 기준으로 성공/실패 처리
      if (data.message === "사용 가능한 계정ID 입니다.") {
        setAccountnameError("");
        setIsAccountnameValid(true);
      } else {
        // "이미 가입된 계정ID 입니다." 또는 "잘못된 접근입니다." 메시지를 에러로 표시
        setAccountnameError(data.message);
        setIsAccountnameValid(false);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAccountnameError("계정 ID 검사 중 오류가 발생했습니다.");
      setIsAccountnameValid(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("입력 양식을 올바르게 작성해주세요.");
      return;
    }

    let finalImageUrl = image; // 기본 이미지 또는 사용자가 선택한 미리보기 이미지로 시작

    try {
      // 사용자가 새 이미지를 선택한 경우에만 업로드 API 호출
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgRes = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!imgRes.ok) {
          const errorData = await imgRes.json();
          throw new Error(errorData.message || "이미지 업로드에 실패했습니다.");
        }

        const imgData = await imgRes.json();
        let filename = "";

        // { info: { filename: '...' } } 형식 응답 처리
        if (
          imgData &&
          imgData.info &&
          typeof imgData.info === "object" &&
          !Array.isArray(imgData.info)
        ) {
          filename = imgData.info.filename;
        }
        // 기존 { filename: '...' } 형식 응답 처리 (하위 호환)
        else if (imgData.filename) {
          filename = imgData.filename;
        }

        if (filename) {
          finalImageUrl = `https://dev.wenivops.co.kr/services/mandarin/${filename}`;
        } else {
          throw new Error("서버 응답에서 이미지 파일명을 찾을 수 없습니다.");
        }
      }

      // 회원가입 데이터 구성
      const userData = {
        user: {
          username,
          email,
          password,
          accountname,
          intro,
          image: finalImageUrl,
        },
      };

      // 회원가입 API 호출
      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();
      if (res.ok && data.user) {
        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
        navigate("/login");
      } else {
        throw new Error(data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 처리 중 오류:", error);
      alert(error.message);
    }
  };

  const isFormValid = isUsernameValid && isAccountnameValid;

  return (
    <div className="auth-container">
      <h1 className="auth-title">프로필 설정</h1>
      <p className="auth-subtitle">나중에 언제든지 변경할 수 있습니다.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="profile-img-wrapper">
          <img
            src={image}
            alt="프로필 미리보기"
            className="profile-img-preview"
          />
          <label htmlFor="profile-img-upload" className="profile-img-label">
            <img src={uploadIcon} alt="업로드 아이콘" />
          </label>
          <input
            type="file"
            id="profile-img-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="profile-img-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">사용자 이름</label>
          <input
            type="text"
            id="username"
            placeholder="2~10자 이내여야 합니다."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={validateUsername}
          />
          {usernameError && <p className="error-message">{usernameError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="accountname">계정 ID</label>
          <input
            type="text"
            id="accountname"
            placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
            value={accountname}
            onChange={(e) => setAccountname(e.target.value)}
            onBlur={validateAccountname}
          />
          {accountnameError && (
            <p className="error-message">{accountnameError}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="intro">소개</label>
          <input
            type="text"
            id="intro"
            placeholder="자신과 판매할 상품에 대해 소개해 주세요!"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
          />
        </div>

        <button type="submit" className="auth-button" disabled={!isFormValid}>
          중고스왑 시작하기
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
