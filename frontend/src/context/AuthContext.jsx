import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getUserIdFromToken,
  isAuthenticated as checkAuth,
  isAdmin as checkAdmin,
} from "../utils/jwtUtils";

const AuthContext = createContext();

let spinnerInterval = null;
let spinnerTimeout = null;
const originalFavicon = "/Captions.png";
function setAnimatedFavicon(isLoading) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (isLoading) {
    if (spinnerInterval) clearInterval(spinnerInterval);
    if (spinnerTimeout) clearTimeout(spinnerTimeout);
    let frame = 0;
    const totalFrames = 60;
    spinnerInterval = setInterval(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 32, 32);
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(((2 * Math.PI) / totalFrames) * frame);
      ctx.translate(-16, -16);
      for (let i = 0; i < totalFrames; i++) {
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(((2 * Math.PI) / totalFrames) * i);
        ctx.globalAlpha = (i + 1) / totalFrames;
        ctx.beginPath();
        ctx.arc(0, -10, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#A4BEEB";
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      link.href = canvas.toDataURL("image/png");
      frame = (frame + 1) % totalFrames;
    }, 40);
  } else {
    if (spinnerTimeout) clearTimeout(spinnerTimeout);
    spinnerTimeout = setTimeout(() => {
      if (spinnerInterval) clearInterval(spinnerInterval);
      link.href = originalFavicon;
    }, 300);
  }
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = checkAuth();
      if (authenticated) {
        try {
          const currentUserId = getUserIdFromToken();
          setUserId(currentUserId);
          setIsAdmin(checkAdmin());
          const email = localStorage.getItem("userEmail");
          if (email) setUserEmail(email);
          setIsLoggedIn(true);
        } catch (error) {
          setIsAdmin(false);
          setIsLoggedIn(false);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");
        }
      } else {
        setUserId(null);
        setIsAdmin(false);
        setUserEmail("");
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  const logout = () => {
    setAnimatedFavicon(true);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserId(null);
    setUserEmail("");
    window.dispatchEvent(new Event("authChange"));
    setTimeout(() => {
      setAnimatedFavicon(false);
    }, 800);
  };

  const login = () => {
    const authenticated = checkAuth();
    if (authenticated) {
      const currentUserId = getUserIdFromToken();
      setUserId(currentUserId);
      const adminStatus = checkAdmin();
      setIsAdmin(adminStatus);
      setIsLoggedIn(true);
      const email = localStorage.getItem("userEmail");
      if (email) setUserEmail(email);
      window.dispatchEvent(new Event("authChange"));
    }
  };

  const value = {
    isLoggedIn,
    isAdmin,
    userId,
    userEmail,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
