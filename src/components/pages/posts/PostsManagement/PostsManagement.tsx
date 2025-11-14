import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostsManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
  status: "active" | "inactive" | "reported";
  author: string;
}

const PostsManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  const posts: Post[] = [
    {
      id: 1,
      title: "옷 교환으로 시작하는 지속가능한 패션",
      content: "옷을 버리는 대신 교환함으로써 환경을 보호하는 21%파티의 의미와 실천 방법에 대해 알아보겠습니다...",
      date: "2024-01-15",
      status: "active",
      author: "관리자",
    },
    {
      id: 2,
      title: "패스트 패션의 환경 영향과 대안",
      content: "빠르게 버려지는 옷들이 환경에 미치는 영향과 옷 교환을 통한 해결책에 대해 알아보겠습니다...",
      date: "2024-01-14",
      status: "inactive",
      author: "관리자",
    },
    {
      id: 3,
      title: "옷 교환 행사 참가 후기 및 팁",
      content: "21%파티 옷 교환 행사에 참가한 후기와 효과적인 옷 교환을 위한 실용적인 팁을 공유합니다...",
      date: "2024-01-13",
      status: "reported",
      author: "관리자",
    },
    {
      id: 4,
      title: "환경을 지키는 옷 관리 방법",
      content: "옷의 수명을 늘리고 환경에 미치는 영향을 줄이기 위한 옷 관리와 보관 방법을 소개합니다...",
      date: "2024-01-12",
      status: "active",
      author: "관리자",
    },
    {
      id: 5,
      title: "옷 교환으로 절약한 환경 임팩트",
      content: "옷 교환을 통해 절약한 CO₂, 물, 에너지의 양을 계산하고 환경 보호에 기여한 내용을 공유합니다...",
      date: "2024-01-11",
      status: "active",
      author: "관리자",
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = selectedStatus === "all" || post.status === selectedStatus;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>활성</span>;
      case "inactive":
        return <span className={`${styles["status-badge"]} ${styles["inactive"]}`}>비활성</span>;
      case "reported":
        return <span className={`${styles["status-badge"]} ${styles["reported"]}`}>신고됨</span>;
      default:
        return null;
    }
  };

  const navigate = useNavigate();

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="게시글 관리" subtitle="등록된 게시글을 관리하고 편집할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          <DataList
            headerTitle="게시글 목록"
            headerRight={
              <>
                <span>총 {filteredPosts.length}개 게시글</span>
                <span>|</span>
                <span>
                  페이지 {currentPage}/{totalPages}
                </span>
              </>
            }
            renderFilters={() => (
              <div className={`${styles["filter-section"]} ${isFilterOpen ? styles["is-open"] : styles["is-collapsed"]}`}>
                <div className={styles["filter-header"]}>
                  <h3>필터 및 검색</h3>
                  <button
                    className={`${styles["filter-toggle"]} ${isFilterOpen ? styles["open"] : ""}`}
                    aria-expanded={isFilterOpen}
                    onClick={() => setIsFilterOpen((v) => !v)}
                  >
                    ▼
                  </button>
                </div>
                <div className={`${styles["filter-controls"]} ${isFilterOpen ? styles["is-open"] : ""}`}>
                  <div className={styles["search-container"]}>
                    <div className={styles["search-icon"]}>
                      <img src="/admin/img/icon/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="게시글 제목 또는 내용으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles["search-input"]}
                    />
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={styles["status-select"]}
                    >
                      <option value="all">전체 상태</option>
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="reported">신고됨</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["sort-select-container"]}>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles["sort-select"]}>
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="title">제목순</option>
                    </select>
                    <div className={styles["sort-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            columns={[
              {
                key: "title",
                title: "제목",
                width: 200,
                className: styles["title-cell"],
                render: (row: any) => (
                  <span className={styles["clickable"]} onClick={() => navigate(`/posts/${row.id}`, { state: row })}>
                    {row.title}
                  </span>
                ),
              },
              {
                key: "content",
                title: "내용",
                width: 370,
                className: styles["content-cell"],
                render: (row: any) => row.content,
              },
              {
                key: "date",
                title: "작성일",
                width: 120,
                className: styles["date-cell"],
                render: (row: any) => (
                  <div>
                    <div>{row.date.split("-")[0]}-</div>
                    <div>{row.date.split("-").slice(1).join("-")}</div>
                  </div>
                ),
              },
              { key: "status", title: "상태", width: 100, render: (row: any) => getStatusBadge(row.status) },
              {
                key: "actions",
                title: "작업",
                width: 60,
                align: "center",
                className: styles["actions-cell"],
                render: () => (
                  <button className={`${styles["action-btn"]} ${styles["delete"]}`} title="삭제">
                    <img src="/admin/img/icon/delete.svg" alt="삭제" />
                  </button>
                ),
              },
            ]}
            data={currentPosts}
            rowKey={(row: any) => row.id}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setItemsPerPage(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default PostsManagement;
