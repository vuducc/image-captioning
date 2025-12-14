import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import ImageCaptionForm from "../../components/user/ImageCaptionForm";
import VideoTitleForm from "../../components/user/VideoTitleForm";
import Dashboard from "../../components/user/Dashboard";
import Sidebar from "../../components/user/Sidebar";
import FeedbackModal from "../../components/user/FeedbackModal";

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white;
  overflow-y: auto;
  min-height: 120vh;
  padding-bottom: 4rem;
  @media (max-width: 768px) {
    padding: 0;
    min-height: 100vh;
    width: 100vw;
    max-width: 100%;
    overflow-x: hidden;
  }
`;

const Card = styled.div`
  background-color: white;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  border: none;
  border-radius: 0;
  box-shadow: none;
  flex-shrink: 0;
  @media (max-width: 768px) {
    padding: 1rem 0.25rem;
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    max-width: 100vw;
    margin: 0;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
  padding: 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    width: 100%;

    &.dashboard-title {
      display: none;
    }
  }
`;

const ExtraSpace = styled.div`
  height: 60vh;
  width: 100%;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  position: fixed;
  top: 64px;
  left: 16px;
  z-index: 3000;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: none;
  @media (max-width: 768px) {
    display: ${(props) => (props.showButton ? "block" : "none")};
  }
`;

const HomePage = ({ activeTool, onToolSelect, isLoggedIn }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTool, setCurrentTool] = useState(activeTool || "image-caption");
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Sync currentTool with activeTool from props
  useEffect(() => {
    if (activeTool && activeTool !== currentTool) {
      setCurrentTool(activeTool);
      if (activeTool === "feedback") {
        setFeedbackVisible(true);
      } else {
        setFeedbackVisible(false);
      }
    }
  }, [activeTool, currentTool]);
  // Handle mobile/desktop detection
  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);

      // Khi phát hiện là mobile, đảm bảo trang mở đầu là Image Caption
      if (isMobileView && !currentTool) {
        setCurrentTool("image-caption");
        onToolSelect("image-caption");
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [onToolSelect]);
  // Listen for tool changes from sidebar
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "currentTool") {
        const newTool = e.newValue;
        setCurrentTool(newTool);
        // Nếu chọn feedback, đảm bảo feedback hiển thị
        if (newTool === "feedback") {
          setFeedbackVisible(true);
          // Khi chọn feedback qua localStorage, đảm bảo sidebar vẫn mở
          if (isMobile) {
            setShowSidebar(true);
          }
        } else {
          // Nếu không phải feedback, có thể ẩn sidebar (chỉ trên mobile)
          if (isMobile) {
            setShowSidebar(false);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isMobile]);

  // Lắng nghe sự kiện showFeedback từ Sidebar
  useEffect(() => {
    const handleShowFeedback = (e) => {
      if (e.type === "showFeedback" && e.detail === true) {
        setFeedbackVisible(true);
        // Đảm bảo sidebar vẫn mở khi hiển thị feedback trên mobile
        if (isMobile) {
          setShowSidebar(true);
        }
      }
    };
    window.addEventListener("showFeedback", handleShowFeedback);
    return () => window.removeEventListener("showFeedback", handleShowFeedback);
  }, [isMobile]);

  // Xử lý đặc biệt cho Feedback trên mobile
  useEffect(() => {
    if (isMobile && currentTool === "feedback") {
      // Đảm bảo khi chọn feedback, sidebar vẫn mở và feedback hiển thị
      setShowSidebar(true);
      setFeedbackVisible(true);
    }
  }, [isMobile, currentTool]);

  const handleSidebarToggle = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);
  const handleToolSelect = useCallback(
    (toolId) => {
      // Khi chọn feedback, ngay lập tức hiển thị modal
      if (toolId === "feedback") {
        setFeedbackVisible(true);
        // Đảm bảo sidebar luôn mở khi hiển thị feedback trên mobile
        if (isMobile) {
          setShowSidebar(true);
        }
      }

      setCurrentTool(toolId);
      onToolSelect(toolId);
      window.localStorage.setItem("currentTool", toolId);
    },
    [onToolSelect, isMobile]
  );
  // Xử lý tắt feedback riêng, không thay đổi currentTool để có thể mở lại
  const handleCloseFeedback = useCallback(() => {
    setFeedbackVisible(false);
    // Không thay đổi currentTool khi đóng feedback
  }, []);

  return (
    <MainContent>
      <MobileMenuButton
        onClick={handleSidebarToggle}
        showButton={isMobile && !showSidebar}
      >
        ☰
      </MobileMenuButton>
      {isMobile && !showSidebar && (
        <Card>
          <CardTitle
            className={currentTool === "dashboard" ? "dashboard-title" : ""}
          >
            {currentTool === "dashboard"
              ? "Your Content Dashboard"
              : currentTool === "image-caption"
              ? "Image Caption"
              : currentTool === "video-title"
              ? "YouTube Video Title"
              : ""}
          </CardTitle>
          {currentTool === "dashboard" ? (
            <Dashboard key="dashboard" />
          ) : currentTool === "image-caption" ? (
            <ImageCaptionForm key="image-caption" />
          ) : currentTool === "video-title" ? (
            <VideoTitleForm key="video-title" />
          ) : null}
        </Card>
      )}{" "}
      {isMobile && showSidebar && (
        <>
          <Sidebar
            activeToolId={currentTool}
            onToolSelect={handleToolSelect}
            isVisible={showSidebar}
          />{" "}
          {feedbackVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 3000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <div style={{ width: "100%", maxWidth: "500px" }}>
                <FeedbackModal
                  key="feedback-mobile"
                  onClose={handleCloseFeedback}
                />
              </div>
            </div>
          )}
        </>
      )}
      {!isMobile && (
        <>
          <Card>
            <CardTitle>
              {currentTool === "dashboard"
                ? ""
                : currentTool === "image-caption"
                ? "Image Caption"
                : currentTool === "video-title"
                ? "YouTube Video Title"
                : currentTool === "feedback"
                ? "Feedback"
                : ""}
            </CardTitle>
            {currentTool === "dashboard" ? (
              <Dashboard key="dashboard" />
            ) : currentTool === "image-caption" ? (
              <ImageCaptionForm key="image-caption" />
            ) : currentTool === "video-title" ? (
              <VideoTitleForm key="video-title" />
            ) : currentTool === "feedback" ? (
              <FeedbackModal key="feedback" />
            ) : null}
          </Card>
          <ExtraSpace />
        </>
      )}
    </MainContent>
  );
};

export default HomePage;
