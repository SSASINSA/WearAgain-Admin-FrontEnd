import React, { useState, useEffect, useCallback } from "react";
import styles from "./AdminUserList.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataListFooter from "../../../common/DataListFooter/DataListFooter";
import apiRequest from "utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface AdminUserResponse {
  adminId: number;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE";
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersApiResponse {
  items: AdminUserResponse[];
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminUserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<AdminUser | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      MANAGER: "주최자",
      ADMIN: "관리자",
      SUPER_ADMIN: "최고 관리자",
    };
    return roleMap[role] || role;
  };

  const getStatusDisplayName = (status: string): string => {
    const statusMap: Record<string, string> = {
      ACTIVE: "활성",
      INACTIVE: "비활성",
    };
    return statusMap[status] || status;
  };

  const transformApiResponse = (apiResponse: AdminUserResponse): AdminUser => {
    const formatDate = (dateString: string | null): string | null => {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return {
      id: apiResponse.adminId,
      email: apiResponse.email,
      name: apiResponse.name,
      role: apiResponse.role,
      status: apiResponse.status,
      mustChangePassword: apiResponse.mustChangePassword,
      lastLoginAt: formatDate(apiResponse.lastLoginAt),
      createdAt: formatDate(apiResponse.createdAt) || "",
      updatedAt: formatDate(apiResponse.updatedAt) || "",
    };
  };

  const fetchAdminUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("/admin/auth/admin-users", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "관리자 계정 목록을 가져오는데 실패했습니다.");
      }

      const data: AdminUsersApiResponse = await response.json();
      const transformedData = data.items.map(transformApiResponse);
      setAdminUsers(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "관리자 계정 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Error fetching admin users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const filteredUsers = adminUsers.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className={`${styles["admin-user-status-badge"]} ${styles["active"]}`}>활성</span>;
      case "INACTIVE":
        return <span className={`${styles["admin-user-status-badge"]} ${styles["inactive"]}`}>비활성</span>;
      default:
        return null;
    }
  };

  const handleViewDetail = (user: AdminUser) => {
    setSelectedDetail(user);
  };

  const handleCloseModal = () => {
    setSelectedDetail(null);
  };

  const handleToggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className={styles["admin-user-dashboard"]}>
      <main className={styles["admin-user-main-content"]}>
        <PageHeader title="관리자 계정 목록" subtitle="등록된 모든 관리자 계정을 조회할 수 있습니다" />

        <div className={styles["admin-user-dashboard-content"]}>
          <div className={styles["dl-container"]}>
            {isFilterOpen && (
              <div className={styles["dl-controls"]}>
                <div
                  className={`${styles["admin-user-filter-section"]} ${
                    isFilterOpen ? styles["is-open"] : styles["is-collapsed"]
                  }`}
                >
                  <div className={styles["admin-user-filter-header"]}>
                    <h3>필터 및 검색</h3>
                    <button
                      className={`${styles["admin-user-filter-toggle"]} ${isFilterOpen ? styles["open"] : ""}`}
                      aria-expanded={isFilterOpen}
                      onClick={() => setIsFilterOpen((v) => !v)}
                    >
                      ▼
                    </button>
                  </div>
                  <div
                    className={`${styles["admin-user-filter-controls"]} ${isFilterOpen ? styles["is-open"] : ""}`}
                  >
                    <div className={styles["admin-user-search-container"]}>
                      <div className={styles["admin-user-search-icon"]}>
                        <img src="/admin/img/icon/search.svg" alt="검색" />
                      </div>
                      <input
                        type="text"
                        placeholder="이름 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles["admin-user-search-input"]}
                      />
                    </div>
                    <div className={styles["admin-user-role-select-container"]}>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={styles["admin-user-role-select"]}
                      >
                        <option value="all">전체 권한</option>
                        <option value="SUPER_ADMIN">최고 관리자</option>
                        <option value="ADMIN">관리자</option>
                        <option value="MANAGER">주최자</option>
                      </select>
                      <div className={styles["admin-user-role-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className={styles["admin-user-status-select-container"]}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className={styles["admin-user-status-select"]}
                      >
                        <option value="all">전체 상태</option>
                        <option value="ACTIVE">활성</option>
                        <option value="INACTIVE">비활성</option>
                      </select>
                      <div className={styles["admin-user-status-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className={styles["admin-user-sort-select-container"]}>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles["admin-user-sort-select"]}
                      >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="name">이름순</option>
                      </select>
                      <div className={styles["admin-user-sort-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles["dl-table-container"]}>
              <div className={styles["dl-table-header"]}>
                <h3>관리자 계정 목록</h3>
                <div className={styles["dl-table-info"]}>
                  <span>총 {filteredUsers.length}개 계정</span>
                  <span>|</span>
                  <span>
                    페이지 {currentPage}/{totalPages}
                  </span>
                </div>
              </div>

              <div className={styles["dl-table-wrapper"]}>
                {isLoading ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
                ) : error ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
                    {error}
                    <button
                      onClick={fetchAdminUsers}
                      style={{ marginTop: "16px", padding: "8px 16px", cursor: "pointer" }}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : (
                  <table className={styles["dl-table"]}>
                    <thead>
                      <tr>
                        {[
                          { key: "expand", title: "", width: 40 },
                          { key: "name", title: "이름", width: "auto" },
                          { key: "email", title: "이메일", width: "auto" },
                          { key: "role", title: "권한", width: "auto" },
                          { key: "status", title: "상태", width: "auto" },
                          { key: "mustChangePassword", title: "비밀번호 변경 필요", width: "auto" },
                          { key: "lastLoginAt", title: "최종 로그인", width: "auto" },
                          { key: "createdAt", title: "생성일", width: "auto" },
                          { key: "actions", title: "작업", width: 100 },
                        ].map((col) => (
                          <th
                            key={col.key}
                            style={{
                              width:
                                col.key === "expand"
                                  ? `${col.width}px`
                                  : col.key === "actions"
                                    ? `${col.width}px`
                                    : undefined,
                              textAlign: col.key === "expand" ? "center" : "left",
                            }}
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ padding: "40px", textAlign: "center" }}>
                            관리자 계정이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((row) => (
                          <React.Fragment key={row.id}>
                            <tr>
                              <td style={{ textAlign: "center", padding: "16px 8px" }}>
                                <button
                                  className={styles["admin-user-expand-btn"]}
                                  onClick={() => handleToggleRow(row.id)}
                                  title={expandedRows.has(row.id) ? "접기" : "펼치기"}
                                >
                                  <span
                                    className={`${styles["admin-user-expand-icon"]} ${
                                      expandedRows.has(row.id) ? styles["expanded"] : ""
                                    }`}
                                  >
                                    ▼
                                  </span>
                                </button>
                              </td>
                              <td className={styles["admin-user-name-cell"]} style={{ paddingLeft: "20px" }}>
                                {row.name}
                              </td>
                              <td className={styles["admin-user-email-cell"]}>{row.email}</td>
                              <td className={styles["admin-user-role-cell"]}>
                                {getRoleDisplayName(row.role)}
                              </td>
                              <td>{getStatusBadge(row.status)}</td>
                              <td>
                                {row.mustChangePassword ? (
                                  <span className={styles["admin-user-password-warning"]}>필요</span>
                                ) : (
                                  <span className={styles["admin-user-password-ok"]}>불필요</span>
                                )}
                              </td>
                              <td className={styles["admin-user-date-cell"]}>
                                {row.lastLoginAt ? (
                                  (() => {
                                    const [datePart, timePart] = row.lastLoginAt.split(" ");
                                    const [year, month, day] = datePart.split("-");
                                    const [hour, minute, second] = timePart.split(":");
                                    return (
                                      <div>
                                        <div>
                                          {year}-{month}-{day}
                                        </div>
                                        <div>
                                          {hour}:{minute}:{second}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span style={{ color: "#9ca3af" }}>로그인 기록 없음</span>
                                )}
                              </td>
                              <td className={styles["admin-user-date-cell"]}>
                                {(() => {
                                  const [datePart, timePart] = row.createdAt.split(" ");
                                  const [year, month, day] = datePart.split("-");
                                  const [hour, minute, second] = timePart.split(":");
                                  return (
                                    <div>
                                      <div>
                                        {year}-{month}-{day}
                                      </div>
                                      <div>
                                        {hour}:{minute}:{second}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td></td>
                            </tr>
                            {expandedRows.has(row.id) && (
                              <tr className={styles["admin-user-expanded-row"]}>
                                <td colSpan={9} className={styles["admin-user-expanded-content"]}>
                                  <div className={styles["admin-user-expanded-info"]}>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>이름:</span>
                                      <span className={styles["admin-user-expanded-value"]}>{row.name}</span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>이메일:</span>
                                      <span className={styles["admin-user-expanded-value"]}>{row.email}</span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>권한:</span>
                                      <span className={styles["admin-user-expanded-value"]}>
                                        {getRoleDisplayName(row.role)}
                                      </span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>상태:</span>
                                      <span className={styles["admin-user-expanded-value"]}>
                                        {getStatusBadge(row.status)}
                                      </span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>비밀번호 변경 필요:</span>
                                      <span className={styles["admin-user-expanded-value"]}>
                                        {row.mustChangePassword ? "필요" : "불필요"}
                                      </span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>최종 로그인:</span>
                                      <span className={styles["admin-user-expanded-value"]}>
                                        {row.lastLoginAt || "로그인 기록 없음"}
                                      </span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>생성일:</span>
                                      <span className={styles["admin-user-expanded-value"]}>{row.createdAt}</span>
                                    </div>
                                    <div className={styles["admin-user-expanded-item"]}>
                                      <span className={styles["admin-user-expanded-label"]}>수정일:</span>
                                      <span className={styles["admin-user-expanded-value"]}>{row.updatedAt}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <DataListFooter
                pageSize={itemsPerPage}
                onPageSizeChange={(s) => {
                  setItemsPerPage(s);
                  setCurrentPage(1);
                }}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        </div>
      </main>

      {selectedDetail && (
        <div className={styles["admin-user-modal-overlay"]} onClick={handleCloseModal}>
          <div className={styles["admin-user-modal-content"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["admin-user-modal-header"]}>
              <h2>상세 정보</h2>
              <button className={styles["admin-user-modal-close"]} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles["admin-user-modal-body"]}>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>이름:</span>
                <span className={styles["admin-user-modal-value"]}>{selectedDetail.name}</span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>이메일:</span>
                <span className={styles["admin-user-modal-value"]}>{selectedDetail.email}</span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>권한:</span>
                <span className={styles["admin-user-modal-value"]}>
                  {getRoleDisplayName(selectedDetail.role)}
                </span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>상태:</span>
                <span className={styles["admin-user-modal-value"]}>
                  {getStatusBadge(selectedDetail.status)}
                </span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>비밀번호 변경 필요:</span>
                <span className={styles["admin-user-modal-value"]}>
                  {selectedDetail.mustChangePassword ? "필요" : "불필요"}
                </span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>최종 로그인:</span>
                <span className={styles["admin-user-modal-value"]}>
                  {selectedDetail.lastLoginAt || "로그인 기록 없음"}
                </span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>생성일:</span>
                <span className={styles["admin-user-modal-value"]}>{selectedDetail.createdAt}</span>
              </div>
              <div className={styles["admin-user-modal-row"]}>
                <span className={styles["admin-user-modal-label"]}>수정일:</span>
                <span className={styles["admin-user-modal-value"]}>{selectedDetail.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;

