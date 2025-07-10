import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext"; // 1. UserProvider를 import 합니다.
import "./App.css"; // App.css import 추가

import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import EmailLoginPage from "./pages/EmailLoginPage";
import EmailSignupPage from "./pages/EmailSignupPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ChatListPage from "./pages/ChatListPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import PostUploadPage from "./pages/PostUploadPage";
import ProfilePage from "./components/profile/ProfilePage";
import FollowListPage from "./pages/FollowListPage"; // FollowListPage import 추가
import ProfileEditPage from "./pages/ProfileEditPage";
import ProductUploadPage from "./pages/ProductUploadPage";
import PostDetailPage from "./pages/PostDetailPage";
import NotFoundPage from "./pages/404page"; // 1. NotFoundPage 컴포넌트를 import 합니다.

function App() {
  return (
    <Router>
      {/* 2. UserProvider로 Routes 컴포넌트를 감싸줍니다. */}
      <UserProvider>
        <Routes>
          {/* 인증 및 시작 */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/email" element={<EmailLoginPage />} />
          <Route path="/signup/email" element={<EmailSignupPage />} />
          <Route path="/signup/profile" element={<ProfileSetupPage />} />

          {/* 메인 화면 */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:id" element={<ChatRoomPage />} />
          <Route path="/post/upload" element={<PostUploadPage />} />
          <Route path="/profile/:accountname" element={<ProfilePage />} />
          {/* 팔로워/팔로잉 경로 추가 */}
          <Route
            path="/profile/:accountname/followers"
            element={<FollowListPage />}
          />
          <Route
            path="/profile/:accountname/followings"
            element={<FollowListPage />}
          />
          {/* 프로필 편집 페이지 추가 */}
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/product/upload" element={<ProductUploadPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          {/* 2. 정의된 라우트 외 모든 경로(*)에 대해 NotFoundPage를 보여주도록 설정합니다. */}
          {/* 이 Route는 항상 Routes 컴포넌트의 가장 마지막에 위치해야 합니다. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
