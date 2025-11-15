import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation/Navigation";
import AdminDashboard from "./components/pages/dashboard/AdminDashboard/AdminDashboard";
import EventsManagement from "./components/pages/events/EventsManagement/EventsManagement";
import EventDetail from "./components/pages/events/EventDetail/EventDetail";
import EventRegistration from "./components/pages/events/EventRegistration/EventRegistration";
import EventEdit from "./components/pages/events/EventEdit/EventEdit";
import EventApproval from "./components/pages/admin/EventApproval/EventApproval";
import EventApprovalDetail from "./components/pages/admin/EventApprovalDetail/EventApprovalDetail";
import PostsManagement from "./components/pages/posts/PostsManagement/PostsManagement";
import PostDetail from "./components/pages/posts/PostDetail/PostDetail";
import StoreManagement from "./components/pages/store/StoreManagement/StoreManagement";
import AddProduct from "./components/pages/store/AddProduct/AddProduct";
import ParticipantManagement from "./components/pages/participants/ParticipantManagement/ParticipantManagement";
import ParticipantEdit from "./components/pages/participants/ParticipantEdit/ParticipantEdit";
import ParticipantDetail from "./components/pages/participants/ParticipantDetail/ParticipantDetail";
import AdminAccountManagement from "./components/pages/admin/AdminAccountManagement/AdminAccountManagement";
import Login from "./components/pages/auth/Login/Login";
import SignUp from "./components/pages/auth/SignUp/SignUp";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute/PublicRoute";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Router basename="/admin">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigation />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/register"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/approval"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/approval/:id"
            element={
              <ProtectedRoute>
                <Navigation />
                <EventApprovalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <Navigation />
                <PostsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <Navigation />
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <Navigation />
                <StoreManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/add"
            element={
              <ProtectedRoute>
                <Navigation />
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repair"
            element={
              <ProtectedRoute>
                <Navigation />
                <ParticipantManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repair/:id/edit"
            element={
              <ProtectedRoute>
                <Navigation />
                <ParticipantEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repair/:id"
            element={
              <ProtectedRoute>
                <Navigation />
                <ParticipantDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval"
            element={
              <ProtectedRoute>
                <Navigation />
                <AdminAccountManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
