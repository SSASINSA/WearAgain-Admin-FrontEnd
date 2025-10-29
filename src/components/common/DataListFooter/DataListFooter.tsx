import React, { useEffect, useRef, useState } from "react";
import Pagination from "../Pagination";
import "./DataListFooter.css";

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
  const [leftWidth, setLeftWidth] = useState<number>(0);
  const [leftMarginRight, setLeftMarginRight] = useState<number>(0);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const update = () => {
      setLeftWidth(el.offsetWidth || 0);
      try {
        const styles = window.getComputedStyle(el);
        setLeftMarginRight(parseFloat(styles.marginRight || "0") || 0);
      } catch {
        setLeftMarginRight(0);
      }
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
  }, [pageSize]);

  return (
    <div className={`dl-footer ${className ? className : ""}`}>
      <div className="dl-items" ref={leftRef}>
        <select className="dl-items-select" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}개씩 보기
            </option>
          ))}
        </select>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={onPageChange} className="dl-pagination" />
      {/**
       * 중앙 보정 식
       * -50% : 컨테이너 정중앙
       * -(leftWidth + leftMarginRight)/2 : 좌측 블록(셀렉트 + 마진)의 절반만큼 추가 이동
       * - 8px : 셀렉트 화살표/내부 패딩으로 인한 시각적 중심 보정
       */}
      <style>{`.dl-footer .dl-pagination{ transform: translateX(calc(-50% - ${
        (leftWidth + leftMarginRight) / 2
      }px - 8px)); }`}</style>
    </div>
  );
};

export default DataListFooter;
