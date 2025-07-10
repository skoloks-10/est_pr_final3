import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import PostList from "../components/profile/PostList";
import emptyFeedIcon from "../assets/images/logo.png";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  // 1. 무한 스크롤을 위한 상태 추가
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 초기 로딩과 추가 로딩을 모두 관리
  const [hasMore, setHasMore] = useState(true); // 더 불러올 게시물이 있는지 여부
  const [skip, setSkip] = useState(0); // 건너뛸 게시물 수 (페이지네이션)
  const POST_LIMIT = 10; // 한 번에 불러올 게시물 수

  // 2. 데이터 로딩 함수 수정 (useCallback으로 불필요한 재실행 방지)
  const fetchFeed = useCallback(async () => {
    if (isLoading || !hasMore) return; // 로딩 중이거나 더 이상 게시물이 없으면 실행하지 않음

    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/feed?limit=${POST_LIMIT}&skip=${skip}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("피드를 불러오는 데 실패했습니다.");

      const data = await response.json();

      if (data.posts.length > 0) {
        // 기존 feed에 새로운 게시물을 이어 붙임
        setFeed((prevFeed) => [...prevFeed, ...data.posts]);
        setSkip((prevSkip) => prevSkip + data.posts.length);
      } else {
        // 받아온 게시물이 없으면 더 이상 불러올 데이터가 없는 것으로 간주
        setHasMore(false);
      }
    } catch (error) {
      console.error("피드를 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, skip, navigate]);

  // 3. 스크롤 이벤트 핸들러 추가
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 맨 아래에 가까워졌는지 확인 (맨 아래에서 200px 위)
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        fetchFeed();
      }
    };

    window.addEventListener("scroll", handleScroll);
    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거 (메모리 누수 방지)
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchFeed]);

  // 4. 첫 페이지 로딩
  useEffect(() => {
    // 컴포넌트가 처음 마운트될 때만 첫 페이지 데이터를 불러옴
    setFeed([]);
    setSkip(0);
    setHasMore(true);
    // 초기 로드를 위해 즉시 실행
    (async () => {
      await fetchFeed();
    })();
  }, []); // 의존성 배열을 비워 최초 1회만 실행되도록 함

  const handleSearchClick = () => navigate("/search");

  return (
    <div className="home-page-container">
      <Header />
      <main className="home-main-content">
        {feed.length > 0 ? (
          <PostList posts={feed} showViewToggle={false} />
        ) : (
          !isLoading && ( // 로딩 중이 아닐 때만 '피드 없음' 메시지 표시
            <div className="empty-feed">
              <img
                src={emptyFeedIcon}
                alt="피드 없음"
                className="empty-feed-icon"
              />
              <p>유저를 검색해 팔로우 해보세요!</p>
              <button onClick={handleSearchClick} className="search-button">
                검색하기
              </button>
            </div>
          )
        )}
        {/* 로딩 중일 때 표시될 스피너 또는 메시지 */}
        {isLoading && <div className="loading-indicator">로딩 중...</div>}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
