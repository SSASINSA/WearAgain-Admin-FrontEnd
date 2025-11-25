import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authUtils } from "utils/auth";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./Navigation.module.css";

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isLoading: isRoleLoading, clearRole } = useAuth();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authUtils.isAuthenticated());

  const handleLogout = () => {
    authUtils.clearTokens();
    clearRole();
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/approval" || location.pathname === "/events/approval") {
      setIsAdminDropdownOpen(true);
    }
    if (location.pathname === "/login" || location.pathname === "/signup") {
      setIsTestDropdownOpen(true);
    }
  }, [location.pathname]);

  const allNavItems = [
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

  const getNavItems = () => {
    if (role === "MANAGER") {
      return allNavItems.filter((item) => item.path === "/" || item.path === "/events");
    }
    return allNavItems;
  };

  const navItems = getNavItems();

  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["sidebar-header"]}>
        <h2>관리자 페이지</h2>
      </div>
      <nav className={styles["sidebar-nav"]}>
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? styles["active"] : ""}>
              <Link to={item.path} className={styles["nav-item"]}>
                {item.icon.startsWith("/") ? (
                  <img src={item.icon} alt="" />
                ) : (
                  <span className={styles["emoji-icon"]}>{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          {!isRoleLoading && role === "SUPER_ADMIN" && (
            <li className={`${styles["nav-dropdown"]} ${isAdminDropdownOpen ? styles["open"] : ""}`}>
              <button
                className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              >
                <img src="/admin/img/icon/user-icon.svg" alt="" />
                <span>최고 관리자</span>
                <span className={`${styles["dropdown-arrow"]} ${isAdminDropdownOpen ? styles["open"] : ""}`}>▼</span>
              </button>
              <ul className={styles["nav-dropdown-menu"]}>
                <li className={location.pathname === "/approval" ? styles["active"] : ""}>
                  <Link to="/approval" className={styles["nav-dropdown-item"]}>
                    <img src="/admin/img/icon/check-circle.svg" alt="" />
                    <span>관리자 계정 승인</span>
                  </Link>
                </li>
                <li className={location.pathname === "/events/approval" ? styles["active"] : ""}>
                  <Link to="/events/approval" className={styles["nav-dropdown-item"]}>
                    <img src="/admin/img/icon/check-circle.svg" alt="" />
                    <span>행사등록 승인</span>
                  </Link>
                </li>
              </ul>
            </li>
          )}
          <li className={`${styles["nav-dropdown"]} ${isTestDropdownOpen ? styles["open"] : ""}`}>
            <button
              className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
              onClick={() => setIsTestDropdownOpen(!isTestDropdownOpen)}
            >
              <img src="/admin/img/icon/user-icon.svg" alt="" />
              <span>테스트용(삭제 예정)</span>
              <span className={`${styles["dropdown-arrow"]} ${isTestDropdownOpen ? styles["open"] : ""}`}>▼</span>
            </button>
            <ul className={styles["nav-dropdown-menu"]}>
              <li className={location.pathname === "/login" ? styles["active"] : ""}>
                <Link to="/login" className={styles["nav-dropdown-item"]}>
                  로그인
                </Link>
              </li>
              <li className={location.pathname === "/signup" ? styles["active"] : ""}>
                <Link to="/signup" className={styles["nav-dropdown-item"]}>
                  회원가입
                </Link>
              </li>
            </ul>
          </li>
          {isAuthenticated && (
            <li>
              <button
                onClick={handleLogout}
                className={styles["nav-item"]}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
              >
                <img src="/admin/img/icon/user-icon.svg" alt="" />
                <span>로그아웃</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
