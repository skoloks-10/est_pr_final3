import React from "react";
import { Link } from "react-router-dom";
import loginLogo from "../assets/images/logo.png";
import "../styles/LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-page-container">
      <img src={loginLogo} alt="감귤마켓 로고" className="login-logo" />
      <section className="login-form-container">
        <button className="social-login-button kakao">
          <i className="icon-kakao"></i>
          카카오톡 계정으로 로그인
        </button>
        <button className="social-login-button google">
          <i className="icon-google"></i>
          구글 계정으로 로그인
        </button>
        <button className="social-login-button facebook">
          <i className="icon-facebook"></i>
          페이스북 계정으로 로그인
        </button>
        <div className="login-links">
          <Link to="/login/email" className="email-login-link">
            이메일로 로그인
          </Link>
          <span className="link-divider">|</span>
          <Link to="/signup/email" className="signup-link">
            회원가입
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
