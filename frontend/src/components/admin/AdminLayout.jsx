import React, { useState } from "react";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  FaUsers,
  FaChartBar,
  FaComments,
  FaImages,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #111827;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
`;

const Header = styled.header`
  background: #111827;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
`;

const Navigation = styled.nav`
  margin-top: 2rem;
`;

const UserInfo = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #d1d5db;
  margin-top: 0.25rem;
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 250px;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  color: #d1d5db;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 1rem;
  &:hover {
    color: white;
  }
`;

const AdminLayout = () => {
  const { isAdmin, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  const handleLogout = async () => {
    try {
      if (api && api.logout) {
        await api.logout();
      }
      logout();
    } catch (error) {
      console.error("Error logging out:", error);
      logout();
    }
  };

  return (
    <AdminContainer>
      <Sidebar>
        <Header>
          <Title>Visual Caption Admin</Title>
        </Header>
        <UserInfo>
          <h3>Admin</h3>
          <UserEmail>{userEmail}</UserEmail>
        </UserInfo>
        <Navigation>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "active-nav-link" : "nav-link"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              color: "#d1d5db",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <FaChartBar /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "active-nav-link" : "nav-link"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              color: "#d1d5db",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <FaUsers /> Users
          </NavLink>

          <NavLink
            to="/admin/captions"
            className={({ isActive }) =>
              isActive ? "active-nav-link" : "nav-link"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              color: "#d1d5db",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <FaImages /> Captions
          </NavLink>

          <NavLink
            to="/admin/feedback"
            className={({ isActive }) =>
              isActive ? "active-nav-link" : "nav-link"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.5rem",
              color: "#d1d5db",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <FaComments /> Feedback
          </NavLink>
        </Navigation>
        <Footer>
          <ActionButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </ActionButton>
        </Footer>
      </Sidebar>

      <MainContent>
        <Outlet />
      </MainContent>

      <style>
        {`
          .active-nav-link {
            background: rgba(255, 255, 255, 0.1);
            color: white !important;
            border-left: 3px solid #60a5fa;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
    </AdminContainer>
  );
};

export default AdminLayout;
