import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventApprovalDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";

const imgImg = "/admin/img/example/event-hero.png";
const imgFrame1 = "/admin/img/icon/date-time.svg";
const imgFrame2 = "/admin/img/icon/location-pin.svg";
const approveIcon = "/admin/img/icon/check-approve.svg";
const rejectIcon = "/admin/img/icon/x-reject.svg";

const EventApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

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

  const handleApproveConfirm = () => {
    console.log("승인:", id);
    alert("행사가 승인되었습니다.");
    navigate("/events/approval");
  };

  const handleRejectConfirm = () => {
    console.log("거부:", id);
    alert("행사가 거부되었습니다.");
    navigate("/events/approval");
  };

  const handleModalCancel = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
  };

  return (
    <div className={styles["event-approval-detail-page"]}>
      <PageHeader title="행사등록 승인 상세" />

      <div className={styles["event-approval-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-approval-detail-content"]}>
          {/* 행사 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div className={styles["event-hero-image"]}>
              <img src={imgImg} alt="행사 이미지" />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                <span className={`${styles["tag"]} ${styles["environment"]}`}>환경보호</span>
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>워크샵</span>
              </div>
              <h2 className={styles["event-title"]}>제로웨이스트 라이프스타일 워크샵</h2>
              <p className={styles["event-description"]}>
                일상생활에서 실천할 수 있는 제로웨이스트 방법을 배우고, 지속가능한 라이프스타일을 시작 해보세요. 전문
                강사와 함께하는 실습 중심의 워크샵으로 친환경 제품 만들기와 생활 속 실천 방법을 익힐 수 있습니다.
              </p>
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
                  <p className={styles["detail-label"]}>날짜 및 시간</p>
                  <p className={styles["detail-value"]}>2024년 3월 15일 (금)</p>
                  <p className={styles["detail-value"]}>오후 2:00 - 5:00 (3시간)</p>
                </div>
              </div>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame2} alt="위치 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>위치</p>
                  <p className={styles["detail-value"]}>서울시 강남구 테헤란로 123</p>
                  <p className={styles["detail-value"]}>그린센터 2층 컨퍼런스룸</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 방법 섹션 */}
          <div className={styles["event-usage-section"]}>
            <h3 className={styles["section-title"]}>이용 방법</h3>
            <ul className={styles["usage-list"]}>
              <li>깨끗한 옷을 행사장으로 들고옵니다.</li>
              <li>행사장 입구에서 가져온 옷을 QR을 통해 등록합니다.</li>
              <li>등록 후 교환 티켓이 잘 들어왔는지 확인합니다.</li>
              <li>교환 티켓 만큼 행사장에 있는 옷들을 고릅니다.</li>
              <li>교환 존에서 담당자에게 QR 제시 후 수령합니다.</li>
            </ul>
          </div>

          {/* 주의사항 섹션 */}
          <div className={styles["event-precaution-section"]}>
            <h3 className={styles["section-title"]}>주의사항</h3>
            <ul className={styles["precaution-list"]}>
              <li>가져온 옷은 반드시 세탁 필수!</li>
              <li>행사장 내에서 음식물 섭취는 제한 될 수 있습니다.</li>
            </ul>
          </div>
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
                  <span className={`${styles["info-value"]} ${styles["status-pending"]}`}>승인 대기</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>카테고리</span>
                  <span className={styles["info-value"]}>환경보호</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>주최자</span>
                  <span className={styles["info-value"]}>그린라이프</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>참가비</span>
                  <span className={styles["info-value"]}>무료</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록자</span>
                  <span className={styles["info-value"]}>김관리자</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>등록일</span>
                  <span className={styles["info-value"]}>2024.03.10</span>
                </div>
              </div>
            </div>

            {/* 승인/거부 액션 섹션 */}
            <div className={styles["approval-actions-section"]}>
              <button className={styles["approve-button"]} onClick={handleApproveClick}>
                <img src={approveIcon} alt="승인 아이콘" />
                행사 승인
              </button>
              <button className={styles["reject-button"]} onClick={handleRejectClick}>
                <img src={rejectIcon} alt="거부 아이콘" />
                행사 거부
              </button>
            </div>
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
    </div>
  );
};

export default EventApprovalDetail;

