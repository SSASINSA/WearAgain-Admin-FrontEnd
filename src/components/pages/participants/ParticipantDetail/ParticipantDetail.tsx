import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ParticipantDetail.module.css";
import apiRequest from "../../../../utils/api";

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
  mascot: {
    level: number;
    exp: number;
    nextLevelExp: number;
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
      console.error("Error fetching participant:", error);
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
                <img
                  className={`${styles["avatar"]} ${styles["large"]}`}
                  src={participant.avatarUrl || "/admin/img/icon/basic-profile.svg"}
                  alt={participant.name}
                />
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
                        width: `${participant.mascot.nextLevelExp > 0 ? (participant.mascot.exp / participant.mascot.nextLevelExp) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className={styles["progress-text"]}>
                    다음 레벨까지{" "}
                    {participant.mascot.nextLevelExp > 0
                      ? Math.round((participant.mascot.exp / participant.mascot.nextLevelExp) * 100)
                      : 0}
                    %
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
          {/* 획득한 옷 섹션 */}
          <section className={`${styles["section"]} ${styles["clothes-section"]}`}>
            <h3>획득한 옷</h3>
            <div className={styles["clothes-grid"]}>
              <div className={styles["clothes-item"]}>
                <img src="/admin/img/example/clothes-tshirt.png" alt="친환경 티셔츠" />
                <p>친환경 티셔츠</p>
              </div>
              <div className={styles["clothes-item"]}>
                <img src="/admin/img/example/clothes-jeans.png" alt="지속가능 청바지" />
                <p>지속가능 청바지</p>
              </div>
              <div className={styles["clothes-item"]}>
                <img src="/admin/img/example/clothes-shoes.png" alt="재활용 운동화" />
                <p>재활용 운동화</p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ParticipantDetail;
