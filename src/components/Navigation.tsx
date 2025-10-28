import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/components/Navigation.css";

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: "/assets/dashboard.svg",
      label: "대시보드",
    },
    {
      path: "/events",
      icon: "/assets/events.svg",
      label: "행사 관리",
    },
    {
      path: "/posts",
      icon: "/assets/posts.svg",
      label: "게시글 관리",
    },
    {
      path: "/store",
      icon: "/assets/store.svg",
      label: "상점 관리",
    },
    {
      path: "/repair",
      icon: "/assets/participants.svg",
      label: "참가자 관리",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>관리자 페이지</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path} className="nav-item">
                {item.icon.startsWith("/") ? (
                  <img src={item.icon} alt="" />
                ) : (
                  <span className="emoji-icon">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
