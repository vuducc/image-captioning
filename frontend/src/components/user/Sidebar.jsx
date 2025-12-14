import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BsImage, BsYoutube, BsBook, BsChatDots } from "react-icons/bs";
import { isAuthenticated } from "../../utils/jwtUtils";
import FeedbackModal from "./FeedbackModal";

const SidebarContainer = styled.aside`
  width: ${(props) => (props.isVisible ? "250px" : "0")};
  background-color: white;
  position: fixed;
  top: 3.5rem;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: ${(props) => (props.isVisible ? "auto" : "hidden")};
  transition: width 0.3s ease-in-out;
  z-index: 100;
  padding-bottom: 80px;
  border-right: ${(props) => (props.isVisible ? "1px solid #ddd" : "none")};

  @media (max-width: 768px) {
    width: ${(props) => (props.isVisible ? "100vw" : "0")};
    left: 0;
    top: 0;
    height: 100vh;
    border-right: none;
    background: white;
    z-index: 2000;
  }
`;

const Nav = styled.nav`
  padding: ${(props) => (props.isVisible ? "0.5rem 1rem" : "0")};
  width: 250px;
  overflow: hidden;
  transition: padding 0.3s ease-in-out;
  @media (max-width: 768px) {
    width: 100vw;
    padding: ${(props) => (props.isVisible ? "1.5rem 1.5rem" : "0")};
  }
`;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0.25rem;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
`;

const Li = styled.li`
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  background-color: ${(props) => (props.active ? "#e5e7eb" : "transparent")};
  color: ${(props) => (props.active ? "#000" : "#666")};
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #e5e7eb;
    color: #000;
  }

  span {
    margin-right: 0.5rem;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ddd;
  margin: 1rem 0;
  width: 100%;
`;

const FeedbackButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: rgba(229, 231, 235, 0.1);
  color: #666;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #e5e7eb;
    color: #000;
  }

  span {
    margin-right: 0.5rem;
  }
`;

const Sidebar = ({ activeToolId, onToolSelect, isVisible }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    // Directly call the effect to handle stored tool ID
    const storedToolId = localStorage.getItem("activeToolId");
    if (storedToolId) {
      onToolSelect(storedToolId);
      localStorage.removeItem("activeToolId");
    }

    const handleStorageChange = (e) => {
      if (e.key === "activeToolId" || e.type === "storageChange") {
        const newToolId = localStorage.getItem("activeToolId");
        if (newToolId) {
          onToolSelect(newToolId);
          localStorage.removeItem("activeToolId");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storageChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storageChange", handleStorageChange);
    };
  }, [onToolSelect]);
  const tools = [
    {
      id: "dashboard",
      name: "Content Dashboard",
      icon: <BsBook size={20} />,
    },
    {
      id: "image-caption",
      name: "Image Caption",
      icon: <BsImage size={20} />,
    },
    {
      id: "video-title",
      name: "Youtube Video Title",
      icon: <BsYoutube size={20} />,
    },
  ];

  const handleFeedback = () => {
    setIsFeedbackModalOpen(true);
  };
  // Force re-render when tool selected on mobile
  const handleToolClick = (toolId) => {
    onToolSelect(toolId);
  };

  // For mobile: Xử lý đặc biệt cho nút Feedback
  const handleFeedbackClick = () => {
    if (isMobile) {
      // Luôn cập nhật activeToolId thành "feedback"
      onToolSelect("feedback");

      // Đặt trực tiếp vào localStorage
      localStorage.setItem("currentTool", "feedback");

      // Kích hoạt sự kiện để các component khác lắng nghe
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "currentTool",
          newValue: "feedback",
        })
      );

      // Kích hoạt sự kiện để buộc các component render lại
      window.dispatchEvent(new CustomEvent("showFeedback", { detail: true }));
    } else {
      handleFeedback();
    }
  };
  // For mobile: show only FeedbackModal when activeToolId === 'feedback', nothing else
  if (false) {
    return <FeedbackModal onClose={() => onToolSelect("image-caption")} />;
  }

  return (
    <>
      <SidebarContainer isVisible={isVisible}>
        <Nav isVisible={isVisible}>
          <Ul>
            {tools.map((tool) => (
              <Li key={tool.id}>
                <Button
                  active={activeToolId === tool.id}
                  onClick={() => handleToolClick(tool.id)}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                </Button>
              </Li>
            ))}
            <Divider />
            <Li>
              {" "}
              <FeedbackButton onClick={handleFeedbackClick}>
                <span>
                  <BsChatDots size={20} />
                </span>
                <span>Feedback</span>
              </FeedbackButton>
            </Li>
          </Ul>
        </Nav>
      </SidebarContainer>
      {!isMobile && isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
