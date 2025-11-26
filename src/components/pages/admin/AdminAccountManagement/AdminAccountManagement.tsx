import React, { useState, useEffect, useCallback } from "react";
import styles from "./AdminAccountManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataListFooter from "../../../common/DataListFooter/DataListFooter";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface Reviewer {
  adminId: number;
  name: string;
}

interface SignupRequestResponse {
  signupRequestId: number;
  email: string;
  name: string;
  requestedRole: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  reason: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewer: Reviewer | null;
}

interface SignupRequestsApiResponse {
  items: SignupRequestResponse[];
}

interface AdminAccountRequest {
  id: number;
  userId: string;
  email: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "expired";
  requestedRole: string;
  reason?: string;
  description?: string;
}

const AdminAccountManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<AdminAccountRequest | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [adminAccountRequests, setAdminAccountRequests] = useState<AdminAccountRequest[]>([]);
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

  const transformApiResponse = (apiResponse: SignupRequestResponse): AdminAccountRequest => {
    const statusMap: Record<string, "pending" | "approved" | "rejected" | "expired"> = {
      PENDING: "pending",
      APPROVED: "approved",
      REJECTED: "rejected",
      EXPIRED: "expired",
    };

    const formatDate = (dateString: string): string => {
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
      id: apiResponse.signupRequestId,
      userId: apiResponse.name,
      email: apiResponse.email,
      requestDate: formatDate(apiResponse.createdAt),
      status: statusMap[apiResponse.status] || "pending",
      requestedRole: apiResponse.requestedRole,
      reason: apiResponse.rejectionReason || undefined,
      description: apiResponse.reason || undefined,
    };
  };

  const fetchSignupRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("/admin/auth/signup-requests", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "승인 요청 목록을 가져오는데 실패했습니다.");
      }

      const data: SignupRequestsApiResponse = await response.json();
      const transformedData = data.items.map(transformApiResponse);
      setAdminAccountRequests(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "승인 요청 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Error fetching signup requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignupRequests();
  }, [fetchSignupRequests]);

  const filteredRequests = adminAccountRequests.filter((request) => {
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    const matchesSearch =
      request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
    } else if (sortBy === "id") {
      return a.userId.localeCompare(b.userId);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = sortedRequests.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className={`${styles["admin-account-status-badge"]} ${styles["pending"]}`}>대기중</span>;
      case "approved":
        return <span className={`${styles["admin-account-status-badge"]} ${styles["approved"]}`}>승인됨</span>;
      case "rejected":
        return <span className={`${styles["admin-account-status-badge"]} ${styles["rejected"]}`}>거부됨</span>;
      case "expired":
        return <span className={`${styles["admin-account-status-badge"]} ${styles["expired"]}`}>만료됨</span>;
      default:
        return null;
    }
  };

  const handleApproveClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowApproveModal(true);
  };

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedRequestId === null) return;

    try {
      const response = await apiRequest(`/admin/auth/signup-requests/${selectedRequestId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "승인 요청 처리에 실패했습니다.");
      }

      const data = await response.json();
      alert(`관리자 계정이 승인되었습니다.\n이메일: ${data.email}\n역할: ${data.role}`);
      setShowApproveModal(false);
      setSelectedRequestId(null);
      await fetchSignupRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "승인 요청 처리에 실패했습니다.";
      alert(errorMessage);
      console.error("Error approving signup request:", err);
    }
  };

  const handleRejectConfirm = async () => {
    if (selectedRequestId === null) return;

    try {
      const response = await apiRequest(`/admin/auth/signup-requests/${selectedRequestId}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "거부 요청 처리에 실패했습니다.");
      }

      const data = await response.json();
      alert(data.message || "관리자 계정 신청이 거부되었습니다.");
      setShowRejectModal(false);
      setSelectedRequestId(null);
      await fetchSignupRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "거부 요청 처리에 실패했습니다.";
      alert(errorMessage);
      console.error("Error rejecting signup request:", err);
    }
  };

  const handleModalCancel = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedRequestId(null);
  };

  const handleViewDetail = (request: AdminAccountRequest) => {
    setSelectedDetail(request);
  };

  const handleCloseModal = () => {
    setSelectedDetail(null);
  };

  const handleToggleRow = (requestId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  return (
    <div className={styles["admin-account-dashboard"]}>
      <main className={styles["admin-account-main-content"]}>
        <PageHeader title="관리자 계정 관리" subtitle="관리자 계정 신청을 검토하고 승인/거부할 수 있습니다" />

        <div className={styles["admin-account-dashboard-content"]}>
          <div className={styles["dl-container"]}>
            {isFilterOpen && (
              <div className={styles["dl-controls"]}>
                <div
                  className={`${styles["admin-account-filter-section"]} ${
                    isFilterOpen ? styles["is-open"] : styles["is-collapsed"]
                  }`}
                >
                  <div className={styles["admin-account-filter-header"]}>
                    <h3>필터 및 검색</h3>
                    <button
                      className={`${styles["admin-account-filter-toggle"]} ${isFilterOpen ? styles["open"] : ""}`}
                      aria-expanded={isFilterOpen}
                      onClick={() => setIsFilterOpen((v) => !v)}
                    >
                      ▼
                    </button>
                  </div>
                  <div
                    className={`${styles["admin-account-filter-controls"]} ${isFilterOpen ? styles["is-open"] : ""}`}
                  >
                    <div className={styles["admin-account-search-container"]}>
                      <div className={styles["admin-account-search-icon"]}>
                        <img src="/admin/img/icon/search.svg" alt="검색" />
                      </div>
                      <input
                        type="text"
                        placeholder="아이디 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles["admin-account-search-input"]}
                      />
                    </div>
                    <div className={styles["admin-account-status-select-container"]}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className={styles["admin-account-status-select"]}
                      >
                        <option value="all">전체 상태</option>
                        <option value="pending">대기중</option>
                        <option value="approved">승인됨</option>
                        <option value="rejected">거부됨</option>
                        <option value="expired">만료됨</option>
                      </select>
                      <div className={styles["admin-account-status-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className={styles["admin-account-sort-select-container"]}>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles["admin-account-sort-select"]}
                      >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="id">아이디순</option>
                      </select>
                      <div className={styles["admin-account-sort-select-icon"]}>
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles["dl-table-container"]}>
              <div className={styles["dl-table-header"]}>
                <h3>승인 요청 목록</h3>
                <div className={styles["dl-table-info"]}>
                  <span>총 {filteredRequests.length}개 요청</span>
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
                      onClick={fetchSignupRequests}
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
                          { key: "expand", title: "", width: 20 },
                          { key: "userId", title: "아이디", width: 120 },
                          { key: "email", title: "이메일", width: 180 },
                          { key: "requestDate", title: "신청일", width: 150 },
                          { key: "detail", title: "상세 설명", width: 280 },
                          { key: "requestedRole", title: "요청 권한", width: 100 },
                          { key: "status", title: "상태", width: 100 },
                          { key: "actions", title: "작업", width: 100 },
                        ].map((col) => (
                          <th
                            key={col.key}
                            style={{
                              width: col.key === "actions" ? 100 : col.width,
                              textAlign: col.key === "actions" ? "center" : col.key === "detail" ? "left" : "left",
                            }}
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                            승인 요청이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        currentRequests.map((row) => (
                          <React.Fragment key={row.id}>
                            <tr>
                              <td style={{ textAlign: "center", padding: "8px 2px 8px 8px" }}>
                                <button
                                  className={styles["admin-account-expand-btn"]}
                                  onClick={() => handleToggleRow(row.id)}
                                  title={expandedRows.has(row.id) ? "접기" : "펼치기"}
                                >
                                  <span
                                    className={`${styles["admin-account-expand-icon"]} ${
                                      expandedRows.has(row.id) ? styles["expanded"] : ""
                                    }`}
                                  >
                                    ▼
                                  </span>
                                </button>
                              </td>
                              <td className={styles["admin-account-userid-cell"]} style={{ paddingLeft: "4px" }}>
                                {row.userId}
                              </td>
                              <td className={styles["admin-account-email-cell"]}>{row.email}</td>
                              <td className={styles["admin-account-date-cell"]}>
                                {(() => {
                                  const [datePart, timePart] = row.requestDate.split(" ");
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
                              <td className={styles["admin-account-description-cell"]}>
                                <div className={styles["admin-account-description-wrapper"]}>
                                  <span
                                    className={styles["admin-account-description-text"]}
                                    title={row.description || ""}
                                  >
                                    {row.description || "상세 설명이 없습니다."}
                                  </span>
                                  {row.description && (
                                    <button
                                      className={styles["admin-account-detail-btn"]}
                                      onClick={() => handleViewDetail(row)}
                                      title="전체 보기"
                                    >
                                      <img src="/admin/img/icon/detail.svg" alt="전체 보기" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className={styles["admin-account-role-cell"]}>
                                {getRoleDisplayName(row.requestedRole)}
                              </td>
                              <td>{getStatusBadge(row.status)}</td>
                              <td style={{ textAlign: "center" }}>
                                <div className={styles["admin-account-action-buttons"]}>
                                  {row.status === "pending" && (
                                    <>
                                      <button
                                        className={`${styles["admin-account-action-btn"]} ${styles["approve"]}`}
                                        title="승인"
                                        onClick={() => handleApproveClick(row.id)}
                                      >
                                        승인
                                      </button>
                                      <button
                                        className={`${styles["admin-account-action-btn"]} ${styles["reject"]}`}
                                        title="거부"
                                        onClick={() => handleRejectClick(row.id)}
                                      >
                                        거부
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedRows.has(row.id) && (
                              <tr className={styles["admin-account-expanded-row"]}>
                                <td colSpan={8} className={styles["admin-account-expanded-content"]}>
                                  <div className={styles["admin-account-expanded-info"]}>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>아이디:</span>
                                      <span className={styles["admin-account-expanded-value"]}>{row.userId}</span>
                                    </div>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>이메일:</span>
                                      <span className={styles["admin-account-expanded-value"]}>{row.email}</span>
                                    </div>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>요청 권한:</span>
                                      <span className={styles["admin-account-expanded-value"]}>
                                        {getRoleDisplayName(row.requestedRole)}
                                      </span>
                                    </div>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>신청일:</span>
                                      <span className={styles["admin-account-expanded-value"]}>{row.requestDate}</span>
                                    </div>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>상태:</span>
                                      <span className={styles["admin-account-expanded-value"]}>
                                        {getStatusBadge(row.status)}
                                      </span>
                                    </div>
                                    <div className={styles["admin-account-expanded-item"]}>
                                      <span className={styles["admin-account-expanded-label"]}>상세 설명:</span>
                                      <span className={styles["admin-account-expanded-value"]}>
                                        {row.description || "상세 설명이 없습니다."}
                                      </span>
                                    </div>
                                    {row.reason && (
                                      <div className={styles["admin-account-expanded-item"]}>
                                        <span className={styles["admin-account-expanded-label"]}>거부 사유:</span>
                                        <span className={styles["admin-account-expanded-value"]}>{row.reason}</span>
                                      </div>
                                    )}
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
        <div className={styles["admin-account-modal-overlay"]} onClick={handleCloseModal}>
          <div className={styles["admin-account-modal-content"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["admin-account-modal-header"]}>
              <h2>상세 정보</h2>
              <button className={styles["admin-account-modal-close"]} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles["admin-account-modal-body"]}>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>아이디:</span>
                <span className={styles["admin-account-modal-value"]}>{selectedDetail.userId}</span>
              </div>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>이메일:</span>
                <span className={styles["admin-account-modal-value"]}>{selectedDetail.email}</span>
              </div>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>요청 권한:</span>
                <span className={styles["admin-account-modal-value"]}>
                  {getRoleDisplayName(selectedDetail.requestedRole)}
                </span>
              </div>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>신청일:</span>
                <span className={styles["admin-account-modal-value"]}>{selectedDetail.requestDate}</span>
              </div>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>상태:</span>
                <span className={styles["admin-account-modal-value"]}>{getStatusBadge(selectedDetail.status)}</span>
              </div>
              <div className={styles["admin-account-modal-row"]}>
                <span className={styles["admin-account-modal-label"]}>상세 설명:</span>
                <div className={styles["admin-account-modal-description"]}>
                  {selectedDetail.description || "상세 설명이 없습니다."}
                </div>
              </div>
              {selectedDetail.reason && (
                <div className={styles["admin-account-modal-row"]}>
                  <span className={styles["admin-account-modal-label"]}>거부 사유:</span>
                  <span className={styles["admin-account-modal-value"]}>{selectedDetail.reason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showApproveModal}
        title="관리자 계정 승인"
        message="이 관리자 계정 신청을 승인하시겠습니까?"
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApproveConfirm}
        onCancel={handleModalCancel}
        type="account-approve"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        title="관리자 계정 거부"
        message="이 관리자 계정 신청을 거부하시겠습니까?"
        confirmText="거부"
        cancelText="취소"
        onConfirm={handleRejectConfirm}
        onCancel={handleModalCancel}
        type="reject"
      />
    </div>
  );
};

export default AdminAccountManagement;
