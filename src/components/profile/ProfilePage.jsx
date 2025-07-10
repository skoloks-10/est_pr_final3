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

  // 상태 관리
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [skip, setSkip] = useState(0);
  const POST_LIMIT = 10;

  const myAccountname = localStorage.getItem("accountname");
  const isMyProfile = decodedAccountname === myAccountname;

  // 게시물 추가 로딩 함수
  const fetchMorePosts = useCallback(async () => {
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
      console.error("게시물을 추가로 불러오는 데 실패했습니다.", error);
    } finally {
      setIsPostsLoading(false);
    }
  }, [decodedAccountname, isPostsLoading, hasMorePosts, skip]);

  // 초기 데이터 로딩 (프로필, 상품, 첫 게시물) - 단 한 번만 실행
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsPageLoading(true);
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
        // 프로필, 상품, 첫 게시물 정보를 동시에 요청
        const [profileRes, productRes, postRes] = await Promise.all([
          fetch(
            `https://dev.wenivops.co.kr/services/mandarin/profile/${decodedAccountname}`,
            { headers }
          ),
          fetch(
            `https://dev.wenivops.co.kr/services/mandarin/product/${decodedAccountname}`,
            { headers }
          ),
          fetch(
            `https://dev.wenivops.co.kr/services/mandarin/post/${decodedAccountname}/userpost?limit=${POST_LIMIT}&skip=0`,
            { headers }
          ),
        ]);

        const profileData = await profileRes.json();
        const productData = await productRes.json();
        const postData = await postRes.json();

        // 서버에서 직접 받아온 프로필 객체를 상태에 저장
        setProfile(profileData.profile);
        setProducts(productData.product || []);

        if (postData.post && postData.post.length > 0) {
          setPosts(postData.post);
          setSkip(postData.post.length);
        } else {
          setHasMorePosts(false);
        }
      } catch (error) {
        console.error("프로필 데이터를 불러오는 데 실패했습니다.", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInitialData();
  }, [decodedAccountname, navigate]); // 프로필 주인이 바뀔 때만 모든 데이터를 새로고침

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        !isPostsLoading
      ) {
        fetchMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchMorePosts, isPostsLoading]);

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

  // 1. 상품 삭제 처리 함수 추가
  const handleProductDelete = (deletedProductId) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== deletedProductId)
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
                {/* 2. ProductList에 onProductDelete prop 전달 */}
                <ProductList
                  products={products}
                  onProductDelete={handleProductDelete}
                />
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
