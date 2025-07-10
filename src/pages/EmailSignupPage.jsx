import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth/EmailSignupPage.css";

const EmailSignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const navigate = useNavigate();

  // 이메일 유효성 검사 (onBlur 이벤트 핸들러)
  const validateEmail = async () => {
    // 1. 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("유효한 이메일 형식이 아닙니다.");
      setIsEmailValid(false);
      return;
    }

    // 2. 이메일 중복 검사 API 호출
    try {
      const response = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user/emailvalid",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: { email } }),
        }
      );
      const data = await response.json();

      if (data.message === "사용 가능한 이메일 입니다.") {
        setEmailError("");
        setIsEmailValid(true);
      } else {
        // "이미 가입된 이메일 주소 입니다." 메시지를 받아 에러로 처리
        setEmailError(data.message);
        setIsEmailValid(false);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setEmailError("이메일 검사 중 오류가 발생했습니다.");
      setIsEmailValid(false);
    }
  };

  // 비밀번호 유효성 검사 (onBlur 이벤트 핸들러)
  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("비밀번호는 6자 이상이어야 합니다.");
      setIsPasswordValid(false);
    } else {
      setPasswordError("");
      setIsPasswordValid(true);
    }
  };

  // 다음 버튼 클릭 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEmailValid && isPasswordValid) {
      // 유효성 검사를 통과하면 프로필 설정 페이지로 이메일과 비밀번호를 전달
      navigate("/signup/profile", { state: { email, password } });
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">이메일로 회원가입</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            placeholder="이메일 주소를 입력해 주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호를 설정해 주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validatePassword}
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>
        <button
          type="submit"
          className="auth-button"
          disabled={!(isEmailValid && isPasswordValid)}
        >
          다음
        </button>
      </form>
    </div>
  );
};

export default EmailSignupPage;
