import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultProfileImg from "../assets/images/basic-profile.png";
import "../styles/ChatRoomPage.css";

const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // 채팅방 더미 데이터 - 이미지에 보이는 실제 내용으로 업데이트
  const chatRoomInfo = {
    id: id,
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

  const handleImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      // 실제 구현에서는 API 호출하여 메시지 전송 처리
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

  return (
    <div className="chat-room-page">
      <header className="chat-room-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <span className="icon-arrow-left"></span>
        </button>
        <div className="chat-room-info">
          <h1 className="chat-room-name">{chatRoomInfo.name}</h1>
        </div>
        <button className="menu-button" onClick={() => setShowModal(true)}>
          <span className="icon-more-vertical"></span>
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
                    src={chatRoomInfo.profileImage || defaultProfileImg}
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
                      src={msg.content}
                      alt="전송된 이미지"
                      className="message-image"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/200x150?text=Image+Error";
                      }}
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

      {/* 모달 */}
      {showModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="chat-options-modal">
            <button className="modal-option">채팅방 나가기</button>
            <button className="modal-option">신고하기</button>
            <button
              className="modal-option cancel"
              onClick={() => setShowModal(false)}
            >
              취소
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoomPage;
