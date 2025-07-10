import React from "react";
import { Link } from "react-router-dom";
import "../../styles/common/Header.css";
import searchIcon from "../../assets/images/icon-search.png";

const Header = () => {
  return (
    <header className="app-header">
      <h1 className="app-title">에코스왑 피드</h1>
      <Link to="/search">
        <img src={searchIcon} alt="검색" className="search-icon" />
      </Link>
    </header>
  );
};

export default Header;
