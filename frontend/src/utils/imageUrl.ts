/**
 * Construct full image URL from relative path
 * If image already has a protocol, return as-is
 * Otherwise, prepend the image base URL
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";

  // If it already has a protocol, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise, construct full URL
  const baseUrl =
    process.env.REACT_APP_IMAGE_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${imagePath}`;
};
