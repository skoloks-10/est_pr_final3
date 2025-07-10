import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import uploadFileIcon from "../assets/images/img-button.svg";
import "../styles/ProductUploadPage.css";

const ProductUploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [saleLink, setSaleLink] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // 1. API 명세에 맞춘 유효성 검사
  useEffect(() => {
    const isNameValid = productName.length >= 2 && productName.length <= 15;
    // 가격은 1원 이상이어야 함
    const isPriceValid = parseInt(price.replace(/,/g, ""), 10) >= 1;
    const isLinkValid = saleLink.length > 0;
    const isImageValid = !!imageFile;

    setIsFormValid(isNameValid && isPriceValid && isLinkValid && isImageValid);
  }, [productName, price, saleLink, imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const numericValue = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(numericValue)) {
      setPrice("");
    } else {
      setPrice(numericValue.toLocaleString("ko-KR"));
    }
  };

  // 2. API 명세에 맞춘 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      let itemImageUrl = ""; // 전체 이미지 URL을 저장할 변수

      // Step 1: 이미지 업로드 및 전체 URL 생성
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgRes = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!imgRes.ok) {
          const errorData = await imgRes.json();
          throw new Error(errorData.message || "이미지 업로드에 실패했습니다.");
        }

        const imgData = await imgRes.json();
        console.log("이미지 업로드 응답:", imgData); // 1. 이미지 서버 응답 확인
        let filename = "";

        // { info: { filename: '...' } } 형식 응답 처리 (단일 파일)
        if (
          imgData &&
          imgData.info &&
          typeof imgData.info === "object" &&
          !Array.isArray(imgData.info)
        ) {
          filename = imgData.info.filename;
        }
        // { info: [...] } 형식 응답 처리 (다중 파일과 호환)
        else if (
          imgData &&
          Array.isArray(imgData.info) &&
          imgData.info.length > 0
        ) {
          filename = imgData.info[0].filename;
        }
        // { filename: '...' } 형식 응답 처리 (하위 호환)
        else if (imgData.filename) {
          filename = imgData.filename;
        }

        if (filename) {
          itemImageUrl = `https://dev.wenivops.co.kr/services/mandarin/${filename}`;
        } else {
          throw new Error("서버 응답에서 이미지 파일명을 찾을 수 없습니다.");
        }
      }

      // URL 형식 검증 및 접두어 추가
      let formattedLink = saleLink;
      if (
        saleLink &&
        !saleLink.startsWith("http://") &&
        !saleLink.startsWith("https://")
      ) {
        formattedLink = `https://${saleLink}`;
      }

      // Step 2: 상품 데이터 전송
      const productData = {
        product: {
          itemName: productName,
          price: parseInt(price.replace(/,/g, ""), 10),
          link: formattedLink,
          itemImage: itemImageUrl, // 전체 URL 전송
        },
      };

      const token = localStorage.getItem("token");
      const productRes = await fetch(
        "https://dev.wenivops.co.kr/services/mandarin/product",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      const productResult = await productRes.json();
      console.log("상품 등록 응답:", productResult); // 2. 상품 등록 서버 응답 확인

      if (!productRes.ok) {
        throw new Error(productResult.message || "상품 등록에 실패했습니다.");
      }

      if (productResult.product) {
        navigate(`/profile/${localStorage.getItem("accountname")}`);
      } else {
        throw new Error(
          productResult.message || "알 수 없는 오류로 상품 등록에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("상품 등록 중 오류 발생:", error);
      alert(error.message);
    }
  };

  return (
    <div className="product-upload-container">
      <header className="product-upload-header">
        <button onClick={() => navigate(-1)} className="back-button"></button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="save-button"
        >
          저장
        </button>
      </header>
      <main className="product-upload-main">
        <form onSubmit={handleSubmit} className="product-upload-form">
          <div className="input-group">
            <label>이미지 등록</label>
            <div
              className="image-upload-area"
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="상품 이미지 미리보기"
                  className="image-preview"
                />
              )}
              <img
                src={uploadFileIcon}
                alt="업로드 아이콘"
                className="image-placeholder-icon"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="productName">상품명</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="2~15자 이내여야 합니다."
            />
          </div>

          <div className="input-group">
            <label htmlFor="price">가격</label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={handlePriceChange}
              inputMode="numeric"
              placeholder="숫자만 입력 가능합니다."
            />
          </div>

          <div className="input-group">
            <label htmlFor="saleLink">판매 링크</label>
            <input
              type="text"
              id="saleLink"
              value={saleLink}
              onChange={(e) => setSaleLink(e.target.value)}
              placeholder="URL을 입력해 주세요."
            />
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProductUploadPage;
