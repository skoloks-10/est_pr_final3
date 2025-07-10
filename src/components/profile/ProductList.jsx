import React, { useState, useEffect } from "react"; // useEffect 임포트
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/basic-profile.png";
import "../../styles/profile/ProductList.css";

// 부모로부터 onProductDelete 함수를 props로 받습니다.
const ProductList = ({ products = [], onProductDelete }) => {
  // --- 콘솔 출력 코드 추가 ---
  useEffect(() => {
    if (products && products.length > 0) {
      console.log("📦 ProductList가 받은 전체 상품 데이터:", products);

      // 첫 번째 상품의 이미지 데이터만 따로 자세히 볼 수 있습니다.
      console.log("🖼️ 첫 번째 상품의 이미지:", products[0].itemImage);
    }
  }, [products]); // products 배열이 변경될 때마다 이 코드가 실행됩니다.
  // -------------------------

  const myAccountname = localStorage.getItem("accountname");

  // 모달과 알림창 상태 관리
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    selectedProduct: null,
    alertMessage: "",
    alertConfirmText: "",
    onConfirmAction: null,
  });

  // 상품 삭제 API 호출
  const handleDeleteProduct = async (productId) => {
    closeAlert();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://dev.wenivops.co.kr/services/mandarin/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "상품 삭제에 실패했습니다.");
      }

      onProductDelete(productId);

      alert("상품이 삭제되었습니다.");
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert(error.message);
    }
  };

  // 모달 열기
  const openModal = (product) => {
    setModalState((prev) => ({
      ...prev,
      isModalOpen: true,
      selectedProduct: product,
    }));
  };

  // 모달 닫기
  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isModalOpen: false }));
  };

  // 알림창 열기
  const openAlert = ({ message, confirmText, onConfirm }) => {
    setModalState((prev) => ({
      ...prev,
      isModalOpen: false,
      isAlertOpen: true,
      alertMessage: message,
      alertConfirmText: confirmText,
      onConfirmAction: onConfirm,
    }));
  };

  // 알림창 닫기
  const closeAlert = () => {
    setModalState((prev) => ({ ...prev, isAlertOpen: false }));
  };

  // 모달에 표시될 옵션 생성
  const getModalOptions = () => {
    const product = modalState.selectedProduct;
    if (!product) return [];

    const isMyProduct = product.author.accountname === myAccountname;
    const options = [
      {
        text: "웹사이트에서 상품 보기",
        action: () => {
          window.open(product.link, "_blank");
          closeModal();
        },
      },
    ];

    if (isMyProduct) {
      options.unshift({
        text: "삭제",
        action: () =>
          openAlert({
            message: "상품을 삭제할까요?",
            confirmText: "삭제",
            onConfirm: () => handleDeleteProduct(product.id),
          }),
      });
    }

    return options;
  };

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <>
      <section className="product-list-section">
        {products.length > 0 ? (
          <div className="product-list-wrapper">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-item"
                onClick={() => openModal(product)}
              >
                <img
                  src={generateImageUrl(product.itemImage)}
                  alt={product.itemName}
                  className="product-image"
                  crossOrigin="anonymous"
                  onError={handleImgError}
                />
                <p className="product-name">{product.itemName}</p>
                <p className="product-price">
                  {product.price.toLocaleString("ko-KR")}원
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-products">등록된 상품이 없습니다.</p>
        )}
      </section>

      {modalState.isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <ul>
              {getModalOptions().map((option, index) => (
                <li key={index}>
                  <button onClick={option.action}>{option.text}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {modalState.isAlertOpen && (
        <div className="alert-backdrop">
          <div className="alert-content">
            <p className="alert-message">{modalState.alertMessage}</p>
            <div className="alert-buttons">
              <button onClick={closeAlert}>취소</button>
              <button className="confirm" onClick={modalState.onConfirmAction}>
                {modalState.alertConfirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductList;
