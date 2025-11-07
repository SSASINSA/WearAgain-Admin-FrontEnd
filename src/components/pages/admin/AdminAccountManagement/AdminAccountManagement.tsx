import React, { useState } from "react";
import "./AdminAccountManagement.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataListFooter from "../../../common/DataListFooter/DataListFooter";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface AdminAccountRequest {
  id: number;
  userId: string;
  email: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
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

  const adminAccountRequests: AdminAccountRequest[] = [
    {
      id: 1,
      userId: "admin01",
      email: "hong@example.com",
      requestDate: "2024-01-15 14:32:15",
      status: "pending",
      description:
        "다시입다연구소 신입 홍길동입니다! 관리자 계정 생성 요청드립니다! 제 부서는 시스템 관리팀이고, 주로 사용자 지원 및 시스템 모니터링 업무를 담당하게 됩니다. 빠른 승인 부탁드립니다.",
    },
    {
      id: 2,
      userId: "admin02",
      email: "kim@example.com",
      requestDate: "2024-01-14 09:15:42",
      status: "pending",
      description:
        "다시입다연구소 신입 김철수입니다! 계정 생성 요청드립니다! 제 부서는 컨텐츠 관리팀입니다. 게시글 모더레이션 및 커뮤니티 관리 업무를 수행하기 위해 관리자 권한이 필요합니다.",
    },
    {
      id: 3,
      userId: "admin03",
      email: "lee@example.com",
      requestDate: "2024-01-13 16:48:03",
      status: "approved",
      description:
        "다시입다연구소 신입 이영희입니다! 계정 생성 요청드립니다! 제 부서는 행사 기획팀이고, 이벤트 등록 및 관리 업무를 담당합니다.",
    },
    {
      id: 4,
      userId: "admin04",
      email: "park@example.com",
      requestDate: "2024-01-12 11:22:57",
      status: "rejected",
      reason: "정보 불일치",
      description:
        "다시입다연구소 신입 박민수입니다! 계정 생성 요청드립니다! 제 부서는 마케팅팀이고, 홍보 및 광고 관리 업무를 수행하기 위해 관리자 계정이 필요합니다.",
    },
    {
      id: 5,
      userId: "admin05",
      email: "jung@example.com",
      requestDate: "2024-01-11 13:07:29",
      status: "pending",
      description:
        "다시입다연구소 신입 정수진입니다! 계정 생성 요청드립니다! 제 부서는 고객 지원팀입니다. 고객 문의 응답 및 지원 업무를 담당하기 위해 관리자 권한이 필요합니다.",
    },
  ];

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
        return <span className="admin-account-status-badge pending">대기중</span>;
      case "approved":
        return <span className="admin-account-status-badge approved">승인됨</span>;
      case "rejected":
        return <span className="admin-account-status-badge rejected">거부됨</span>;
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

  const handleApproveConfirm = () => {
    if (selectedRequestId !== null) {
      // TODO: 승인 API 호출
      console.log("승인:", selectedRequestId);
      alert(`관리자 계정 ID ${selectedRequestId}가 승인되었습니다.`);
      setShowApproveModal(false);
      setSelectedRequestId(null);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedRequestId !== null) {
      // TODO: 거부 API 호출
      console.log("거부:", selectedRequestId);
      alert(`관리자 계정 ID ${selectedRequestId}가 거부되었습니다.`);
      setShowRejectModal(false);
      setSelectedRequestId(null);
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
    <div className="admin-account-dashboard">
      <main className="admin-account-main-content">
        <PageHeader title="관리자 계정 관리" subtitle="관리자 계정 신청을 검토하고 승인/거부할 수 있습니다" />

        <div className="admin-account-dashboard-content">
          <div className="dl-container">
            {isFilterOpen && (
              <div className="dl-controls">
                <div className={`admin-account-filter-section ${isFilterOpen ? "is-open" : "is-collapsed"}`}>
                  <div className="admin-account-filter-header">
                    <h3>필터 및 검색</h3>
                    <button
                      className={`admin-account-filter-toggle ${isFilterOpen ? "open" : ""}`}
                      aria-expanded={isFilterOpen}
                      onClick={() => setIsFilterOpen((v) => !v)}
                    >
                      ▼
                    </button>
                  </div>
                  <div className={`admin-account-filter-controls ${isFilterOpen ? "is-open" : ""}`}>
                    <div className="admin-account-search-container">
                      <div className="admin-account-search-icon">
                        <img src="/admin/img/icon/search.svg" alt="검색" />
                      </div>
                      <input
                        type="text"
                        placeholder="아이디 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-account-search-input"
                      />
                    </div>
                    <div className="admin-account-status-select-container">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="admin-account-status-select"
                      >
                        <option value="all">전체 상태</option>
                        <option value="pending">대기중</option>
                        <option value="approved">승인됨</option>
                        <option value="rejected">거부됨</option>
                      </select>
                      <div className="admin-account-status-select-icon">
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                    <div className="admin-account-sort-select-container">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-account-sort-select">
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="id">아이디순</option>
                      </select>
                      <div className="admin-account-sort-select-icon">
                        <img src={dropdownIcon} alt="드롭다운" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="dl-table-container">
              <div className="dl-table-header">
                <h3>관리자 계정 승인 요청 목록</h3>
                <div className="dl-table-info">
                  <span>총 {filteredRequests.length}개 요청</span>
                  <span>|</span>
                  <span>
                    페이지 {currentPage}/{totalPages}
                  </span>
                </div>
              </div>

              <div className="dl-table-wrapper">
                <table className="dl-table">
                  <thead>
                    <tr>
                      {[
                        { key: "expand", title: "", width: 32 },
                        { key: "userId", title: "아이디", width: 150 },
                        { key: "email", title: "이메일", width: 200 },
                        { key: "requestDate", title: "신청일", width: 180 },
                        { key: "status", title: "상태", width: 100 },
                        { key: "detail", title: "상세 설명", width: 200 },
                        { key: "actions", title: "작업", width: 140 },
                      ].map((col) => (
                        <th
                          key={col.key}
                          style={{
                            width: col.width,
                            textAlign: col.key === "actions" ? "center" : col.key === "detail" ? "left" : "left",
                          }}
                        >
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRequests.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr>
                          <td style={{ textAlign: "center", padding: "8px 2px" }}>
                            <button
                              className="admin-account-expand-btn"
                              onClick={() => handleToggleRow(row.id)}
                              title={expandedRows.has(row.id) ? "접기" : "펼치기"}
                            >
                              <span className={`admin-account-expand-icon ${expandedRows.has(row.id) ? "expanded" : ""}`}>
                                ▼
                              </span>
                            </button>
                          </td>
                          <td className="admin-account-userid-cell" style={{ paddingLeft: "4px" }}>
                            {row.userId}
                          </td>
                          <td className="admin-account-email-cell">{row.email}</td>
                          <td className="admin-account-date-cell">
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
                          <td>{getStatusBadge(row.status)}</td>
                          <td className="admin-account-description-cell">
                            <div className="admin-account-description-wrapper">
                              <span className="admin-account-description-text" title={row.description || ""}>
                                {row.description || "상세 설명이 없습니다."}
                              </span>
                              {row.description && (
                                <button
                                  className="admin-account-detail-btn"
                                  onClick={() => handleViewDetail(row)}
                                  title="전체 보기"
                                >
                                  <img src="/admin/img/icon/detail.svg" alt="전체 보기" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div className="admin-account-action-buttons">
                              {row.status === "pending" && (
                                <>
                                  <button
                                    className="admin-account-action-btn approve"
                                    title="승인"
                                    onClick={() => handleApproveClick(row.id)}
                                  >
                                    승인
                                  </button>
                                  <button
                                    className="admin-account-action-btn reject"
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
                          <tr className="admin-account-expanded-row">
                            <td colSpan={7} className="admin-account-expanded-content">
                              <div className="admin-account-expanded-info">
                                <div className="admin-account-expanded-item">
                                  <span className="admin-account-expanded-label">아이디:</span>
                                  <span className="admin-account-expanded-value">{row.userId}</span>
                                </div>
                                <div className="admin-account-expanded-item">
                                  <span className="admin-account-expanded-label">이메일:</span>
                                  <span className="admin-account-expanded-value">{row.email}</span>
                                </div>
                                <div className="admin-account-expanded-item">
                                  <span className="admin-account-expanded-label">신청일:</span>
                                  <span className="admin-account-expanded-value">{row.requestDate}</span>
                                </div>
                                <div className="admin-account-expanded-item">
                                  <span className="admin-account-expanded-label">상태:</span>
                                  <span className="admin-account-expanded-value">{getStatusBadge(row.status)}</span>
                                </div>
                                <div className="admin-account-expanded-item">
                                  <span className="admin-account-expanded-label">상세 설명:</span>
                                  <span className="admin-account-expanded-value">
                                    {row.description || "상세 설명이 없습니다."}
                                  </span>
                                </div>
                                {row.reason && (
                                  <div className="admin-account-expanded-item">
                                    <span className="admin-account-expanded-label">거부 사유:</span>
                                    <span className="admin-account-expanded-value">{row.reason}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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
        <div className="admin-account-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-account-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-account-modal-header">
              <h2>상세 정보</h2>
              <button className="admin-account-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="admin-account-modal-body">
              <div className="admin-account-modal-row">
                <span className="admin-account-modal-label">아이디:</span>
                <span className="admin-account-modal-value">{selectedDetail.userId}</span>
              </div>
              <div className="admin-account-modal-row">
                <span className="admin-account-modal-label">이메일:</span>
                <span className="admin-account-modal-value">{selectedDetail.email}</span>
              </div>
              <div className="admin-account-modal-row">
                <span className="admin-account-modal-label">신청일:</span>
                <span className="admin-account-modal-value">{selectedDetail.requestDate}</span>
              </div>
              <div className="admin-account-modal-row">
                <span className="admin-account-modal-label">상태:</span>
                <span className="admin-account-modal-value">{getStatusBadge(selectedDetail.status)}</span>
              </div>
              <div className="admin-account-modal-row">
                <span className="admin-account-modal-label">상세 설명:</span>
                <div className="admin-account-modal-description">
                  {selectedDetail.description || "상세 설명이 없습니다."}
                </div>
              </div>
              {selectedDetail.reason && (
                <div className="admin-account-modal-row">
                  <span className="admin-account-modal-label">거부 사유:</span>
                  <span className="admin-account-modal-value">{selectedDetail.reason}</span>
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

