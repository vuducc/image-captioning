import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const SignInCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const SignInTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const FormInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
`;

const SignInButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.p`
  color: rgb(0, 0, 0);
  background-color: white;
  border: 1px solid #ee2c4a;
  border-radius: 0.25rem;
  padding: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SignUpLink = styled(Link)`
  font-weight: bold;
  color: #333;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SignUpText = styled(Link)`
  text-align: center;
  margin-top: 1rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const setFavicon = (iconUrl) => {
  const link = document.querySelector("link[rel~='icon']");
  if (link) {
    link.href = iconUrl;
  }
};
const originalFavicon = "/Captions.png";
const loadingFavicon =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><circle cx='32' cy='32' r='28' stroke='%2360a5fa' stroke-width='8' fill='none' stroke-dasharray='40 40'><animateTransform attributeName='transform' type='rotate' from='0 32 32' to='360 32 32' dur='0.8s' repeatCount='indefinite'/></circle></svg>";

let spinnerInterval = null;
function setAnimatedFavicon(isLoading) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (isLoading) {
    let frame = 0;
    const totalFrames = 60;
    if (spinnerInterval) clearInterval(spinnerInterval);
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
    setTimeout(() => {
      if (spinnerInterval) clearInterval(spinnerInterval);
      link.href = originalFavicon;
    }, 300);
  }
}

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isLoading) {
        setAnimatedFavicon(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLoading]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setAnimatedFavicon(true);
    try {
      setError(null);
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      const response = await api.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userEmail", trimmedEmail);

        login();

        setSnackbarMsg("Sign in successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setTimeout(() => {
          setAnimatedFavicon(false);
          setIsLoading(false);
          navigate(isAdmin ? "/admin" : "/");
        }, 1200);
      } else {
        setAnimatedFavicon(false);
        setIsLoading(false);
        setFavicon(originalFavicon);
        setError("Login failed. Please try again.");
        setSnackbarMsg("Login failed. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setAnimatedFavicon(false);
      setIsLoading(false);
      setFavicon(originalFavicon);

      if (err.response) {
        if (err.response.status === 401) {
          if (
            err.response.data &&
            err.response.data.detail === "Invalid credentials"
          ) {
            setError("Invalid email or password. Please try again.");
          } else {
            setError("Incorrect email or password.");
          }
        } else if (err.response.status === 500) {
          setError("Internal server error. Please try again later.");
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
      setSnackbarMsg("Login failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignIn();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <SignInContainer>
      <SignInCard>
        <SignInTitle>Sign In</SignInTitle>
        {error && (
          <ErrorMessage>
            <FaTimesCircle color="#ee2c4a" />
            {error}
          </ErrorMessage>
        )}
        <FormLabel>Email</FormLabel>
        <FormInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <FormLabel>Password</FormLabel>
        <FormInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SignInButton onClick={handleSignIn}>Sign In</SignInButton>
      </SignInCard>
      <SignUpText to="/signup">Don't have an account? Sign up</SignUpText>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontSize: "1rem",
            borderRadius: "8px",
            background: snackbarSeverity === "success" ? "#2196f3" : "#e53935",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {snackbarMsg}
        </MuiAlert>
      </Snackbar>
    </SignInContainer>
  );
};

export default SignInPage;
