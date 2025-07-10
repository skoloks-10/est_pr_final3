import React from "react";
import "../../styles/common/Modal.css";

const Modal = ({ options, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <ul className="modal-options-list">
          {options.map((option, index) => (
            <li key={index}>
              <button
                onClick={option.action}
                className={`modal-option ${
                  option.name === "삭제" ? "warning" : ""
                }`}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Modal;
