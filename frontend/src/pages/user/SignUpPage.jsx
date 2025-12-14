import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const SignUpCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const SignUpTitle = styled.h2`
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

const SignUpButton = styled.button`
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

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendOtp = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      setSnackbarMsg("Please enter your email and password.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      setSnackbarMsg("Invalid email format.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setSnackbarMsg("Passwords do not match!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setError(null);
      localStorage.setItem("tempEmail", email);
      localStorage.setItem("tempPassword", password);

      const response = await api.sendOtp(email);
      if (response.status === 200) {
        setSnackbarMsg("OTP sent! Please check your email.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } });
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send OTP. Please try again."
      );
      setSnackbarMsg("Could not send OTP. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    handleSendOtp();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <SignUpContainer>
      <SignUpCard>
        <SignUpTitle>Sign Up</SignUpTitle>
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
        <FormLabel>Confirm Password</FormLabel>
        <FormInput
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SignUpButton onClick={handleSignUp}>Send OTP</SignUpButton>
      </SignUpCard>
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
    </SignUpContainer>
  );
};

export default SignUpPage;
