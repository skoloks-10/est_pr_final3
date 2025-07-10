import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/full-logo.png";
import "../styles/SplashScreen.css";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      const token = localStorage.getItem("token");

      // 1. 로컬 스토리지에 토큰이 없는 경우
      if (!token) {
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // 2. 토큰이 있는 경우, 서버에 유효성 검증 요청
      try {
        const res = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/user/checktoken",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          }
        );

        const data = await res.json();

        // 3. 검증 결과에 따라 페이지 이동
        if (data.isValid) {
          // 유효한 토큰이면 홈 페이지로 이동
          setTimeout(() => navigate("/home"), 2000);
        } else {
          // 유효하지 않은 토큰이면 만료된 정보 삭제 후 로그인 페이지로 이동
          localStorage.clear();
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        console.error("토큰 검증 실패:", error);
        // 에러 발생 시에도 안전하게 로그인 페이지로 이동
        localStorage.clear();
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    checkTokenAndNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회만 실행

  return (
    <div className="splash-screen">
      <img src={logo} alt="만다린 마켓 로고" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;
