import React from "react";
import "../../styles/common/Alert.css";

const Alert = ({ message, onClose, onConfirm }) => {
  // '확인' 버튼을 눌렀을 때의 동작
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(); // onConfirm 함수가 있으면 실행
    }
    onClose(); // 항상 알림창을 닫음
  };

  return (
    <div className="alert-overlay">
      <div className="alert-content">
        <p className="alert-message">{message}</p>
        <div className="alert-buttons">
          {onConfirm ? (
            // onConfirm이 있으면 '취소'와 '확인' 버튼을 모두 표시
            <>
              <button onClick={onClose} className="alert-button cancel">
                취소
              </button>
              <button onClick={handleConfirm} className="alert-button confirm">
                확인
              </button>
            </>
          ) : (
            // onConfirm이 없으면 '확인' 버튼만 표시
            <button onClick={onClose} className="alert-button single-confirm">
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
