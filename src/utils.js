import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// API URL - Use environment variable if available, otherwise fallback to default values
export const APIUrl = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://xpense-xpert-api-ldwv.onrender.com"
    : "http://localhost:8080")

// Toast notification helpers
export const handleSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
}

export const handleError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
}

