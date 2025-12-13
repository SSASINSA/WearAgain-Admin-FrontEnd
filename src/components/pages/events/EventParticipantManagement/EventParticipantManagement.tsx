import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import styles from "./EventParticipantManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface EventApplicationResponse {
  applicationId: number;
  eventId: number;
  eventTitle: string;
  eventPeriod: {
    startDate: string;
    endDate: string;
  };
  userId: number;
  displayName: string;
  email: string;
  optionPath: string;
  status: "APPLIED" | "CHECKED_IN" | "CANCELLED" | "REJECTED";
  appliedAt: string;
  checkedInAt: string | null;
  suspended: boolean;
}

interface EventApplicationPageResponse {
  content: EventApplicationResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary: {
    totalApplications: number;
    appliedCount: number;
    checkedInCount: number;
    cancelledCount: number;
    rejectedCount: number;
    events: Array<{
      eventId: number;
      eventTitle: string;
      totalApplications: number;
    }>;
  };
}

interface Participant {
  id: number;
  applicationId: number;
  eventId: number;
  eventTitle: string;
  eventPeriod: string;
  userId: number;
  name: string;
  email: string;
  optionPath: string;
  status: "APPLIED" | "CHECKED_IN" | "CANCELLED" | "REJECTED";
  appliedAt: string;
  checkedInAt: string | null;
  suspended: boolean;
}

const EventParticipantManagement: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
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

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<EventApplicationPageResponse["summary"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eventInfo, setEventInfo] = useState<{
    title: string;
    status: string;
    organizerName: string;
    organizerEmail: string;
  } | null>(null);

  const mapApiStatusToDisplayStatus = (
    apiStatus: string
  ): "active" | "completed" | "upcoming" | "pending" | "rejected" | "deleted" => {
    switch (apiStatus.toUpperCase()) {
      case "OPEN":
        return "active";
      case "CLOSED":
        return "completed";
      case "ARCHIVED":
        return "deleted";
      case "APPROVAL":
        return "upcoming";
      case "DRAFT":
        return "pending";
      case "REJECTED":
        return "rejected";
      default:
        return "active";
    }
  };

  const getEventStatusBadge = (status: string) => {
    const displayStatus = mapApiStatusToDisplayStatus(status);
    switch (displayStatus) {
      case "active":
        return <span className={`${styles["event-status-badge"]} ${styles["active"]}`}>진행중</span>;
      case "completed":
        return <span className={`${styles["event-status-badge"]} ${styles["completed"]}`}>완료됨</span>;
      case "upcoming":
        return <span className={`${styles["event-status-badge"]} ${styles["upcoming"]}`}>승인됨</span>;
      case "pending":
        return <span className={`${styles["event-status-badge"]} ${styles["pending"]}`}>승인 대기</span>;
      case "rejected":
        return <span className={`${styles["event-status-badge"]} ${styles["rejected"]}`}>승인 거부</span>;
      case "deleted":
        return <span className={`${styles["event-status-badge"]} ${styles["deleted"]}`}>삭제됨</span>;
      default:
        return null;
    }
  };

  const isEventEnded = (status: string): boolean => {
    const displayStatus = mapApiStatusToDisplayStatus(status);
    return displayStatus === "completed" || displayStatus === "deleted";
  };

  const fetchEventInfo = useCallback(async () => {
    if (!eventId) return;

    try {
      const response = await apiRequest(`/admin/events/${eventId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setEventInfo({
          title: data.title || "",
          status: data.status || "",
          organizerName: data.organizerAdminName || "",
          organizerEmail: data.organizerAdminEmail || "",
        });
      }
    } catch (error) {
      console.error("행사 정보 조회 실패:", error);
    }
  }, [eventId]);
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [selectedStatus, setSelectedStatus] = useState<string>(getStatusFromUrl());
  const [sortBy, setSortBy] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");

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

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case "APPLIED":
        return "신청";
      case "CHECKED_IN":
        return "참여 완료";
      case "CANCELLED":
        return "취소";
      case "REJECTED":
        return "차단";
      default:
        return status;
    }
  };

  const fetchParticipants = useCallback(async () => {
    if (!eventId) {
      alert("행사 ID가 없습니다.");
      navigate("/events");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      params.append("eventId", eventId);
      
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      
      params.append("sort", sortBy);
      params.append("page", String(currentPage));
      params.append("size", String(itemsPerPage));

      const response = await apiRequest(`/admin/event-applications?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("참가자 목록 조회에 실패했습니다.");
      }

      const data: EventApplicationPageResponse = await response.json();
      const mappedParticipants: Participant[] = data.content.map((app) => ({
        id: app.userId,
        applicationId: app.applicationId,
        eventId: app.eventId,
        eventTitle: app.eventTitle,
        eventPeriod: formatDateRange(app.eventPeriod.startDate, app.eventPeriod.endDate),
        userId: app.userId,
        name: app.displayName,
        email: app.email,
        optionPath: app.optionPath,
        status: app.status,
        appliedAt: formatDate(app.appliedAt),
        checkedInAt: app.checkedInAt ? formatDate(app.checkedInAt) : null,
        suspended: app.suspended,
      }));

      setParticipants(mappedParticipants);
      setTotalPages(data.totalPages);
      setStats(data.summary);
    } catch (error) {
      console.error("참가자 목록 조회 실패:", error);
      alert("참가자 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, selectedStatus, appliedSearchTerm, appliedSearchScope, sortBy, currentPage, itemsPerPage, navigate]);

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
    fetchEventInfo();
  }, [fetchEventInfo]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

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

  const handleCancelClick = (applicationId: number, participantName: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedParticipantName(participantName);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedApplicationId || !eventId) return;

    if (!cancelReason.trim()) {
      alert("취소 사유를 입력해주세요.");
      return;
    }

    if (cancelReason.length > 255) {
      alert("취소 사유는 255자 이하여야 합니다.");
      return;
    }

    try {
      const response = await apiRequest(`/admin/events/${eventId}/applications/${selectedApplicationId}/cancel`, {
        method: "DELETE",
        body: JSON.stringify({
          reason: cancelReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errorCode === "E1015") {
          throw new Error("신청 정보를 찾을 수 없습니다.");
        } else if (errorData.errorCode === "E1035") {
          throw new Error("관리자에 의해 거절된 신청입니다. 재신청이 불가능합니다.");
        }
        throw new Error(errorData.message || "참가 신청 취소에 실패했습니다.");
      }

      alert("참가 신청이 취소되었습니다.");
      setShowCancelModal(false);
      setSelectedApplicationId(null);
      setSelectedParticipantName("");
      setCancelReason("");
      await fetchParticipants();
    } catch (error) {
      console.error("참가 신청 취소 실패:", error);
    }
  };

  const handleCancelModalCancel = () => {
    setShowCancelModal(false);
    setSelectedApplicationId(null);
    setSelectedParticipantName("");
    setCancelReason("");
  };


  if (!eventId) {
    return (
      <div className={styles["admin-dashboard"]}>
        <PageHeader title="참가 신청 관리" subtitle="행사 ID가 없습니다." />
      </div>
    );
  }

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <header className={styles["participant-header"]} style={{ padding: 0, borderBottom: "none", height: "auto" }}>
          <PageHeader 
            title="참가 신청 관리" 
            subtitle="참가 신청 목록을 확인하고 관리하세요" 
          />
        </header>

        {/* 행사 정보 */}
        {eventInfo && (
          <div className={styles["event-info-badge"]}>
            <h3 className={styles["event-info-title"]}>행사 정보</h3>
            <div className={styles["event-info-row"]}>
              <div className={styles["event-info-item"]}>
                <span className={styles["event-info-label"]}>행사명 :</span>
                <span className={styles["event-info-name"]}>{eventInfo.title}</span>
              </div>
              <div className={styles["event-info-item"]}>
                <span className={styles["event-info-label"]}>주최자 :</span>
                <span className={styles["event-info-value"]}>{eventInfo.organizerName}</span>
              </div>
              <div className={styles["event-info-item"]}>
                <span className={styles["event-info-label"]}>연락처 :</span>
                <span className={styles["event-info-value"]}>{eventInfo.organizerEmail}</span>
              </div>
              <div className={styles["event-info-item"]}>
                <span className={styles["event-info-label"]}>상태 :</span>
                {getEventStatusBadge(eventInfo.status)}
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 섹션 */}
        <div className={styles["stats-section"]}>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>총 신청 수</h3>
                <p className={styles["stat-number"]}>
                  {isLoading ? "..." : stats?.totalApplications.toLocaleString() || 0}
                </p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/users.svg" alt="신청" />
              </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
               <div className={styles["stat-info"]}>
                 <h3>신청</h3>
                 <p className={styles["stat-number"]}>
                   {isLoading ? "..." : stats?.appliedCount.toLocaleString() || 0}
                 </p>
               </div>
               <div className={styles["stat-icon"]}>
                 <img src="/admin/img/icon/ticket.svg" alt="신청" />
               </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>참여 완료</h3>
                <p className={styles["stat-number"]}>
                  {isLoading ? "..." : stats?.checkedInCount.toLocaleString() || 0}
                </p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/credit.svg" alt="참여 완료" />
              </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
               <div className={styles["stat-info"]}>
                 <h3>취소</h3>
                 <p className={styles["stat-number"]}>
                   {isLoading ? "..." : stats?.cancelledCount.toLocaleString() || 0}
                 </p>
               </div>
               <div className={styles["stat-icon"]}>
                 <img src="/admin/img/icon/delete.svg" alt="취소" />
               </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
               <div className={styles["stat-info"]}>
                 <h3>차단</h3>
                 <p className={styles["stat-number"]}>
                   {isLoading ? "..." : stats?.rejectedCount.toLocaleString() || 0}
                 </p>
               </div>
               <div className={styles["stat-icon"]}>
                 <img src="/admin/img/icon/ban.svg" alt="차단" />
               </div>
            </div>
          </div>
        </div>

        {/* 참가자 목록 섹션 */}
        <div className={styles["participants-section"]}>
          <DataList
            headerTitle="참가자 목록"
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
                  <div className={styles["status-select-container"]}>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedStatus(newStatus);
                        setCurrentPage(0);
                        updateUrlParams({ status: newStatus, page: 0 });
                      }}
                      className={styles["status-select"]}
                    >
                      <option value="all">전체 상태</option>
                      <option value="APPLIED">신청</option>
                      <option value="CHECKED_IN">참여 완료</option>
                      <option value="CANCELLED">취소</option>
                      <option value="REJECTED">차단</option>
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
                      <option value="LATEST">신청일 최신순</option>
                      <option value="OLDEST">신청일 오래된 순</option>
                      <option value="BY_EVENT">행사명순</option>
                      <option value="BY_USER">닉네임순</option>
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
                title: "참가자 정보",
                width: 250,
                render: (p: Participant) => (
                  <div className={styles["participant-info"]}>
                    <div className={styles["participant-details"]}>
                      <p
                        className={`${styles["participant-name"]} ${styles["clickable"]}`}
                        onClick={() => navigate(`/repair/${p.userId}`)}
                      >
                        {p.name}
                      </p>
                      <p className={styles["participant-email"]}>{p.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "optionPath",
                title: "선택 옵션",
                width: 150,
                render: (p: Participant) => p.optionPath || "-",
              },
              {
                key: "appliedAt",
                title: "신청일",
                width: 130,
                render: (p: Participant) => p.appliedAt,
              },
              {
                key: "checkedInAt",
                title: "행사 참여일",
                width: 130,
                render: (p: Participant) => p.checkedInAt || "-",
              },
              {
                key: "status",
                title: "상태",
                width: 100,
                align: "center",
                render: (p: Participant) => {
                  let statusClass = "";
                  switch (p.status) {
                    case "APPLIED":
                      statusClass = styles["applied"];
                      break;
                    case "CHECKED_IN":
                      statusClass = styles["checked-in"];
                      break;
                    case "CANCELLED":
                      statusClass = styles["cancelled"];
                      break;
                    case "REJECTED":
                      statusClass = styles["rejected"];
                      break;
                    default:
                      statusClass = "";
                  }
                  return (
                    <span className={`${styles["status-badge"]} ${statusClass}`}>
                      {getStatusDisplayName(p.status)}
                    </span>
                  );
                },
              },
              {
                key: "actions",
                title: "작업",
                width: 80,
                align: "center",
                className: styles["actions-cell"],
                render: (p: Participant) => {
                  const canCancel = 
                    (p.status === "APPLIED" || p.status === "CHECKED_IN") &&
                    eventInfo &&
                    !isEventEnded(eventInfo.status);
                  
                  return (
                    <div className={styles["actions-wrapper"]}>
                      {canCancel ? (
                        <button
                          className={`${styles["action-btn"]} ${styles["cancel"]}`}
                          onClick={() => handleCancelClick(p.applicationId, p.name)}
                        >
                          취소
                        </button>
                      ) : null}
                    </div>
                  );
                },
              },
            ]}
            data={isLoading ? [] : participants}
            rowKey={(row: Participant) => row.applicationId}
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

      {showCancelModal && (
        createPortal(
          <div className={styles["cancel-modal-overlay"]} onClick={handleCancelModalCancel}>
            <div className={styles["cancel-modal-content"]} onClick={(e) => e.stopPropagation()}>
              <div className={styles["cancel-modal-header"]}>
                <h2 className={styles["cancel-modal-title"]}>참가 신청 취소</h2>
              </div>
              <div className={styles["cancel-modal-body"]}>
                <p className={styles["cancel-modal-message"]}>
                  {selectedParticipantName}님의 참가 신청을 취소하시겠습니까?
                </p>
                <div className={styles["cancel-modal-reason"]}>
                  <label htmlFor="cancel-reason">취소 사유 (필수)</label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="취소 사유를 입력해주세요 (최대 255자)"
                    maxLength={255}
                    rows={4}
                    className={styles["cancel-reason-input"]}
                  />
                  <div className={styles["cancel-reason-count"]}>
                    {cancelReason.length}/255
                  </div>
                </div>
              </div>
              <div className={styles["cancel-modal-footer"]}>
                <button className={styles["cancel-modal-btn"]} onClick={handleCancelModalCancel}>
                  취소
                </button>
                <button
                  className={`${styles["cancel-modal-btn"]} ${styles["confirm-btn"]} ${styles["reject"]}`}
                  onClick={handleCancelConfirm}
                  disabled={!cancelReason.trim()}
                >
                  확인
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default EventParticipantManagement;

