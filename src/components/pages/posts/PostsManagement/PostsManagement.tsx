import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./PostsManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";
const searchIcon = "/admin/img/icon/search.svg";

interface Author {
  authorId: number;
  displayName: string;
  email: string;
}

interface PostApiResponse {
  postId: number;
  title: string;
  status: string;
  categoryName: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PostListResponse {
  posts: PostApiResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
  status: "active" | "inactive" | "reported";
  author: string;
  authorEmail: string;
  categoryName: string;
  likeCount: number;
  commentCount: number;
  reportCount: number;
}

const PostsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getPageFromUrl = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 0;
  };

  const getSearchTermFromUrl = () => {
    return searchParams.get("keyword") || "";
  };

  const getSearchScopeFromUrl = () => {
    return searchParams.get("keywordScope") || "ALL";
  };

  const getStatusFromUrl = () => {
    return searchParams.get("status") || "all";
  };

  const getSortFromUrl = () => {
    return searchParams.get("sort") || "LATEST";
  };

  const [selectedStatus, setSelectedStatus] = useState<string>(getStatusFromUrl());
  const [searchTerm, setSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [sortBy, setSortBy] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState<number>(getPageFromUrl());
  const [itemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const updateUrlParams = (updates: {
    page?: number;
    keyword?: string;
    keywordScope?: string;
    status?: string;
    sort?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.page !== undefined) {
      if (updates.page === 0) {
        newParams.delete("page");
      } else {
        newParams.set("page", updates.page.toString());
      }
    }

    if (updates.keyword !== undefined) {
      if (updates.keyword === "") {
        newParams.delete("keyword");
      } else {
        newParams.set("keyword", updates.keyword);
      }
    }

    if (updates.keywordScope !== undefined) {
      if (updates.keywordScope === "ALL") {
        newParams.delete("keywordScope");
      } else {
        newParams.set("keywordScope", updates.keywordScope);
      }
    }

    if (updates.status !== undefined) {
      if (updates.status === "all") {
        newParams.delete("status");
      } else {
        newParams.set("status", updates.status);
      }
    }

    if (updates.sort !== undefined) {
      if (updates.sort === "LATEST") {
        newParams.delete("sort");
      } else {
        newParams.set("sort", updates.sort);
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const mapApiStatusToDisplayStatus = (apiStatus: string): "active" | "inactive" | "reported" => {
    switch (apiStatus.toUpperCase()) {
      case "ACTIVE":
        return "active";
      case "HIDDEN":
        return "inactive";
      case "REPORTED":
        return "reported";
      default:
        return "active";
    }
  };

  const mapDisplayStatusToApiStatus = (displayStatus: string): string | null => {
    switch (displayStatus) {
      case "active":
        return "ACTIVE";
      case "inactive":
        return "HIDDEN";
      case "reported":
        return "REPORTED";
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const apiStatus = mapDisplayStatusToApiStatus(selectedStatus);
      if (apiStatus && selectedStatus !== "all") {
        params.append("status", apiStatus);
      }
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      params.append("page", String(currentPage));
      params.append("size", String(itemsPerPage));
      params.append("sort", sortBy);

      const response = await apiRequest(`/admin/posts?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "게시글 목록을 가져오는데 실패했습니다.");
      }

      const data: PostListResponse = await response.json();

      if (!data || !Array.isArray(data.posts)) {
        throw new Error("잘못된 응답 형식입니다.");
      }

      const transformedPosts: Post[] = data.posts.map((apiPost) => {
        const displayStatus = mapApiStatusToDisplayStatus(apiPost.status);
        return {
          id: apiPost.postId,
          title: apiPost.title,
          content: "",
          date: formatDate(apiPost.createdAt),
          status: displayStatus,
          author: apiPost.author.displayName,
          authorEmail: apiPost.author.email,
          categoryName: apiPost.categoryName,
          likeCount: apiPost.likeCount,
          commentCount: apiPost.commentCount,
          reportCount: apiPost.reportCount,
        };
      });

      setPosts(transformedPosts);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      setHasNext(data.hasNext);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "게시글 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("게시글 목록 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, appliedSearchTerm, appliedSearchScope, sortBy, currentPage, itemsPerPage]);

  useEffect(() => {
    const urlPage = getPageFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();
    const urlStatus = getStatusFromUrl();
    const urlSort = getSortFromUrl();

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlKeyword !== appliedSearchTerm) {
      setSearchTerm(urlKeyword);
      setAppliedSearchTerm(urlKeyword);
    }
    if (urlKeywordScope !== appliedSearchScope) {
      setSearchScope(urlKeywordScope);
      setAppliedSearchScope(urlKeywordScope);
    }
    if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    if (urlSort !== sortBy) setSortBy(urlSort);
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedSearchScope(searchScope);
    setCurrentPage(0);
    updateUrlParams({
      keyword: searchTerm,
      keywordScope: searchScope,
      page: 0,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(0);
    updateUrlParams({ status: newStatus, page: 0 });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(0);
    updateUrlParams({ sort: newSort, page: 0 });
  };

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

  const handleDelete = async (postId: number) => {
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await apiRequest(`/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "게시글 삭제에 실패했습니다.");
      }

      alert("게시글이 삭제되었습니다.");
      fetchPosts();
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
    }
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="게시글 관리" subtitle="등록된 게시글을 관리하고 편집할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          {isLoading && (
            <div className={styles["loading-container"]}>
              <p>로딩 중...</p>
            </div>
          )}

          {error && (
            <div className={styles["error-container"]}>
              <p>{error}</p>
              <button onClick={fetchPosts}>다시 시도</button>
            </div>
          )}

          {!isLoading && !error && (
            <DataList
              headerTitle="게시글 목록"
              headerRight={
                <>
                  <span>총 {totalElements}개 게시글</span>
                  <span>|</span>
                  <span>
                    페이지 {currentPage + 1}/{totalPages || 1}
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
                      <div className={styles["search-icon"]} onClick={handleSearch} style={{ cursor: "pointer" }}>
                        <img src={searchIcon} alt="검색" />
                      </div>
                      <input
                        type="text"
                        placeholder="게시글 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={styles["search-input"]}
                      />
                    </div>
                    <div className={styles["status-select-container"]}>
                      <select
                        value={searchScope}
                        onChange={(e) => setSearchScope(e.target.value)}
                        className={styles["status-select"]}
                      >
                        <option value="ALL">전체</option>
                        <option value="TITLE">제목</option>
                        <option value="AUTHOR">작성자</option>
                      </select>
                      <div className={styles["status-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className={styles["status-select-container"]}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className={styles["status-select"]}
                      >
                        <option value="all">전체 상태</option>
                        <option value="active">활성</option>
                        <option value="reported">신고됨</option>
                      </select>
                      <div className={styles["status-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className={styles["sort-select-container"]}>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className={styles["sort-select"]}
                      >
                        <option value="LATEST">최신순</option>
                        <option value="OLDEST">오래된순</option>
                        <option value="TITLE">제목순</option>
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
                    <span className={styles["clickable"]} onClick={() => navigate(`/posts/${row.id}`)}>
                      {row.title}
                    </span>
                  ),
                },
                {
                  key: "author",
                  title: "작성자",
                  width: 150,
                  className: styles["content-cell"],
                  render: (row: any) => (
                    <div>
                      <div>{row.author}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{row.authorEmail}</div>
                    </div>
                  ),
                },
                {
                  key: "category",
                  title: "카테고리",
                  width: 100,
                  className: styles["content-cell"],
                  render: (row: any) => <span>{row.categoryName || "-"}</span>,
                },
                {
                  key: "date",
                  title: "작성일",
                  width: 120,
                  className: styles["date-cell"],
                  render: (row: any) => <span>{row.date}</span>,
                },
                {
                  key: "stats",
                  title: "통계",
                  width: 120,
                  className: styles["content-cell"],
                  render: (row: any) => (
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      <div>좋아요: {row.likeCount}</div>
                      <div>댓글: {row.commentCount}</div>
                      {row.reportCount > 0 && <div style={{ color: "#ef4444" }}>신고: {row.reportCount}</div>}
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
                  render: (row: any) => (
                    <button
                      className={`${styles["action-btn"]} ${styles["delete"]}`}
                      title="삭제"
                      onClick={() => handleDelete(row.id)}
                    >
                      <img src="/admin/img/icon/delete.svg" alt="삭제" />
                    </button>
                  ),
                },
              ]}
              data={posts}
              rowKey={(row: any) => row.id}
              currentPage={currentPage + 1}
              totalPages={totalPages}
              pageSize={itemsPerPage}
              onPageChange={(p) => {
                setCurrentPage(p - 1);
                updateUrlParams({ page: p - 1 });
              }}
              onPageSizeChange={(s) => {
                setCurrentPage(0);
                updateUrlParams({ page: 0 });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PostsManagement;
