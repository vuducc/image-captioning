import React, { useState, useRef } from "react";
import styled from "styled-components";
import { FaTimes, FaStar, FaExclamationCircle } from "react-icons/fa";
import api from "../../services/api";
import { getUserIdFromToken, isAuthenticated } from "../../utils/jwtUtils";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: rgb(79, 70, 229);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: rgb(79, 70, 229);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
`;

const SubmitButton = styled.button`
  display: inline-block;
  align-self: flex-end;
  padding: 0.75rem 1.5rem;
  background-color: rgb(79, 70, 229);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(67, 56, 202);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// New styled components for rating
const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.active ? "#FFD700" : "#DDD")};
  font-size: 1.5rem;
  padding: 0.25rem;
  transition: color 0.2s, transform 0.1s;

  &:hover {
    color: #ffd700;
    transform: scale(1.1);
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9fafb;
  border-radius: 1rem;
  margin: 1rem 0;
  border: 1px dashed #cbd5e1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);

  svg {
    font-size: 3rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  h2 {
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    letter-spacing: -0.3px;
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
    font-weight: 400;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
    letter-spacing: 0.2px;
  }
`;

const CaptionText = styled.div`
  line-height: 1.7;
  font-weight: 400;
  color: #334155;
  letter-spacing: 0.2px;
  /* Limit to 2 lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FeedbackModal = ({ onClose }) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentError, setContentError] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const contentInputRef = useRef(null);

  const validateForm = () => {
    let isValid = true;

    if (!content.trim()) {
      setContentError("Please fill in this field");
      contentInputRef.current?.focus();
      isValid = false;
    } else {
      setContentError("");
    }

    if (rating === 0) {
      setRatingError("Please select a rating");
      isValid = false;
    } else {
      setRatingError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user ID from token
      const userId = getUserIdFromToken();

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Call the API to submit feedback
      await api.submitFeedback(userId, content, rating);

      setSnackbarMsg("Feedback submitted successfully!");
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSnackbarMsg("Failed to submit feedback. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Feedback</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        {!isAuthenticated() ? (
          <EmptyStateContainer>
            <FaExclamationCircle />
            <h2>Please sign in to submit feedback</h2>
            <p>
              You need to be logged in to provide feedback about our platform.
            </p>
          </EmptyStateContainer>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            <RatingContainer>
              <Label>Rating</Label>
              <StarsContainer>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarButton
                    key={star}
                    type="button"
                    active={rating >= star}
                    onClick={() => setRating(star)}
                  >
                    <FaStar />
                  </StarButton>
                ))}
              </StarsContainer>
              {ratingError && <ErrorMessage>{ratingError}</ErrorMessage>}
            </RatingContainer>
            <FormGroup>
              <Label htmlFor="feedback-content">Content</Label>
              <TextArea
                id="feedback-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.trim()) setContentError("");
                }}
                placeholder="Write your feedback here..."
                ref={contentInputRef}
                aria-invalid={!!contentError}
              />
              {contentError && <ErrorMessage>{contentError}</ErrorMessage>}
            </FormGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </SubmitButton>
          </Form>
        )}
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
            severity={snackbarMsg.includes("success") ? "success" : "error"}
            sx={{
              width: "100%",
              fontSize: "1rem",
              borderRadius: "8px",
              background: snackbarMsg.includes("success")
                ? "#2196f3"
                : "#e53935",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {snackbarMsg}
          </MuiAlert>
        </Snackbar>
      </ModalContent>
    </ModalOverlay>
  );
};

// Add this styled component for error messages
const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

export default FeedbackModal;
