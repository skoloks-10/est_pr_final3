import React, { useState } from "react";
import { Link } from "react-router-dom";
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/default-profile.svg";
import "../../styles/profile/UserListItem.css";

const UserListItem = ({ user, onFollowToggle, listType }) => {
  const [isFollowing, setIsFollowing] = useState(user.isfollow);
  const showButton = listType === "following";

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    // 2. 현재 isFollowing 상태에 따라 'unfollow' 또는 'follow' 액션을 결정합니다.
    const action = isFollowing ? "unfollow" : "follow";
    const method = isFollowing ? "DELETE" : "POST";
    console.log("버튼 클릭 전 상태:", isFollowing);

    try {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);

      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/profile/${user.accountname}/${action}`,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        // API 호출이 실패하면 원래 상태로 되돌림
        setIsFollowing(isFollowing);
        throw new Error(data.message);
      }

      console.log("API 응답:", data.profile);

      if (onFollowToggle) {
        onFollowToggle(user.accountname, newIsFollowing);
      }

      if (res.ok) {
        // 로컬 스토리지에 팔로우 상태 저장
        const followStatus = JSON.parse(
          localStorage.getItem("followStatus") || "{}"
        );
        followStatus[user.accountname] = newIsFollowing;
        localStorage.setItem("followStatus", JSON.stringify(followStatus));
      }
    } catch (error) {
      console.error("팔로우 처리 중 오류:", error);
      alert(error.message);
    }
    console.log("버튼 클릭 후 상태:", isFollowing);
  };

  // 이미지 로딩 실패 시 기본 이미지로 교체하는 함수
  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="user-list-item">
      <Link to={`/profile/${user.accountname}`} className="user-link">
        <img
          // 3. generateImageUrl 함수를 사용하여 올바른 이미지 주소 생성
          src={generateImageUrl(user.image)}
          alt={`${user.username}의 프로필`}
          className="user-image"
          onError={handleImgError} // 4. 이미지 로딩 실패 대비
        />
        <div className="user-details">
          <p className="user-name">{user.username}</p>
          <p className="user-intro">{user.intro}</p>
        </div>
      </Link>

      {showButton && (
        <button
          onClick={handleFollow}
          className={`follow-button ${isFollowing ? "cancel" : ""}`}
        >
          {/* isFollowing 상태에 따라 '취소' 또는 '팔로우' 텍스트가 표시됩니다. */}
          {isFollowing ? "취소" : "팔로우"}
        </button>
      )}
    </div>
  );
};

export default UserListItem;
