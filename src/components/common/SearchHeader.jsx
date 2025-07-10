import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/common/SearchHeader.css";
import backIcon from "../../assets/images/icon-arrow-left.png";

const SearchHeader = ({ keyword, setKeyword }) => {
  const navigate = useNavigate();

  return (
    <header className="search-header">
      <button onClick={() => navigate(-1)} className="back-button">
        <img src={backIcon} alt="뒤로 가기" />
      </button>
      <input
        type="text"
        className="search-input"
        placeholder="계정 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
    </header>
  );
};

export default SearchHeader;
