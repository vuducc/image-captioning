import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FaImage,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaTrash,
  FaFilter,
} from "react-icons/fa";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

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

const ImagePreview = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
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

const DialogImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
`;

const CaptionText = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  color: #1f2937;
`;

const CaptionsManagement = () => {
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("uploaded_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchCaptions();
    fetchUsers();
  }, [filterType]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCaptions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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

  const fetchCaptions = async () => {
    try {
      setLoading(true);
      let typeParam = null;
      if (filterType !== "all") typeParam = filterType;

      const response = await api.adminGetCaptions(
        searchTerm || null,
        typeParam,
        null,
        null
      );

      if (response.data && Array.isArray(response.data)) {
        setCaptions(response.data);
      } else if (response.data && response.data.captions) {
        setCaptions(response.data.captions);
      } else {
        setCaptions([]);
      }
    } catch (error) {
      console.error("Error fetching captions:", error);
      setSnackbarMessage("Failed to load captions");
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

  const handlePreview = (caption) => {
    setSelectedCaption(caption);
    setPreviewDialogOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
  };
  const handleDeleteCaption = async (captionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this caption? This action cannot be undone."
      )
    ) {
      try {
        await api.adminDeleteCaption(captionId);
        setCaptions(
          captions.filter((caption) => caption.upload_id !== captionId)
        );
        setSnackbarMessage("Caption deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error deleting caption:", error);
        setSnackbarMessage(
          "Failed to delete caption: " +
            (error.response?.data?.detail || error.message)
        );
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

  const filteredCaptions = captions
    .filter((caption) => {
      if (filterType !== "all" && caption.file_type !== filterType)
        return false;
      if (searchTerm) {
        return caption.caption.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === "caption") {
        return sortDirection === "asc"
          ? a.caption.localeCompare(b.caption)
          : b.caption.localeCompare(a.caption);
      } else if (sortField === "uploaded_at") {
        return sortDirection === "asc"
          ? new Date(a.uploaded_at) - new Date(b.uploaded_at)
          : new Date(b.uploaded_at) - new Date(a.uploaded_at);
      } else if (sortField === "file_type") {
        return sortDirection === "asc"
          ? a.file_type.localeCompare(b.file_type)
          : b.file_type.localeCompare(a.file_type);
      }
      return 0;
    });

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>Captions Management</PageTitle>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search captions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </PageHeader>

      <FilterContainer>
        <FilterButton
          active={filterType === "all"}
          onClick={() => setFilterType("all")}
        >
          All
        </FilterButton>
        <FilterButton
          active={filterType === "jpg"}
          onClick={() => setFilterType("jpg")}
        >
          JPG
        </FilterButton>
        <FilterButton
          active={filterType === "png"}
          onClick={() => setFilterType("png")}
        >
          PNG
        </FilterButton>
        <FilterButton
          active={filterType === "jpeg"}
          onClick={() => setFilterType("jpeg")}
        >
          JPEG
        </FilterButton>
      </FilterContainer>

      {loading ? (
        <p>Loading captions...</p>
      ) : captions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>
            No captions found.{" "}
            {searchTerm ? "Try a different search term." : ""}
          </p>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader>Preview</TableHeader>
              <TableHeader onClick={() => handleSort("caption")}>
                Caption {getSortIcon("caption")}
              </TableHeader>
              <TableHeader>User</TableHeader>
              <TableHeader onClick={() => handleSort("file_type")}>
                Type {getSortIcon("file_type")}
              </TableHeader>
              <TableHeader onClick={() => handleSort("uploaded_at")}>
                Uploaded {getSortIcon("uploaded_at")}
              </TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredCaptions.map((caption) => (
              <TableRow key={caption.upload_id}>
                <TableCell>
                  <ImagePreview src={caption.file_url} alt="Thumbnail" />
                </TableCell>
                <TableCell>
                  {caption.caption.length > 50
                    ? `${caption.caption.substring(0, 50)}...`
                    : caption.caption}
                </TableCell>
                <TableCell>
                  {users[caption.user_id] || caption.user_id}
                </TableCell>
                <TableCell>{caption.file_type.toUpperCase()}</TableCell>
                <TableCell>{formatDate(caption.uploaded_at)}</TableCell>
                <TableCell>
                  <ActionButton
                    title="View"
                    onClick={() => handlePreview(caption)}
                  >
                    <FaEye />
                  </ActionButton>
                  <ActionButton
                    title="Delete"
                    onClick={() => handleDeleteCaption(caption.upload_id)}
                  >
                    <FaTrash />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedCaption && (
            <>
              <DialogImage
                src={selectedCaption.file_url}
                alt={selectedCaption.caption}
              />
              <CaptionText>{selectedCaption.caption}</CaptionText>
              <p>
                User:{" "}
                {users[selectedCaption?.user_id] || selectedCaption?.user_id}
              </p>
              <p>Uploaded: {formatDate(selectedCaption?.uploaded_at)}</p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

export default CaptionsManagement;
