import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "utils/api";
import styles from "./EventsManagement.module.css";

const searchIcon = "/admin/img/icon/search.svg";
const dropdownIcon = "/admin/img/icon/dropdown.svg";
const plusIcon = "/admin/img/icon/plus.svg";
const calendarIcon = "/admin/img/icon/calendar.svg";
const locationIcon = "/admin/img/icon/location.svg";
const staffIcon = "/admin/img/icon/staff.svg";
const participantIcon = "/admin/img/icon/user-group.svg";
const detailIcon = "/admin/img/icon/detail.svg";
const editIcon = "/admin/img/icon/edit.svg";
const prevIcon = "/admin/img/icon/chevron-left.svg";
const nextIcon = "/admin/img/icon/arrow-right.svg";

interface EventApiResponse {
  eventId: number;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  totalCapacity: number;
  appliedCount: number;
  remainingCount: number;
  organizerName: string;
  organizerContact: string;
  organizerAdminId: number;
  organizerAdminEmail: string;
  organizerAdminName: string;
}

interface EventAdminListResponse {
  events: EventApiResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  participants: number;
  staff: number;
  status: "active" | "completed" | "upcoming" | "pending" | "rejected" | "deleted";
  description: string;
}

const EventsManagement: React.FC = () => {
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
  const [sort, setSort] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState<number>(getPageFromUrl());
  const [pageSize] = useState<number>(9);
  const [events, setEvents] = useState<Event[]>([]);
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

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const mapDisplayStatusToApiStatus = (displayStatus: string): string[] => {
    switch (displayStatus) {
      case "active":
        return ["OPEN"];
      case "pending":
        return ["DRAFT"];
      case "upcoming":
        return ["APPROVAL"];
      case "rejected":
        return ["REJECTED"];
      case "completed":
        return ["CLOSED"];
      case "deleted":
        return ["ARCHIVED"];
      default:
        return ["DRAFT", "APPROVAL", "OPEN", "REJECTED", "CLOSED", "ARCHIVED"];
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const apiStatuses = mapDisplayStatusToApiStatus(selectedStatus);
      if (apiStatuses.length > 0 && selectedStatus !== "all") {
        params.append("status", apiStatuses.join(","));
      }
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      params.append("page", String(currentPage));
      params.append("size", String(pageSize));
      params.append("sort", sort);

      const response = await apiRequest(`/admin/events?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "행사 목록을 가져오는데 실패했습니다.");
      }

      const data: EventAdminListResponse = await response.json();
      const transformedEvents = data.events.map((apiEvent) => {
        const displayStatus = mapApiStatusToDisplayStatus(apiEvent.status);
        return {
          id: apiEvent.eventId,
          title: apiEvent.title,
          date: formatDateRange(apiEvent.startDate, apiEvent.endDate),
          location: apiEvent.location,
          participants: apiEvent.appliedCount,
          staff: 0,
          status: displayStatus,
          description: "",
        };
      });
      setEvents(transformedEvents);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      setHasNext(data.hasNext);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "행사 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, appliedSearchTerm, appliedSearchScope, sort, currentPage, pageSize]);

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
    if (urlSort !== sort) setSort(urlSort);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>진행중</span>;
      case "completed":
        return <span className={`${styles["status-badge"]} ${styles["completed"]}`}>완료됨</span>;
      case "upcoming":
        return <span className={`${styles["status-badge"]} ${styles["upcoming"]}`}>승인됨</span>;
      case "pending":
        return <span className={`${styles["status-badge"]} ${styles["pending"]}`}>승인 대기</span>;
      case "rejected":
        return <span className={`${styles["status-badge"]} ${styles["rejected"]}`}>승인 거부</span>;
      case "deleted":
        return <span className={`${styles["status-badge"]} ${styles["deleted"]}`}>삭제됨</span>;
      default:
        return null;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(0);
    updateUrlParams({ status: newStatus, page: 0 });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(0);
    updateUrlParams({ sort: newSort, page: 0 });
  };

  const handleViewDetails = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleEdit = (eventId: number) => {
    navigate(`/events/${eventId}/edit`);
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="행사 관리" subtitle="등록된 행사를 확인하고 관리할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          <div className={styles["events-controls"]}>
            <div className={styles["search-filter-section"]}>
              <div className={styles["search-input-container"]}>
                <div className={styles["search-icon"]} onClick={handleSearch} style={{ cursor: "pointer" }}>
                  <img src={searchIcon} alt="검색" />
                </div>
                <input
                  type="text"
                  placeholder="행사 검색..."
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
                  <option value="TITLE">행사명</option>
                  <option value="DESCRIPTION">설명</option>
                  <option value="LOCATION">위치</option>
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
                  <option value="pending">승인 대기</option>
                  <option value="upcoming">승인됨</option>
                  <option value="active">진행중</option>
                  <option value="rejected">승인 거부</option>
                  <option value="completed">완료됨</option>
                  <option value="deleted">삭제됨</option>
                </select>
                <div className={styles["status-select-icon"]}>
                  <img src={dropdownIcon} alt="드롭다운" />
                </div>
              </div>
              <div className={styles["status-select-container"]}>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={styles["status-select"]}
                >
                  <option value="LATEST">최신순</option>
                  <option value="OLDEST">오래된순</option>
                  <option value="TITLE_ASC">제목순</option>
                </select>
                <div className={styles["status-select-icon"]}>
                  <img src={dropdownIcon} alt="드롭다운" />
                </div>
              </div>
            </div>
            <button className={styles["add-event-btn"]} onClick={() => navigate("/events/register")}>
              <img src={plusIcon} alt="" />새 행사 만들기
            </button>
          </div>

          {isLoading && (
            <div className={styles["loading-container"]}>
              <p>로딩 중...</p>
            </div>
          )}

          {error && (
            <div className={styles["error-container"]}>
              <p>{error}</p>
              <button onClick={fetchEvents}>다시 시도</button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className={styles["events-grid"]}>
                {events.map((event) => (
                  <div key={event.id} className={styles["event-card"]}>
                    <div className={styles["event-card-content"]}>
                      <div className={styles["event-header"]}>
                        <h3 className={styles["event-title"]}>{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>

                      <div className={styles["event-details"]}>
                        <div className={styles["event-detail"]}>
                          <span className={styles["detail-icon"]}>
                            <img src={calendarIcon} alt="날짜" />
                          </span>
                          <span className={styles["detail-text"]}>{event.date}</span>
                        </div>
                        <div className={styles["event-detail"]}>
                          <span className={styles["detail-icon"]}>
                            <img src={locationIcon} alt="위치" />
                          </span>
                          <span className={styles["detail-text"]}>{event.location}</span>
                        </div>
                      </div>

                      <div className={styles["event-stats"]}>
                        <div className={styles["stat-item"]}>
                          <span className={styles["stat-icon"]}>
                            <img src={participantIcon} alt="참가자" />
                          </span>
                          <span className={styles["stat-text"]}>참가자 {event.participants}명</span>
                        </div>
                        <div className={styles["stat-item"]}>
                          <span className={styles["stat-icon"]}>
                            <img src={staffIcon} alt="스태프" />
                          </span>
                          <span className={styles["stat-text"]}>스태프 {event.staff}명</span>
                        </div>
                      </div>

                      <div className={styles["event-actions"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["primary"]}`}
                          onClick={() => handleViewDetails(event.id)}
                        >
                          <img src={detailIcon} alt="" />
                          상세보기
                        </button>
                        <div className={styles["action-icons-group"]}>
                          <button
                            className={`${styles["action-btn"]} ${styles["secondary"]}`}
                            onClick={() => handleEdit(event.id)}
                          >
                            <img src={editIcon} alt="수정" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles["pagination-section"]}>
                <div className={styles["pagination-info"]}>
                  총 {totalElements}개 행사 중 {currentPage * pageSize + 1}-
                  {Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
                </div>
                <div className={styles["pagination-controls"]}>
                  <button
                    className={styles["pagination-btn"]}
                    onClick={() => {
                      const newPage = Math.max(0, currentPage - 1);
                      setCurrentPage(newPage);
                      updateUrlParams({ page: newPage });
                    }}
                    disabled={currentPage === 0}
                  >
                    <img src={prevIcon} alt="이전" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                    <button
                      key={page}
                      className={`${styles["pagination-btn"]} ${currentPage === page ? styles["active"] : ""}`}
                      onClick={() => {
                        setCurrentPage(page);
                        updateUrlParams({ page });
                      }}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    className={styles["pagination-btn"]}
                    onClick={() => {
                      const newPage = Math.min(totalPages - 1, currentPage + 1);
                      setCurrentPage(newPage);
                      updateUrlParams({ page: newPage });
                    }}
                    disabled={!hasNext}
                  >
                    <img src={nextIcon} alt="다음" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsManagement;
