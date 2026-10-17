const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";


// ============================================================
// IMAGE URL RESOLVER
// ============================================================

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  const value = String(imageUrl).trim();

  if (!value) {
    return "";
  }


  // ==========================================================
  // ABSOLUTE / BROWSER URL
  // ==========================================================

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }


  // ==========================================================
  // NORMALIZE BACKEND BASE URL
  // ==========================================================

  const backendUrl =
    API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;


  // ==========================================================
  // ALREADY CONTAINS /uploads
  // ==========================================================

  if (
    value.startsWith("/uploads/")
  ) {
    return `${backendUrl}${value}`;
  }

  if (
    value.startsWith("uploads/")
  ) {
    return `${backendUrl}/${value}`;
  }


  // ==========================================================
  // USER PROFILE IMAGES
  // ==========================================================
  //
  // Database currently stores:
  //
  // profile-images/users/{userId}/{file}
  //
  // Spring exposes uploaded files publicly from:
  //
  // /uploads/**
  //
  // Therefore:
  //
  // profile-images/users/18/a.jpg
  //
  // becomes:
  //
  // http://localhost:8080/uploads/profile-images/users/18/a.jpg
  //
  // ==========================================================

  if (
    value.startsWith("profile-images/")
  ) {
    return `${backendUrl}/uploads/${value}`;
  }


  // ==========================================================
  // GENERAL RELATIVE PATH
  // ==========================================================

  const normalizedPath =
    value.startsWith("/")
      ? value
      : `/${value}`;

  return `${backendUrl}${normalizedPath}`;
};


export default getImageUrl;