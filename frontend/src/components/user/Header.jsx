import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaUser, FaSignOutAlt, FaHistory } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const HeaderContainer = styled.header`
  background-color: white;
  border-bottom: 1px solid #ddd;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  height: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 2rem;
  box-sizing: border-box;
  max-width: 100%;
  @media (min-width: 1200px) {
    padding: 0 5rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
`;

const Logo = styled.img`
  height: 1.8rem;
  width: 1.8rem;
  object-fit: contain;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-left: 0.5rem;
  font-family: "Roboto", sans-serif;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SignInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.9rem;
  border: 2px solid rgb(17, 24, 39);
  border-radius: 0.25rem;
  background-color: transparent;
  color: rgb(17, 24, 39);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
  flex-shrink: 0;

  &:hover {
    background-color: rgb(17, 24, 39);
    color: white;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: rgb(17, 24, 39);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 200px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const UserInfo = styled(DropdownItem)`
  background-color: #f9fafb;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  color: #555;
  word-break: break-all;
`;

const ActionItem = styled(DropdownItem)`
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const Header = () => {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignOut = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleHistoryClick = () => {
    navigate("/");

    localStorage.setItem("activeToolId", "dashboard");

    window.dispatchEvent(new Event("storageChange"));

    setDropdownOpen(false);
  };

  const getAvatarText = () => {
    if (userEmail && userEmail.length > 0) {
      return userEmail[0].toUpperCase();
    }
    return <FaUser />;
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoContainer onClick={handleLogoClick}>
          <Logo src="/Captions2.png" alt="Logo" />
          <Title>Visual Captioning</Title>
        </LogoContainer>

        {isLoggedIn ? (
          <AvatarContainer ref={dropdownRef}>
            <Avatar onClick={toggleDropdown}>{getAvatarText()}</Avatar>
            <DropdownMenu isOpen={dropdownOpen}>
              <UserInfo>
                <FaUser />
                <UserEmail>{userEmail}</UserEmail>
              </UserInfo>
              <ActionItem onClick={handleHistoryClick}>
                <FaHistory />
                History
              </ActionItem>
              <ActionItem onClick={handleSignOut}>
                <FaSignOutAlt />
                Sign Out
              </ActionItem>
            </DropdownMenu>
          </AvatarContainer>
        ) : (
          <SignInButton onClick={handleSignIn}>Sign in</SignInButton>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
