import React from "react";
import DataListFooter from "../DataListFooter/DataListFooter";
import styles from "./DataList.module.css";

export interface DataListColumn<T> {
  key: string;
  title: React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  dataIndex?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataListProps<T> {
  headerTitle?: string;
  headerRight?: React.ReactNode;
  renderFilters?: () => React.ReactNode;
  columns: DataListColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function DataList<T>(props: DataListProps<T>) {
  const {
    headerTitle,
    headerRight,
    renderFilters,
    columns,
    data,
    rowKey,
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
  } = props;

  return (
    <div className={styles["dl-container"]}>
      {renderFilters && <div className={styles["dl-controls"]}>{renderFilters()}</div>}

      <div className={styles["dl-table-container"]}>
        {(headerTitle || headerRight) && (
          <div className={styles["dl-table-header"]}>
            {headerTitle && <h3>{headerTitle}</h3>}
            <div className={styles["dl-table-info"]}>{headerRight}</div>
          </div>
        )}

        <div className={styles["dl-table-wrapper"]}>
          <table className={styles["dl-table"]}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ width: col.width, textAlign: col.align || "left" }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className} style={{ textAlign: col.align || "left" }}>
                      {col.render ? col.render(row) : col.dataIndex ? String(row[col.dataIndex]) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DataListFooter
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

export default DataList;
