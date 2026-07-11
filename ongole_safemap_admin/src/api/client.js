import axios from "axios";

const TOKEN_STORAGE_KEY = "ongole_admin_token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request if we have one. Reading straight from
// localStorage here (rather than needing React context injected into this
// module) keeps this file usable outside components/hooks too.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing/expired/invalid — clear it and let
// AuthContext's storage listener (or a hard redirect) handle sending the
// admin back to the login page rather than silently failing requests.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event("ongole-admin-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export { TOKEN_STORAGE_KEY };
export default apiClient;