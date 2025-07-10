import React from "react";
import { generateImageUrl } from "../../utils/imageUrl";
import defaultImage from "../../assets/images/default-profile.svg"; // 상품 이미지가 없을 때를 대비한 기본 이미지
import "../../styles/profile/ProductList.css";

const ProductList = ({ products = [] }) => {
  // 상품이 없으면 아무것도 렌더링하지 않습니다.
  if (!products || products.length === 0) {
    return null;
  }

  const handleImgError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <section className="product-list-section">
      <h2 className="product-list-title">판매 중인 상품</h2>
      <div className="product-list-container">
        {products.map((product) => {
          // 불필요한 이미지 처리 로직을 제거합니다.
          // console.log("이미지 경로 디버깅:", product.itemImage); // 디버깅 후 제거

          return (
            <article key={product.id || product._id} className="product-item">
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="product-link"
              >
                <div className="product-image-wrapper">
                  <img
                    // API에서 받은 이미지 경로를 그대로 전달합니다.
                    src={generateImageUrl(product.itemImage)}
                    alt={product.itemName}
                    className="product-image"
                    onError={handleImgError}
                  />
                </div>
                <p className="product-name">{product.itemName}</p>
                <p className="product-price">{`${product.price.toLocaleString()}원`}</p>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ProductList;
