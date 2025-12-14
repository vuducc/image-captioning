import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaYoutube,
  FaFileAlt,
  FaCopy,
  FaInfoCircle,
  FaVideo,
} from "react-icons/fa";
import api from "../../services/api";

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  padding: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  background: #f9fafb;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
  }
`;

const InputIcon = styled.div`
  display: flex;
  align-items: center;
  color: #ef4444;
  margin-right: 0.75rem;
  font-size: 1.2rem;
`;

const FormInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.25rem 0;
  font-size: 1rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(90deg, #6b7280 0%, #9ca3af 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResultBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f2f5;
  border-radius: 0.25rem;
`;

const VideoInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
`;

const Thumbnail = styled.img`
  width: 120px;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }
`;

const VideoDetails = styled.div`
  flex: 1;
`;

const VideoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const VideoDomain = styled.p`
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.25rem 0;

  svg {
    color: #ef4444;
    font-size: 1rem;
  }
`;

const ResultContainer = styled.div`
  margin-top: 1.5rem;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
`;

const ResultHeader = styled.div`
  background: linear-gradient(90deg, #b91c1c 0%, #ef4444 100%);
  padding: 1rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    margin-right: 0.5rem;
  }
`;

const ResultTitle = styled.div`
  display: flex;
  align-items: center;
`;

const ResultContent = styled.div`
  padding: 1.25rem;
  background: white;
  min-height: 100px;
  position: relative;
`;

const CaptionText = styled.p`
  margin: 0;
  line-height: 1.6;
  font-size: 1.1rem;
  color: #1e293b;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.875rem;

  svg {
    margin-right: 0.25rem;
  }

  &:hover {
    opacity: 0.8;
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

const VideoContainer = styled.div`
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VideoTitleForm = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);

    const videoId = extractVideoId(url);
    if (videoId) {
      fetchVideoDetails(videoId);
    }
  };

  const extractVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchVideoDetails = async (videoId) => {
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch video details");
      const data = await response.json();
      setVideoTitle(data.title);
      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
    } catch (error) {
      setVideoTitle("Could not retrieve video details");
      setThumbnailUrl("");
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await api.generateVideoTitle(videoUrl);
      setCaption(response.data.title);
    } catch (error) {
      setCaption("Failed to generate title. Please try again.");
    }
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
      <FormLabel>YouTube Video URL</FormLabel>
      <InputWrapper>
        <InputIcon>
          <FaYoutube />
        </InputIcon>
        <FormInput
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={handleUrlChange}
        />
      </InputWrapper>
      {videoTitle && (
        <VideoInfoContainer>
          {thumbnailUrl && <Thumbnail src={thumbnailUrl} alt="Thumbnail" />}
          <VideoDetails>
            <VideoDomain>
              <FaYoutube /> youtube.com
            </VideoDomain>
            <VideoTitle>{videoTitle}</VideoTitle>
          </VideoDetails>
        </VideoInfoContainer>
      )}
      <Button onClick={handleGenerate}>GENERATE</Button>
      {caption && (
        <ResultContainer>
          <ResultHeader>
            <ResultTitle>
              <FaYoutube /> Generated Title
            </ResultTitle>
            <CopyButton onClick={() => navigator.clipboard.writeText(caption)}>
              <FaCopy /> Copy
            </CopyButton>
          </ResultHeader>
          <ResultContent>
            <VideoContainer>
              <iframe
                width="100%"
                height="300"
                src={`https://www.youtube.com/embed/${extractVideoId(
                  videoUrl
                )}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </VideoContainer>
            <CaptionText>{caption}</CaptionText>
          </ResultContent>
        </ResultContainer>
      )}
      {videoUrl && !caption && (
        <ResultContainer>
          <ResultHeader>
            <ResultTitle>
              <FaInfoCircle /> Video Title Result
            </ResultTitle>
          </ResultHeader>
          <ResultContent>
            <VideoContainer>
              <iframe
                width="100%"
                height="300"
                src={`https://www.youtube.com/embed/${extractVideoId(
                  videoUrl
                )}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </VideoContainer>
            <EmptyResult>
              <FaVideo />
              <p>Click "Generate Title" to create a title</p>
            </EmptyResult>
          </ResultContent>
        </ResultContainer>
      )}
    </div>
  );
};

export default VideoTitleForm;
