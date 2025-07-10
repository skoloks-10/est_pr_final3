import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "../common/ProfileHeader";
import ProfileInfo from "../profile/ProfileInfo";
import ProductList from "../profile/ProductList";
import PostList from "../profile/PostList";
import Footer from "../common/Footer";
import "../../styles/ProfilePage.css";

const ProfilePage = () => {
  const { accountname } = useParams();
  const decodedAccountname = decodeURIComponent(accountname);
  const navigate = useNavigate();

  // 1. 상태 관리 세분화
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true); // 전체 페이지 초기 로딩
  const [isPostsLoading, setIsPostsLoading] = useState(false); // 게시물 추가 로딩
  const [hasMorePosts, setHasMorePosts] = useState(true); // 더 불러올 게시물이 있는지
  const [skip, setSkip] = useState(0); // 건너뛸 게시물 수
  const POST_LIMIT = 10; // 한 번에 불러올 게시물 수

  const myAccountname = localStorage.getItem("accountname");
  const isMyProfile = decodedAccountname === myAccountname;

  // 2. 게시물만 불러오는 함수 (useCallback으로 최적화)
  const fetchPosts = useCallback(async () => {
    if (isPostsLoading || !hasMorePosts) return;

    setIsPostsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/post/${decodedAccountname}/userpost?limit=${POST_LIMIT}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.post && data.post.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...data.post]);
        setSkip((prevSkip) => prevSkip + data.post.length);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("게시물을 불러오는 데 실패했습니다.", error);
    } finally {
      setIsPostsLoading(false);
    }
  }, [decodedAccountname, isPostsLoading, hasMorePosts, skip]);

  // 3. 초기 데이터 로딩 (프로필, 상품, 첫 페이지 게시물)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsPageLoading(true);
      // 프로필이 바뀔 때마다 상태 초기화
      setProfile(null);
      setProducts([]);
      setPosts([]);
      setSkip(0);
      setHasMorePosts(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // 프로필 정보와 상품 정보를 동시에 요청
        const [profileRes, productRes] = await Promise.all([
          fetch(
            `https://dev.wenivops.co.kr/services/mandarin/profile/${decodedAccountname}`,
            {
              headers,
            }
          ),
          fetch(
            `https://dev.wenivops.co.kr/services/mandarin/product/${decodedAccountname}`,
            {
              headers,
            }
          ),
        ]);

        const profileData = await profileRes.json();
        const productData = await productRes.json();

        setProfile(profileData.profile);
        setProducts(productData.product || []);

        // 프로필, 상품 로딩 후 첫 페이지 게시물 로딩 시작
        if (profileData.profile) {
          const initialPostRes = await fetch(
            `https://dev.wenivops.co.kr/services/mandarin/post/${decodedAccountname}/userpost?limit=${POST_LIMIT}&skip=0`,
            { headers }
          );
          const initialPostData = await initialPostRes.json();
          if (initialPostData.post && initialPostData.post.length > 0) {
            setPosts(initialPostData.post);
            setSkip(initialPostData.post.length);
          } else {
            setHasMorePosts(false);
          }
        }
      } catch (error) {
        console.error("프로필 데이터를 불러오는 데 실패했습니다.", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInitialData();
  }, [decodedAccountname, navigate]); // accountname이 바뀔 때마다 모든 데이터를 새로 불러옵니다.

  // 4. 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  // 사용자 프로필 최신 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      // API에서 최신 사용자 정보 가져오기
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/profile/${decodedAccountname}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      // 최신 팔로우 상태 포함된 사용자 정보 설정
      setProfile(data.profile);
    };

    fetchUserProfile();
  }, [decodedAccountname]); // 사용자가 바뀔 때마다 재실행

  // 상품 데이터 가져오기 (예시 추가)
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/product/${decodedAccountname}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("API에서 받은 상품 데이터:", data.product); // 이 부분을 확인!
      setProducts(data.product);
    };

    fetchProducts();
  }, [decodedAccountname]); // decodedAccountname이 바뀔 때마다 상품 데이터 재요청

  // 게시물 삭제 처리 함수
  const handlePostDelete = (deletedPostId) => {
    // 삭제된 게시물을 목록에서 제거
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== deletedPostId)
    );
  };

  if (isPageLoading)
    return <div className="loading-indicator">프로필을 불러오는 중...</div>;

  return (
    <div className="profile-page-container">
      <ProfileHeader />
      <main className="profile-page-main">
        {profile && (
          <>
            <ProfileInfo profile={profile} isMyProfile={isMyProfile} />

            {products && products.length > 0 && (
              <section className="product-section">
                <h2 className="section-title">판매 중인 상품</h2>
                <ProductList products={products} />
              </section>
            )}

            {/* 게시물 목록 섹션 */}
            <section className="post-section">
              <PostList
                posts={posts}
                onPostDelete={handlePostDelete}
                showViewToggle={true}
              />
              {isPostsLoading && (
                <div className="loading-indicator">
                  게시물을 더 불러오는 중...
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
