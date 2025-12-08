import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ParticipantManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
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

const ParticipantManagement: React.FC = () => {
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

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<EventApplicationPageResponse["summary"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        return "신청됨";
      case "CHECKED_IN":
        return "체크인";
      case "CANCELLED":
        return "취소됨";
      case "REJECTED":
        return "거절됨";
      default:
        return status;
    }
  };

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
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
      console.error("Error fetching participants:", error);
      alert("참가자 목록을 불러오는데 실패했습니다.");
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


  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <header className={styles["participant-header"]} style={{ padding: 0, borderBottom: "none", height: "auto" }}>
          <PageHeader title="참가자 관리" subtitle="이벤트 참가자 목록을 확인하고 관리하세요" />
        </header>

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
                <h3>신청됨</h3>
                <p className={styles["stat-number"]}>
                  {isLoading ? "..." : stats?.appliedCount.toLocaleString() || 0}
                </p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/ticket.svg" alt="신청됨" />
              </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>체크인</h3>
                <p className={styles["stat-number"]}>
                  {isLoading ? "..." : stats?.checkedInCount.toLocaleString() || 0}
                </p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/credit.svg" alt="체크인" />
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
                      <option value="APPLIED">신청됨</option>
                      <option value="CHECKED_IN">체크인</option>
                      <option value="CANCELLED">취소됨</option>
                      <option value="REJECTED">거절됨</option>
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
                key: "event",
                title: "행사",
                width: 200,
                render: (p: Participant) => p.eventTitle,
              },
              {
                key: "eventPeriod",
                title: "행사 기간",
                width: 150,
                render: (p: Participant) => p.eventPeriod,
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
                title: "체크인일",
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
    </div>
  );
};

export default ParticipantManagement;
