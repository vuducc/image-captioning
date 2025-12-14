import styled from "styled-components";
import { BsHeartFill } from "react-icons/bs";

const FooterContainer = styled.footer`
  background-color: white;
  width: 100%;
  padding: 2rem 0;
  margin: 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 1rem;
  }
`;

const LeftNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    width: 100%;
    gap: 1rem;
  }
`;

const RightNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    margin-top: 0.5rem;
  }
`;

const FooterLink = styled.a`
  color: #444;
  text-decoration: underline;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    color: #111;
  }
`;

const FooterText = styled.p`
  color: #444;
  font-size: 0.875rem;
  margin-right: 1.5rem;

  @media (max-width: 768px) {
    margin-right: 0;
    text-align: center;
    font-size: 0.8rem;
    display: none;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <LeftNavGroup>
          <FooterText>
            © 2025 Visual Captioning. All rights reserved.
          </FooterText>
          <FooterLink href="#">Privacy Policy</FooterLink>
          <FooterLink href="#">Terms</FooterLink>
        </LeftNavGroup>
        <RightNavGroup>
          <FooterLink href="#">
            <BsHeartFill style={{ color: "#ff0000" }} /> Contact Us
          </FooterLink>
        </RightNavGroup>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
