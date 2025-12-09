import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./AdminUserList.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface AdminManagedUserResponse {
  adminUserId: number;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminManagedUserListResponse {
  content: AdminManagedUserResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminUserList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getPageFromUrl = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 0;
  };

  const getStatusFromUrl = () => {
    const status = searchParams.get("status");
    if (status === "ACTIVE" || status === "INACTIVE" || status === "SUSPENDED") {
      return status;
    }
    return null;
  };

  const getSortFromUrl = () => {
    return (
      searchParams.get("sortBy") || "CREATED_DESC"
    ) as "CREATED_DESC" | "CREATED_ASC" | "NAME_ASC" | "NAME_DESC";
  };

  const getSearchTermFromUrl = () => {
    return searchParams.get("keyword") || "";
  };

  const getSearchScopeFromUrl = () => {
    return (searchParams.get("keywordScope") || "ALL") as "ALL" | "EMAIL" | "NAME";
  };

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED" | null>(
    getStatusFromUrl()
  );
  const [sortBy, setSortBy] = useState<"CREATED_DESC" | "CREATED_ASC" | "NAME_ASC" | "NAME_DESC">(
    getSortFromUrl()
  );
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<"ALL" | "EMAIL" | "NAME">(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<"ALL" | "EMAIL" | "NAME">(
    getSearchScopeFromUrl()
  );

  const updateUrlParams = (updates: {
    page?: number;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | null;
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

    if (updates.status !== undefined) {
      if (updates.status === null) {
        newParams.delete("status");
      } else {
        newParams.set("status", updates.status);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const fetchAdminUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.append("status", statusFilter);
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

      const response = await apiRequest(`/admin/admin-users?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("관리자 계정 목록 조회에 실패했습니다.");
      }

      const data: AdminManagedUserListResponse = await response.json();
      const mappedUsers: AdminUser[] = data.content.map((user) => ({
        id: user.adminUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt ? formatDate(user.lastLoginAt) : null,
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt),
      }));

      setAdminUsers(mappedUsers);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("관리자 계정 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, appliedSearchTerm, appliedSearchScope, sortBy, currentPage, itemsPerPage]);

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
    const urlStatus = getStatusFromUrl();
    const urlSort = getSortFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlStatus !== statusFilter) setStatusFilter(urlStatus);
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
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUserId === null) return;

    try {
      const response = await apiRequest(`/admin/admin-users/${selectedUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "관리자 계정 정지에 실패했습니다.");
      }

      alert("관리자 계정이 정지되었습니다.");
      setShowDeleteModal(false);
      setSelectedUserId(null);
      setSelectedUserName("");
      await fetchAdminUsers();
    } catch (error) {
      console.error("관리자 계정 정지 실패:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
    setSelectedUserName("");
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      MANAGER: "주최자",
      ADMIN: "관리자",
      SUPER_ADMIN: "최고 관리자",
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>활성</span>;
      case "INACTIVE":
        return <span className={`${styles["status-badge"]} ${styles["inactive"]}`}>비활성</span>;
      case "SUSPENDED":
        return <span className={`${styles["status-badge"]} ${styles["suspended"]}`}>정지</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="관리자 계정 목록" subtitle="등록된 모든 관리자 계정을 조회할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          <DataList
            headerTitle="관리자 계정 목록"
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
                      placeholder="이메일/이름 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={styles["search-input"]}
                    />
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={searchScope}
                      onChange={(e) => setSearchScope(e.target.value as "ALL" | "EMAIL" | "NAME")}
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
                      value={statusFilter === null ? "all" : statusFilter}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newStatus =
                          value === "all" ? null : (value as "ACTIVE" | "INACTIVE" | "SUSPENDED");
                        setStatusFilter(newStatus);
                        setCurrentPage(0);
                        updateUrlParams({ status: newStatus, page: 0 });
                      }}
                      className={styles["status-select"]}
                    >
                      <option value="all">전체 상태</option>
                      <option value="ACTIVE">활성</option>
                      <option value="INACTIVE">비활성</option>
                      <option value="SUSPENDED">정지</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["sort-select-container"]}>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const newSort = e.target.value as "CREATED_DESC" | "CREATED_ASC" | "NAME_ASC" | "NAME_DESC";
                        setSortBy(newSort);
                        setCurrentPage(0);
                        updateUrlParams({ sortBy: newSort, page: 0 });
                      }}
                      className={styles["sort-select"]}
                    >
                      <option value="CREATED_DESC">생성일 최신순</option>
                      <option value="CREATED_ASC">생성일 오래된 순</option>
                      <option value="NAME_ASC">이름순</option>
                      <option value="NAME_DESC">이름 역순</option>
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
                render: (u: AdminUser) => (
                  <p className={styles["user-name"]}>{u.name}</p>
                ),
              },
              {
                key: "email",
                title: "이메일",
                width: 200,
                render: (u: AdminUser) => (
                  <span style={{ fontSize: "14px", color: "#1f2937" }}>{u.email}</span>
                ),
              },
              {
                key: "role",
                title: "권한",
                width: 120,
                render: (u: AdminUser) => getRoleDisplayName(u.role),
              },
              {
                key: "createdAt",
                title: "생성일",
                width: 130,
                render: (u: AdminUser) => u.createdAt,
              },
              {
                key: "lastLoginAt",
                title: "최종 로그인",
                width: 130,
                render: (u: AdminUser) => (
                  u.lastLoginAt ? (
                    u.lastLoginAt
                  ) : (
                    <span style={{ color: "#9ca3af" }}>로그인 기록 없음</span>
                  )
                ),
              },
              {
                key: "status",
                title: "상태",
                width: 100,
                align: "center",
                render: (u: AdminUser) => getStatusBadge(u.status),
              },
              {
                key: "actions",
                title: "작업",
                width: 80,
                align: "center",
                className: styles["actions-cell"],
                render: (u: AdminUser) => (
                  <button
                    className={`${styles["action-btn"]} ${styles["delete"]}`}
                    onClick={() => handleDeleteClick(u.id, u.name)}
                    disabled={u.status === "INACTIVE" || u.role === "SUPER_ADMIN"}
                    title={
                      u.status === "INACTIVE"
                        ? "비활성 계정은 삭제할 수 없습니다"
                        : u.role === "SUPER_ADMIN"
                          ? "최고 관리자 계정은 삭제할 수 없습니다"
                          : "정지"
                    }
                  >
                    정지
                  </button>
                ),
              },
            ]}
            data={isLoading ? [] : adminUsers}
            rowKey={(row: AdminUser) => row.id}
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
        isOpen={showDeleteModal}
        title="관리자 계정 정지"
        message={`${selectedUserName} 관리자 계정을 정지하시겠습니까?`}
        confirmText="정지"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="reject"
      />
    </div>
  );
};

export default AdminUserList;
