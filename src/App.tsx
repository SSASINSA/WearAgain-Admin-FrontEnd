import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation/Navigation";
import AdminDashboard from "./components/pages/AdminDashboard/AdminDashboard";
import EventsManagement from "./components/pages/EventsManagement/EventsManagement";
import EventDetail from "./components/pages/EventDetail/EventDetail";
import EventRegistration from "./components/pages/EventRegistration/EventRegistration";
import PostsManagement from "./components/pages/PostsManagement/PostsManagement";
import PostDetail from "./components/pages/PostDetail/PostDetail";
import StoreManagement from "./components/pages/StoreManagement/StoreManagement";
import AddProduct from "./components/pages/AddProduct/AddProduct";
import ParticipantManagement from "./components/pages/ParticipantManagement/ParticipantManagement";
import ParticipantEdit from "./components/pages/ParticipantEdit/ParticipantEdit";
import ParticipantDetail from "./components/pages/ParticipantDetail/ParticipantDetail";
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
