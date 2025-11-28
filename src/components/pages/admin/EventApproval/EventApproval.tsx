import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "utils/api";
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
  type: string;
  displayOrder: number;
  capacity: number | null;
  children: EventOption[];
}

interface EventApprovalRequest {
  approvalRequestId: number;
  event: {
    eventId: number;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
  };
  options: EventOption[];
  requestingAdmin: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  registeredBy: string;
  registeredDate: string;
  approvalRequestId: number;
  participantCapacity: number | null;
  staffCapacity: number | null;
}

const EventApproval: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("/admin/events/approvals", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "승인 대기 목록을 가져오는데 실패했습니다.");
      }

      const data: EventApprovalRequest[] = await response.json();

      const findOptionByType = (options: EventOption[], type: string): EventOption | null => {
        for (const opt of options) {
          if (opt.type === type) {
            return opt;
          }
          if (opt.children && opt.children.length > 0) {
            const found = findOptionByType(opt.children, type);
            if (found) return found;
          }
        }
        return null;
      };

      const transformedEvents: Event[] = data.map((item) => {
        const attendeeOption = findOptionByType(item.options, "ATTENDEE");
        const staffOption = findOptionByType(item.options, "STAFF");

        return {
          id: item.event.eventId,
          title: item.event.title,
          date: formatDateRange(item.event.startDate, item.event.endDate),
          location: item.event.location,
          registeredBy: item.requestingAdmin.name,
          registeredDate: formatDateTime(item.createdAt),
          approvalRequestId: item.approvalRequestId,
          participantCapacity: attendeeOption?.capacity || null,
          staffCapacity: staffOption?.capacity || null,
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "승인 대기 목록을 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("Error fetching pending approvals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.registeredBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
                <div className={styles["search-icon"]}>
                  <img src={searchIcon} alt="검색" />
                </div>
                <input
                  type="text"
                  placeholder="행사 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles["search-input"]}
                />
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
              <button onClick={fetchPendingApprovals}>다시 시도</button>
            </div>
          )}

          {!isLoading && !error && (
            <>
          <div className={styles["events-grid"]}>
                {filteredEvents.map((event) => (
              <div key={event.id} className={styles["event-card"]}>
                <div className={styles["event-card-content"]}>
                  <div className={styles["event-header"]}>
                    <h3 className={styles["event-title"]}>{event.title}</h3>
                        <span className={`${styles["status-badge"]} ${styles["pending"]}`}>승인 대기</span>
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

                  <div className={styles["event-registration-info"]}>
                    <span className={styles["registration-text"]}>등록자: {event.registeredBy}</span>
                    <span className={styles["registration-text"]}>등록일: {event.registeredDate}</span>
                        {event.participantCapacity !== null && (
                          <span className={styles["registration-text"]}>
                            참가자 정원: {event.participantCapacity}명
                          </span>
                        )}
                        {event.staffCapacity !== null && (
                          <span className={styles["registration-text"]}>스태프 정원: {event.staffCapacity}명</span>
                        )}
                  </div>

                  <div className={styles["event-actions"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["primary"]}`}
                          onClick={() => handleViewDetails(event.approvalRequestId)}
                        >
                      <img src={detailIcon} alt="" />
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

              {filteredEvents.length === 0 && (
                <div className={styles["empty-container"]}>
                  <p>승인 대기 중인 행사가 없습니다.</p>
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
