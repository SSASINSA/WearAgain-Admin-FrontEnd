import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import AdminDashboard from "./components/AdminDashboard";
import EventsManagement from "./components/EventsManagement";
import EventDetail from "./components/EventDetail";
import PostsManagement from "./components/PostsManagement";
import StoreManagement from "./components/StoreManagement";
import ParticipantManagement from "./components/ParticipantManagement";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Router>
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
            path="/posts"
            element={
              <>
                <Navigation />
                <PostsManagement />
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
            path="/repair"
            element={
              <>
                <Navigation />
                <ParticipantManagement />
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
