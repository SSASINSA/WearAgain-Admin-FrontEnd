import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "../../../../utils/api";
import styles from "./EventApproval.module.css";

const searchIcon = "/admin/img/icon/search.svg";
const dropdownIcon = "/admin/img/icon/dropdown.svg";
const calendarIcon = "/admin/img/icon/calendar.svg";
const locationIcon = "/admin/img/icon/location.svg";
const detailIcon = "/admin/img/icon/detail.svg";
const prevIcon = "/admin/img/icon/chevron-left.svg";
const nextIcon = "/admin/img/icon/arrow-right.svg";

interface EventOption {
  optionId: number;
  name: string;
  displayOrder: number;
  capacity: number | null;
  appliedCount: number | null;
  remainingCount: number | null;
  children: EventOption[];
}

interface EventInfo {
  eventId: number;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface AdminInfo {
  name: string;
  email: string;
}

interface EventApprovalRequestListResponse {
  approvalRequestId: number;
  event: EventInfo;
  options: EventOption[];
  requestingAdmin: AdminInfo;
  createdAt: string;
}

interface EventApprovalRequestPageResponse {
  approvals: EventApprovalRequestListResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface ApprovalRequest {
  approvalRequestId: number;
  eventId: number;
  title: string;
  date: string;
  location: string;
  registeredBy: string;
  registeredDate: string;
  participantCapacity: number | null;
  staffCapacity: number | null;
}

const EventApproval: React.FC = () => {
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

  const [searchTerm, setSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [sort, setSort] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState<number>(getPageFromUrl());
  const [pageSize] = useState<number>(10);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

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

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const calculateTotalCapacity = (options: EventOption[]): number => {
    let total = 0;
    const traverse = (opts: EventOption[]) => {
      for (const opt of opts) {
        if (opt.children && opt.children.length > 0) {
          traverse(opt.children);
        } else if (opt.capacity !== null && opt.capacity !== undefined) {
          total += opt.capacity;
        }
      }
    };
    traverse(options);
    return total;
  };

  const fetchApprovalRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      params.append("page", String(currentPage));
      params.append("size", String(pageSize));
      params.append("sort", sort);

      const response = await apiRequest(`/admin/events/approvals?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "승인 대기 목록을 가져오는데 실패했습니다.");
      }

      const data: EventApprovalRequestPageResponse = await response.json();

      if (!data || !Array.isArray(data.approvals)) {
        throw new Error("잘못된 응답 형식입니다.");
      }

      const transformedRequests: ApprovalRequest[] = data.approvals.map((item) => {
        const totalCapacity = calculateTotalCapacity(item.options);

        return {
          approvalRequestId: item.approvalRequestId,
          eventId: item.event.eventId,
          title: item.event.title,
          date: formatDateRange(item.event.startDate, item.event.endDate),
          location: item.event.location,
          registeredBy: item.requestingAdmin.name,
          registeredDate: formatDateTime(item.createdAt),
          participantCapacity: totalCapacity > 0 ? totalCapacity : null,
          staffCapacity: null,
        };
      });

      setApprovalRequests(transformedRequests);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      setHasNext(data.hasNext);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "승인 대기 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Error fetching approval requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearchTerm, appliedSearchScope, sort, currentPage, pageSize]);

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
    if (urlSort !== sort) setSort(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchApprovalRequests();
  }, [fetchApprovalRequests]);

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

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(0);
    updateUrlParams({ sort: newSort, page: 0 });
  };

  const handleViewDetails = (approvalRequestId: number) => {
    navigate(`/events/approval/${approvalRequestId}`);
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="행사등록 승인" subtitle="하위 관리자가 등록한 행사를 확인하고 승인할 수 있습니다" />

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
                  <option value="REQUESTER">신청자명</option>
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
          </div>

          {isLoading && (
            <div className={styles["loading-container"]}>
              <p>로딩 중...</p>
            </div>
          )}

          {error && (
            <div className={styles["error-container"]}>
              <p>{error}</p>
              <button onClick={fetchApprovalRequests}>다시 시도</button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className={styles["events-grid"]}>
                {approvalRequests.map((request) => (
                  <div key={request.approvalRequestId} className={styles["event-card"]}>
                    <div className={styles["event-card-content"]}>
                      <div className={styles["event-header"]}>
                        <h3 className={styles["event-title"]}>{request.title}</h3>
                        <span className={`${styles["status-badge"]} ${styles["pending"]}`}>승인 대기</span>
                      </div>

                      <div className={styles["event-details"]}>
                        <div className={styles["event-detail"]}>
                          <span className={styles["detail-icon"]}>
                            <img src={calendarIcon} alt="날짜" />
                          </span>
                          <span className={styles["detail-text"]}>{request.date}</span>
                        </div>
                        <div className={styles["event-detail"]}>
                          <span className={styles["detail-icon"]}>
                            <img src={locationIcon} alt="위치" />
                          </span>
                          <span className={styles["detail-text"]}>{request.location}</span>
                        </div>
                      </div>

                      <div className={styles["event-registration-info"]}>
                        <span className={styles["registration-text"]}>등록자: {request.registeredBy}</span>
                        <span className={styles["registration-text"]}>등록일: {request.registeredDate}</span>
                        {request.participantCapacity !== null && (
                          <span className={styles["registration-text"]}>
                            참가자 정원: {request.participantCapacity}명
                          </span>
                        )}
                        {request.staffCapacity !== null && (
                          <span className={styles["registration-text"]}>스태프 정원: {request.staffCapacity}명</span>
                        )}
                      </div>

                      <div className={styles["event-actions"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["primary"]}`}
                          onClick={() => handleViewDetails(request.approvalRequestId)}
                        >
                          <img src={detailIcon} alt="" />
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {approvalRequests.length === 0 && (
                <div className={styles["empty-container"]}>
                  <p>승인 대기 중인 행사가 없습니다.</p>
                </div>
              )}

              {approvalRequests.length > 0 && (
                <div className={styles["pagination-section"]}>
                  <div className={styles["pagination-info"]}>
                    총 {totalElements}개 승인 요청 중 {currentPage * pageSize + 1}-
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventApproval;
