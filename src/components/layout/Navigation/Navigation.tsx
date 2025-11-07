import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/approval" || location.pathname === "/events/approval") {
      setIsAdminDropdownOpen(true);
    }
    if (location.pathname === "/login" || location.pathname === "/signup") {
      setIsTestDropdownOpen(true);
    }
  }, [location.pathname]);

  const navItems = [
    {
      path: "/",
      icon: "/admin/img/icon/dashboard.svg",
      label: "대시보드",
    },
    {
      path: "/events",
      icon: "/admin/img/icon/events.svg",
      label: "행사 관리",
    },
    {
      path: "/posts",
      icon: "/admin/img/icon/posts.svg",
      label: "게시글 관리",
    },
    {
      path: "/store",
      icon: "/admin/img/icon/store.svg",
      label: "상점 관리",
    },
    {
      path: "/repair",
      icon: "/admin/img/icon/participants.svg",
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
          <li className={`nav-dropdown ${isAdminDropdownOpen ? "open" : ""}`}>
            <button
              className="nav-item nav-dropdown-toggle"
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            >
              <img src="/admin/img/icon/user-icon.svg" alt="" />
              <span>최고 관리자</span>
              <span className={`dropdown-arrow ${isAdminDropdownOpen ? "open" : ""}`}>▼</span>
            </button>
            <ul className="nav-dropdown-menu">
              <li className={location.pathname === "/approval" ? "active" : ""}>
                <Link to="/approval" className="nav-dropdown-item">
                  <img src="/admin/img/icon/check-circle.svg" alt="" />
                  <span>관리자 계정 승인</span>
                </Link>
              </li>
              <li className={location.pathname === "/events/approval" ? "active" : ""}>
                <Link to="/events/approval" className="nav-dropdown-item">
                  <img src="/admin/img/icon/check-circle.svg" alt="" />
                  <span>행사등록 승인</span>
                </Link>
              </li>
            </ul>
          </li>
          <li className={`nav-dropdown ${isTestDropdownOpen ? "open" : ""}`}>
            <button className="nav-item nav-dropdown-toggle" onClick={() => setIsTestDropdownOpen(!isTestDropdownOpen)}>
              <img src="/admin/img/icon/user-icon.svg" alt="" />
              <span>테스트용(삭제 예정)</span>
              <span className={`dropdown-arrow ${isTestDropdownOpen ? "open" : ""}`}>▼</span>
            </button>
            <ul className="nav-dropdown-menu">
              <li className={location.pathname === "/login" ? "active" : ""}>
                <Link to="/login" className="nav-dropdown-item">
                  로그인
                </Link>
              </li>
              <li className={location.pathname === "/signup" ? "active" : ""}>
                <Link to="/signup" className="nav-dropdown-item">
                  회원가입
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
