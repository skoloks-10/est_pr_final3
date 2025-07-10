import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import defaultProfileImg from "../assets/images/basic-profile.png";
import "../styles/ChatListPage.css";

const ChatListPage = () => {
  const navigate = useNavigate();

  // 채팅 목록 더미 데이터
  const chatRooms = [
    {
      id: 1,
      profileImage: null,
      name: "애월읍 위니브 감귤농장",
      lastMessage: "이번에 정장 언제하맘싯?",
      date: "2020.10.25",
      hasUnread: true,
    },
    {
      id: 2,
      profileImage: null,
      name: "제주감귤마을",
      lastMessage: "깊은 어둠의 존재감, 블스로이스 뉴 블랙 배지...",
      date: "2020.10.25",
      hasUnread: true,
    },
    {
      id: 3,
      profileImage: null,
      name: "누구네 농장 친환경 한라봉",
      lastMessage: "내 차는 내가 평가한다. 오픈 이벤트에 참여 하...",
      date: "2020.10.25",
      hasUnread: false,
    },
  ];

  const handleImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  return (
    <div className="chat-list-page">
      <header className="chat-list-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <i className="icon-arrow-left"></i>
        </button>
        <div className="header-options">
          <button className="menu-button">
            <i className="icon-more-vertical"></i>
          </button>
        </div>
      </header>

      <main className="chat-list-main">
        <ul className="chat-list">
          {chatRooms.map((chat) => (
            <li key={chat.id} className="chat-item">
              <Link to={`/chat/${chat.id}`} className="chat-link">
                <div className="profile-image-wrapper">
                  {chat.hasUnread && <span className="unread-indicator"></span>}
                  <img
                    src={chat.profileImage || defaultProfileImg}
                    alt={`${chat.name}의 프로필`}
                    className="profile-image"
                    onError={handleImgError}
                  />
                </div>
                <div className="chat-info">
                  <p className="chat-name">{chat.name}</p>
                  <p className="chat-message">{chat.lastMessage}</p>
                </div>
                <p className="chat-date">{chat.date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer activeTab="채팅" />
    </div>
  );
};

export default ChatListPage;
