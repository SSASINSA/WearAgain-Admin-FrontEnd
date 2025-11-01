import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode; // 알림 왼쪽에 추가 버튼 등 배치
}

const HIDE_BACK_ON: string[] = ["/", "/events", "/posts", "/store", "/repair"]; // 네비 5개 루트

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightSlot }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showBack = !HIDE_BACK_ON.includes(pathname);

  const headerClass = `page-header${showBack ? " has-back" : ""}`;
  return (
    <header className={headerClass}>
      {showBack && (
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
      )}
      <div className="header-content">
        <div className="header-info">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="header-actions">
          {rightSlot}
          <button className="notification-btn">
            <img src="/img/icon/bell.svg" alt="알림" />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-avatar">
            <img src="/img/example/admin-avatar.png" alt="관리자" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
