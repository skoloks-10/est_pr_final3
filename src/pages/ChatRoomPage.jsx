import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateImageUrl } from "../utils/imageUrl";
import defaultImage from "../assets/images/basic-profile.png";
import moreIcon from "../assets/images/icon-more-vertical.svg"; // 더보기 아이콘 추가
import Modal from "../components/common/Modal"; // 재사용 가능한 모달 컴포넌트
import Alert from "../components/common/Alert"; // 재사용 가능한 알림 컴포넌트
import "../styles/ChatRoomPage.css";

const ChatRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // 1. 모달 및 알림창 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const chatRoomInfo = {
    id: roomId, // 정의되지 않은 'id'를 'roomId'로 수정
    name: "애월읍 위니브 감귤농장",
    profileImage: null,
    messages: [
      {
        id: 1,
        sender: "other",
        content:
          "옷을 인생을 그리므로 없으면 것은 이 상은 것은 우리의 위하여, 뿐이다. 이상의 정촌의 배 따뜻한 그들의 그와 약동하다. 대고, 못할 넣는 풍부하게 되는는 인생의 힘있다.",
        time: "12:39",
      },
      {
        id: 2,
        sender: "other",
        content: "안녕하세요. 감귤 사고싶어요오오오오",
        time: "12:41",
      },
      {
        id: 3,
        sender: "me",
        content: "네 말씀하세요.",
        time: "12:50",
      },
      {
        id: 4,
        sender: "me",
        type: "image",
        content: "https://images.unsplash.com/photo-1591160690555-5debfba289f0",
        time: "12:51",
      },
    ],
  };

  useEffect(() => {
    setMessages(chatRoomInfo.messages);
    setOtherUser({ username: "감귤농장 주인" });
  }, [roomId]);

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      alert("메시지 전송 기능은 구현되지 않았습니다.");
      setMessage("");
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleLeaveChat = () => {
    console.log(`'${roomId}' 채팅방에서 나갔습니다.`);
    setIsAlertOpen(false); // 알림창 닫기
    navigate("/chat"); // 채팅 목록으로 이동
  };

  const openLeaveAlert = () => {
    setIsModalOpen(false); // 기존 모달은 닫고
    setIsAlertOpen(true); // 알림창을 엽니다.
  };

  const modalOptions = [{ name: "채팅방 나가기", action: openLeaveAlert }];

  if (!otherUser) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <div className="chat-room-container">
        <header className="chat-room-header">
          <button onClick={() => navigate(-1)} className="back-button" />
          <h2 className="chat-username">{otherUser.username}</h2>
          <button onClick={() => setIsModalOpen(true)} className="more-button">
            <img src={moreIcon} alt="더보기" />
          </button>
        </header>

        <main className="chat-room-main">
          <div className="chat-date-divider">
            <span>2020년 10월 25일</span>
          </div>

          <div className="messages-container">
            {chatRoomInfo.messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === "me" ? "my-message" : "other-message"}`}
              >
                {msg.sender !== "me" && (
                  <div className="profile-image-wrapper">
                    <img
                      src={chatRoomInfo.profileImage || defaultImage}
                      alt="프로필"
                      className="profile-image"
                      onError={handleImgError}
                    />
                  </div>
                )}
                <div className="message-content-wrapper">
                  {msg.type === "image" ? (
                    <div className="message-image-container">
                      <img
                        src={generateImageUrl(msg.content)}
                        alt="전송된 이미지"
                        className="message-image"
                        crossOrigin="anonymous"
                        onError={handleImgError}
                      />
                    </div>
                  ) : (
                    <div className="message-bubble">{msg.content}</div>
                  )}
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          <button
            type="button"
            className="image-upload-button"
            onClick={handleImageButtonClick}
          >
            <span className="icon-image"></span>
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지 입력하기..."
            className="message-input"
          />
          <button
            type="submit"
            className={`send-button ${!message.trim() && !selectedImage ? "disabled" : ""}`}
            disabled={!message.trim() && !selectedImage}
          >
            전송
          </button>
        </form>

        {selectedImage && (
          <div className="selected-image-preview">
            <img src={selectedImage} alt="선택된 이미지" />
            <button onClick={() => setSelectedImage(null)}>취소</button>
          </div>
        )}

        {isModalOpen && (
          <Modal options={modalOptions} onClose={() => setIsModalOpen(false)} />
        )}

        {isAlertOpen && (
          <Alert
            message="채팅방을 나가시겠습니까?"
            confirmText="나가기"
            onClose={() => setIsAlertOpen(false)}
            onConfirm={handleLeaveChat}
          />
        )}
      </div>
    </>
  );
};

export default ChatRoomPage;
