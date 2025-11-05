import React, { useState } from "react";
import "./ApprovalManagement.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataListFooter from "../../../common/DataListFooter/DataListFooter";

interface ApprovalRequest {
  id: number;
  userId: string;
  email: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  description?: string;
}

const ApprovalManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<ApprovalRequest | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const approvalRequests: ApprovalRequest[] = [
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

  const filteredRequests = approvalRequests.filter((request) => {
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
        return <span className="approval-status-badge pending">대기중</span>;
      case "approved":
        return <span className="approval-status-badge approved">승인됨</span>;
      case "rejected":
        return <span className="approval-status-badge rejected">거부됨</span>;
      default:
        return null;
    }
  };

  const handleApprove = (requestId: number) => {
    console.log("승인:", requestId);
  };

  const handleReject = (requestId: number) => {
    console.log("거부:", requestId);
  };

  const handleViewDetail = (request: ApprovalRequest) => {
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
    <div className="approval-admin-dashboard">
      <main className="approval-main-content">
        <PageHeader title="관리자 계정 승인" subtitle="관리자 계정 신청을 검토하고 승인/거부할 수 있습니다" />

        <div className="approval-dashboard-content">
          <div className="dl-container">
            {isFilterOpen && (
              <div className="dl-controls">
                <div className={`approval-filter-section ${isFilterOpen ? "is-open" : "is-collapsed"}`}>
                  <div className="approval-filter-header">
                    <h3>필터 및 검색</h3>
                    <button
                      className={`approval-filter-toggle ${isFilterOpen ? "open" : ""}`}
                      aria-expanded={isFilterOpen}
                      onClick={() => setIsFilterOpen((v) => !v)}
                    >
                      ▼
                    </button>
                  </div>
                  <div className={`approval-filter-controls ${isFilterOpen ? "is-open" : ""}`}>
                    <div className="approval-search-container">
                      <div className="approval-search-icon">
                        <img src="/admin/img/icon/search.svg" alt="검색" />
                      </div>
                      <input
                        type="text"
                        placeholder="아이디 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="approval-search-input"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="approval-status-select"
                    >
                      <option value="all">전체 상태</option>
                      <option value="pending">대기중</option>
                      <option value="approved">승인됨</option>
                      <option value="rejected">거부됨</option>
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="approval-sort-select">
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="id">아이디순</option>
                    </select>
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
                              className="approval-expand-btn"
                              onClick={() => handleToggleRow(row.id)}
                              title={expandedRows.has(row.id) ? "접기" : "펼치기"}
                            >
                              <span className={`approval-expand-icon ${expandedRows.has(row.id) ? "expanded" : ""}`}>
                                ▼
                              </span>
                            </button>
                          </td>
                          <td className="approval-userid-cell" style={{ paddingLeft: "4px" }}>
                            {row.userId}
                          </td>
                          <td className="approval-email-cell">{row.email}</td>
                          <td className="approval-date-cell">
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
                          <td className="approval-description-cell">
                            <div className="approval-description-wrapper">
                              <span className="approval-description-text" title={row.description || ""}>
                                {row.description || "상세 설명이 없습니다."}
                              </span>
                              {row.description && (
                                <button
                                  className="approval-detail-btn"
                                  onClick={() => handleViewDetail(row)}
                                  title="전체 보기"
                                >
                                  <img src="/admin/img/icon/detail.svg" alt="전체 보기" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div className="approval-action-buttons">
                              {row.status === "pending" && (
                                <>
                                  <button
                                    className="approval-action-btn approve"
                                    title="승인"
                                    onClick={() => handleApprove(row.id)}
                                  >
                                    승인
                                  </button>
                                  <button
                                    className="approval-action-btn reject"
                                    title="거부"
                                    onClick={() => handleReject(row.id)}
                                  >
                                    거부
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRows.has(row.id) && (
                          <tr className="approval-expanded-row">
                            <td colSpan={7} className="approval-expanded-content">
                              <div className="approval-expanded-info">
                                <div className="approval-expanded-item">
                                  <span className="approval-expanded-label">아이디:</span>
                                  <span className="approval-expanded-value">{row.userId}</span>
                                </div>
                                <div className="approval-expanded-item">
                                  <span className="approval-expanded-label">이메일:</span>
                                  <span className="approval-expanded-value">{row.email}</span>
                                </div>
                                <div className="approval-expanded-item">
                                  <span className="approval-expanded-label">신청일:</span>
                                  <span className="approval-expanded-value">{row.requestDate}</span>
                                </div>
                                <div className="approval-expanded-item">
                                  <span className="approval-expanded-label">상태:</span>
                                  <span className="approval-expanded-value">{getStatusBadge(row.status)}</span>
                                </div>
                                <div className="approval-expanded-item">
                                  <span className="approval-expanded-label">상세 설명:</span>
                                  <span className="approval-expanded-value">
                                    {row.description || "상세 설명이 없습니다."}
                                  </span>
                                </div>
                                {row.reason && (
                                  <div className="approval-expanded-item">
                                    <span className="approval-expanded-label">거부 사유:</span>
                                    <span className="approval-expanded-value">{row.reason}</span>
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
        <div className="approval-modal-overlay" onClick={handleCloseModal}>
          <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <h2>상세 정보</h2>
              <button className="approval-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="approval-modal-body">
              <div className="approval-modal-row">
                <span className="approval-modal-label">아이디:</span>
                <span className="approval-modal-value">{selectedDetail.userId}</span>
              </div>
              <div className="approval-modal-row">
                <span className="approval-modal-label">이메일:</span>
                <span className="approval-modal-value">{selectedDetail.email}</span>
              </div>
              <div className="approval-modal-row">
                <span className="approval-modal-label">신청일:</span>
                <span className="approval-modal-value">{selectedDetail.requestDate}</span>
              </div>
              <div className="approval-modal-row">
                <span className="approval-modal-label">상태:</span>
                <span className="approval-modal-value">{getStatusBadge(selectedDetail.status)}</span>
              </div>
              <div className="approval-modal-row">
                <span className="approval-modal-label">상세 설명:</span>
                <div className="approval-modal-description">
                  {selectedDetail.description || "상세 설명이 없습니다."}
                </div>
              </div>
              {selectedDetail.reason && (
                <div className="approval-modal-row">
                  <span className="approval-modal-label">거부 사유:</span>
                  <span className="approval-modal-value">{selectedDetail.reason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
