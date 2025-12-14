import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaReply,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaSmile,
  FaMeh,
  FaFrown,
  FaTrash,
} from "react-icons/fa";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Container = styled.div`
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  white-space: nowrap;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.25rem;
  border-radius: 0.25rem;

  &:hover {
    color: #111827;
    background: #f3f4f6;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "unread" ? "#FEF3C7" : "#DEF7EC"};
  color: ${(props) => (props.status === "unread" ? "#92400E" : "#03543F")};
`;

const StarsContainer = styled.div`
  display: flex;
  color: #f59e0b;
`;

const Modal = styled.div`
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
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #111827;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }
`;

const FeedbackCard = styled.div`
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const UserEmail = styled.span`
  font-weight: 500;
  color: #111827;
`;

const FeedbackDate = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FeedbackContent = styled.p`
  margin-bottom: 0.5rem;
  color: #4b5563;
`;

const AdminResponse = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
`;

const AdminResponseLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: ${(props) => (props.active ? "#4f46e5" : "white")};
  color: ${(props) => (props.active ? "white" : "#4b5563")};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    border-color: ${(props) => (props.active ? "#4338ca" : "#9ca3af")};
    background: ${(props) => (props.active ? "#4338ca" : "#f9fafb")};
  }
`;

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [filterRating, setFilterRating] = useState("all");
  const [users, setUsers] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await api.adminGetUsers();
      if (response.data && Array.isArray(response.data)) {
        const userMap = {};
        response.data.forEach((user) => {
          userMap[user.user_id] = user.username || user.email;
        });
        setUsers(userMap);
      } else if (response.data && response.data.users) {
        const userMap = {};
        response.data.users.forEach((user) => {
          userMap[user.user_id] = user.username || user.email;
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      // Không truyền tham số rating vào API request
      // Thay vào đó, sẽ lọc kết quả bên phía client
      const response = await api.adminGetFeedback(
        searchTerm || null,
        null, // Bỏ tham số rating
        `${sortField}:${sortDirection}`,
        null
      );

      if (response.data && Array.isArray(response.data)) {
        setFeedback(response.data);
      } else if (response.data && response.data.feedback) {
        setFeedback(response.data.feedback);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setSnackbarMessage("Failed to load feedback");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    fetchUsers();
  }, [filterRating]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFeedback();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortField, sortDirection]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRespondToFeedback = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setResponseText(feedbackItem.admin_response || "");
    setIsModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;

    try {
      const feedbackId = selectedFeedback.id || selectedFeedback.feedback_id;
      const response = await api.adminRespondToFeedback(
        feedbackId,
        responseText
      );

      if (response.status === 200) {
        // Mark feedback as resolved
        await api.adminMarkFeedbackResolved(feedbackId);

        // Refetch feedback data
        fetchFeedback();

        setSnackbarMessage("Response sent successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error responding to feedback:", error);
      setSnackbarMessage(
        "Failed to send response: " +
          (error.response?.data?.detail || error.message)
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    setIsModalOpen(false);
    setSelectedFeedback(null);
    setResponseText("");
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
    setResponseText("");
  };
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <FaStar key={i} /> : <FaRegStar key={i} />);
    }
    return <StarsContainer>{stars}</StarsContainer>;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };
  const filteredFeedback = feedback
    .filter((item) => {
      // Áp dụng bộ lọc tìm kiếm theo nội dung
      if (searchTerm) {
        const content = item.content || item.message || "";
        const email = item.user_email || item.email || "";
        const username = users[item.user_id] || "";
        return (
          content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    // Áp dụng bộ lọc theo rating nếu không được xử lý từ server
    .filter((item) => {
      if (filterRating === "all") return true;

      const rating = parseInt(item.rating);
      if (filterRating === "positive" && (rating === 4 || rating === 5))
        return true;
      if (filterRating === "neutral" && rating === 3) return true;
      if (filterRating === "negative" && (rating === 1 || rating === 2))
        return true;

      return false;
    })
    .sort((a, b) => {
      if (sortField === "user_email") {
        const emailA = a.user_email || a.email || "";
        const emailB = b.user_email || b.email || "";
        return sortDirection === "asc"
          ? emailA.localeCompare(emailB)
          : emailB.localeCompare(emailA);
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortField === "rating") {
        return sortDirection === "asc"
          ? a.rating - b.rating
          : b.rating - a.rating;
      }
      return 0;
    });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>Feedback Management</PageTitle>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </PageHeader>
      <FilterContainer>
        <FilterButton
          active={filterRating === "all"}
          onClick={() => setFilterRating("all")}
        >
          All Feedback
        </FilterButton>
        <FilterButton
          active={filterRating === "positive"}
          onClick={() => setFilterRating("positive")}
        >
          <FaSmile
            style={{ color: filterRating === "positive" ? "white" : "#10b981" }}
          />
          Positive (4-5 ★)
        </FilterButton>
        <FilterButton
          active={filterRating === "neutral"}
          onClick={() => setFilterRating("neutral")}
        >
          <FaMeh
            style={{ color: filterRating === "neutral" ? "white" : "#f59e0b" }}
          />
          Neutral (3 ★)
        </FilterButton>
        <FilterButton
          active={filterRating === "negative"}
          onClick={() => setFilterRating("negative")}
        >
          <FaFrown
            style={{ color: filterRating === "negative" ? "white" : "#ef4444" }}
          />
          Negative (1-2 ★)
        </FilterButton>
      </FilterContainer>
      {loading ? (
        <p>Loading feedback...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader onClick={() => handleSort("user_email")}>
                User {getSortIcon("user_email")}
              </TableHeader>
              <TableHeader>Feedback</TableHeader>
              <TableHeader onClick={() => handleSort("rating")}>
                Rating {getSortIcon("rating")}
              </TableHeader>
              <TableHeader onClick={() => handleSort("created_at")}>
                Date {getSortIcon("created_at")}
              </TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map((item) => (
              <TableRow key={item.id || item.feedback_id}>
                <TableCell>
                  {users[item.user_id] ||
                    item.user_email ||
                    item.email ||
                    "Unknown User"}
                </TableCell>
                <TableCell>
                  {item.message && item.message.length > 50
                    ? `${item.message.substring(0, 50)}...`
                    : item.message || item.content}
                </TableCell>
                <TableCell>{renderStars(item.rating)}</TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
                <TableCell>
                  <ActionButton
                    title="Respond to feedback"
                    onClick={() => handleRespondToFeedback(item)}
                  >
                    <FaReply />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
      {isModalOpen && selectedFeedback && (
        <Modal onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Respond to Feedback</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            <FeedbackCard>
              <UserInfo>
                <UserEmail>
                  {users[selectedFeedback.user_id] ||
                    selectedFeedback.user_email ||
                    selectedFeedback.email ||
                    "Unknown User"}
                </UserEmail>
                <FeedbackDate>
                  {formatDate(selectedFeedback.created_at)}
                </FeedbackDate>
              </UserInfo>
              <StarsContainer>
                {renderStars(selectedFeedback.rating)}
              </StarsContainer>
              <FeedbackContent>
                {selectedFeedback.message || selectedFeedback.content}
              </FeedbackContent>

              {selectedFeedback.admin_response && (
                <AdminResponse>
                  <AdminResponseLabel>Previous Response:</AdminResponseLabel>
                  <FeedbackContent>
                    {selectedFeedback.admin_response}
                  </FeedbackContent>
                </AdminResponse>
              )}
            </FeedbackCard>
            <TextArea
              placeholder="Type your response here..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <SubmitButton onClick={handleSubmitResponse}>
              Send Response
            </SubmitButton>
          </ModalContent>
        </Modal>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackManagement;
