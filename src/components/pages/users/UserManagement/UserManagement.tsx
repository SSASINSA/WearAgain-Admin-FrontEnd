import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./UserManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
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
}

interface UserPageResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary?: {
    totalParticipants: number;
    totalTickets: number;
    totalCredits: number;
    participantsChangeFromLastMonth: number;
    ticketsChangeFromLastMonth: number;
    creditsChangeFromLastMonth: number;
  };
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
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getPageFromUrl = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 0;
  };

  const getSuspendedFromUrl = () => {
    const suspended = searchParams.get("suspended");
    if (suspended === "true") return true;
    if (suspended === "false") return false;
    return null;
  };

  const getSortFromUrl = () => {
    return searchParams.get("sortBy") || "CREATED_DESC";
  };

  const getSearchTermFromUrl = () => {
    return searchParams.get("keyword") || "";
  };

  const getSearchScopeFromUrl = () => {
    return searchParams.get("keywordScope") || "ALL";
  };

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [suspendedFilter, setSuspendedFilter] = useState<boolean | null>(getSuspendedFromUrl());
  const [sortBy, setSortBy] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [summary, setSummary] = useState<UserPageResponse["summary"] | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isSuspending, setIsSuspending] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());

  const updateUrlParams = (updates: {
    page?: number;
    suspended?: boolean | null;
    sortBy?: string;
    keyword?: string;
    keywordScope?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.page !== undefined) {
      if (updates.page === 0) {
        newParams.delete("page");
      } else {
        newParams.set("page", updates.page.toString());
      }
    }
    
    if (updates.suspended !== undefined) {
      if (updates.suspended === null) {
        newParams.delete("suspended");
      } else {
        newParams.set("suspended", updates.suspended.toString());
      }
    }
    
    if (updates.sortBy !== undefined) {
      if (updates.sortBy === "CREATED_DESC") {
        newParams.delete("sortBy");
      } else {
        newParams.set("sortBy", updates.sortBy);
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
      
      if (suspendedFilter !== null) {
        params.append("suspended", suspendedFilter.toString());
      }
      
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      
      params.append("sortBy", sortBy);
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
      }));

      setUsers(mappedUsers);
      setTotalPages(data.totalPages);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("유저 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [suspendedFilter, appliedSearchTerm, appliedSearchScope, sortBy, currentPage, itemsPerPage]);

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

  useEffect(() => {
    const urlPage = getPageFromUrl();
    const urlSuspended = getSuspendedFromUrl();
    const urlSort = getSortFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlSuspended !== suspendedFilter) setSuspendedFilter(urlSuspended);
    if (urlSort !== sortBy) setSortBy(urlSort);
    if (urlKeyword !== appliedSearchTerm) {
      setSearchTerm(urlKeyword);
      setAppliedSearchTerm(urlKeyword);
    }
    if (urlKeywordScope !== appliedSearchScope) {
      setSearchScope(urlKeywordScope);
      setAppliedSearchScope(urlKeywordScope);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  const handleSuspendClick = (userId: number, userName: string, isSuspended: boolean) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsSuspending(isSuspended);
    setShowSuspendModal(true);
  };

  const handleSuspendConfirm = async () => {
    if (selectedUserId === null) return;

    try {
      const response = await apiRequest(`/admin/participants/${selectedUserId}/suspension`, {
        method: "PUT",
        body: JSON.stringify({
          suspended: !isSuspending,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errorCode === "U1001") {
          throw new Error("사용자를 찾을 수 없습니다.");
        } else if (errorData.errorCode === "U1002") {
          throw new Error("잘못된 요청입니다.");
        }
        throw new Error(errorData.message || `유저 ${isSuspending ? "정지 해제" : "정지"}에 실패했습니다.`);
      }

      alert(`유저가 ${isSuspending ? "정지 해제" : "정지"}되었습니다.`);
      setShowSuspendModal(false);
      setSelectedUserId(null);
      setSelectedUserName("");
      await fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `유저 ${isSuspending ? "정지 해제" : "정지"}에 실패했습니다.`;
      alert(errorMessage);
      console.error("Error suspending/unsuspending user:", error);
    }
  };

  const handleSuspendCancel = () => {
    setShowSuspendModal(false);
    setSelectedUserId(null);
    setSelectedUserName("");
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="유저 관리" subtitle="전체 유저 목록을 확인하고 관리하세요" />

        <div className={styles["dashboard-content"]}>
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
                      <option value="NAME">이름</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={suspendedFilter === null ? "all" : suspendedFilter ? "true" : "false"}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newSuspended = value === "all" ? null : value === "true";
                        setSuspendedFilter(newSuspended);
                        setCurrentPage(0);
                        updateUrlParams({ suspended: newSuspended, page: 0 });
                      }}
                      className={styles["status-select"]}
                    >
                      <option value="all">전체</option>
                      <option value="false">정상 회원</option>
                      <option value="true">정지 회원</option>
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
                        updateUrlParams({ sortBy: newSort, page: 0 });
                      }}
                      className={styles["sort-select"]}
                    >
                      <option value="CREATED_DESC">가입일 최신순</option>
                      <option value="CREATED_ASC">가입일 오래된 순</option>
                      <option value="NAME_ASC">이름순</option>
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
                key: "name",
                title: "이름",
                width: 150,
                render: (u: User) => (
                  <p
                    className={`${styles["user-name"]} ${styles["clickable"]}`}
                    onClick={() => navigate(`/repair/${u.id}`)}
                  >
                    {u.name}
                  </p>
                ),
              },
              {
                key: "email",
                title: "이메일",
                width: 200,
                render: (u: User) => (
                  <span style={{ fontSize: "14px", color: "#1f2937" }}>{u.email}</span>
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
                key: "joinedAt",
                title: "가입일",
                width: 130,
                render: (u: User) => u.joinedAt,
              },
              {
                key: "suspended",
                title: "정지 여부",
                width: 100,
                align: "center",
                render: (u: User) => (
                  <span
                    className={`${styles["status-badge"]} ${u.suspended ? styles["suspended"] : styles["normal"]}`}
                  >
                    {u.suspended ? "정지" : "정상"}
                  </span>
                ),
              },
              {
                key: "actions",
                title: "작업",
                width: 80,
                align: "center",
                className: styles["actions-cell"],
                render: (u: User) => (
                  <button
                    className={`${styles["action-btn"]} ${u.suspended ? styles["unsuspend"] : styles["suspend"]}`}
                    onClick={() => handleSuspendClick(u.id, u.name, u.suspended)}
                  >
                    {u.suspended ? "정지 해제" : "정지"}
                  </button>
                ),
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

      <ConfirmModal
        isOpen={showSuspendModal}
        title={isSuspending ? "유저 정지 해제" : "유저 정지"}
        message={`${selectedUserName} 유저를 ${isSuspending ? "정지 해제" : "정지"}하시겠습니까?`}
        confirmText={isSuspending ? "정지 해제" : "정지"}
        cancelText="취소"
        onConfirm={handleSuspendConfirm}
        onCancel={handleSuspendCancel}
        type={isSuspending ? "approve" : "reject"}
      />
    </div>
  );
};

export default UserManagement;

