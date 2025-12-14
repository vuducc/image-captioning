import axios from "axios";
import { Client } from "@gradio/client";

const API_URL =
  import.meta.env.VITE_API_URL || "https://visual-caption-backend.onrender.com";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  withCredentials: true,
});

if (import.meta.env.DEV) {
  api.defaults.baseURL = API_BASE_URL;
} else {
  api.defaults.baseURL = `${API_URL}${API_BASE_URL}`;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const auth = {
  register: ({ email, password }) => {
    return api.post("/auth/register", null, {
      params: { email: String(email), password: String(password) },
    });
  },

  sendOtp: (email) => {
    return api.post("/auth/send-otp", null, {
      params: { email: String(email) },
    });
  },

  verifyOtp: ({ email, otp }) => {
    return api.post("/auth/verify-otp", null, {
      params: { email: String(email), otp: String(otp) },
    });
  },

  login: ({ email, password }) => {
    return api.post("/auth/login", null, {
      params: { email: String(email), password: String(password) },
    });
  },

  logout: () => api.post("/auth/logout"),

  // Admin API Endpoints
  adminGetUsers: (search = null, status = null) => {
    const params = {};
    if (search) params.search = search;
    if (status !== null) params.status = status;
    return api.get("/auth/admin/users", { params });
  },

  adminToggleUserStatus: (userId) => {
    return api.patch(`/auth/admin/users/${userId}/status`);
  },

  adminDeleteUser: (userId) => {
    return api.delete(`/auth/admin/users/${userId}`);
  },
  adminGetFeedback: (
    search = null,
    rating = null,
    sort = null,
    limit = null
  ) => {
    const params = {};
    if (search) params.content = search; // Tìm kiếm theo nội dung
    if (rating !== null) params.rating = rating;
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;
    return api.get("/auth/admin/feedback", { params });
  },
  adminRespondToFeedback: (feedbackId, response) => {
    return api.post(`/auth/admin/feedback/${feedbackId}/response`, null, {
      params: { response },
    });
  },

  adminMarkFeedbackResolved: (feedbackId) => {
    return api.patch(`/auth/admin/feedback/${feedbackId}/status`);
  },

  adminGetStats: () => {
    return api.get("/auth/admin/stats");
  },
  adminGetCaptions: (search = null, type = null, sort = null, limit = null) => {
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;
    return api.get("/auth/admin/captions", { params });
  },

  adminGetCaptionDetail: (captionId) => {
    return api.get(`/uploads/admin/captions/${captionId}`);
  },

  adminDeleteCaption: (captionId) => {
    // Sử dụng axios trực tiếp để tránh tự động thêm tiền tố /api
    return axios.delete(`${API_URL}/uploads/admin/captions/${captionId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
  },
};

const features = {
  generateImageCaption: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/caption/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  generateHuggingFaceCaption: async (file) => {
    try {
      const app = await Client.connect("kRnos22/image-caption-vi");
      const result = await app.predict("/predict", {
        image: file,
      });
      return {
        status: 200,
        data: {
          data: result.data,
        },
      };
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      throw error;
    }
  },

  generateImageDescription: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${API_URL}/api/caption/image/destination`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  generateVideoTitle: (url) => api.post("/caption/video", { url }),

  getHistory: () => api.get("/history"),

  getHistoryDetail: (id) => api.get(`/history/${id}`),

  uploadImageToCloud: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/image/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  submitFeedback: (userId, content, rating) => {
    return api.post(`/auth/users/${userId}/feedback`, {
      content,
      rating,
    });
  },

  saveUploadHistory: (userId, fileUrl, fileType, caption) => {
    return axios.post(`${API_URL}/uploads/upload`, null, {
      params: {
        user_id: userId,
        file_url: fileUrl,
        file_type: fileType,
        caption: caption,
      },
    });
  },

  getUserUploads: (userId) => {
    return axios.get(`${API_URL}/uploads/uploads/${userId}`);
  },
};

export default {
  ...auth,
  ...features,
};
