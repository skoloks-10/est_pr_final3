/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/common/Footer.css";
import homeIcon from "../../assets/images/icon-home.svg";
import homeIconFill from "../../assets/images/icon-home-fill.svg";
import chatIcon from "../../assets/images/icon-message-circle.png";
import chatIconFill from "../../assets/images/icon-message-circle-fill.png";
import editIcon from "../../assets/images/icon-edit.png";
import userIcon from "../../assets/images/icon-user.png";
import userIconFill from "../../assets/images/icon-user-fill.png";

const Footer = () => {
  const accountname = localStorage.getItem("accountname");

  return (
    <nav className="app-footer">
      <NavLink to="/home" className="nav-item">
        {({ isActive }) => (
          <>
            <img src={isActive ? homeIconFill : homeIcon} alt="홈" />
            <span>홈</span>
          </>
        )}
      </NavLink>
      <NavLink to="/chat" className="nav-item">
        {({ isActive }) => (
          <>
            <img src={isActive ? chatIconFill : chatIcon} alt="채팅" />
            <span>채팅</span>
          </>
        )}
      </NavLink>
      <NavLink to="/post/upload" className="nav-item">
        {({ isActive }) => (
          <>
            <img src={editIcon} alt="게시물 작성" />
            <span>게시물 작성</span>
          </>
        )}
      </NavLink>
      <NavLink to={`/profile/${accountname}`} className="nav-item">
        {({ isActive }) => (
          <>
            <img src={isActive ? userIconFill : userIcon} alt="프로필" />
            <span>프로필</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default Footer;
