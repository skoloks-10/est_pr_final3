import React, { useState, useEffect } from "react"; // useEffect 추가
import { Link, useNavigate } from "react-router-dom";
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/basic-profile.png";
import listIcon from "../../assets/images/icon-list.png";
import listIconFill from "../../assets/images/icon-list-fill.png";
import albumIcon from "../../assets/images/icon-album.png";
import albumIconFill from "../../assets/images/icon-album-fill.png";
import moreIcon from "../../assets/images/icon-more-vertical.svg";
import heartIcon from "../../assets/images/icon-heart.png";
import heartIconFill from "../../assets/images/icon-heart-fill.svg"; // 채워진 하트 아이콘 추가
import commentIcon from "../../assets/images/icon-message-circle.png";
import "../../styles/profile/PostList.css";

const PostList = ({ posts = [], showViewToggle = true, onPostDelete }) => {
  // --- 콘솔 출력 코드 추가 ---
  useEffect(() => {
    if (posts && posts.length > 0) {
      console.log("📄 PostList가 받은 전체 게시물 데이터:", posts);

      // 첫 번째 게시물의 이미지 데이터만 따로 자세히 볼 수 있습니다.
      console.log("👤 첫 번째 게시물의 작성자 이미지:", posts[0].author.image);
      console.log("🖼️ 첫 번째 게시물의 본문 이미지:", posts[0].image);
    }
  }, [posts]); // posts 배열이 변경될 때마다 이 코드가 실행됩니다.
  // -------------------------

  const navigate = useNavigate(); // useNavigate 훅 사용
  const myAccountname = localStorage.getItem("accountname");
  const [view, setView] = useState("list");
  const [isDeleting, setIsDeleting] = useState(false); // 1. 게시글 삭제 로딩 상태 추가

  // 모달과 알림창 상태를 하나의 객체로 관리
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    selectedPost: null,
    alertMessage: "",
    alertConfirmText: "",
    onConfirmAction: null,
  });

  // 1. 게시글 수정 페이지로 이동하는 함수 추가
  const handleEditPost = (post) => {
    // PostUploadPage를 재사용하되, 수정 모드임을 알리고 post 데이터를 전달
    navigate(`/post/edit/${post.id}`, { state: { postToEdit: post } });
  };

  // 2. 게시글 삭제 API 호출 로직 개선
  const handleDeletePost = async (postId) => {
    if (isDeleting) return; // 중복 실행 방지

    setIsDeleting(true);
    closeAlert(); // 확인 즉시 알림창 닫기

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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "게시글 삭제에 실패했습니다.");
      }

      alert("게시글이 삭제되었습니다.");

      // 부모 컴포넌트의 상태를 업데이트하여 UI에서 게시글 제거
      if (typeof onPostDelete === "function") {
        onPostDelete(postId);
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert(error.message);
    } finally {
      setIsDeleting(false); // 로딩 상태 해제
    }
  };

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
      onConfirmAction: onConfirm, // 버그 수정: 함수를 직접 할당
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
          // 3. 수정 버튼에 handleEditPost 함수 연결
          { text: "수정", action: () => handleEditPost(post) },
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

  // 1. 부모로부터 받은 posts를 내부 상태로 관리합니다.
  const [postList, setPostList] = useState(posts);

  // 2. posts prop이 변경될 때마다 내부 상태를 업데이트.
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  // 3. 좋아요 토글 함수 추가
  const handleLikeToggle = async (postId, isLiked) => {
    const token = localStorage.getItem("token");
    const action = isLiked ? "unheart" : "heart";
    const url = `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/${action}`;
    const method = isLiked ? "DELETE" : "POST";

    // 먼저 UI를 낙관적으로 업데이트
    setPostList((currentList) =>
      currentList.map((p) =>
        p.id === postId
          ? {
              ...p,
              hearted: !p.hearted,
              heartCount: p.hearted ? p.heartCount - 1 : p.heartCount + 1,
            }
          : p
      )
    );

    try {
      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("좋아요 처리에 실패했습니다.");
      }

      const result = await response.json();
      // 서버 응답으로 최종 상태를 다시 업데이트하여 동기화
      setPostList((currentList) =>
        currentList.map((p) => (p.id === postId ? result.post : p))
      );
    } catch (error) {
      console.error(error);
      setPostList(posts);
    }
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
                {postList.map((post) => (
                  <div key={post.id} className="post-item-list">
                    <div className="post-author-info">
                      <Link
                        to={`/profile/${post.author.accountname}`}
                        className="post-author-link"
                      >
                        <img
                          src={generateImageUrl(post.author.image)}
                          alt={`${post.author.username}의 프로필 이미지`}
                          className="post-author-image"
                          crossOrigin="anonymous" // 1. 작성자 프로필 이미지에 추가
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
                        (post.image.includes(",") ? (
                          <div className="post-image-gallery">
                            {post.image.split(",").map((imgName, index) => (
                              <img
                                key={index}
                                src={generateImageUrl(imgName.trim())}
                                alt={`게시물 이미지 ${index + 1}`}
                                className="gallery-image"
                                crossOrigin="anonymous" // 2. 갤러리 이미지에 추가
                                onError={handleImgError}
                              />
                            ))}
                          </div>
                        ) : (
                          <Link to={`/post/${post.id}`}>
                            <img
                              src={generateImageUrl(post.image)}
                              alt="게시물 이미지"
                              crossOrigin="anonymous"
                              className="post-image-list"
                              onError={handleImgError}
                            />
                          </Link>
                        ))}
                    </div>
                    <div className="post-interactions">
                      {/* 5. 좋아요 버튼에 onClick 이벤트와 동적 className, src를 적용합니다. */}
                      <button
                        className={`like-button ${post.hearted ? "liked" : ""}`}
                        onClick={() => handleLikeToggle(post.id, post.hearted)}
                      >
                        <img
                          src={post.hearted ? heartIconFill : heartIcon}
                          alt="좋아요"
                        />
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
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="post-item-album"
                  >
                    {post.image && (
                      <img
                        src={generateImageUrl(post.image.split(",")[0])}
                        alt="게시글 썸네일"
                        className="post-album-image"
                        crossOrigin="anonymous" // 3. 앨범 뷰 이미지에 추가
                        onError={handleImgError}
                      />
                    )}
                  </Link>
                ))}
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
