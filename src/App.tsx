import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation/Navigation";
import AdminDashboard from "./components/pages/dashboard/AdminDashboard/AdminDashboard";
import EventsManagement from "./components/pages/events/EventsManagement/EventsManagement";
import EventDetail from "./components/pages/events/EventDetail/EventDetail";
import EventRegistration from "./components/pages/events/EventRegistration/EventRegistration";
import PostsManagement from "./components/pages/posts/PostsManagement/PostsManagement";
import PostDetail from "./components/pages/posts/PostDetail/PostDetail";
import StoreManagement from "./components/pages/store/StoreManagement/StoreManagement";
import AddProduct from "./components/pages/store/AddProduct/AddProduct";
import ParticipantManagement from "./components/pages/participants/ParticipantManagement/ParticipantManagement";
import ParticipantEdit from "./components/pages/participants/ParticipantEdit/ParticipantEdit";
import ParticipantDetail from "./components/pages/participants/ParticipantDetail/ParticipantDetail";
import Login from "./components/pages/auth/Login/Login";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Router basename="/admin">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navigation />
                <AdminDashboard />
              </>
            }
          />
          <Route
            path="/events"
            element={
              <>
                <Navigation />
                <EventsManagement />
              </>
            }
          />
          <Route
            path="/events/:id"
            element={
              <>
                <Navigation />
                <EventDetail />
              </>
            }
          />
          <Route
            path="/events/register"
            element={
              <>
                <Navigation />
                <EventRegistration />
              </>
            }
          />
          <Route
            path="/posts"
            element={
              <>
                <Navigation />
                <PostsManagement />
              </>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <>
                <Navigation />
                <PostDetail />
              </>
            }
          />
          <Route
            path="/store"
            element={
              <>
                <Navigation />
                <StoreManagement />
              </>
            }
          />
          <Route
            path="/store/add"
            element={
              <>
                <Navigation />
                <AddProduct />
              </>
            }
          />
          <Route
            path="/repair"
            element={
              <>
                <Navigation />
                <ParticipantManagement />
              </>
            }
          />
          <Route
            path="/repair/:id/edit"
            element={
              <>
                <Navigation />
                <ParticipantEdit />
              </>
            }
          />
          <Route
            path="/repair/:id"
            element={
              <>
                <Navigation />
                <ParticipantDetail />
              </>
            }
          />
          <Route
            path="/login"
            element={<Login />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
