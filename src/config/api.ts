import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_USER: (userId: string) => `${API_BASE_URL}/auth/user/${userId}`,
  UPDATE_USER: (userId: string) => `${API_BASE_URL}/auth/user/${userId}`,

  // Chat
  SEND_MESSAGE: `${API_BASE_URL}/api/chat/`,
  GET_CHAT_HISTORY: `${API_BASE_URL}/api/chat/history`,

  // Wardrobe
  ADD_ITEM: `${API_BASE_URL}/wardrobe/`,
  GET_ITEMS: `${API_BASE_URL}/wardrobe/`,
  DELETE_ITEM: (itemId: string) => `${API_BASE_URL}/wardrobe/${itemId}`,

  // Outfit Suggestions
  GET_SUGGESTIONS: `${API_BASE_URL}/outfits/suggest`,
  GENERATE_OUTFITS: `${API_BASE_URL}/outfits/generate`,
  GET_OUTFITS_FOR_USER: (userId: string) => `${API_BASE_URL}/outfits/user/${userId}`,
  DELETE_OUTFIT: (outfitId: string) => `${API_BASE_URL}/outfits/${outfitId}`,

  // Saved Outfits
  SAVE_OUTFIT: `${API_BASE_URL}/saved/`,
  GET_SAVED_OUTFITS: (userId: string) => `${API_BASE_URL}/saved/user/${userId}`,
  DELETE_SAVED_OUTFIT: (savedOutfitId: string) => `${API_BASE_URL}/saved/${savedOutfitId}`,
  LIKE_SAVED_OUTFIT: (savedOutfitId: string) => `${API_BASE_URL}/saved/${savedOutfitId}/like`,

  // Community/Posts
  CREATE_POST: `${API_BASE_URL}/posts/`,
  GET_POSTS: `${API_BASE_URL}/posts/`,
  GET_USER_POSTS: (userId: string) => `${API_BASE_URL}/posts/user/${userId}`,
  LIKE_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}/like`,
  SAVE_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}/save`,
  GET_SAVED_POSTS: (userId: string) => `${API_BASE_URL}/posts/saved/user/${userId}`,
  ADD_COMMENT: (postId: string) => `${API_BASE_URL}/posts/${postId}/comment`,
  DELETE_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}`,
  DELETE_COMMENT: (postId: string, commentId: string) => `${API_BASE_URL}/posts/${postId}/comment/${commentId}`,
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Don't override Content-Type if data is FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token added to request:", token.substring(0, 20) + "...");
  } else if (!token) {
    console.warn("⚠️  No token in localStorage for request to:", config.url);
  }
  return config;
});

const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "/auth";
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const apiCall = async (
  url: string,
  options: { method?: "GET" | "POST" | "PUT" | "DELETE" | string; data?: any; params?: any; headers?: any } = {}
) => {
  try {
    const response = await apiClient({
      url,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "API Error"
      );
    }
    throw error;
  }
};
