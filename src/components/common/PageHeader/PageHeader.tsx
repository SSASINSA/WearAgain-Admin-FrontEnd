import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authUtils } from "utils/auth";
import { useAuth } from "../../../contexts/AuthContext";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

const HIDE_BACK_ON: string[] = ["/", "/events", "/posts", "/store", "/repair", "/approval", "/events/approval"];

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightSlot }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clearRole } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const showBack = !HIDE_BACK_ON.includes(pathname);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    authUtils.clearTokens();
    clearRole();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const headerClass = `${styles["page-header"]}${showBack ? ` ${styles["has-back"]}` : ""}`;
  return (
    <header className={headerClass}>
      {showBack && (
        <button className={styles["back-btn"]} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src="/admin/img/icon/back-arrow.svg" alt="뒤로가기" />
        </button>
      )}
      <div className={styles["header-content"]}>
        <div className={styles["header-info"]}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className={styles["header-actions"]}>
          {rightSlot}
          {authUtils.isAuthenticated() && (
            <button className={styles["logout-btn"]} onClick={handleLogoutClick} aria-label="로그아웃">
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showLogoutModal}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        type="reject"
      />
    </header>
  );
};

export default PageHeader;
