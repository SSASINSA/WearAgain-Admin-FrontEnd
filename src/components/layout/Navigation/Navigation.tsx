import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import type { AdminRole } from "../../../contexts/AuthContext";
import styles from "./Navigation.module.css";

interface NavItem {
  path: string;
  icon: string;
  label: string;
  allowedRoles?: AdminRole[];
}

interface NavDropdown {
  label: string;
  icon: string;
  allowedRoles?: AdminRole[];
  items: NavItem[];
  openStateKey: string;
  pathMatchers: string[];
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const { role, isLoading: isRoleLoading } = useAuth();
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({
    store: false,
    adminFeatures: false,
    admin: false,
  });

  const navItems: NavItem[] = [
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
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      path: "/users",
      icon: "/admin/img/icon/users.svg",
      label: "유저 관리",
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
  ];

  const navDropdowns: NavDropdown[] = [
    {
      label: "상점 관리",
      icon: "/admin/img/icon/store.svg",
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      openStateKey: "store",
      pathMatchers: ["/store", "/store/orders"],
      items: [
        {
          path: "/store",
          icon: "/admin/img/icon/store.svg",
          label: "상품 관리",
        },
        {
          path: "/store/orders",
          icon: "/admin/img/icon/document.svg",
          label: "상품 주문 관리",
        },
      ],
    },
    {
      label: "관리자 기능",
      icon: "/admin/img/icon/check-circle.svg",
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      openStateKey: "adminFeatures",
      pathMatchers: ["/approval", "/events/approval"],
      items: [
        {
          path: "/approval",
          icon: "/admin/img/icon/check-circle.svg",
          label: "관리자 계정 승인",
        },
        {
          path: "/events/approval",
          icon: "/admin/img/icon/check-circle.svg",
          label: "행사등록 승인",
        },
      ],
    },
    {
      label: "최고 관리자",
      icon: "/admin/img/icon/user-icon.svg",
      allowedRoles: ["SUPER_ADMIN"],
      openStateKey: "admin",
      pathMatchers: ["/admin-users"],
      items: [
        {
          path: "/admin-users",
          icon: "/admin/img/icon/user-icon.svg",
          label: "관리자 계정 목록",
        },
      ],
    },
  ];

  const hasAccess = (allowedRoles?: AdminRole[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  useEffect(() => {
    const newStates: Record<string, boolean> = {};
    navDropdowns.forEach((dropdown) => {
      const isActive = dropdown.pathMatchers.some((matcher) => {
        if (matcher.includes("/store/")) {
          return location.pathname.startsWith("/store");
        }
        return location.pathname === matcher || location.pathname.startsWith(matcher + "/");
      });
      if (isActive) {
        newStates[dropdown.openStateKey] = true;
      }
    });
    setDropdownStates((prev) => ({ ...prev, ...newStates }));
  }, [location.pathname]);

  const toggleDropdown = (key: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredNavItems = navItems.filter((item) => hasAccess(item.allowedRoles));
  const filteredDropdowns = navDropdowns.filter((dropdown) => hasAccess(dropdown.allowedRoles));

  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["sidebar-header"]}>
        <h2>관리자 페이지</h2>
      </div>
      <nav className={styles["sidebar-nav"]}>
        <ul>
          {!isRoleLoading && filteredNavItems.map((item) => (
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
          {!isRoleLoading &&
            filteredDropdowns.map((dropdown) => {
              const isOpen = dropdownStates[dropdown.openStateKey];
              const isActive = dropdown.items.some((item) => {
                if (item.path === "/store") {
                  return location.pathname === "/store" || (location.pathname.startsWith("/store/") && location.pathname !== "/store/orders");
                }
                return location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              });

              return (
                <li key={dropdown.openStateKey} className={`${styles["nav-dropdown"]} ${isOpen ? styles["open"] : ""}`}>
                  <button
                    className={`${styles["nav-item"]} ${styles["nav-dropdown-toggle"]}`}
                    onClick={() => toggleDropdown(dropdown.openStateKey)}
                  >
                    <img src={dropdown.icon} alt="" />
                    <span>{dropdown.label}</span>
                    <span className={`${styles["dropdown-arrow"]} ${isOpen ? styles["open"] : ""}`}>▼</span>
                  </button>
                  <ul className={styles["nav-dropdown-menu"]}>
                    {dropdown.items.map((item) => {
                      const itemIsActive =
                        item.path === "/store"
                          ? location.pathname === "/store" || (location.pathname.startsWith("/store/") && location.pathname !== "/store/orders")
                          : location.pathname === item.path || location.pathname.startsWith(item.path + "/");

                      return (
                        <li key={item.path} className={itemIsActive ? styles["active"] : ""}>
                          <Link to={item.path} className={styles["nav-dropdown-item"]}>
                            <img src={item.icon} alt="" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
