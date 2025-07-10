import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatTimeAgo } from "../utils/time";
import { generateImageUrl } from "../utils/imageUrl";
import defaultProfileImg from "../assets/images/default-profile.svg";
import moreIcon from "../assets/images/icon-more-vertical.png";
import heartIcon from "../assets/images/icon-heart.png";
import commentIcon from "../assets/images/icon-message-circle.png";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import "../styles/PostDetailPage.css";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);
  const commentFormRef = useRef(null); // 1. 댓글 입력창을 가리킬 ref를 추가합니다.

  // --- 상태 관리 ---
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsSkip, setCommentsSkip] = useState(0);
  const COMMENT_LIMIT = 100; // 한 번에 불러올 댓글 수를 10에서 100으로 늘립니다.

  // ▼▼▼ 모달 상태 분리 ▼▼▼
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false); // 게시글 모달 상태 추가
  const [selectedComment, setSelectedComment] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmAction, setAlertConfirmAction] = useState(null);

  const myAccountname = localStorage.getItem("accountname");
  const myProfileImage = localStorage.getItem("profileImage");
  const token = localStorage.getItem("token");

  // --- 데이터 로딩 (기존과 동일) ---
  const fetchComments = useCallback(
    async (skip) => {
      if (isCommentsLoading || !hasMoreComments) return;
      setIsCommentsLoading(true);
      try {
        const res = await fetch(
          `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/comments/?limit=${COMMENT_LIMIT}&skip=${skip}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.comments && data.comments.length > 0) {
          setComments((prev) =>
            skip === 0 ? data.comments : [...prev, ...data.comments]
          );
          setCommentsSkip(skip + data.comments.length);
        } else {
          setHasMoreComments(false);
        }
      } catch (error) {
        console.error("댓글 목록 로딩 실패:", error);
      } finally {
        setIsCommentsLoading(false);
      }
    },
    [postId, token, isCommentsLoading, hasMoreComments]
  );

  // 초기 데이터 (게시글 + 첫 댓글 페이지) 로딩
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const postRes = await fetch(
          `https://dev.wenivops.co.kr/services/mandarin/post/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const postData = await postRes.json();
        setPost(postData.post);
        await fetchComments(0); // 첫 댓글 페이지 로드
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [postId, token]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        mainContentRef.current &&
        mainContentRef.current.scrollTop +
          mainContentRef.current.clientHeight >=
          mainContentRef.current.scrollHeight - 100
      ) {
        fetchComments(commentsSkip);
      }
    };
    const mainContent = mainContentRef.current;
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, [fetchComments, commentsSkip]);

  // --- 기능 함수 ---
  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: { content: newComment } }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev]); // 새 댓글을 목록 맨 위에 추가
        setNewComment("");
        setPost((p) => ({ ...p, commentCount: p.commentCount + 1 })); // 댓글 수 업데이트
      } else {
        alert(data.message || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  // 댓글 삭제
  const deleteComment = async () => {
    if (!selectedComment) return;
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/comments/${selectedComment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== selectedComment.id));
        setPost((p) => ({ ...p, commentCount: p.commentCount - 1 }));
        setAlertMessage("댓글이 삭제되었습니다.");
        setAlertConfirmAction(null);
        setIsAlertOpen(true);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlertMessage(error.message || "댓글 삭제에 실패했습니다.");
      setAlertConfirmAction(null);
      setIsAlertOpen(true);
    }
  };

  // 댓글 신고
  const reportComment = async () => {
    if (!selectedComment) return;
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/comments/${selectedComment.id}/report`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setAlertMessage("신고가 접수되었습니다.");
        setAlertConfirmAction(null);
        setIsAlertOpen(true);
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      setAlertMessage(error.message || "댓글 신고에 실패했습니다.");
      setAlertConfirmAction(null);
      setIsAlertOpen(true);
    }
  };

  // ▼▼▼ 게시글 관련 기능 함수 추가 ▼▼▼
  const deletePost = async () => {
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        navigate(`/profile/${myAccountname}`, { replace: true });
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      setAlertMessage(error.message || "게시글 삭제에 실패했습니다.");
      setAlertConfirmAction(null);
      setIsAlertOpen(true);
    }
  };

  const reportPost = async () => {
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${postId}/report`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setAlertMessage("게시글이 신고되었습니다.");
        setAlertConfirmAction(null);
        setIsAlertOpen(true);
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      setAlertMessage(error.message || "게시글 신고에 실패했습니다.");
      setAlertConfirmAction(null);
      setIsAlertOpen(true);
    }
  };

  const goToEditPage = () => {
    navigate(`/post/${postId}/edit`);
  };

  const openPostDeleteAlert = () => {
    setIsPostModalOpen(false);
    setAlertMessage("게시글을 삭제하시겠습니까?");
    setAlertConfirmAction(() => deletePost);
    setIsAlertOpen(true);
  };

  const openCommentModal = (comment) => {
    setSelectedComment(comment);
    setIsCommentModalOpen(true);
  };

  const openCommentDeleteAlert = () => {
    setIsCommentModalOpen(false);
    setAlertMessage("댓글을 삭제하시겠습니까?");
    setAlertConfirmAction(() => deleteComment);
    setIsAlertOpen(true);
  };

  // 2. 댓글 아이콘 클릭 시, 입력창으로 스크롤하는 함수를 추가합니다.
  const handleScrollToComment = () => {
    commentFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  // ▼▼▼ 모달 옵션 분리 및 정의 ▼▼▼
  const commentModalOptions =
    selectedComment?.author.accountname === myAccountname
      ? [{ name: "삭제", action: openCommentDeleteAlert }]
      : [
          {
            name: "신고하기",
            action: () => {
              setIsCommentModalOpen(false);
              reportComment();
            },
          },
        ];

  const postModalOptions =
    post.author.accountname === myAccountname
      ? [
          { name: "삭제", action: openPostDeleteAlert },
          { name: "수정", action: goToEditPage },
        ]
      : [
          {
            name: "신고하기",
            action: () => {
              setIsPostModalOpen(false);
              reportPost();
            },
          },
        ];

  return (
    <>
      <div className="post-detail-container">
        <header className="post-detail-header">
          <button onClick={() => navigate(-1)} className="back-button" />
          {/* 게시글 더보기 버튼에 핸들러 연결 */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="more-button-header"
          />
        </header>

        <main className="post-detail-main" ref={mainContentRef}>
          {/* 게시글 영역 */}
          <div className="post-item-list">
            <div className="post-author-info">
              <Link
                to={`/profile/${post.author.accountname}`}
                className="post-author-link"
              >
                <img
                  src={generateImageUrl(post.author.image)}
                  onError={handleImgError}
                  alt=""
                  className="post-author-image"
                />
                <div className="post-author-details">
                  <span className="post-author-name">
                    {post.author.username}
                  </span>
                  <span className="post-author-account">
                    @ {post.author.accountname}
                  </span>
                </div>
              </Link>
            </div>
            <div className="post-content-list">
              <p>{post.content}</p>
              {post.image && (
                <img
                  src={generateImageUrl(post.image.split(",")[0])}
                  alt=""
                  className="post-image-list"
                />
              )}
            </div>
            <div className="post-interactions">
              <button className={`like-button ${post.hearted ? "liked" : ""}`}>
                {/* 아이콘을 heartIcon으로 통일합니다. */}
                <img src={heartIcon} alt="좋아요" />
                <span>{post.heartCount}</span>
              </button>
              {/* 3. div를 button으로 바꾸고, 클릭 이벤트를 연결합니다. */}
              <button className="comment-link" onClick={handleScrollToComment}>
                <img src={commentIcon} alt="댓글" />
                <span>{post.commentCount}</span>
              </button>
            </div>
            <p className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* 댓글 목록 영역 */}
          <div className="comment-list-container">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={generateImageUrl(comment.author.image)}
                  onError={handleImgError}
                  alt=""
                  className="comment-author-img"
                />
                <div className="comment-content-wrap">
                  <div className="comment-author-info">
                    <span className="comment-author-name">
                      {comment.author.username}
                    </span>
                    <span className="comment-time">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
                <button
                  onClick={() => openCommentModal(comment)}
                  className="more-button-comment"
                >
                  <img src={moreIcon} alt="더보기" />
                </button>
              </div>
            ))}
            {isCommentsLoading && <div>댓글 로딩 중...</div>}
          </div>
        </main>

        {/* 댓글 입력창 */}
        {/* 4. footer에 ref를 연결합니다. */}
        <footer className="comment-form-container" ref={commentFormRef}>
          <img
            src={generateImageUrl(myProfileImage)}
            onError={handleImgError}
            alt=""
            className="my-profile-img"
          />
          <input
            type="text"
            placeholder="댓글 입력하기..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!newComment.trim()}
            className="comment-submit-button"
          >
            게시
          </button>
        </footer>
      </div>

      {/* ▼▼▼ 모달 렌더링 분리 ▼▼▼ */}
      {isCommentModalOpen && (
        <Modal
          options={commentModalOptions}
          onClose={() => setIsCommentModalOpen(false)}
        />
      )}
      {isPostModalOpen && (
        <Modal
          options={postModalOptions}
          onClose={() => setIsPostModalOpen(false)}
        />
      )}
      {isAlertOpen && (
        <Alert
          message={alertMessage}
          onClose={() => setIsAlertOpen(false)}
          onConfirm={alertConfirmAction}
        />
      )}
    </>
  );
};

export default PostDetailPage;
