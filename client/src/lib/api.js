import axios from "axios"

// Set your API URL in .env: REACT_APP_API_URL=https://your-server-domain/api
let API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  if (process.env.NODE_ENV === "development") {
    API_URL = "http://localhost:5000/api";
  } else {
    // fallback for production if not set
    API_URL = "/api";
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taskyToken")
    if (token) {
      config.headers["x-auth-token"] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
