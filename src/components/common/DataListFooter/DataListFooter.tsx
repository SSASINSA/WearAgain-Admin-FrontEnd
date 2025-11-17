import React, { useEffect, useRef, useState } from "react";
import Pagination from "../Pagination/Pagination";
import styles from "./DataListFooter.module.css";

interface DataListFooterProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const DataListFooter: React.FC<DataListFooterProps> = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const [leftWidth, setLeftWidth] = useState<number>(0);
  const [leftMarginRight, setLeftMarginRight] = useState<number>(0);

  useEffect(() => {
    const el = leftRef.current;
    const paginationEl = paginationRef.current;
    if (!el || !paginationEl) return;

    const update = () => {
      setLeftWidth(el.offsetWidth || 0);
      try {
        const styles = window.getComputedStyle(el);
        setLeftMarginRight(parseFloat(styles.marginRight || "0") || 0);
      } catch {
        setLeftMarginRight(0);
      }

      const translateX = `calc(-50% - ${(leftWidth + leftMarginRight) / 2}px - 8px)`;
      paginationEl.style.transform = `translateX(${translateX})`;
    };
    update();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [pageSize, leftWidth, leftMarginRight]);

  return (
    <div className={`${styles["dl-footer"]} ${className ? className : ""}`}>
      <div className={styles["dl-items"]} ref={leftRef}>
        <select className={styles["dl-items-select"]} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}개씩 보기
            </option>
          ))}
        </select>
      </div>
      <Pagination
        ref={paginationRef}
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={onPageChange}
        className={styles["dl-pagination"]}
      />
    </div>
  );
};

export default DataListFooter;
