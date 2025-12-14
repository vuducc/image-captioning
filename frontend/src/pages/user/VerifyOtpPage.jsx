import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const VerifyOtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const VerifyOtpCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const VerifyOtpTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const VerifyOtpSubtitle = styled.p`
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #666;
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
  font-size: 1.2rem;
  letter-spacing: 0.25rem;
  text-align: center;
`;

const VerifyOtpButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    background-color: rgb(30, 41, 59);
  }
`;

const ResendOtpButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #111827;
  border: 1px solid #111827;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f9fafb;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    color: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
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

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      setSnackbarMsg("Please enter the OTP");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setError(null);
      console.log("Verifying OTP for:", { email, otp });
      const response = await api.verifyOtp({ email, otp });
      console.log("OTP verification response:", response);

      if (
        response.data &&
        (response.data.message === "Invalid OTP." ||
          response.data.detail === "Invalid OTP")
      ) {
        setError("Invalid OTP. Please try again.");
        setSnackbarMsg("Invalid OTP. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      await handleRegister();
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Invalid or expired OTP. Please try again.");
      setSnackbarMsg("Invalid or expired OTP. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRegister = async () => {
    try {
      const tempEmail = localStorage.getItem("tempEmail");
      const tempPassword = localStorage.getItem("tempPassword");

      if (!tempEmail || !tempPassword) {
        setError("Missing account information. Please start over.");
        setSnackbarMsg("Missing account information. Please start over.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      console.log("Registering with:", { email: tempEmail });
      const response = await api.register({
        email: tempEmail,
        password: tempPassword,
      });

      console.log("Registration response:", response);

      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempPassword");

      setSnackbarMsg("Registration successful! Redirecting to sign in...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.status === 400) {
        setError("Email is already registered. Please use a different email.");
        setSnackbarMsg(
          "Email is already registered. Please use a different email."
        );
      } else {
        setError("Registration failed. Please try again.");
        setSnackbarMsg("Registration failed. Please try again.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      await api.sendOtp(email);
      setSnackbarMsg("OTP resent! Please check your email.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setCountdown(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Could not resend OTP. Please try again later");
      setSnackbarMsg("Could not resend OTP. Please try again later");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleVerifyOtp();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <VerifyOtpContainer>
      <VerifyOtpCard>
        <VerifyOtpTitle>OTP Verification</VerifyOtpTitle>
        <VerifyOtpSubtitle>
          Please enter the OTP that was sent to {email}
        </VerifyOtpSubtitle>

        {error && (
          <ErrorMessage>
            <FaTimesCircle color="#ee2c4a" />
            {error}
          </ErrorMessage>
        )}

        <FormLabel>OTP Code</FormLabel>
        <FormInput
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={6}
          placeholder="000000"
        />

        <VerifyOtpButton onClick={handleVerifyOtp}>
          Verify & Complete Registration
        </VerifyOtpButton>

        <ResendOtpButton onClick={handleResendOtp} disabled={countdown > 0}>
          {countdown > 0 ? `Resend OTP (${countdown}s)` : "Resend OTP"}
        </ResendOtpButton>
      </VerifyOtpCard>

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
    </VerifyOtpContainer>
  );
};

export default VerifyOtpPage;
