import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FollowListHeader from "../components/common/FollowListHeader";
import UserListItem from "../components/profile/UserListItem";
import Footer from "../components/common/Footer";
import "../styles/profile/FollowListPage.css";

const FollowListPage = () => {
  const { accountname } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const path = location.pathname.split("/").pop(); // 'followers' 또는 'followings'
  const listType = path === "followers" ? "follower" : "following"; // API 요청에 맞게 변환 (s 제거)

  // 화면에 표시할 제목용
  const pageTitle = path === "followers" ? "Followers" : "Followings";

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(
          `https://dev.wenivops.co.kr/services/mandarin/profile/${accountname}/${listType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          }
        );

        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("사용자 목록을 불러오는 데 실패했습니다.");
        }

        const data = await res.json();
        console.log("API 응답 데이터:", data); // API 응답 전체를 확인
        // API 응답이 사용자 객체 배열 자체일 가능성이 높으므로, data를 직접 상태에 설정합니다.
        setUsers(data || []);
      } catch (error) {
        console.error(`${pageTitle} 목록 로딩 실패:`, error);
        alert(error.message);
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [accountname, listType, pageTitle, navigate]);

  const handleFollowToggle = (targetAccountname, newIsFollow) => {
    if (listType === "followings" && !newIsFollow) {
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.accountname !== targetAccountname)
      );
    } else {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.accountname === targetAccountname
            ? { ...user, isfollow: newIsFollow }
            : user
        )
      );
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="follow-list-page-container">
      <FollowListHeader title={pageTitle} />
      <main className="follow-list-main">
        {users.length > 0 ? (
          users.map((user) => (
            <UserListItem
              key={user._id}
              user={user}
              onFollowToggle={handleFollowToggle}
              listType={listType} // 이 부분 확인
            />
          ))
        ) : (
          <p className="no-users-message">표시할 사용자가 없습니다.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FollowListPage;
