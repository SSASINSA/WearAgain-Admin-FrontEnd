import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import AdminDashboard from "./components/AdminDashboard";
import EventsManagement from "./components/EventsManagement";
import PostsManagement from "./components/PostsManagement";
import StoreManagement from "./components/StoreManagement";
import ParticipantManagement from "./components/ParticipantManagement";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/events" element={<EventsManagement />} />
          <Route path="/posts" element={<PostsManagement />} />
          <Route path="/store" element={<StoreManagement />} />
          <Route path="/repair" element={<ParticipantManagement />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
