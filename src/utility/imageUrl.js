const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";

export const getImageUrl = (imageUrl) => {

    if (!imageUrl) {
        return "";
    }

    // Already an absolute URL
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Relative URL returned by backend
    return `${API_BASE_URL}${imageUrl}`;
};

export default getImageUrl;