import React from "react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string; // 외부 컨테이너 클래스 (배치용)
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onChange, className }) => {
  const go = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onChange(page);
  };

  const pages = (): (number | "dots")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // 간단한 패턴: 1, 2, 3, ..., total
    return [1, 2, 3, "dots", totalPages];
  };

  return (
    <div className={`${className ? className : ""}`}>
      <div className="wa-pagination">
        <button
          className="wa-pagination-btn"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          ‹
        </button>
        {pages().map((p, idx) =>
          p === "dots" ? (
            <span key={`dots-${idx}`} className="wa-pagination-dots">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`wa-pagination-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => go(p)}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          className="wa-pagination-btn"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
