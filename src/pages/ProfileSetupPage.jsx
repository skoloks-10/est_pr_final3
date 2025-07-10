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
    let finalImageUrl = "";

    // 사용자가 새 이미지를 선택한 경우에만 API 호출
    if (imageFile) {
      // 1. FormData 객체 생성
      const formData = new FormData();
      // 2. 'image'라는 key로 이미지 파일을 body에 추가 (API 명세와 일치)
      formData.append("image", imageFile);
      try {
        // 3. API 호출 (URL, Method 일치)
        // Content-Type 헤더는 FormData를 body로 사용할 때 브라우저가 자동으로 설정하므로, 수동으로 추가하지 않는 것이 올바른 방법입니다.
        const imgRes = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            body: formData,
          }
        );
        const imgData = await imgRes.json();
        // 4. 성공 응답(Res)에서 'filename'을 사용하여 이미지 URL 생성
        if (imgData.filename) {
          finalImageUrl =
            "https://dev.wenivops.co.kr/services/mandarin/" + imgData.filename;
        } else {
          // ... (업로드 실패 시 예외 처리) ...
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // ... (네트워크 오류 등 예외 처리) ...
      }
    } else {
      // ... (이미지를 선택하지 않은 경우) ...
    }

    // 2. 요청 본문(Body) 생성: API 명세와 동일한 구조로 데이터를 구성합니다.
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

    try {
      // 3. API 호출: 명세에 맞는 URL, 메소드, 헤더, 본문을 사용하여 서버에 요청합니다.
      const res = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      const data = await res.json();
      if (data.user) {
        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
        navigate("/login");
      } else {
        alert(`회원가입 실패: ${data.message}`);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.");
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
          감귤마켓 시작하기
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
