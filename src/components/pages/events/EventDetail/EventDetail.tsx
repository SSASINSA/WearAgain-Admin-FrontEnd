import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "utils/api";

const imgImg = "/admin/img/example/event-hero.png";
const imgFrame1 = "/admin/img/icon/date-time.svg";
const imgFrame2 = "/admin/img/icon/location-pin.svg";
const imgFrame3 = "/admin/img/icon/user-count.svg";
const imgFrame9 = "/admin/img/icon/alert.svg";
const editIcon = "/admin/img/icon/edit.svg";
const co2Icon = "/admin/img/icon/co2.svg";
const waterIcon = "/admin/img/icon/water.svg";
const energyIcon = "/admin/img/icon/energy.svg";
const reportIcon = "/admin/img/icon/document.svg";

interface EventImage {
  imageId: number;
  url: string;
  altText: string | null;
  displayOrder: number;
}

interface EventOption {
  optionId: number;
  name: string;
  displayOrder: number;
  capacity: number | null;
  appliedCount: number | null;
  remainingCount: number | null;
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

interface ImpactAnalytics {
  available: boolean;
  co2Saved: number | null;
  waterSaved: number | null;
  energySaved: number | null;
  message: string | null;
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
  impactAnalytics: ImpactAnalytics;
}

interface StaffCodeResponse {
  eventId: number;
  staffCode: string;
  issuedAt: string;
}

interface EventReportResponse {
  reportId: string;
  status: string;
  downloadUrl?: string;
  message?: string;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [staffCode, setStaffCode] = useState<string | null>(null);
  const [staffCodeIssuedAt, setStaffCodeIssuedAt] = useState<string | null>(null);
  const [isLoadingStaffCode, setIsLoadingStaffCode] = useState<boolean>(false);
  const [isIssuingCode, setIsIssuingCode] = useState<boolean>(false);
  const [staffCodeError, setStaffCodeError] = useState<string | null>(null);
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showReissueModal, setShowReissueModal] = useState<boolean>(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);

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
        console.error("행사 상세 정보 조회 실패:", err);
        setError("행사 상세 정보를 가져오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  const fetchStaffCode = useCallback(async (): Promise<"hasCode" | "noCode" | "noPermission"> => {
    if (!id) return "noCode";

    try {
      setIsLoadingStaffCode(true);
      setStaffCodeError(null);

      const response = await apiRequest(`/admin/events/${id}/staff-code`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorCode = errorData.errorCode;

        if (errorCode === "E1025") {
          setStaffCode(null);
          setStaffCodeIssuedAt(null);
          return "noCode";
        }

        if (errorCode === "E1024") {
          setStaffCode(null);
          setStaffCodeIssuedAt(null);
          setStaffCodeError(null);
          return "noPermission";
        }

        throw new Error(errorData.message || "스태프 코드 조회에 실패했습니다.");
      }

      const data: StaffCodeResponse = await response.json();
      setStaffCode(data.staffCode);
      setStaffCodeIssuedAt(data.issuedAt);
      return "hasCode";
    } catch (err) {
      console.error("스태프 코드 조회 실패:", err);
      setStaffCodeError("스태프 코드 조회에 실패했습니다.");
      return "noCode";
    } finally {
      setIsLoadingStaffCode(false);
    }
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
    const utcYear = date.getUTCFullYear();
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
    const utcDay = String(date.getUTCDate()).padStart(2, "0");
    const utcHours = String(date.getUTCHours()).padStart(2, "0");
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${utcYear}.${utcMonth}.${utcDay} ${utcHours}:${utcMinutes}`;
  };

  const formatDateTimeLocal = (utcDateString: string | null): string => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const handleIssueStaffCode = async () => {
    if (!id) return;

    try {
      setIsIssuingCode(true);
      setStaffCodeError(null);

      const response = await apiRequest(`/admin/events/${id}/staff-code`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorCode = errorData.errorCode;

        if (errorCode === "E1024") {
          return;
        }

        throw new Error(errorData.message || "스태프 코드 발급에 실패했습니다.");
      }

      const data: StaffCodeResponse = await response.json();
      setStaffCode(data.staffCode);
      setStaffCodeIssuedAt(data.issuedAt);
      alert("스태프 코드가 발급되었습니다.");
    } catch (err) {
      console.error("스태프 코드 발급 실패:", err);
    } finally {
      setIsIssuingCode(false);
    }
  };

  const handleLoadOrIssueStaffCode = async () => {
    if (!id) return;

    const result = await fetchStaffCode();
    if (result === "noCode") {
      setShowIssueModal(true);
    }
  };

  const handleIssueConfirm = async () => {
    setShowIssueModal(false);
    await handleIssueStaffCode();
  };

  const handleReissueClick = () => {
    setShowReissueModal(true);
  };

  const handleReissueConfirm = async () => {
    setShowReissueModal(false);
    await handleIssueStaffCode();
  };

  const handleCopyCode = async () => {
    if (!staffCode) return;

    try {
      await navigator.clipboard.writeText(staffCode);
      alert("코드가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("코드 복사 실패:", err);
      alert("코드 복사에 실패했습니다.");
    }
  };

  const buildDownloadUrl = (rawUrl: string): string => {
    if (!rawUrl) return "";
    const base = process.env.REACT_APP_API_BASE_URL || window.location.origin;
    try {
      if (rawUrl.startsWith("http")) {
        return rawUrl;
      }
      return new URL(rawUrl, base).toString();
    } catch (error) {
      console.error("보고서 다운로드 URL 변환 실패:", error);
      return rawUrl;
    }
  };

  const handleDownloadReport = async () => {
    if (!id) return;

    try {
      setIsDownloadingReport(true);
      const response = await apiRequest(`/admin/reports?eventId=${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "행사 보고서 다운로드에 실패했습니다.");
      }

      const data: EventReportResponse = await response.json();
      const status = data.status ? data.status.toUpperCase() : "";

      if (status === "FAILED") {
        throw new Error("보고서 집계가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.");
      }

      if (status === "READY" && data.downloadUrl) {
        const downloadUrl = buildDownloadUrl(data.downloadUrl);
        const anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.click();
        return;
      }

      alert("보고서를 준비 중입니다. 잠시 후 다시 시도해주세요.");
    } catch (err) {
      console.error("행사 보고서 다운로드 실패:", err);
      const message = err instanceof Error ? err.message : "행사 보고서 다운로드에 실패했습니다.";
      alert(message);
    } finally {
      setIsDownloadingReport(false);
    }
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

  const calculateTotalAppliedCount = (options: EventOption[]): number => {
    let total = 0;
    const traverse = (opts: EventOption[]) => {
      for (const opt of opts) {
        if (opt.children && opt.children.length > 0) {
          traverse(opt.children);
        } else if (opt.appliedCount !== null && opt.appliedCount !== undefined) {
          total += opt.appliedCount;
        }
      }
    };
    traverse(options);
    return total;
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

  const isEventCompleted = (status: string): boolean => {
    return mapApiStatusToDisplayStatus(status) === "completed";
  };

  const isEventArchived = (status: string): boolean => {
    return mapApiStatusToDisplayStatus(status) === "deleted";
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = mapApiStatusToDisplayStatus(status);
    switch (displayStatus) {
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


  const OptionTreeItem: React.FC<{ option: EventOption; depth: number }> = ({ option, depth }) => {
    const hasChildren = option.children && option.children.length > 0;
    const isLeaf = !hasChildren;

    return (
      <div className={`${styles["option-tree-item"]} ${depth === 0 ? styles["option-category"] : styles["option-child"]}`}>
        <div className={styles["option-item-row"]}>
          <div className={styles["option-name-wrapper"]}>
            <span className={styles["option-equals-icon"]}>=</span>
            <span className={styles["option-name"]}>{option.name}</span>
          </div>
          <div className={styles["option-right-section"]}>
            {isLeaf && (
              <span className={styles["option-quantity"]}>
                수량: {option.appliedCount !== null && option.appliedCount !== undefined ? option.appliedCount : 0}/{option.capacity !== null && option.capacity !== undefined ? option.capacity : 0}
              </span>
            )}
          </div>
        </div>
        {hasChildren && (
          <div className={styles["option-children"]}>
            {option.children
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((child) => (
                <OptionTreeItem key={child.optionId} option={child} depth={depth + 1} />
              ))}
          </div>
        )}
      </div>
    );
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

  const getSortedImages = (): EventImage[] => {
    if (eventData?.images && eventData.images.length > 0) {
      return [...eventData.images].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [];
  };

  const getMainImage = (): string => {
    const sortedImages = getSortedImages();
    if (sortedImages.length > 0) {
      return sortedImages[0].url;
    }
    return imgImg;
  };

  const mainImage = getMainImage();

  const handleImageClick = () => {
    if (getSortedImages().length > 0) {
      setSelectedImageIndex(0);
      setIsImageModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  const handlePrevImage = () => {
    const images = getSortedImages();
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    const images = getSortedImages();
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCloseModal();
    } else if (e.key === "ArrowLeft") {
      handlePrevImage();
    } else if (e.key === "ArrowRight") {
      handleNextImage();
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const totalCapacity = calculateTotalCapacity(eventData.options);
  const totalAppliedCount = calculateTotalAppliedCount(eventData.options);
  const totalRemainingCount = totalCapacity - totalAppliedCount;
  const isCompletedEvent = isEventCompleted(eventData.status);

  return (
    <div className={styles["event-detail-page"]}>
      <PageHeader title="행사 상세정보" />

      <div className={styles["event-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-detail-content"]}>
          {/* 행사 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div
              className={styles["event-hero-image"]}
              onClick={handleImageClick}
              style={{ cursor: getSortedImages().length > 0 ? "pointer" : "default" }}
            >
              <img src={mainImage} alt={eventData.images[0]?.altText || "행사 이미지"} />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
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
                  <p className={styles["result-number"]}>{totalAppliedCount}</p>
                  <p className={styles["result-label"]}>신청 참가자 수</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="정원 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>{totalCapacity}</p>
                  <p className={styles["result-label"]}>전체 정원</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="잔여 정원 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>{totalRemainingCount}</p>
                  <p className={styles["result-label"]}>잔여 정원</p>
                </div>
              </div>
            </div>
          </div>

          {/* 환경 임팩트 섹션 */}
          <div className={styles["event-impact-section"]}>
            <h3 className={styles["section-title"]}>환경 임팩트</h3>
            {eventData.impactAnalytics?.available ? (
              <div className={styles["impact-grid"]}>
                <div className={styles["impact-item"]}>
                  <div className={`${styles["impact-icon"]} ${styles["co2-icon"]}`}>
                    <img src={co2Icon} alt="CO2 아이콘" />
                  </div>
                  <div className={styles["impact-content"]}>
                    <p className={styles["impact-number"]}>
                      {eventData.impactAnalytics.co2Saved !== null && eventData.impactAnalytics.co2Saved !== undefined
                        ? Math.round(eventData.impactAnalytics.co2Saved).toLocaleString()
                        : 0}
                    </p>
                    <p className={styles["impact-label"]}>CO2 절감량 (kg)</p>
                  </div>
                </div>
                <div className={styles["impact-item"]}>
                  <div className={`${styles["impact-icon"]} ${styles["water-icon"]}`}>
                    <img src={waterIcon} alt="물 아이콘" />
                  </div>
                  <div className={styles["impact-content"]}>
                    <p className={styles["impact-number"]}>
                      {eventData.impactAnalytics.waterSaved !== null && eventData.impactAnalytics.waterSaved !== undefined
                        ? Math.round(eventData.impactAnalytics.waterSaved).toLocaleString()
                        : 0}
                    </p>
                    <p className={styles["impact-label"]}>물 절약량 (L)</p>
                  </div>
                </div>
                <div className={styles["impact-item"]}>
                  <div className={`${styles["impact-icon"]} ${styles["energy-icon"]}`}>
                    <img src={energyIcon} alt="에너지 아이콘" />
                  </div>
                  <div className={styles["impact-content"]}>
                    <p className={styles["impact-number"]}>
                      {eventData.impactAnalytics.energySaved !== null && eventData.impactAnalytics.energySaved !== undefined
                        ? Math.round(eventData.impactAnalytics.energySaved).toLocaleString()
                        : 0}
                    </p>
                    <p className={styles["impact-label"]}>에너지 절약량 (kWh)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles["impact-message"]}>
                <img src={imgFrame9} alt="알림 아이콘" />
                <p>{eventData.impactAnalytics?.message || "행사 종료 후 집계 예정입니다."}</p>
              </div>
            )}
          </div>

          {/* 행사 정보 섹션 */}
          <div className={styles["event-info-main-section"]}>
            <h3 className={styles["section-title"]}>행사 정보</h3>
            <div className={styles["info-list"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>상태</span>
                {getStatusBadge(eventData.status)}
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>주최자</span>
                <span className={styles["info-value"]}>{eventData.organizerName}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>연락처</span>
                <span className={styles["info-value"]}>{eventData.organizerContact}</span>
              </div>
            </div>
          </div>

          {/* 옵션 현황 섹션 */}
          {eventData.options && eventData.options.length > 0 && (
            <div className={styles["event-options-section"]}>
              <h3 className={styles["section-title"]}>옵션 현황</h3>
              <div className={styles["options-tree"]}>
                {eventData.options
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option) => (
                    <OptionTreeItem key={option.optionId} option={option} depth={0} />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 - 스태프 코드 발급 */}
        <div className={styles["event-detail-sidebar"]} ref={sidebarRef} style={{ alignSelf: "flex-start" }}>
          <div ref={sidebarInnerRef}>
            {!isEventArchived(eventData.status) && staffCodeError && staffCodeError.includes("담당자만") ? (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <h4 className={styles["staff-code-title"]}>스태프 코드</h4>
                  <p className={styles["staff-code-description"]} style={{ color: "#ef4444" }}>
                    {staffCodeError}
                  </p>
                </div>
              </div>
            ) : !isEventArchived(eventData.status) && isLoadingStaffCode ? (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <h4 className={styles["staff-code-title"]}>스태프 코드</h4>
                  <p className={styles["staff-code-description"]}>로딩 중...</p>
                </div>
              </div>
            ) : !isEventArchived(eventData.status) && staffCode ? (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <h4 className={styles["staff-code-title"]}>스태프 코드</h4>
                  <p className={styles["staff-code-description"]}>발급된 스태프 코드</p>
                </div>
                <div className={styles["staff-code-display"]}>
                  <div className={styles["staff-code-value-wrapper"]}>
                    <p className={styles["staff-code-value"]}>{staffCode}</p>
                    <button
                      className={styles["staff-code-copy-button"]}
                      onClick={handleCopyCode}
                      title="코드 복사"
                    >
                      복사
                    </button>
                  </div>
                  {staffCodeIssuedAt && (
                    <p className={styles["staff-code-issued"]}>
                      발급일: {formatDateTimeLocal(staffCodeIssuedAt)}
                    </p>
                  )}
                </div>
                <button
                  className={styles["staff-code-button"]}
                  onClick={handleReissueClick}
                  disabled={isIssuingCode}
                >
                  {isIssuingCode ? "발급 중..." : "재발급"}
                </button>
                <div className={styles["staff-code-notice"]}>
                  <img src={imgFrame9} alt="알림 아이콘" />
                  <p>재발급 시 이전 코드는 즉시 무효화됩니다</p>
                </div>
              </div>
            ) : !isEventArchived(eventData.status) ? (
              <div className={styles["staff-code-section"]}>
                <div className={styles["staff-code-content"]}>
                  <h4 className={styles["staff-code-title"]}>스태프 코드 발급</h4>
                  <p className={styles["staff-code-description"]}>행사 운영진을 위한 전용 코드를 발급받으세요</p>
                </div>
                <button
                  className={styles["staff-code-button"]}
                  onClick={handleLoadOrIssueStaffCode}
                  disabled={isIssuingCode || isLoadingStaffCode}
                >
                  {isIssuingCode || isLoadingStaffCode ? "처리 중..." : "스태프 코드 조회/발급"}
                </button>
                <div className={styles["staff-code-notice"]}>
                  <img src={imgFrame9} alt="알림 아이콘" />
                  <p>코드는 행사 당일에만 유효합니다</p>
                </div>
              </div>
            ) : null}

            {/* 행사 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>행사 정보</h4>
              <div className={styles["info-list"]}>
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
              {isEventArchived(eventData.status) && (
                <div className={`${styles["staff-code-notice"]} ${styles["archived-notice"]}`} style={{ marginTop: "24px" }}>
                  <img src={imgFrame9} alt="알림 아이콘" />
                  <p>삭제된 행사입니다</p>
                </div>
              )}
            </div>

            {!isEventArchived(eventData.status) && (
              <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                {isCompletedEvent && (
                  <button
                    className={`${styles["edit-button"]} ${styles["download-button"]}`}
                    onClick={handleDownloadReport}
                    disabled={isDownloadingReport}
                  >
                    <img src={reportIcon} alt="보고서 다운로드 아이콘" />
                    {isDownloadingReport ? "다운로드 중..." : "보고서 다운로드"}
                  </button>
                )}
                {!isCompletedEvent && (
                  <button
                    className={styles["edit-button"]}
                    onClick={() => navigate(`/events/${id}/edit`)}
                  >
                    <img src={editIcon} alt="수정 아이콘" />
                    수정하기
                  </button>
                )}
                <button
                  className={`${styles["edit-button"]} ${styles["participants-button"]}`}
                  onClick={() => navigate(`/events/${id}/participants`)}
                >
                  <img src="/admin/img/icon/users.svg" alt="참가 신청 관리 아이콘" />
                  참가 신청 관리
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showIssueModal}
        title="스태프 코드 발급"
        message="스태프 코드를 발급하시겠습니까?"
        confirmText="발급"
        cancelText="취소"
        onConfirm={handleIssueConfirm}
        onCancel={() => setShowIssueModal(false)}
        type="default"
      />

      <ConfirmModal
        isOpen={showReissueModal}
        title="스태프 코드 재발급"
        message="스태프 코드를 재발급하시겠습니까? 재발급 시 이전 코드는 즉시 무효화됩니다."
        confirmText="재발급"
        cancelText="취소"
        onConfirm={handleReissueConfirm}
        onCancel={() => setShowReissueModal(false)}
        type="default"
      />

      {/* 이미지 갤러리 모달 */}
      {isImageModalOpen && (
        <div
          className={styles["image-modal-overlay"]}
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className={styles["image-modal-container"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["modal-title"]}>확대보기</h2>
            <div className={styles["modal-main-content"]}>
              <div className={styles["modal-image-wrapper"]}>
                {getSortedImages().length > 0 && (
                  <>
                    <img
                      src={getSortedImages()[selectedImageIndex].url}
                      alt={getSortedImages()[selectedImageIndex].altText || `행사 이미지 ${selectedImageIndex + 1}`}
                      className={styles["modal-image"]}
                    />
                    {getSortedImages().length > 1 && (
                      <>
                        <button className={styles["modal-nav-btn"]} onClick={handlePrevImage} style={{ left: "20px" }}>
                          ‹
                        </button>
                        <button className={styles["modal-nav-btn"]} onClick={handleNextImage} style={{ right: "20px" }}>
                          ›
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              {getSortedImages().length > 1 && (
                <div className={styles["modal-thumbnails"]}>
                  {getSortedImages().map((image, index) => (
                    <div
                      key={image.imageId}
                      className={`${styles["modal-thumbnail"]} ${index === selectedImageIndex ? styles["active"] : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img src={image.url} alt={image.altText || `썸네일 ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className={styles["modal-close-button"]} onClick={handleCloseModal}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
