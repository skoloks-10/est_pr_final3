import React, { createContext, useState, useContext, useEffect } from "react";

// 1. Context 생성
const UserContext = createContext(null);

// 2. Context를 쉽게 사용하기 위한 커스텀 훅
export const useUser = () => useContext(UserContext);

// 3. Context Provider 컴포넌트: 앱 전체에 사용자 정보를 제공
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    image: localStorage.getItem("profileImage"),
    accountname: localStorage.getItem("accountname"),
  });

  // 사용자 정보를 업데이트하고, 변경 사항을 즉시 반영하는 함수
  const updateUserProfile = (newProfile) => {
    // localStorage 업데이트
    if (newProfile.image) {
      localStorage.setItem("profileImage", newProfile.image);
    }
    if (newProfile.accountname) {
      localStorage.setItem("accountname", newProfile.accountname);
    }
    // 앱의 다른 컴포넌트들이 리렌더링되도록 state 업데이트
    setUser(newProfile);
  };

  // 앱이 처음 로드될 때 localStorage의 값으로 state를 초기화
  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    const storedAccountname = localStorage.getItem("accountname");
    if (storedImage || storedAccountname) {
      setUser({ image: storedImage, accountname: storedAccountname });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
