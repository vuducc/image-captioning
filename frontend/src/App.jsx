import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { FaIndent, FaOutdent } from "react-icons/fa";

import { useAuth } from "./context/AuthContext";
import api from "./services/api";

// User components
import Header from "./components/user/Header";
import Sidebar from "./components/user/Sidebar";
import Footer from "./components/user/Footer";

// User pages
import HomePage from "./pages/user/HomePage";
import SignInPage from "./pages/user/SignInPage";
import SignUpPage from "./pages/user/SignUpPage";
import VerifyOtpPage from "./pages/user/VerifyOtpPage";
import RegisterPage from "./pages/user/RegisterPage";

// Admin components and pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import CaptionsManagement from "./pages/admin/CaptionsManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: #f0f2f5;
    color: #333;
    font-family: 'Roboto', sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f2f5;
  margin: 0;
  padding: 0;
  position: relative;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 3.5rem;
  margin: 0;
  background-color: white;
  overflow-x: hidden;
  position: relative;
  min-height: calc(100vh - 3.5rem);
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
  border-bottom: none;
`;

const FooterWrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: white;
  border-top: 1px solid #ddd;
  box-shadow: none;
  z-index: 101;
`;

const MainContentWrapper = styled.div`
  width: ${(props) =>
    props.isSidebarVisible ? "calc(100% - 250px)" : "calc(100% - 250px)"};
  max-width: ${(props) =>
    props.isSidebarVisible ? "none" : "calc(100% - 50px)"};
  position: relative;
  margin-left: ${(props) => (props.isSidebarVisible ? "250px" : "auto")};
  margin-right: ${(props) => (props.isSidebarVisible ? "0" : "auto")};
  transition: margin 0.3s ease-in-out;
  border-left: none;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 3.5rem - 88px);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0 0 2rem 0;
  background: white;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 150vh;

  @media (max-width: 768px) {
    padding: 0;
    width: 100vw;
    max-width: 100%;
  }
`;

const SidebarToggle = styled.button`
  position: fixed;
  top: 4.25rem;
  left: ${(props) => (props.isVisible ? "245px" : "5px")};
  z-index: 1500;
  padding: 0.5rem;
  background-color: transparent;
  color: #666;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: rgb(17, 24, 39);
  }
`;

const App = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState("image-caption");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);

      // Trên desktop: luôn hiển thị sidebar
      if (!isMobileView) {
        setIsSidebarVisible(true);
      }
      // Trên mobile: ẩn sidebar, hiện trang Image Caption
      else {
        setIsSidebarVisible(false);
        setActiveTool("image-caption");
        window.localStorage.setItem("currentTool", "image-caption");
      }
    };

    // Gọi lúc khởi động
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("Auth state:", {
      isLoggedIn,
      isAdmin,
      path: window.location.pathname,
    });

    if (
      isLoggedIn &&
      isAdmin &&
      !window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/signin"
    ) {
      console.log("Redirecting admin to admin dashboard");
      navigate("/admin");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    window.localStorage.setItem("currentTool", activeTool);
  }, [activeTool]);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    if (isMobile) setIsSidebarVisible(false);
  };

  const UserInterface = () => (
    <Container>
      <Header />
      <ContentWrapper>
        <MainArea>
          {(!isMobile || isSidebarVisible) && (
            <Sidebar
              activeToolId={activeTool}
              onToolSelect={handleToolSelect}
              isVisible={isSidebarVisible}
              availableTools={[
                "dashboard",
                "image-caption",
                "video-title",
                "feedback",
              ]}
            />
          )}
          {!isMobile && (
            <SidebarToggle onClick={toggleSidebar} isVisible={isSidebarVisible}>
              {isSidebarVisible ? (
                <FaOutdent size={18} />
              ) : (
                <FaIndent size={18} />
              )}
            </SidebarToggle>
          )}
          <MainContentWrapper isSidebarVisible={!isMobile && isSidebarVisible}>
            <MainContent>
              <HomePage
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
              />
            </MainContent>
          </MainContentWrapper>
        </MainArea>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </ContentWrapper>
    </Container>
  );
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route
          path="/signin"
          element={
            !isLoggedIn ? (
              <SignInPage />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isLoggedIn ? (
              <SignUpPage />
            ) : isAdmin ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isLoggedIn ? (
              <RegisterPage />
            ) : isAdmin ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/verify-otp"
          element={
            !isLoggedIn ? (
              <VerifyOtpPage />
            ) : isAdmin ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn && isAdmin ? <Navigate to="/admin" /> : <UserInterface />
          }
        />
        <Route
          path="/admin"
          element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="captions" element={<CaptionsManagement />} />
          <Route path="feedback" element={<FeedbackManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
