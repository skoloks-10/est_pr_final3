import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth/EmailLoginPage.css";

const EmailLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loginAttemptFailed, setLoginAttemptFailed] = useState(false); // 로그인 시도 실패 상태 추가
  const navigate = useNavigate();

  // 입력값이 변경되면 에러 상태를 초기화하는 핸들러
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (loginAttemptFailed) {
      setLoginAttemptFailed(false);
      setErrorMessage("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // --- 운영자 전용 로그인 로직 추가 ---
    const OPERATOR_EMAIL = "operator@naver.com";
    const OPERATOR_PASSWORD = "admin1234";

    if (email === OPERATOR_EMAIL && password === OPERATOR_PASSWORD) {
      console.log("운영자 계정으로 로그인합니다.");
      // 운영자용 토큰 및 계정 정보 저장
      localStorage.setItem("token", "operator-special-token-for-admin-access");
      localStorage.setItem("accountname", "mandarin_admin");
      navigate("/home"); // 홈으로 이동
      return; // API 호출을 막고 함수를 즉시 종료
    }
    // --- 운영자 전용 로그인 로직 끝 ---

    const loginData = {
      user: {
        email: email,
        password: password,
      },
    };

    try {
      console.log("API 요청 시작:", loginData);
      const response = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/user/login",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      console.log("응답 상태:", response.status, response.statusText);
      const data = await response.json();
      console.log("서버 응답 데이터:", data);

      if (response.ok && data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("accountname", data.accountname);
        navigate("/home");
      } else {
        setErrorMessage(data.message || "로그인에 실패했습니다.");
        setLoginAttemptFailed(true); // 로그인 실패 시 상태를 true로 설정
      }
    } catch (error) {
      console.error("로그인 API 연동 실패:", error);
      setErrorMessage(
        "로그인 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요."
      );
      setLoginAttemptFailed(true); // 로그인 실패 시 상태를 true로 설정
    }
  };

  const isFormValid = email && password;

  return (
    <div className="auth-container">
      <h1 className="auth-title">로그인</h1>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleInputChange(setEmail)} // 입력 핸들러 변경
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handleInputChange(setPassword)} // 입력 핸들러 변경
            required
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <button
          type="submit"
          className="auth-button"
          disabled={!isFormValid || loginAttemptFailed} // 비활성화 조건 추가
        >
          로그인
        </button>
      </form>
      <Link to="/signup/email" className="auth-link">
        이메일로 회원가입
      </Link>
    </div>
  );
};

export default EmailLoginPage;
