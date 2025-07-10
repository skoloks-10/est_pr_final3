import React, { useState } from "react";
import { Link } from "react-router-dom";
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/basic-profile.png";
import listIcon from "../../assets/images/icon-list.png";
import listIconFill from "../../assets/images/icon-list-fill.png";
import albumIcon from "../../assets/images/icon-album.png";
import albumIconFill from "../../assets/images/icon-album-fill.png";
import moreIcon from "../../assets/images/icon-more-vertical.svg";
import heartIcon from "../../assets/images/icon-heart.png";
import commentIcon from "../../assets/images/icon-message-circle.png";
import "../../styles/profile/PostList.css";

const PostList = ({ posts = [], showViewToggle = true, onPostDelete }) => {
  const myAccountname = localStorage.getItem("accountname");
  const [view, setView] = useState("list");

  // 모달과 알림창 상태를 하나의 객체로 관리
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    selectedPost: null,
    alertMessage: "",
    alertConfirmText: "",
    onConfirmAction: null,
  });

  // 게시글 삭제 API 호출 (예시)
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      // 응답 확인
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "게시글 삭제에 실패했습니다.");
      }

      // 성공 시 UI 업데이트를 위해 부모 컴포넌트에 알림 추가 (prop으로 전달받아야 함)
      alert("게시글이 삭제되었습니다.");

      // onPostDelete prop이 존재한다면 호출
      if (typeof onPostDelete === "function") {
        onPostDelete(postId);
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert(error.message);
    }

    closeAlert();
  };

  // 게시글 신고 API 호출 (예시)
  const handleReportPost = async (postId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      // 응답 확인
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "게시글 신고에 실패했습니다.");
      }

      const data = await res.json();
      console.log("신고 완료:", data);
      alert("게시글이 신고되었습니다.");
    } catch (error) {
      console.error("게시글 신고 실패:", error);
      alert(error.message);
    }

    closeAlert();
  };

  // 모달 열기
  const openModal = (post) => {
    setModalState((prev) => ({
      ...prev,
      isModalOpen: true,
      selectedPost: post,
    }));
  };

  // 모달 닫기
  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedPost: null,
    }));
  };

  // 알림창 열기
  const openAlert = ({ message, confirmText, onConfirm }) => {
    setModalState((prev) => ({
      ...prev,
      isModalOpen: false, // 모달은 닫고
      isAlertOpen: true,
      alertMessage: message,
      alertConfirmText: confirmText,
      onConfirmAction: () => onConfirm, // 함수 자체를 저장
    }));
  };

  // 알림창 닫기
  const closeAlert = () => {
    setModalState((prev) => ({
      ...prev,
      isAlertOpen: false,
      onConfirmAction: null,
    }));
  };

  // 모달 옵션 생성
  const getModalOptions = () => {
    if (!modalState.selectedPost) return [];

    const post = modalState.selectedPost;
    const isMyPost = post.author.accountname === myAccountname;

    return isMyPost
      ? [
          {
            text: "삭제",
            action: () =>
              openAlert({
                message: "게시글을 삭제할까요?",
                confirmText: "삭제",
                onConfirm: () => handleDeletePost(post.id),
              }),
          },
          { text: "수정", action: () => console.log("수정") },
        ]
      : [
          {
            text: "신고하기",
            action: () =>
              openAlert({
                message: "게시글을 신고할까요?",
                confirmText: "신고",
                onConfirm: () => handleReportPost(post.id),
              }),
          },
        ];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <>
      <section className="post-list-section">
        {showViewToggle && (
          <div className="view-toggle-bar">
            <button onClick={() => setView("list")}>
              <img
                src={view === "list" ? listIcon : listIconFill}
                alt="목록형"
              />
            </button>
            <button onClick={() => setView("album")}>
              <img
                src={view === "album" ? albumIconFill : albumIcon}
                alt="앨범형"
              />
            </button>
          </div>
        )}
        {posts.length > 0 && (
          <>
            {view === "list" && (
              <div className="post-list-view">
                {posts.map((post) => (
                  <div key={post.id} className="post-item-list">
                    <div className="post-author-info">
                      <Link
                        to={`/profile/${post.author.accountname}`}
                        className="post-author-link"
                      >
                        <img
                          // 2. generateImageUrl 함수를 사용하여 올바른 URL 생성
                          src={generateImageUrl(post.author.image)}
                          alt={`${post.author.username}의 프로필 이미지`}
                          className="post-author-image"
                          onError={handleImgError}
                        />
                      </Link>
                      <div>
                        <p className="author-name">{post.author.username}</p>
                        <p className="author-account">
                          @ {post.author.accountname}
                        </p>
                      </div>
                      <button
                        className="post-more-button"
                        onClick={() => openModal(post)}
                      >
                        <img src={moreIcon} alt="더보기" />
                      </button>
                    </div>

                    <div className="post-content-list">
                      <Link to={`/post/${post.id}`}>
                        <p>{post.content}</p>
                      </Link>

                      {post.image &&
                        // 1. post.image에 쉼표가 있는지 확인하여 여러 이미지인지 판단
                        (post.image.includes(",") ? (
                          // 2. 여러 이미지일 경우: 가로 스크롤 갤러리 렌더링
                          <div className="post-image-gallery">
                            {post.image.split(",").map((imgName, index) => (
                              <img
                                key={index}
                                src={generateImageUrl(imgName.trim())} // .trim()으로 공백 제거
                                alt={`게시물 이미지 ${index + 1}`}
                                className="gallery-image"
                              />
                            ))}
                          </div>
                        ) : (
                          // 3. 단일 이미지일 경우: 기존 방식대로 렌더링
                          <Link to={`/post/${post.id}`}>
                            <img
                              src={generateImageUrl(post.image)}
                              alt="게시물 이미지"
                              crossOrigin="anonymous" // 이 속성 추가
                              className="post-image-list"
                            />
                          </Link>
                        ))}
                    </div>
                    <div className="post-interactions">
                      <button
                        className={`like-button ${post.hearted ? "liked" : ""}`}
                      >
                        <img src={heartIcon} alt="좋아요" />
                        <span>{post.heartCount}</span>
                      </button>
                      <Link to={`/post/${post.id}`} className="comment-link">
                        <img src={commentIcon} alt="댓글" />
                        <span>{post.commentCount}</span>
                      </Link>
                    </div>
                    <p className="post-date">{formatDate(post.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
            {view === "album" && (
              <div className="post-album-view">
                {posts.map((post) => {
                  // 1. 게시물에 이미지가 있는지, 여러 개인지 확인
                  if (!post.image) return null;
                  const images = post.image.split(",");
                  const firstImage = images[0].trim();

                  return (
                    <Link
                      to={`/post/${post.id}`}
                      key={post.id}
                      className="post-item-album"
                    >
                      <img
                        // 2. generateImageUrl 함수를 사용하여 썸네일 표시
                        src={generateImageUrl(firstImage)}
                        alt="게시물 썸네일"
                        onError={handleImgError} // 3. 이미지 로딩 실패 처리
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
        {posts.length === 0 && <p className="no-posts">게시물이 없습니다.</p>}
      </section>

      {modalState.isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <ul>
              {getModalOptions().map((option, index) => (
                <li key={index}>
                  <button onClick={option.action}>{option.text}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {modalState.isAlertOpen && (
        <div className="alert-backdrop">
          <div className="alert-content">
            <p className="alert-message">{modalState.alertMessage}</p>
            <div className="alert-buttons">
              <button onClick={closeAlert}>취소</button>
              <button className="confirm" onClick={modalState.onConfirmAction}>
                {modalState.alertConfirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostList;
