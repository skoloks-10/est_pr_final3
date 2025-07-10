import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Icon404 from "../assets/images/icon-404.png";

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 24px;
  background-color: #fff;
  font-family: "Pretendard", sans-serif;
`;

const Icon = styled.img`
  width: 150px;
`;

const Message = styled.p`
  color: #767676;
  font-size: 14px;
`;

const GoBackButton = styled.button`
  background-color: #f26e22;
  color: white;
  border: none;
  border-radius: 44px;
  padding: 13px 36px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <NotFoundContainer>
      {/* 
        이미지 파일이 없다면, 아래 Icon 컴포넌트 대신 
        div나 다른 태그로 아이콘을 직접 구현할 수 있습니다.
      */}
      <Icon src={Icon404} alt="404 Not Found 아이콘" />
      <Message>페이지를 찾을 수 없습니다. :(</Message>
      <GoBackButton onClick={handleGoBack}>이전 페이지</GoBackButton>
    </NotFoundContainer>
  );
}

export default NotFoundPage;
