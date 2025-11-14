import React, { forwardRef } from "react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onChange, className }, ref) => {
    const go = (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      onChange(page);
    };

    const pages = (): (number | "dots")[] => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      return [1, 2, 3, "dots", totalPages];
    };

    return (
      <div ref={ref} className={`${className ? className : ""}`}>
        <div className={styles["wa-pagination"]}>
          <button
            className={styles["wa-pagination-btn"]}
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {pages().map((p, idx) =>
            p === "dots" ? (
              <span key={`dots-${idx}`} className={styles["wa-pagination-dots"]}>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`${styles["wa-pagination-btn"]} ${currentPage === p ? styles["active"] : ""}`}
                onClick={() => go(p)}
                aria-current={currentPage === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            className={styles["wa-pagination-btn"]}
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
