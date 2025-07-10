import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { generateImageUrl } from "../utils/imageUrl";
import defaultImage from "../assets/images/basic-profile.png";
import "../styles/ChatListPage.css";

const ChatListPage = () => {
  const [chatList, setChatList] = useState([]);

  // 이미지에 표시된 내용을 기반으로 한 더미 데이터
  const dummyChatData = [
    {
      id: "weniv_farm",
      username: "애월읍 위니브 감귤농장",
      lastMessage: "이번에 정정 언제하맨마씸?",
      date: "2020.10.25",
      userImage: null, // 기본 이미지를 사용합니다.
      hasNotification: true,
    },
    {
      id: "jeju_tangerine",
      username: "제주감귤마을",
      lastMessage: "깊은 어둠의 존재감, 롤스로이스 뉴 블랙 배지...",
      date: "2020.10.25",
      userImage: null,
      hasNotification: true,
    },
    {
      id: "nugune_farm",
      username: "누구네 농장 친환경 한라봉",
      lastMessage: "내 차는 내가 평가한다. 오픈 이벤트에 참여 하...",
      date: "2020.10.25",
      userImage: null,
      hasNotification: false,
    },
  ];

  useEffect(() => {
    setChatList(dummyChatData);
  }, []);

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="chat-list-page-container">
      <Header title="채팅" />
      <main className="chat-list-main">
        {chatList.map((chat) => (
          <Link
            to={`/chat/${chat.id}`}
            key={chat.id}
            className="chat-item-link"
          >
            <div className="chat-item">
              <div className="profile-image-container">
                <img
                  src={generateImageUrl(chat.userImage)}
                  alt={`${chat.username}의 프로필`}
                  className="chat-profile-image"
                  crossOrigin="anonymous"
                  onError={handleImgError}
                />
                {chat.hasNotification && (
                  <div className="notification-dot"></div>
                )}
              </div>
              <div className="chat-content">
                <p className="chat-username">{chat.username}</p>
                <p className="chat-last-message">{chat.lastMessage}</p>
              </div>
              <span className="chat-date">{chat.date}</span>
            </div>
          </Link>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default ChatListPage;
