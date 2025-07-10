import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/default-profile.svg";
import chatIcon from "../../assets/images/icon-message-circle.png";
import shareIcon from "../../assets/images/icon-share.png";
import "../../styles/profile/ProfileInfo.css";

const ProfileInfo = ({ profile, isMyProfile, onFollowChange }) => {
  // isfollow prop으로 초기 상태 설정
  const [isFollowing, setIsFollowing] = useState(profile.isfollow);
  // 팔로워 수를 상태로 관리하여 실시간으로 변경
  const [followerCount, setFollowerCount] = useState(profile.followerCount);

  // 외부에서 profile이 바뀌면 상태도 업데이트
  useEffect(() => {
    setIsFollowing(profile.isfollow);
    setFollowerCount(profile.followerCount);
  }, [profile.isfollow, profile.followerCount]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem("token");
    const action = isFollowing ? "unfollow" : "follow";
    const method = isFollowing ? "DELETE" : "POST";

    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/profile/${profile.accountname}/${action}`,
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
        throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
      }

      if (data.profile) {
        // API 응답을 기반으로 팔로우 상태와 팔로워 수 업데이트
        setIsFollowing(!isFollowing);
        setFollowerCount(data.profile.followerCount);

        // 팔로우 상태 변경을 부모 컴포넌트에 알림
        if (onFollowChange) {
          onFollowChange(!isFollowing);
        }
      }
    } catch (error) {
      console.error("팔로우 처리 중 오류:", error);
      alert(error.message);
    }
  };

  // 이미지 로딩 실패 시 기본 이미지로 교체하는 함수
  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <section className="profile-info-section">
      <div className="followers-followings">
        <Link
          to={`/profile/${profile.accountname}/followers`}
          className="count-info"
        >
          {/* 상태로 관리되는 팔로워 수 표시 */}
          <p className="count">{followerCount}</p>
          <span>followers</span>
        </Link>

        <img
          // 3. generateImageUrl 함수를 사용하여 올바른 이미지 주소를 생성합니다.
          src={generateImageUrl(profile.image)}
          alt="프로필 이미지"
          className="profile-image"
          onError={handleImgError} // 4. 로딩 실패 시를 대비한 onError 핸들러를 추가합니다.
        />

        <Link
          to={`/profile/${profile.accountname}/followings`}
          className="count-info"
        >
          <p className="count">{profile.followingCount}</p>
          <span>followings</span>
        </Link>
      </div>
      <p className="username">{profile.username}</p>
      <p className="accountname">@ {profile.accountname}</p>
      <p className="intro">{profile.intro}</p>
      <div className="profile-buttons">
        {isMyProfile ? (
          <>
            <Link to="/profile/edit" className="profile-button">
              프로필 수정
            </Link>
            <Link to="/product/upload" className="profile-button">
              상품 등록
            </Link>
          </>
        ) : (
          <>
            <button className="icon-button">
              <img src={chatIcon} alt="채팅" />
            </button>
            <button
              onClick={handleFollowToggle}
              className={`profile-button ${isFollowing ? "unfollow" : "follow"}`}
            >
              {isFollowing ? "언팔로우" : "팔로우"}
            </button>
            <button className="icon-button">
              <img src={shareIcon} alt="공유" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default ProfileInfo;
