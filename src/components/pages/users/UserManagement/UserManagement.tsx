import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./UserManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface UserResponse {
  participantId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  ticketBalance: number;
  creditBalance: number;
  suspended: boolean;
  joinedAt: string;
  updatedAt: string;
}

interface UserPageResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  ticketBalance: number;
  creditBalance: number;
  suspended: boolean;
  joinedAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
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

  const getSortFromUrl = () => {
    return searchParams.get("sort") || "LATEST";
  };

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [sortBy, setSortBy] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);

  const updateUrlParams = (updates: {
    page?: number;
    keyword?: string;
    keywordScope?: string;
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
    
    if (updates.sort !== undefined) {
      if (updates.sort === "LATEST") {
        newParams.delete("sort");
      } else {
        newParams.set("sort", updates.sort);
      }
    }
    
    setSearchParams(newParams, { replace: true });
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      
      params.append("sort", sortBy);
      params.append("page", String(currentPage));
      params.append("size", String(itemsPerPage));

      const response = await apiRequest(`/admin/participants?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("유저 목록 조회에 실패했습니다.");
      }

      const data: UserPageResponse = await response.json();
      const mappedUsers: User[] = data.content.map((user) => ({
        id: user.participantId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        ticketBalance: user.ticketBalance,
        creditBalance: user.creditBalance,
        suspended: user.suspended,
        joinedAt: formatDate(user.joinedAt),
        updatedAt: formatDate(user.updatedAt),
      }));

      setUsers(mappedUsers);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("유저 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearchTerm, appliedSearchScope, sortBy, currentPage, itemsPerPage]);

  useEffect(() => {
    const urlPage = getPageFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();
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
    if (urlSort !== sortBy) setSortBy(urlSort);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <header className={styles["user-header"]} style={{ padding: 0, borderBottom: "none", height: "auto" }}>
          <PageHeader title="유저 관리" subtitle="전체 유저 목록을 확인하고 관리하세요" />
        </header>

        {/* 유저 목록 섹션 */}
        <div className={styles["users-section"]}>
          <DataList
            headerTitle="유저 목록"
            renderFilters={() => (
              <div
                className={`${styles["filter-section"]} ${isFilterOpen ? styles["is-open"] : styles["is-collapsed"]}`}
              >
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
                      <img src="/admin/img/icon/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="이메일/닉네임 검색..."
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
                      <option value="EMAIL">이메일</option>
                      <option value="NAME">닉네임</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["sort-select-container"]}>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const newSort = e.target.value;
                        setSortBy(newSort);
                        setCurrentPage(0);
                        updateUrlParams({ sort: newSort, page: 0 });
                      }}
                      className={styles["sort-select"]}
                    >
                      <option value="LATEST">가입일 최신순</option>
                      <option value="OLDEST">가입일 오래된 순</option>
                      <option value="BY_NAME">이름순</option>
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
                key: "info",
                title: "유저 정보",
                width: 250,
                render: (u: User) => (
                  <div className={styles["user-info"]}>
                    <img 
                      src={u.avatarUrl || "/admin/img/icon/basic-profile.svg"} 
                      alt={u.name} 
                      className={styles["user-avatar"]} 
                    />
                    <div className={styles["user-details"]}>
                      <p
                        className={`${styles["user-name"]} ${styles["clickable"]}`}
                        onClick={() => navigate(`/repair/${u.id}`)}
                      >
                        {u.name}
                      </p>
                      <p className={styles["user-email"]}>{u.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "ticketBalance",
                title: "티켓 잔액",
                width: 120,
                render: (u: User) => u.ticketBalance.toLocaleString(),
              },
              {
                key: "creditBalance",
                title: "크레딧 잔액",
                width: 120,
                render: (u: User) => u.creditBalance.toLocaleString(),
              },
              {
                key: "suspended",
                title: "정지 여부",
                width: 100,
                render: (u: User) => (
                  <span className={styles["status-badge"]} style={{ backgroundColor: u.suspended ? "#ef4444" : "#10b981" }}>
                    {u.suspended ? "정지" : "정상"}
                  </span>
                ),
              },
              {
                key: "joinedAt",
                title: "가입일",
                width: 130,
                render: (u: User) => u.joinedAt,
              },
              {
                key: "updatedAt",
                title: "수정일",
                width: 130,
                render: (u: User) => u.updatedAt,
              },
            ]}
            data={isLoading ? [] : users}
            rowKey={(row: User) => row.id}
            currentPage={currentPage + 1}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            onPageChange={(page) => handlePageChange(page - 1)}
            onPageSizeChange={(s) => {
              setItemsPerPage(s);
              setCurrentPage(0);
              updateUrlParams({ page: 0 });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default UserManagement;

