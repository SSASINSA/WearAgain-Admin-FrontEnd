import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./EventDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "utils/api";

const imgImg = "/admin/img/example/event-hero.png";
const imgFrame1 = "/admin/img/icon/date-time.svg";
const imgFrame2 = "/admin/img/icon/location-pin.svg";
const imgFrame3 = "/admin/img/icon/user-count.svg";
const imgFrame4 = "/admin/img/icon/co2.svg";
const imgFrame5 = "/admin/img/icon/energy.svg";
const imgFrame6 = "/admin/img/icon/water.svg";
const imgFrame7 = "/admin/img/icon/staff-badge.svg";
const imgFrame8 = "/admin/img/icon/code-generate.svg";
const imgFrame9 = "/admin/img/icon/alert.svg";
const imgFrame10 = "/admin/img/icon/clothes.svg";
const imgFrame11 = "/admin/img/icon/exchange-rate.svg";

interface EventImage {
  imageId: number;
  url: string;
  altText: string;
  displayOrder: number;
}

interface EventOption {
  optionId: number;
  name: string;
  type: string;
  displayOrder: number;
  capacity: number | null;
  appliedCount: number;
  remainingCount: number;
  children: EventOption[];
}

interface EventApplication {
  applicationId: number;
  email: string;
  displayName: string;
  optionId: number;
  status: string;
  appliedAt: string;
  reason: string | null;
}

interface EventDetailResponse {
  eventId: number;
  title: string;
  description: string;
  usageGuide: string | null;
  precautions: string | null;
  location: string;
  organizerName: string;
  organizerContact: string;
  organizerAdminId: number;
  organizerAdminEmail: string;
  organizerAdminName: string;
  startDate: string;
  endDate: string;
  status: string;
  totalCapacity: number;
  appliedCount: number;
  remainingCount: number;
  staffCode: string | null;
  staffCodeIssuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: EventImage[];
  options: EventOption[];
  applications: EventApplication[];
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest(`/admin/events/${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "행사 상세 정보를 가져오는데 실패했습니다.");
        }

        const data: EventDetailResponse = await response.json();
        setEventData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "행사 상세 정보를 가져오는데 실패했습니다.";
        setError(errorMessage);
        console.error("Error fetching event detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  useEffect(() => {
    const headerOffsetPx = 120;
    let sidebarTopAbs = 0;

    const computeAnchors = () => {
      const el = sidebarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      sidebarTopAbs = window.scrollY + rect.top - headerOffsetPx;
    };

    const onScroll = () => {
      const el = sidebarRef.current;
      const inner = sidebarInnerRef.current;
      if (!el || !inner) return;
      const containerRect = el.getBoundingClientRect();
      if (window.scrollY >= sidebarTopAbs) {
        const fixedLeft = containerRect.left + window.scrollX;
        const width = containerRect.width;
        inner.style.position = "fixed";
        inner.style.top = `${headerOffsetPx}px`;
        inner.style.left = `${fixedLeft}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = "2";
      } else {
        inner.style.position = "static";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
        inner.style.zIndex = "";
      }
    };

    const onResize = () => {
      computeAnchors();
      onScroll();
    };

    computeAnchors();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const calculateAttendeeCapacity = (options: EventOption[]): number => {
    let total = 0;
    const traverse = (opts: EventOption[]) => {
      for (const opt of opts) {
        if (opt.type === "ATTENDEE" && opt.capacity !== null) {
          total += opt.capacity;
        }
        if (opt.children && opt.children.length > 0) {
          traverse(opt.children);
        }
      }
    };
    traverse(options);
    return total;
  };

  const calculateAttendeeAppliedCount = (options: EventOption[]): number => {
    let total = 0;
    const traverse = (opts: EventOption[]) => {
      for (const opt of opts) {
        if (opt.type === "ATTENDEE") {
          total += opt.appliedCount || 0;
        }
        if (opt.children && opt.children.length > 0) {
          traverse(opt.children);
        }
      }
    };
    traverse(options);
    return total;
  };

  const getStatusText = (status: string): string => {
    switch (status.toUpperCase()) {
      case "DRAFT":
        return "승인 대기";
      case "APPROVAL":
        return "승인 완료";
      case "OPEN":
        return "진행중";
      case "REJECTED":
        return "거부됨";
      case "CLOSED":
        return "종료";
      case "ARCHIVED":
        return "보관됨";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className={styles["event-detail-page"]}>
        <PageHeader title="행사 상세정보" />
        <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className={styles["event-detail-page"]}>
        <PageHeader title="행사 상세정보" />
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          {error || "행사 정보를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  const mainImage = eventData.images && eventData.images.length > 0 ? eventData.images[0].url : imgImg;

  const attendeeCapacity = calculateAttendeeCapacity(eventData.options);
  const attendeeAppliedCount = calculateAttendeeAppliedCount(eventData.options);
  const attendeeRemainingCount = attendeeCapacity - attendeeAppliedCount;

  return (
    <div className={styles["event-detail-page"]}>
      <PageHeader title="행사 상세정보" />

      <div className={styles["event-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-detail-content"]}>
          {/* 행사 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div className={styles["event-hero-image"]}>
              <img src={mainImage} alt={eventData.images[0]?.altText || "행사 이미지"} />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                <span className={`${styles["tag"]} ${styles["environment"]}`}>환경보호</span>
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>워크샵</span>
              </div>
              <h2 className={styles["event-title"]}>{eventData.title}</h2>
              <p className={styles["event-description"]}>{eventData.description}</p>
            </div>
          </div>

          {/* 행사 상세 정보 섹션 */}
          <div className={styles["event-details-section"]}>
            <h3 className={styles["section-title"]}>행사 상세 정보</h3>
            <div className={styles["event-details-grid"]}>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame1} alt="날짜 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>날짜</p>
                  <p className={styles["detail-value"]}>
                    {formatDate(eventData.startDate)} - {formatDate(eventData.endDate)}
                  </p>
                </div>
              </div>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame2} alt="위치 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>위치</p>
                  <p className={styles["detail-value"]}>{eventData.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 방법 섹션 */}
          {eventData.usageGuide && (
            <div className={styles["event-usage-section"]}>
              <h3 className={styles["section-title"]}>이용 방법</h3>
              <ul className={styles["usage-list"]}>
                {eventData.usageGuide.split("\n").map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 주의사항 섹션 */}
          {eventData.precautions && (
            <div className={styles["event-precaution-section"]}>
              <h3 className={styles["section-title"]}>주의사항</h3>
              <ul className={styles["precaution-list"]}>
                {eventData.precautions.split("\n").map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 행사 통계 섹션 */}
          <div className={styles["event-results-section"]}>
            <h3 className={styles["section-title"]}>행사 통계</h3>
            <div className={styles["results-grid"]}>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="참가자 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>{attendeeAppliedCount}</p>
                  <p className={styles["result-label"]}>신청 참가자 수</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="정원 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>{attendeeCapacity}</p>
                  <p className={styles["result-label"]}>전체 정원</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="잔여 정원 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>{attendeeRemainingCount}</p>
                  <p className={styles["result-label"]}>잔여 정원</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 - 스태프 코드 발급 */}
        <div className={styles["event-detail-sidebar"]} ref={sidebarRef} style={{ alignSelf: "flex-start" }}>
          <div ref={sidebarInnerRef}>
            {eventData.staffCode ? (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <div className={styles["staff-code-icon"]}>
                    <img src={imgFrame7} alt="스태프 코드 아이콘" />
                  </div>
                  <h4 className={styles["staff-code-title"]}>스태프 코드</h4>
                  <p className={styles["staff-code-description"]}>발급된 스태프 코드</p>
                </div>
                <div className={styles["staff-code-display"]}>
                  <p className={styles["staff-code-value"]}>{eventData.staffCode}</p>
                  {eventData.staffCodeIssuedAt && (
                    <p className={styles["staff-code-issued"]}>발급일: {formatDateTime(eventData.staffCodeIssuedAt)}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <div className={styles["staff-code-icon"]}>
                    <img src={imgFrame7} alt="스태프 코드 아이콘" />
                  </div>
                  <h4 className={styles["staff-code-title"]}>스태프 코드 발급</h4>
                  <p className={styles["staff-code-description"]}>행사 운영진을 위한 전용 코드를 발급받으세요</p>
                </div>
                <button className={styles["staff-code-button"]}>
                  <img src={imgFrame8} alt="발급 아이콘" />
                  스태프 코드 발급
                </button>
                <div className={styles["staff-code-notice"]}>
                  <img src={imgFrame9} alt="알림 아이콘" />
                  <p>코드는 행사 당일에만 유효합니다</p>
                </div>
              </div>
            )}

            {/* 행사 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>행사 정보</h4>
              <div className={styles["info-list"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>상태</span>
                  <span className={`${styles["info-value"]} ${styles[`status-${eventData.status.toLowerCase()}`]}`}>
                    {getStatusText(eventData.status)}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>주최자</span>
                  <span className={styles["info-value"]}>{eventData.organizerName}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>연락처</span>
                  <span className={styles["info-value"]}>{eventData.organizerContact}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록 관리자</span>
                  <span className={styles["info-value"]}>{eventData.organizerAdminName}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록일</span>
                  <span className={styles["info-value"]}>{formatDateTime(eventData.createdAt)}</span>
                </div>
                {eventData.updatedAt && (
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>수정일</span>
                    <span className={styles["info-value"]}>{formatDateTime(eventData.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
