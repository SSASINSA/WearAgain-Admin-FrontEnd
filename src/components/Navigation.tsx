import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/components/Navigation.css";

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: "/assets/613552958ee5321ac946d7ec74aad2c68705a942.svg",
      label: "대시보드",
    },
    {
      path: "/events",
      icon: "/assets/aff6948482ed24bbe1e8dab403b90786aa137152.svg",
      label: "행사 관리",
    },
    {
      path: "/posts",
      icon: "/assets/82f8892cdd76df59f864aff5f231998f79b10267.svg",
      label: "게시글 관리",
    },
    {
      path: "/store",
      icon: "/assets/753bb00acded4c71b741f8314855ca3ea6327a63.svg",
      label: "상점 관리",
    },
    {
      path: "/repair",
      icon: "/assets/594efd96ca48d82256b225fbacc528ff904e6f87.svg",
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
