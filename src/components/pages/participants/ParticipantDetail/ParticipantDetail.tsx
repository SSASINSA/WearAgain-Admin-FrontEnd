import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ParticipantDetail.module.css";
import apiRequest from "../../../../utils/api";

interface RecentEvent {
  eventId: number;
  title: string;
  thumbnailUrl: string | null;
  status: "APPLIED" | "CHECKED_IN";
  startDate: string;
  endDate: string;
  appliedAt: string;
}

interface ParticipantDetailResponse {
  participantId: number;
  name: string;
  email: string;
  avatarUrl: string;
  ticketBalance: number;
  creditBalance: number;
  suspended: boolean;
  joinedAt: string | null;
  updatedAt: string | null;
  impact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
  recentEvents: RecentEvent[];
  mascot: {
    level: number;
    exp: number;
    nextLevelExp: number;
    expProgressPercent: number;
    magicScissorCount: number;
    cycles: number;
  } | null;
}

const ParticipantDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participant, setParticipant] = useState<ParticipantDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [ticketBalance, setTicketBalance] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [ticketBalanceInput, setTicketBalanceInput] = useState<string>("");
  const [creditBalanceInput, setCreditBalanceInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchParticipant = useCallback(async () => {
    if (!id) {
      setError("참가자 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/admin/participants/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("참가자 상세 정보 조회에 실패했습니다.");
      }

      const data: ParticipantDetailResponse = await response.json();
      setParticipant(data);
    } catch (error) {
      console.error("참가자 정보 조회 실패:", error);
      setError("참가자 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParticipant();
  }, [fetchParticipant]);

  const impactRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const syncHeights = () => {
      const container = impactRef.current;
      if (!container) return;
      const cards = container.querySelectorAll<HTMLDivElement>(`.${styles["impact-card"]}`);
      cards.forEach((card) => {
        const width = card.clientWidth;
        card.style.height = `${width}px`;
      });
    };
    syncHeights();
    window.addEventListener("resize", syncHeights);
    return () => window.removeEventListener("resize", syncHeights);
  }, []);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const formatDateTimeLocal = (utcDateString: string): string => {
    const date = new Date(utcDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const getEventStatusText = (status: string): string => {
    switch (status) {
      case "APPLIED":
        return "신청 완료";
      case "CHECKED_IN":
        return "체크인 완료";
      default:
        return status;
    }
  };

  const handleOpenEditModal = () => {
    if (participant) {
      setTicketBalance(participant.ticketBalance);
      setCreditBalance(participant.creditBalance);
      setTicketBalanceInput(participant.ticketBalance.toString());
      setCreditBalanceInput(participant.creditBalance.toString());
      setModalError(null);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setModalError(null);
  };

  const handleSubmitEdit = async () => {
    if (!id || !participant) return;

    if (ticketBalance < 0 || creditBalance < 0) {
      setModalError("티켓 수와 크레딧은 0 이상이어야 합니다.");
      return;
    }

    if (ticketBalance === participant.ticketBalance && creditBalance === participant.creditBalance) {
      setModalError("변경된 내용이 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const requestBody: { ticketBalance?: number; creditBalance?: number } = {};
      if (ticketBalance !== participant.ticketBalance) {
        requestBody.ticketBalance = ticketBalance;
      }
      if (creditBalance !== participant.creditBalance) {
        requestBody.creditBalance = creditBalance;
      }

      const response = await apiRequest(`/admin/participants/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errorCode === "U1002") {
          setModalError("티켓 수 또는 크레딧 중 하나 이상을 입력해주세요.");
        } else if (errorData.errorCode === "U1001") {
          setModalError("참가자를 찾을 수 없습니다.");
        } else {
          setModalError(errorData.message || "참가자 정보 수정에 실패했습니다.");
        }
        return;
      }

      setIsEditModalOpen(false);
      fetchParticipant();
    } catch (error) {
      console.error("참가자 정보 수정 실패:", error);
      setModalError("참가자 정보 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles["participant-detail-page"]}>
        <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className={styles["participant-detail-page"]}>
        <div style={{ padding: "40px", textAlign: "center" }}>
          {error || "참가자 정보를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["participant-detail-page"]}>
      <header className={styles["detail-header"]}>
        <button className={styles["back-btn"]} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src="/admin/img/icon/back-arrow.svg" alt="뒤로가기" />
        </button>
        <div className={styles["header-content"]}>
          <div className={styles["header-info"]}>
            <h1>참가자 상세</h1>
            <p>참가자 정보를 확인하고 관리하세요</p>
          </div>
        </div>
      </header>

      <main className={styles["detail-content"]}>
        {/* 상단 섹션 */}
        <section className={styles["top-section"]}>
          <div className={styles["top-left"]}>
            {/* 참가자 요약 카드 */}
            <section className={`${styles["section"]} ${styles["summary-card"]}`}>
              <div className={styles["summary-left"]}>
                {participant.avatarUrl && (
                  <img
                    className={`${styles["avatar"]} ${styles["large"]}`}
                    src={participant.avatarUrl}
                    alt={participant.name}
                  />
                )}
                <div className={styles["summary-meta"]}>
                  <h2 className={styles["summary-name"]}>{participant.name}</h2>
                  <div className={styles["inline-stats"]}>
                    <span className={styles["chip"]}>
                      <img src="/admin/img/icon/ticket-icon.svg" alt="티켓" />
                      티켓 {participant.ticketBalance}장
                    </span>
                    <span className={styles["chip"]}>
                      <img src="/admin/img/icon/credit-icon.svg" alt="크레딧" />
                      크레딧 {participant.creditBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button className={styles["edit-button"]} onClick={handleOpenEditModal} aria-label="참가자 정보 수정">
                <img src="/admin/img/icon/edit.svg" alt="수정" />
                수정
              </button>
            </section>

            {/* 환경 임팩트 기록 섹션 */}
            <section className={`${styles["section"]} ${styles["impact-section"]}`} ref={impactRef}>
              <h3>환경 임팩트 기록</h3>
              <div className={styles["impact-cards"]}>
                <div className={`${styles["impact-card"]} ${styles["green"]}`}>
                  <div className={styles["impact-icon"]}>
                    <img src="/admin/img/icon/co2-impact.svg" alt="CO2" />
                  </div>
                  <div className={styles["impact-title"]}>CO2 절감량</div>
                  <div className={`${styles["impact-value"]} ${styles["green"]}`}>
                    {participant.impact.co2Saved.toFixed(2)}
                  </div>
                  <div className={styles["impact-unit"]}>kg</div>
                </div>
                <div className={`${styles["impact-card"]} ${styles["yellow"]}`}>
                  <div className={styles["impact-icon"]}>
                    <img src="/admin/img/icon/energy-impact.svg" alt="에너지" />
                  </div>
                  <div className={styles["impact-title"]}>에너지 절감량</div>
                  <div className={`${styles["impact-value"]} ${styles["yellow"]}`}>
                    {participant.impact.energySaved.toFixed(2)}
                  </div>
                  <div className={styles["impact-unit"]}>kWh</div>
                </div>
                <div className={`${styles["impact-card"]} ${styles["blue"]}`}>
                  <div className={styles["impact-icon"]}>
                    <img src="/admin/img/icon/water-impact.svg" alt="물 절약" />
                  </div>
                  <div className={styles["impact-title"]}>물 절약량</div>
                  <div className={`${styles["impact-value"]} ${styles["blue"]}`}>
                    {participant.impact.waterSaved.toFixed(2)}
                  </div>
                  <div className={styles["impact-unit"]}>L</div>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles["top-right"]}>
            {/* 옷 키우기 섹션 */}
            <section className={`${styles["section"]} ${styles["grow-card"]}`}>
              <h3>옷 키우기</h3>
              {participant.mascot ? (
                <>
                  <div className={styles["grow-hero"]}>
                    <img src="/admin/img/example/grow-hero.svg" alt="캐릭터" />
                  </div>
                  <div className={styles["level"]}>레벨 {participant.mascot.level}</div>
                  <div className={styles["progress-bar"]}>
                    <div
                      className={styles["progress"]}
                      style={{
                        width: `${participant.mascot.expProgressPercent}%`,
                      }}
                    />
                  </div>
                  <div className={styles["progress-text"]}>
                    다음 레벨까지 {Math.round(participant.mascot.expProgressPercent)}%
                  </div>
                  <div className={styles["scissor-box"]}>
                    <div className={styles["label"]}>
                      <img src="/admin/img/icon/scissor-icon.svg" alt="가위" />
                      레벨업 가위
                    </div>
                    <div className={styles["value"]}>{participant.mascot.magicScissorCount}개</div>
                  </div>
                </>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  마스코트 정보가 없습니다.
                </div>
              )}
            </section>
          </aside>
        </section>

        {/* 하단 섹션 */}
        <section className={styles["bottom-section"]}>
          {/* 참여한 행사 섹션 */}
          <section className={`${styles["section"]} ${styles["clothes-section"]}`}>
            <h3>참여한 행사</h3>
            {participant.recentEvents && participant.recentEvents.length > 0 ? (
              <div className={styles["clothes-grid"]}>
                {participant.recentEvents.map((event) => (
                  <div
                    key={event.eventId}
                    className={styles["clothes-item"]}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/events/${event.eventId}`)}
                  >
                    <div className={styles["event-thumbnail"]}>
                      {event.thumbnailUrl ? (
                        <img
                          src={event.thumbnailUrl}
                          alt={event.title}
                          className={styles["event-thumbnail-image"]}
                        />
                      ) : (
                        <div className={styles["event-thumbnail-placeholder"]}>
                          <img
                            src="/admin/img/icon/calendar.svg"
                            alt="행사"
                            className={styles["event-thumbnail-icon"]}
                          />
                        </div>
                      )}
                    </div>
                    <p className={styles["event-title"]}>{event.title}</p>
                    <div className={styles["event-meta"]}>
                      <span
                        className={`${styles["event-status-badge"]} ${
                          event.status === "CHECKED_IN" ? styles["checked-in"] : styles["applied"]
                        }`}
                      >
                        {getEventStatusText(event.status)}
                      </span>
                      <p className={styles["event-date"]}>
                        {formatDateRange(event.startDate, event.endDate)}
                      </p>
                      <p className={styles["event-applied-at"]}>
                        {formatDateTimeLocal(event.appliedAt)} 신청
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles["no-events-message"]}>
                최근 90일 내 신청 이력이 없습니다
              </div>
            )}
          </section>
        </section>
      </main>

      {/* 수정 모달 */}
      {isEditModalOpen &&
        createPortal(
          <div className={styles["edit-modal-overlay"]} onClick={handleCloseEditModal}>
            <div className={styles["edit-modal-content"]} onClick={(e) => e.stopPropagation()}>
              <div className={styles["edit-modal-header"]}>
                <h2 className={styles["edit-modal-title"]}>참가자 잔액 조정</h2>
                <button className={styles["edit-modal-close"]} onClick={handleCloseEditModal} aria-label="닫기">
                  ×
                </button>
              </div>
              <div className={styles["edit-modal-body"]}>
                {modalError && <div className={styles["edit-modal-error"]}>{modalError}</div>}
                <div className={styles["edit-form-group"]}>
                  <label htmlFor="ticketBalance">티켓 수</label>
                  <input
                    id="ticketBalance"
                    type="number"
                    value={ticketBalanceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTicketBalanceInput(value);
                      const numValue = value === "" ? 0 : Math.max(0, Number(value));
                      setTicketBalance(numValue);
                    }}
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        setTicketBalanceInput("");
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "" || e.target.value === "0") {
                        setTicketBalanceInput("0");
                        setTicketBalance(0);
                      }
                    }}
                    min="0"
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles["edit-form-group"]}>
                  <label htmlFor="creditBalance">크레딧</label>
                  <input
                    id="creditBalance"
                    type="number"
                    value={creditBalanceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCreditBalanceInput(value);
                      const numValue = value === "" ? 0 : Math.max(0, Number(value));
                      setCreditBalance(numValue);
                    }}
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        setCreditBalanceInput("");
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "" || e.target.value === "0") {
                        setCreditBalanceInput("0");
                        setCreditBalance(0);
                      }
                    }}
                    min="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className={styles["edit-modal-footer"]}>
                <button
                  className={`${styles["edit-modal-btn"]} ${styles["cancel-btn"]}`}
                  onClick={handleCloseEditModal}
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  className={`${styles["edit-modal-btn"]} ${styles["confirm-btn"]}`}
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ParticipantDetail;
