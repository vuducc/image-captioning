import styled from "styled-components";
import api from "../../services/api";
import { useState, useEffect } from "react";
import { getUserIdFromToken, isAuthenticated } from "../../utils/jwtUtils";
import { format } from "date-fns";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaStepBackward,
  FaStepForward,
  FaHistory,
  FaCalendarAlt,
  FaImage,
  FaTag,
  FaFileAlt,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;

  @media (max-width: 768px) {
    padding: 2.5rem 0.5rem 1rem 0.5rem;
    width: 100%;
    max-width: 100%;
  }
`;

const Header = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.5px;
  position: relative;

  svg {
    color: #374151;
    font-size: 1.75rem;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(
      90deg,
      #111827 0%,
      #374151 70%,
      transparent 100%
    );
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-top: 1rem;
    padding-left: 1rem;
  }
`;

const SubHeader = styled.div`
  color: #64748b;
  margin-bottom: 2.5rem;
  margin-top: 1rem;
  font-size: 1.15rem;
  font-weight: 400;
  letter-spacing: 0.2px;
  max-width: 650px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #94a3b8;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding-left: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  height: 100%;
  display: flex;
  align-items: center;
  color: #64748b;
  z-index: 1;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  background: #f9fafb;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.2px;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  overflow: hidden;

  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    margin: 0 0.5rem 1.5rem 0.5rem;
    width: calc(100% - 1rem);
    font-size: 0.9rem;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 1.15rem 1.5rem;
  background: linear-gradient(90deg, #111827 0%, #374151 100%);
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 0.95rem;
  position: relative;
  text-transform: uppercase;

  &:first-child {
    border-top-left-radius: 0.75rem;
  }

  &:last-child {
    border-top-right-radius: 0.75rem;
  }

  svg {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-right: 0.5rem;
    display: inline-block;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 0.85rem;

    svg {
      font-size: 1rem;
    }
  }
`;

const Td = styled.td`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  background: white;
  font-weight: 400;
  line-height: 1.5;

  &:first-child {
    border-left: 1px solid #e2e8f0;
  }

  &:last-child {
    border-right: 1px solid #e2e8f0;
  }

  tr:last-child & {
    border-bottom: 1px solid #e2e8f0;

    &:first-child {
      border-bottom-left-radius: 0.75rem;
    }

    &:last-child {
      border-bottom-right-radius: 0.75rem;
    }
  }

  tr:hover & {
    background-color: #f8fafc;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ImagePreview = styled.img`
  max-width: 150px;
  max-height: 100px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    max-width: 100px;
    max-height: 80px;
  }
`;

const Pagination = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
  font-weight: 500;
  color: #64748b;
  font-size: 0.95rem;
  letter-spacing: 0.2px;

  @media (max-width: 768px) {
    justify-content: center;
    margin: 0 0.5rem;
    font-size: 0.85rem;
    flex-wrap: wrap;
  }
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #111827;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    color: #94a3b8;
    cursor: not-allowed;
    background: #f1f5f9;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.6rem;
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9fafb;
  border-radius: 1rem;
  margin: 2rem 0;
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
    max-width: 500px;
    margin: 0 auto;
    letter-spacing: 0.2px;
  }

  @media (max-width: 768px) {
    margin: 1rem 0.5rem;
    padding: 2.5rem 1rem;
    border-radius: 0.75rem;

    svg {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }

    p {
      font-size: 0.95rem;
      max-width: 100%;
    }
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

  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.5;
    -webkit-line-clamp: 3;
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background: linear-gradient(90deg, #f9fafb 0%, #f1f5f9 100%);
  color: #111827;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }

  svg {
    color: #64748b;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;

  svg {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const Dashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 4;

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);

      if (isAuthenticated()) {
        const userId = getUserIdFromToken();
        if (userId) {
          const response = await api.getUserUploads(userId);
          if (response.data && response.data.uploads) {
            const sortedUploads = response.data.uploads.sort((a, b) => {
              return new Date(b.uploaded_at) - new Date(a.uploaded_at);
            });
            setUploads(sortedUploads);
          }
        }
      } else {
        setUploads([]);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUploads = uploads.filter((upload) =>
    upload.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUploads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUploads.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: "0",
        margin: "0 auto",
      }}
    >
      <DashboardContainer>
        {" "}
        <Header>
          <FaHistory /> Content Dashboard
        </Header>
        <SubHeader>
          <FaInfoCircle />
          <span className="dashboard-text">
            View and search through all the image captions you've generated with
            our platform. Your content history is safely stored and organized
            for easy access.
          </span>
        </SubHeader>
        <SearchContainer>
          <InputWrapper>
            <SearchBar
              type="text"
              placeholder="Search captions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
          </InputWrapper>
        </SearchContainer>
        {loading ? (
          <EmptyStateContainer>
            <FaInfoCircle />
            <p>Loading your content...</p>
          </EmptyStateContainer>
        ) : !isAuthenticated() ? (
          <EmptyStateContainer>
            <FaExclamationCircle />
            <h2>Please sign in to view your history</h2>
            <p>
              You need to be logged in to see your generated captions history.
            </p>
          </EmptyStateContainer>
        ) : uploads.length === 0 ? (
          <EmptyStateContainer>
            <FaImage />
            <h2>No captions generated yet</h2>
            <p>Try generating an image caption to see your history here.</p>
          </EmptyStateContainer>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>
                    <FaImage /> Image
                  </Th>
                  <Th>
                    <FaFileAlt /> Caption
                  </Th>
                  <Th>
                    <FaCalendarAlt /> Created
                  </Th>
                  <Th>
                    <FaTag /> Type
                  </Th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((upload) => (
                  <tr key={upload.upload_id}>
                    <Td>
                      <ImagePreview
                        src={upload.file_url}
                        alt="Generated caption"
                      />
                    </Td>{" "}
                    <Td>
                      <CaptionText>
                        {((caption) => {
                          if (!caption) return "";
                          // First replace underscores with spaces
                          let formattedCaption = caption.replace(/_/g, " ");
                          // Fix spacing around punctuation marks (remove spaces before commas and periods)
                          formattedCaption = formattedCaption.replace(
                            /\s+([,\.])/g,
                            "$1"
                          );
                          // Capitalize the first letter
                          return (
                            formattedCaption.charAt(0).toUpperCase() +
                            formattedCaption.slice(1)
                          );
                        })(upload.caption)}
                      </CaptionText>
                    </Td>
                    <Td>
                      <DateInfo>
                        <FaCalendarAlt />
                        {formatDate(upload.uploaded_at)}
                      </DateInfo>
                    </Td>
                    <Td>
                      <TypeBadge>
                        <FaTag />
                        {upload.file_type.toUpperCase()}
                      </TypeBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {totalPages > 0 && (
              <Pagination>
                Page {currentPage} of {totalPages}
                <PaginationButton
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  <FaStepBackward />
                </PaginationButton>
                <PaginationButton
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <FaChevronLeft />
                </PaginationButton>
                <PaginationButton
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <FaChevronRight />
                </PaginationButton>
                <PaginationButton
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  <FaStepForward />
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;
