import defaultImage from "../assets/images/basic-profile.png";

// 서버의 기본 URL 정의
const IMAGE_BASE_URL = "https://dev.wenivops.co.kr/services/mandarin";

/**
 * 파일 이름을 완전한 이미지 URL로 변환합니다.
 * @param {string} imagePath - API로부터 받은 이미지 경로
 * @returns {string} - 완전한 URL 또는 기본 이미지
 */
export const generateImageUrl = (imagePath) => {
  // 1. imagePath가 비어있거나, 문자열이 아니면 기본 이미지를 반환합니다.
  if (!imagePath || typeof imagePath !== "string") {
    return defaultImage;
  }

  // 2. 여러 이미지가 쉼표로 구분되어 있다면, 첫 번째 이미지만 사용합니다.
  let targetPath = imagePath.split(",")[0].trim();

  // 3. 이미 완전한 URL인 경우 그대로 반환합니다. (http:// 또는 https://)
  if (targetPath.startsWith("http")) {
    // 중복된 URL이 포함된 경우 수정
    const duplicatePattern = `${IMAGE_BASE_URL}/`;
    if (targetPath.startsWith(duplicatePattern + "http")) {
      return targetPath.substring(duplicatePattern.length);
    }
    return targetPath;
  }

  // 4. API 서버의 기본 URL이 중복된 경우 처리
  const duplicateUrlPattern = new RegExp(
    `^${IMAGE_BASE_URL}/${IMAGE_BASE_URL}`
  );
  if (duplicateUrlPattern.test(targetPath)) {
    targetPath = targetPath.substring(IMAGE_BASE_URL.length + 1);
  }

  // 5. 'Ellipse.png'와 같은 특정 기본 이미지 파일명을 처리합니다.
  if (targetPath.endsWith("Ellipse.png")) {
    return defaultImage;
  }

  // 6. 최종적으로 완전한 URL을 반환합니다.
  return `${IMAGE_BASE_URL}/${
    targetPath.startsWith("/") ? targetPath.substring(1) : targetPath
  }`;
};
