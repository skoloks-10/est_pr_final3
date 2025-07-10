import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchHeader from "../components/common/SearchHeader";
import Footer from "../components/common/Footer";
import defaultImage from "../assets/images/basic-profile.png";
import "../styles/SearchPage.css";

const SearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [userImages, setUserImages] = useState({}); // 이미지 URL을 저장할 state

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
      // encodeURIComponent()를 적용하여 한글과 특수문자를 안전하게 인코딩
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

      // 응답 데이터 구조 디버깅
      console.log("API 검색 응답 데이터:", data);

      // 데이터가 배열인지 확인하고 적절히 처리
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && typeof data === "object") {
        // API가 { users: [...] } 또는 다른 구조로 반환할 경우를 대비
        // 객체에 users 키가 있는지 확인
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("예상치 못한 응답 형식:", data);
          setUsers([]); // 빈 배열로 설정
        }
      } else {
        setUsers([]); // 빈 배열로 설정
      }
    } catch (error) {
      console.error("사용자 검색에 실패했습니다:", error);
      setUsers([]); // 오류 시 빈 배열로 설정
    }
  };

  const escapeRegExp = (string) => {
    // 정규표현식 특수 문자를 이스케이프 처리합니다
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    try {
      // 검색어를 정규식으로 사용하기 전에 특수 문자들을 이스케이프 처리
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
    } catch (error) {
      console.error("키워드 강조 처리 중 오류:", error);
      // 오류 발생시 원본 텍스트 반환
      return text;
    }
  };

  // 이미지 URL에서 파일명 추출 함수
  const extractFilename = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return null;

    // URL에서 파일명 추출
    if (imageUrl.includes("https://dev.wenivops.co.kr/services/mandarin/")) {
      return imageUrl.replace(
        "https://dev.wenivops.co.kr/services/mandarin/",
        ""
      );
    }

    // 이미 파일명만 있는 경우
    return imageUrl;
  };

  // 이미지 로드 함수
  const loadUserImages = async () => {
    const token = localStorage.getItem("token");
    // 기존 userImages를 참조하지 않고 매번 새 객체 생성
    const newUserImages = {};

    for (const user of users) {
      // 이전 검사 제거하고 image 존재 여부만 확인
      if (!user.image) continue;

      try {
        const filename = extractFilename(user.image);
        if (!filename) continue;

        console.log(`이미지 요청 URL: /services/mandarin/${filename}`); // 디버깅 로그

        const response = await fetch(`/services/mandarin/${filename}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("이미지 로드 실패");
        console.log(
          `이미지 응답 상태: ${response.status}, 타입: ${response.headers.get("Content-Type")}`
        );

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        console.log(`이미지 URL 생성 성공: ${user._id} -> ${imageUrl}`); // 성공 로그
        newUserImages[user._id] = imageUrl;
      } catch (error) {
        console.error(`사용자 ${user._id} 이미지 로드 실패:`, error);
        newUserImages[user._id] = defaultImage;
      }
    }

    console.log("최종 이미지 URL 상태:", newUserImages); // 최종 상태 확인
    setUserImages(newUserImages);
  };

  // users 배열이 업데이트될 때마다 이미지 로드
  useEffect(() => {
    if (users.length > 0) {
      // setUserImages({}) 제거 - loadUserImages에서 새로운 객체 생성
      loadUserImages();
    }

    // 컴포넌트 언마운트 시 Blob URL 정리
    return () => {
      Object.values(userImages).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [users]); // userImages는 cleanup 함수에서만 사용되므로 의존성에 추가할 필요 없음

  // userImages 상태 변화 확인용 로그 (디버깅용)
  useEffect(() => {
    console.log("userImages 상태 업데이트:", userImages);
  }, [userImages]);

  // 이미지 로딩 실패 시 기본 이미지로 교체하는 함수
  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="search-page-container">
      <SearchHeader keyword={keyword} setKeyword={setKeyword} />
      <main className="search-main-content">
        {users.map((user) => (
          <Link
            to={`/profile/${encodeURIComponent(user.accountname)}`}
            key={user._id}
            className="user-item"
          >
            <img
              // generateImageUrl 대신 userImages에서 URL 가져오기
              src={userImages[user._id] || defaultImage}
              alt={`${user.username} 프로필`}
              className="user-profile-img"
              onError={handleImgError}
            />
            <div className="user-info">
              <p className="user-name">
                {highlightKeyword(user.username, keyword)}
              </p>
              <p className="user-account">
                @{highlightKeyword(user.accountname, keyword)}
              </p>
            </div>
          </Link>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
