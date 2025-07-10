import React from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/images/icon-arrow-left.png";
import "../../styles/common/FollowListHeader.css";

const FollowListHeader = ({ title }) => {
  const navigate = useNavigate();
  return (
    <header className="follow-list-header">
      <button onClick={() => navigate(-1)} className="back-button">
        <img src={backIcon} alt="뒤로 가기" />
      </button>
      <h1 className="header-title">{title}</h1>
    </header>
  );
};

export default FollowListHeader;
