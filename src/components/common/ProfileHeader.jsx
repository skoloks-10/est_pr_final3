import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/images/icon-arrow-left.png";
import moreIcon from "../../assets/images/icon-more-vertical.png";
import "../../styles/common/ProfileHeader.css";

const ProfileHeader = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const modalOptions = [
    { text: "설정 및 개인정보", action: () => {} },
    {
      text: "로그아웃",
      action: () => {
        setIsModalOpen(false);
        setIsAlertOpen(true);
      },
    },
  ];

  return (
    <>
      <header className="profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <img src={backIcon} alt="뒤로 가기" />
        </button>
        <button className="more-button" onClick={() => setIsModalOpen(true)}>
          <img src={moreIcon} alt="더보기" />
        </button>
      </header>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <ul>
              {modalOptions.map((option, index) => (
                <li key={index}>
                  <button onClick={option.action}>{option.text}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isAlertOpen && (
        <div className="alert-backdrop">
          <div className="alert-content">
            <p className="alert-message">로그아웃하시겠습니까?</p>
            <div className="alert-buttons">
              <button onClick={() => setIsAlertOpen(false)}>취소</button>
              <button className="confirm" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
