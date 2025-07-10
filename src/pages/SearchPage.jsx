import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateImageUrl } from "../utils/imageUrl"; // 1. generateImageUrl 함수 불러오기
import SearchHeader from "../components/common/SearchHeader";
import Footer from "../components/common/Footer";
import defaultImage from "../assets/images/basic-profile.png";
import "../styles/SearchPage.css";

const SearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (keyword) {
        searchUsers(keyword);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  const searchUsers = async (searchKeyword) => {
    const token = localStorage.getItem("token");
    try {
      const encodedKeyword = encodeURIComponent(searchKeyword);
      const response = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/user/searchuser/?keyword=${encodedKeyword}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("사용자 검색에 실패했습니다:", error);
      setUsers([]);
    }
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    const escapedKeyword = escapeRegExp(keyword);
    const parts = text.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <strong key={index} className="highlight">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // 3. 개별적으로 이미지를 로드하던 복잡한 로직을 모두 삭제합니다.
  // (extractFilename, loadUserImages, 관련 useEffect 훅들)

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="search-page-container">
      <SearchHeader keyword={keyword} setKeyword={setKeyword} />
      <main className="search-main-content">
        <div className="search-results-container">
          {users.map((user) => (
            <Link
              to={`/profile/${user.accountname}`}
              key={user._id}
              className="user-search-item"
            >
              {/* 4. generateImageUrl을 직접 사용하여 간결하게 처리 */}
              <img
                src={generateImageUrl(user.image)}
                alt={`${user.username}의 프로필`}
                className="user-profile-image"
                crossOrigin="anonymous"
                onError={handleImgError}
              />
              <div className="user-info">
                <p className="username">{user.username}</p>
                <p className="user-account">
                  @{highlightKeyword(user.accountname, keyword)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
