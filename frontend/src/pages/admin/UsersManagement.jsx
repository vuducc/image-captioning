import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheck,
  FaBan,
  FaUserAlt,
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

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props) => (props.active ? "#DEF7EC" : "#FEF3F2")};
  color: ${(props) => (props.active ? "#03543F" : "#B42318")};
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

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

  &:hover {
    border-color: ${(props) => (props.active ? "#4338ca" : "#9ca3af")};
  }
`;

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let statusParam = null;
      if (filterStatus === "active") statusParam = true;
      if (filterStatus === "inactive") statusParam = false;

      const response = await api.adminGetUsers(searchTerm || null, statusParam);
      if (response.data && Array.isArray(response.data)) {
        // Filter out admin user (visualcaption@gmail.com)
        const filteredUsers = response.data.filter(
          (user) => user.email !== "visualcaption@gmail.com"
        );

        setUsers(
          filteredUsers.map((user) => ({
            ...user,
            id: user.user_id,
            captionCount: user.caption_count || 0,
            status: user.is_active ? "active" : "inactive",
            created_at: user.created_at || new Date().toISOString(),
            email: user.email || user.username,
          }))
        );
      } else if (response.data && response.data.users) {
        // Filter out admin user (visualcaption@gmail.com)
        const filteredUsers = response.data.users.filter(
          (user) => user.email !== "visualcaption@gmail.com"
        );

        setUsers(
          filteredUsers.map((user) => ({
            ...user,
            id: user.user_id,
            captionCount: user.caption_count || 0,
            status: user.is_active ? "active" : "inactive",
            created_at: user.created_at || new Date().toISOString(),
            email: user.email || user.username,
          }))
        );
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbarMessage("Failed to load users");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleStatusToggle = async (userId) => {
    try {
      await api.adminToggleUserStatus(userId);

      // Update local state
      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            };
          }
          return user;
        })
      );

      setSnackbarMessage("User status updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error toggling user status:", error);
      setSnackbarMessage("Failed to update user status");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await api.adminDeleteUser(userId);

        // Update local state
        setUsers(users.filter((user) => user.id !== userId));

        setSnackbarMessage("User deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error deleting user:", error);
        setSnackbarMessage("Failed to delete user");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };
  const filteredUsers = users
    .filter((user) => {
      if (filterStatus === "active" && user.status !== "active") return false;
      if (filterStatus === "inactive" && user.status !== "inactive")
        return false;

      if (searchTerm) {
        return user.email.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === "email") {
        return sortDirection === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortField === "status") {
        return sortDirection === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      } else if (sortField === "captionCount") {
        return sortDirection === "asc"
          ? a.captionCount - b.captionCount
          : b.captionCount - a.captionCount;
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
        <PageTitle>Users Management</PageTitle>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </PageHeader>
      <FilterContainer>
        <FilterButton
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
        >
          All
        </FilterButton>
        <FilterButton
          active={filterStatus === "active"}
          onClick={() => setFilterStatus("active")}
        >
          <FaCheck style={{ marginRight: "0.3rem" }} /> Active
        </FilterButton>
        <FilterButton
          active={filterStatus === "inactive"}
          onClick={() => setFilterStatus("inactive")}
        >
          <FaBan style={{ marginRight: "0.3rem" }} /> Inactive
        </FilterButton>
      </FilterContainer>{" "}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>
            No users found. {searchTerm ? "Try a different search term." : ""}
          </p>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader onClick={() => handleSort("email")}>
                Email {getSortIcon("email")}
              </TableHeader>
              <TableHeader onClick={() => handleSort("created_at")}>
                Joined {getSortIcon("created_at")}
              </TableHeader>
              <TableHeader onClick={() => handleSort("status")}>
                Status {getSortIcon("status")}
              </TableHeader>
              <TableHeader onClick={() => handleSort("captionCount")}>
                Captions {getSortIcon("captionCount")}
              </TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FaUserAlt color="#6b7280" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <Badge active={user.status === "active"}>
                    {user.status === "active" ? (
                      <>
                        <FaCheck style={{ marginRight: "0.3rem" }} /> Active
                      </>
                    ) : (
                      <>
                        <FaBan style={{ marginRight: "0.3rem" }} /> Inactive
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{user.captionCount}</TableCell>
                <TableCell>
                  <ActionButton
                    title="Toggle user status"
                    onClick={() => handleStatusToggle(user.id)}
                  >
                    {user.status === "active" ? <FaBan /> : <FaCheck />}
                  </ActionButton>
                  <ActionButton
                    title="Delete user"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <FaTrash />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}{" "}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default UsersManagement;
