import defaultImage from "../assets/images/basic-profile.png";

// 서버의 기본 URL 정의
const IMAGE_BASE_URL = "https://dev.wenivops.co.kr/services/mandarin";
const FULL_URL_PREFIX = "https://dev.wenivops.co.kr";

/**
 * 파일 이름을 완전한 이미지 URL로 변환합니다.
 * URL을 그대로 반환하도록 수정되었습니다.
 * @param {string} imagePath - API로부터 받은 이미지 경로
 * @returns {string} - 완전한 URL 또는 기본 이미지
 */
export const generateImageUrl = (imagePath) => {
  console.log("원본 이미지 경로:", imagePath);

  // 1. imagePath가 비어있거나, 문자열이 아니면 기본 이미지를 반환합니다.
  if (!imagePath || typeof imagePath !== "string") {
    return defaultImage;
  }

  // 2. 여러 이미지가 쉼표로 구분되어 있다면, 첫 번째 이미지만 사용합니다.
  let targetPath = imagePath;
  if (imagePath.includes(",")) {
    targetPath = imagePath.split(",")[0].trim();
  }

  // 3. URL이 중복되는 문제 처리
  const duplicateUrlPattern =
    /https:\/\/dev\.wenivops\.co\.kr\/services\/mandarin\/https:\/\/dev\.wenivops\.co\.kr\/services\/mandarin\//g;
  if (duplicateUrlPattern.test(targetPath)) {
    targetPath = targetPath.replace(
      "https://dev.wenivops.co.kr/services/mandarin/",
      ""
    );
  }

  // 4. 이미 완전한 URL 형태이면, 그대로 사용합니다.
  if (targetPath.startsWith(FULL_URL_PREFIX)) {
    return targetPath; // URL을 그대로 반환
  }

  // 5. 경로가 /services/mandarin으로 시작하는지 확인
  if (targetPath.startsWith("/services/mandarin/")) {
    return FULL_URL_PREFIX + targetPath; // 전체 URL 형태로 반환
  }

  // 6. Ellipse.png인 경우 로컬 이미지로 바로 대체
  if (targetPath === "Ellipse.png" || targetPath === "/Ellipse.png") {
    return defaultImage;
  }

  // 7. 최종적으로 완전한 URL을 반환합니다.
  const path = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const finalUrl = targetPath.startsWith(FULL_URL_PREFIX)
    ? targetPath
    : `${IMAGE_BASE_URL}${path}`;

  console.log("최종 변환된 URL:", finalUrl);
  return finalUrl;
};
