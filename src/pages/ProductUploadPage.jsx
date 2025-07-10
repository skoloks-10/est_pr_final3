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

    // Step 1: 이미지 업로드
    let uploadedFileName = ""; // 파일 이름만 저장할 변수
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const imgRes = await fetch(
          "https://dev.wenivops.co.kr/services/mandarin/image/uploadfile",
          {
            method: "POST",
            body: formData,
          }
        );
        const imgData = await imgRes.json();
        if (imgData.filename) {
          // 🚨 중요: 전체 URL이 아닌, 응답받은 'filename'만 저장합니다.
          uploadedFileName = imgData.filename;
        } else {
          alert("이미지 업로드에 실패했습니다.");
          return;
        }
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        return;
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
        // 🚨 중요: 가공되지 않은 파일 이름을 전송합니다.
        itemImage: uploadedFileName,
      },
    };

    // 디버깅용 - 서버에 전송하는 데이터 확인
    console.log("서버에 전송할 데이터:", productData);

    const token = localStorage.getItem("token");
    try {
      // API 명세에 따라 POST /product 요청 전송
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

      // 에러 응답 상세 정보 확인
      if (!productRes.ok) {
        const errorText = await productRes.text();
        console.error("서버 응답:", errorText);
        throw new Error(
          `상품 등록 실패: ${productRes.status} ${productRes.statusText}`
        );
      }

      const productResult = await productRes.json();

      // 3. API 응답 처리
      if (productResult.product) {
        // SUCCESS: 성공 시 프로필 페이지로 이동
        navigate(`/profile/${localStorage.getItem("accountname")}`);
      } else {
        // FAIL: 실패 시 서버 메시지 표시
        alert(productResult.message || "상품 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 등록 중 오류 발생:", error);
      alert("상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
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
