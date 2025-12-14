import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaUsers,
  FaImages,
  FaComments,
  FaUserCheck,
  FaChartLine,
} from "react-icons/fa";
import api from "../../services/api";

const Container = styled.div`
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: ${(props) => props.bgColor || "#E0F2FE"};
  color: ${(props) => props.color || "#0369A1"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1rem;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  margin-top: 2rem;
`;

const RecentActivity = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${(props) => props.bgColor || "#E0F2FE"};
  color: ${(props) => props.color || "#0369A1"};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
`;

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
`;

const ActivityUser = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const SeeAllLink = styled.a`
  display: block;
  text-align: center;
  padding: 0.5rem;
  color: #4f46e5;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCaptions: 0,
    totalFeedback: 0,
    unreadFeedback: 0,
  });
  const [recentCaptions, setRecentCaptions] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get admin stats
      const statsResponse = await api.adminGetStats();
      if (statsResponse.data) {
        setStats({
          totalUsers: statsResponse.data.total_users || 0,
          activeUsers: statsResponse.data.active_users || 0,
          totalCaptions: statsResponse.data.total_captions || 0,
          totalFeedback: statsResponse.data.total_feedback || 0,
          unreadFeedback: statsResponse.data.unread_feedback || 0,
        });
      } // Get captions and take the 3 most recent
      const captionsResponse = await api.adminGetCaptions();
      if (captionsResponse.data && Array.isArray(captionsResponse.data)) {
        // Reverse and take first 3
        setRecentCaptions([...captionsResponse.data].reverse().slice(0, 3));
      } else if (captionsResponse.data && captionsResponse.data.captions) {
        // Reverse and take first 3
        setRecentCaptions(
          [...captionsResponse.data.captions].reverse().slice(0, 3)
        );
      } // Get feedback and take the 3 most recent
      const feedbackResponse = await api.adminGetFeedback();
      if (feedbackResponse.data && Array.isArray(feedbackResponse.data)) {
        // Reverse and take first 3
        setRecentFeedback([...feedbackResponse.data].reverse().slice(0, 3));
      } else if (feedbackResponse.data && feedbackResponse.data.feedback) {
        // Reverse and take first 3
        setRecentFeedback(
          [...feedbackResponse.data.feedback].reverse().slice(0, 3)
        );
      }

      // Get all users to map user_id to username
      const usersResponse = await api.adminGetUsers();
      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        const userMap = {};
        usersResponse.data.forEach((user) => {
          userMap[user.user_id] = user.username || user.email;
        });
        setUsers(userMap);
      } else if (usersResponse.data && usersResponse.data.users) {
        const userMap = {};
        usersResponse.data.users.forEach((user) => {
          userMap[user.user_id] = user.username || user.email;
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString);
  };

  if (loading) {
    return <Container>Loading dashboard data...</Container>;
  }

  return (
    <Container>
      <PageTitle>Admin Dashboard</PageTitle>

      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#E0F2FE" color="#0369A1">
            <FaUsers />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#FCE7F3" color="#9D174D">
            <FaImages />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalCaptions}</StatValue>
            <StatLabel>Total Captions</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#FEF3C7" color="#92400E">
            <FaComments />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalFeedback}</StatValue>
            <StatLabel>Total Feedback</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Recent Activity</SectionTitle>

      <RecentActivity>
        <ActivityCard>
          <h3>Recent Captions</h3>{" "}
          <ActivityList>
            {recentCaptions.length > 0 ? (
              recentCaptions.map((caption) => (
                <ActivityItem key={caption.upload_id}>
                  <ActivityIcon bgColor="#FCE7F3" color="#9D174D">
                    <FaImages />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityText>
                      {caption.caption.length > 50
                        ? `${caption.caption.substring(0, 50)}...`
                        : caption.caption}
                    </ActivityText>{" "}
                    <ActivityMeta>
                      <ActivityUser>
                        {users[caption.user_id] || caption.user_id}
                      </ActivityUser>
                      <ActivityTime>
                        {getRelativeTime(caption.uploaded_at)}
                      </ActivityTime>
                    </ActivityMeta>
                  </ActivityContent>
                </ActivityItem>
              ))
            ) : (
              <ActivityItem>
                <ActivityText>No captions yet</ActivityText>
              </ActivityItem>
            )}
          </ActivityList>
        </ActivityCard>
        <ActivityCard>
          <h3>Recent Feedback</h3>{" "}
          <ActivityList>
            {recentFeedback.length > 0 ? (
              recentFeedback.map((feedback) => (
                <ActivityItem key={feedback.feedback_id}>
                  <ActivityIcon
                    bgColor={feedback.resolved ? "#DEF7EC" : "#FEF3C7"}
                    color={feedback.resolved ? "#03543F" : "#92400E"}
                  >
                    <FaComments />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityText>
                      {feedback.content && feedback.content.length > 50
                        ? `${feedback.content.substring(0, 50)}...`
                        : feedback.content}
                    </ActivityText>{" "}
                    <ActivityMeta>
                      <ActivityUser>
                        {users[feedback.user_id] || feedback.user_id}
                      </ActivityUser>
                      <ActivityTime>
                        {getRelativeTime(feedback.created_at)}
                      </ActivityTime>
                    </ActivityMeta>
                  </ActivityContent>
                </ActivityItem>
              ))
            ) : (
              <ActivityItem>
                <ActivityText>No feedback yet</ActivityText>
              </ActivityItem>
            )}
          </ActivityList>
        </ActivityCard>
      </RecentActivity>
    </Container>
  );
};

export default AdminDashboard;
