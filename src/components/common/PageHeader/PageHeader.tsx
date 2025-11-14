import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode; // 알림 왼쪽에 추가 버튼 등 배치
}

const HIDE_BACK_ON: string[] = ["/", "/events", "/posts", "/store", "/repair", "/approval", "/events/approval"]; // 네비 5개 루트 + 관리자 계정 관리, 행사등록 승인

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightSlot }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showBack = !HIDE_BACK_ON.includes(pathname);

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
          <button className={styles["notification-btn"]}>
            <img src="/admin/img/icon/bell.svg" alt="알림" />
            <span className={styles["notification-badge"]}>3</span>
          </button>
          <div className={styles["user-avatar"]}>
            <img src="/admin/img/example/admin-avatar.png" alt="관리자" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
