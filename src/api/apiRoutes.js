
const API_BASE = "/api";

export const API_ROUTES = {
  health: {
    check: `${API_BASE}/health`,
  },
  auth: {
    google: `${API_BASE}/auth/google`,
    logout:`${API_BASE}/auth/logout`
  },
  users: {
    getProfile: (userId) => `${API_BASE}/users/${encodeURIComponent(userId)}/profile`,
    getFeed: (userId, limit = 10) =>
      `${API_BASE}/users/${encodeURIComponent(userId)}/feed?${new URLSearchParams({
        limit: String(limit),
      })}`,
  },
  posts: {
    public: (limit = 10) =>
      `${API_BASE}/posts?${new URLSearchParams({
        limit: String(limit),
      })}`,
  },
};

export default API_ROUTES;
