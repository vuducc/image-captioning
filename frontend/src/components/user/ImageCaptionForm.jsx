import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  FaSpinner,
  FaFileAlt,
  FaCopy,
  FaInfoCircle,
  FaImage,
  FaTimesCircle,
  FaCheck,
  FaMagic,
} from "react-icons/fa"; // Import biểu tượng loading
import api from "../../services/api";
import { getUserIdFromToken, isAuthenticated } from "../../utils/jwtUtils";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0;
  color: #1e293b;
  letter-spacing: -0.2px;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
    margin-top: 0.5rem;
  }
`;

const UploadBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${(props) => (props.hasImage ? "auto" : "220px")};
  border: 2px dashed ${(props) => (props.hasImage ? "#374151" : "#111827")};
  border-radius: 0.75rem;
  cursor: pointer;
  text-align: center;
  margin-bottom: 1.25rem;
  padding: ${(props) => (props.hasImage ? "1rem" : "1.5rem 0")};
  background-color: ${(props) => (props.hasImage ? "#f8fafc" : "#f9fafb")};
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);

  &:hover {
    border-color: ${(props) => (props.hasImage ? "#111827" : "#374151")};
    background-color: ${(props) => (props.hasImage ? "#f8fafc" : "#f1f5f9")};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  img {
    max-width: 100%;
    max-height: 320px;
    border-radius: 0.5rem;
    margin-top: 1rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0.5rem;
    padding: ${(props) => (props.hasImage ? "0.75rem" : "1.25rem 0")};
    margin: 0 0.5rem;
    max-width: calc(100% - 1rem);
  }
`;

const UploadText = styled.p`
  margin-top: 1rem;
  color: #4b5563;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
`;

const UploadIcon = styled.div`
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 3rem;
  transition: all 0.3s ease;

  svg {
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.15));
  }
`;

const UploadHint = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  margin-top: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    background: linear-gradient(90deg, #6b7280 0%, #9ca3af 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    width: calc(100% - 1rem);
    margin: 0.75rem 0.5rem;
    padding: 0.85rem;
  }
`;

const ResultBox = styled.div`
  margin-top: 1.5rem;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
`;

const ErrorHeader = styled.div`
  background: linear-gradient(90deg, #991b1b 0%, #ef4444 100%);
  padding: 1rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
  }
`;

const ErrorContent = styled.div`
  padding: 1.25rem;
  background: white;
  color: #1e293b;
  line-height: 1.6;
  font-size: 1.1rem;
`;

const ImagePreview = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  img {
    max-width: 100%;
    max-height: 400px;
    height: auto;
    border-radius: 0.25rem;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;

  .spinner {
    color: #374151;
    font-size: 2.5rem;
    animation: ${spin} 1.2s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    margin: 1.5rem 0.25rem;
    width: calc(100% - 0.5rem);
    border-radius: 0.75rem;
    overflow: visible;
  }
`;

const ResultHeader = styled.div`
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  padding: 1.25rem 1.5rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

const ResultTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  letter-spacing: 0.2px;
`;

const ResultContent = styled.div`
  padding: 1.5rem;
  background: white;
  min-height: 100px;
  position: relative;

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    height: auto;
    overflow: visible;
    overflow-wrap: break-word;
  }
`;

const CaptionText = styled.p`
  margin: 0;
  line-height: 1.8;
  font-size: 1.15rem;
  color: #1e293b;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 4px solid #cbd5e1;
  padding: 1rem 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.05rem;
    padding: 0.85rem 1rem;
    line-height: 1.6;
    overflow-wrap: break-word;
    word-break: break-word;
  }
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;

  svg {
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyResult = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 150px;
  color: #94a3b8;

  svg {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const ImageCaptionForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setImageCaption("");
    setImageDescription("");
  };
  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      setSnackbarMsg("Please select an image first");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setCaptionLoading(true);
    setDescriptionLoading(true);
    setImageCaption("");
    setImageDescription("");
    setError("");

    try {
      let captionText = "";
      try {
        const captionResponse = await api.generateHuggingFaceCaption(
          selectedFile
        );

        if (captionResponse.status === 200 && captionResponse.data) {
          if (
            captionResponse.data.data &&
            Array.isArray(captionResponse.data.data)
          ) {
            captionText = captionResponse.data.data[0];
          } else if (captionResponse.data.data) {
            captionText = captionResponse.data.data;
          } else if (typeof captionResponse.data === "string") {
            captionText = captionResponse.data;
          } else {
            console.log("Unexpected response format:", captionResponse.data);
            captionText = JSON.stringify(captionResponse.data);
          }

          setImageCaption(captionText);
          setSnackbarMsg("Caption generated successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } else {
          throw new Error("Could not generate caption from Hugging Face");
        }
      } catch (captionError) {
        console.error("Caption API Error:", captionError);
        setError("Could not generate caption. Please try again.");
        setSnackbarMsg("Failed to generate caption. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setCaptionLoading(false);
      }

      try {
        const descriptionResponse = await api.generateImageDescription(
          selectedFile
        );

        if (descriptionResponse.status === 200 && descriptionResponse.data) {
          setImageDescription(descriptionResponse.data.destination_info || "");
        }
      } catch (descError) {
        console.error("Description API Error:", descError);
      } finally {
        setDescriptionLoading(false);
      }

      if (isAuthenticated() && captionText) {
        try {
          const cloudResponse = await api.uploadImageToCloud(selectedFile);
          if (
            cloudResponse.status === 200 &&
            cloudResponse.data &&
            cloudResponse.data.url
          ) {
            const userId = getUserIdFromToken();
            if (userId) {
              const fileType = selectedFile.name.split(".").pop().toLowerCase();

              await api.saveUploadHistory(
                userId,
                cloudResponse.data.url,
                fileType,
                captionText
              );
            }
          }
        } catch (historyError) {
          console.error("Error saving to history:", historyError);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("Could not generate caption. Please try again.");
      setSnackbarMsg("Failed to generate caption. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const formatCaption = (caption) => {
    if (!caption) return "";
    // First replace underscores with spaces
    let formattedCaption = caption.replace(/_/g, " ");
    // Fix spacing around punctuation marks (remove spaces before commas and periods)
    formattedCaption = formattedCaption.replace(/\s+([,\.])/g, "$1");
    // Capitalize the first letter
    return formattedCaption.charAt(0).toUpperCase() + formattedCaption.slice(1);
  };

  const copyCaptionToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMsg("Caption copied to clipboard!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "0",
        margin: "0 auto",
        maxWidth: "100%",
      }}
    >
      <FormLabel>Upload Image</FormLabel>
      <UploadBox
        onClick={() => document.getElementById("fileInput").click()}
        hasImage={selectedFile !== null}
      >
        {" "}
        {!selectedFile ? (
          <>
            <UploadIcon>
              <FaCloudUploadAlt />
            </UploadIcon>
            <UploadText>Click to upload an image</UploadText>
            <UploadHint>Supports all common image formats</UploadHint>
          </>
        ) : (
          <>
            <UploadText>Image Ready for Caption Generation</UploadText>
            <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
            <UploadHint>Click to change image</UploadHint>
          </>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </UploadBox>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "GENERATING..." : "GENERATE"}
      </Button>
      {loading && (
        <LoadingSpinner>
          <FaSpinner className="spinner" />
        </LoadingSpinner>
      )}
      {imageCaption && !captionLoading && (
        <ResultContainer>
          <ResultHeader>
            <ResultTitle>
              <FaFileAlt /> Generated Caption
            </ResultTitle>{" "}
            <CopyButton
              onClick={() =>
                copyCaptionToClipboard(formatCaption(imageCaption))
              }
            >
              <FaCopy /> Copy
            </CopyButton>
          </ResultHeader>{" "}
          <ResultContent>
            <CaptionText>{formatCaption(imageCaption)}</CaptionText>
          </ResultContent>
        </ResultContainer>
      )}
      {imageDescription && !descriptionLoading && (
        <ResultContainer>
          <ResultHeader>
            <ResultTitle>
              <FaInfoCircle /> Detailed Description
            </ResultTitle>{" "}
            <CopyButton
              onClick={() =>
                navigator.clipboard.writeText(
                  imageDescription.replace(/_/g, " ")
                )
              }
            >
              <FaCopy /> Copy
            </CopyButton>
          </ResultHeader>
          <ResultContent>
            {" "}
            <CaptionText
              dangerouslySetInnerHTML={{
                __html: imageDescription
                  .replace(/\n/g, "<br>")
                  .replace(/_/g, " "),
              }}
            />
          </ResultContent>
        </ResultContainer>
      )}{" "}
      {error && (
        <ResultContainer>
          <ResultHeader>
            <ResultTitle>
              <FaTimesCircle /> Error
            </ResultTitle>
          </ResultHeader>{" "}
          <ResultContent>
            <CaptionText>{error}</CaptionText>
          </ResultContent>
        </ResultContainer>
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
    </div>
  );
};

export default ImageCaptionForm;
