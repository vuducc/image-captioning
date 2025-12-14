import { jwtDecode } from "jwt-decode";

/**
 * Decode JWT token to get user information
 * @param {string} token - JWT token
 * @returns {Object} User information including user_id, email, etc.
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    const decoded = jwtDecode(token);

    // Parse the user info from the sub field
    if (decoded.sub) {
      try {
        // The sub field contains a stringified JSON object with UUID objects
        // First replace the UUID representation with a simple string
        const preprocessedSub = decoded.sub
          .replace(/UUID\(['"](.*?)['"]\)/g, '"$1"')
          .replace(/'/g, '"');

        const userInfo = JSON.parse(preprocessedSub);
        return userInfo;
      } catch (e) {
        console.error("Error parsing user info from token:", e);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get user ID from token stored in localStorage
 * @returns {string|null} User ID if available, null otherwise
 */
export const getUserIdFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const userInfo = decodeToken(token);
  return userInfo?.user_id || null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getUserIdFromToken();
};

/**
 * Check if the user is an admin
 * @returns {boolean} True if user is an admin, false otherwise
 */
export const isAdmin = () => {
  const userId = getUserIdFromToken();
  const ADMIN_USER_ID = "e2f21c08-f9d6-4388-a3f4-a32393846b70"; // Admin user ID

  return userId === ADMIN_USER_ID;
};
