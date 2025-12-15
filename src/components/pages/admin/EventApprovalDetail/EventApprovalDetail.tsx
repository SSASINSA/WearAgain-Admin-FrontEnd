import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventApprovalDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import ImageGalleryModal, { GalleryImage } from "../../../common/ImageGalleryModal/ImageGalleryModal";
import apiRequest from "utils/api";

const imgImg = "/admin/img/example/event-hero.png";
const imgFrame1 = "/admin/img/icon/date-time.svg";
const imgFrame2 = "/admin/img/icon/location-pin.svg";
const approveIcon = "/admin/img/icon/check-approve.svg";
const rejectIcon = "/admin/img/icon/x-reject.svg";

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
  children: EventOption[];
}

interface EventApprovalRequestDetailResponse {
  approvalRequestId: number;
  createdAt: string;
  processedAt: string | null;
  requestingAdmin: {
    name: string;
    email: string;
  };
  processedByAdmin: {
    name: string;
    email: string;
  } | null;
  event: {
    eventId: number;
    title: string;
    description: string;
    usageGuide: string | null;
    precautions: string | null;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
    organizerName: string | null;
    organizerContact: string | null;
    organizerAdminId: number | null;
    organizerAdminEmail: string | null;
    organizerAdminName: string | null;
  };
  totalCapacity: number | null;
  optionDepth: number;
  images: EventImage[];
  options: EventOption[];
}

const EventApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalData, setApprovalData] = useState<EventApprovalRequestDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchApprovalDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest(`/admin/events/approvals/${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "승인 요청 상세 정보를 가져오는데 실패했습니다.");
        }

        const data: EventApprovalRequestDetailResponse = await response.json();
        setApprovalData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "승인 요청 상세 정보를 가져오는데 실패했습니다.";
        setError(errorMessage);
        console.error("승인 요청 상세 정보 조회 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovalDetail();
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

  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);

      const response = await apiRequest(`/admin/events/approvals/${id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "행사 승인에 실패했습니다.");
      }

      const data = await response.json();
      alert(data.message || "행사가 승인되었습니다.");
      setShowApproveModal(false);
      navigate("/events/approval");
    } catch (error) {
      console.error("행사 승인 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);

      const response = await apiRequest(`/admin/events/approvals/${id}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "행사 거부에 실패했습니다.");
      }

      const data = await response.json();
      alert(data.message || "행사 승인 요청이 거절되었습니다.");
      setShowRejectModal(false);
      navigate("/events/approval");
    } catch (error) {
      console.error("행사 거부 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalCancel = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
  };

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
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const getSortedImages = (): EventImage[] => {
    if (approvalData?.images && approvalData.images.length > 0) {
      return [...approvalData.images].sort((a, b) => a.displayOrder - b.displayOrder);
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

  const handleImageClick = () => {
    if (getSortedImages().length > 0) {
      setIsImageModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  const getGalleryImages = (): GalleryImage[] => {
    return getSortedImages().map((image) => ({
      id: image.imageId,
      url: image.url,
      altText: image.altText,
    }));
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
            {isLeaf && option.capacity !== null && (
              <span className={styles["option-quantity"]}>
                수량: {option.capacity}
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
      <div className={styles["event-approval-detail-page"]}>
        <PageHeader title="행사등록 승인 상세" />
        <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (error || !approvalData) {
    return (
      <div className={styles["event-approval-detail-page"]}>
        <PageHeader title="행사등록 승인 상세" />
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          {error || "승인 요청 정보를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["event-approval-detail-page"]}>
      <PageHeader title="행사등록 승인 상세" />

      <div className={styles["event-approval-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-approval-detail-content"]}>
          {/* 행사 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div
              className={styles["event-hero-image"]}
              onClick={handleImageClick}
              style={{ cursor: getSortedImages().length > 0 ? "pointer" : "default" }}
            >
              <img src={getMainImage()} alt={getSortedImages()[0]?.altText || "행사 이미지"} />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                <span className={`${styles["tag"]} ${styles["environment"]}`}>환경보호</span>
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>워크샵</span>
              </div>
              <h2 className={styles["event-title"]}>{approvalData.event.title}</h2>
              <p className={styles["event-description"]}>{approvalData.event.description}</p>
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
                    {formatDate(approvalData.event.startDate)} - {formatDate(approvalData.event.endDate)}
                  </p>
                </div>
              </div>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame2} alt="위치 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>위치</p>
                  <p className={styles["detail-value"]}>{approvalData.event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 방법 섹션 */}
          {approvalData.event.usageGuide && (
            <div className={styles["event-usage-section"]}>
              <h3 className={styles["section-title"]}>이용 방법</h3>
              <ul className={styles["usage-list"]}>
                {approvalData.event.usageGuide.split("\n").map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 주의사항 섹션 */}
          {approvalData.event.precautions && (
            <div className={styles["event-precaution-section"]}>
              <h3 className={styles["section-title"]}>주의사항</h3>
              <ul className={styles["precaution-list"]}>
                {approvalData.event.precautions.split("\n").map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 옵션 현황 섹션 */}
          {approvalData.options && approvalData.options.length > 0 && (
            <div className={styles["event-options-section"]}>
              <h3 className={styles["section-title"]}>옵션 현황</h3>
              <div className={styles["options-tree"]}>
                {approvalData.options
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option) => (
                    <OptionTreeItem key={option.optionId} option={option} depth={0} />
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* 사이드바 - 승인/거부 액션 */}
        <div className={styles["event-approval-detail-sidebar"]} ref={sidebarRef} style={{ alignSelf: "flex-start" }}>
          <div ref={sidebarInnerRef}>
            {/* 행사 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>행사 정보</h4>
              <div className={styles["info-list"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>상태</span>
                  <span className={`${styles["info-value"]} ${styles["status-pending"]}`}>
                    {approvalData.processedAt ? "처리됨" : "승인 대기"}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록자</span>
                  <span className={styles["info-value"]}>{approvalData.requestingAdmin.name}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록자 이메일</span>
                  <span className={styles["info-value"]}>{approvalData.requestingAdmin.email}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>요청일</span>
                  <span className={styles["info-value"]}>{formatDateTime(approvalData.createdAt)}</span>
                </div>
                {approvalData.totalCapacity !== null && (
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>전체 정원</span>
                    <span className={styles["info-value"]}>{approvalData.totalCapacity}명</span>
                  </div>
                )}
                {approvalData.processedAt && (
                  <>
                    <div className={styles["info-item"]}>
                      <span className={styles["info-label"]}>처리일</span>
                      <span className={styles["info-value"]}>{formatDateTime(approvalData.processedAt)}</span>
                    </div>
                    {approvalData.processedByAdmin && (
                      <div className={styles["info-item"]}>
                        <span className={styles["info-label"]}>처리자</span>
                        <span className={styles["info-value"]}>{approvalData.processedByAdmin.name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 승인/거부 액션 섹션 */}
            {!approvalData.processedAt && (
              <div className={styles["approval-actions-section"]}>
                <button
                  className={styles["approve-button"]}
                  onClick={handleApproveClick}
                  disabled={isProcessing}
                >
                  <img src={approveIcon} alt="승인 아이콘" />
                  {isProcessing ? "처리 중..." : "행사 승인"}
                </button>
                <button
                  className={styles["reject-button"]}
                  onClick={handleRejectClick}
                  disabled={isProcessing}
                >
                  <img src={rejectIcon} alt="거부 아이콘" />
                  {isProcessing ? "처리 중..." : "행사 거부"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showApproveModal}
        title="행사 승인"
        message="이 행사를 승인하시겠습니까?"
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApproveConfirm}
        onCancel={handleModalCancel}
        type="approve"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        title="행사 거부"
        message="이 행사를 거부하시겠습니까?"
        confirmText="거부"
        cancelText="취소"
        onConfirm={handleRejectConfirm}
        onCancel={handleModalCancel}
        type="reject"
      />

      <ImageGalleryModal
        isOpen={isImageModalOpen}
        images={getGalleryImages()}
        initialIndex={0}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default EventApprovalDetail;

