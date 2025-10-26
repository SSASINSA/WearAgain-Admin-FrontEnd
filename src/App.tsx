import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import AdminDashboard from "./components/AdminDashboard";
import EventsManagement from "./components/EventsManagement";
import EventDetail from "./components/EventDetail";
import PostsManagement from "./components/PostsManagement";
import StoreManagement from "./components/StoreManagement";
import AddProduct from "./components/AddProduct";
import ParticipantManagement from "./components/ParticipantManagement";
import ParticipantEdit from "./components/ParticipantEdit";
import ParticipantDetail from "./components/ParticipantDetail";
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
