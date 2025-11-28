import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ParticipantEdit.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "../../../../utils/api";

const ICONS = {
  back: "/admin/img/icon/back-arrow.svg",
  bell: "/admin/img/icon/bell-icon.svg",
  avatar: "/admin/img/example/admin-avatar.png",
  user: "/admin/img/icon/user-icon.svg",
  ticket: "/admin/img/icon/ticket-badge.svg",
  credit: "/admin/img/icon/credit-icon.svg",
  mascot: "/admin/img/icon/mascot-icon.svg",
  scissor: "/admin/img/icon/scissor-tool.svg",
  minus: "/admin/img/icon/minus-icon.svg",
  plus: "/admin/img/icon/plus-icon.svg",
  save: "/admin/img/icon/save-icon.svg",
};

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
}

const ParticipantEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participant, setParticipant] = useState<ParticipantDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [ticketBalance, setTicketBalance] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchParticipant = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(`/admin/participants/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("참가자 정보 조회에 실패했습니다.");
      }

      const data: ParticipantDetailResponse = await response.json();
      setParticipant(data);
      setName(data.name);
      setTicketBalance(data.ticketBalance);
      setCreditBalance(data.creditBalance);
    } catch (error) {
      console.error("Error fetching participant:", error);
      alert("참가자 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParticipant();
  }, [fetchParticipant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (ticketBalance < 0 || creditBalance < 0) {
      alert("티켓 수와 크레딧은 0 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest(`/admin/participants/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          ticketBalance,
          creditBalance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errorCode === "U1003") {
          alert("참가자 정보 수정 기능은 현재 사용할 수 없습니다.");
        } else {
          throw new Error(errorData.message || "참가자 정보 수정에 실패했습니다.");
        }
        return;
      }

      alert("참가자 정보가 수정되었습니다.");
      navigate(`/repair/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "참가자 정보 수정에 실패했습니다.";
      alert(errorMessage);
      console.error("Error updating participant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles["participant-edit-page"]}>
        <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className={styles["participant-edit-page"]}>
        <div style={{ padding: "40px", textAlign: "center" }}>참가자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles["participant-edit-page"]}>
      <PageHeader title="참가자 정보 수정" subtitle="참가자의 게임 정보를 수정하고 관리하세요" />

      <main className={styles["edit-content"]}>
        <section className={`${styles["section"]} ${styles["basic-info"]}`}>
          <div className={styles["section-title"]}>
            <div className={`${styles["title-icon"]} ${styles["gradient"]}`}>
              <img src={ICONS.user} alt="사용자" />
            </div>
            <div className={styles["title-text"]}>
              <h2>기본 정보</h2>
              <p>참가자의 기본 정보를 확인하고 수정하세요</p>
            </div>
          </div>
          <div className={styles["form-grid"]}>
            <div className={styles["form-group"]}>
              <label>참가자 이름</label>
              <div className={styles["input-with-icon"]}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <img src={ICONS.user} alt="이름" />
              </div>
            </div>
            <div className={styles["form-group"]}>
              <label>티켓 수</label>
              <div className={styles["input-with-icon"]}>
                <input
                  type="number"
                  value={ticketBalance}
                  onChange={(e) => setTicketBalance(Number(e.target.value))}
                  min="0"
                />
                <img src={ICONS.ticket} alt="티켓" />
              </div>
            </div>
            <div className={`${styles["form-group"]} ${styles["full"]}`}>
              <label>크레딧</label>
              <div className={styles["input-with-icon"]}>
                <input
                  type="number"
                  value={creditBalance}
                  onChange={(e) => setCreditBalance(Number(e.target.value))}
                  min="0"
                />
                <img src={ICONS.credit} alt="크레딧" />
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles["section"]} ${styles["grow-info"]}`}>
          <div className={styles["section-title"]}>
            <div className={`${styles["title-icon"]} ${styles["gradient"]} ${styles["alt"]}`}>
              <img src={ICONS.mascot} alt="마스코트" />
            </div>
            <div className={styles["title-text"]}>
              <h2>옷 키우기 (마스코트)</h2>
              <p>마스코트의 성장 정보를 관리하세요</p>
            </div>
          </div>

          <div className={`${styles["card"]} ${styles["inline"]}`}>
            <div className={styles["tool"]}>
              <div className={styles["tool-icon"]}>
                <img src={ICONS.scissor} alt="가위" />
              </div>
              <div className={styles["tool-text"]}>
                <h3>마법의 가위</h3>
                <p>마스코트 레벨업 도구</p>
              </div>
              <div className={styles["tool-count"]}>
                <strong>23개</strong>
                <span>보유 수량</span>
              </div>
            </div>
            <div className={styles["tool-adjust"]}>
              <label>수량 조정:</label>
              <div className={styles["adjust-controls"]}>
                <button className={`${styles["btn"]} ${styles["minus"]}`} type="button" aria-label="감소">
                  <img src={ICONS.minus} alt="감소" />
                </button>
                <input type="number" defaultValue={23} />
                <button className={`${styles["btn"]} ${styles["plus"]}`} type="button" aria-label="증가">
                  <img src={ICONS.plus} alt="증가" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className={styles["actions"]}>
          <button className={styles["save-btn"]} onClick={handleSubmit} disabled={isSubmitting}>
            <img src={ICONS.save} alt="저장" />
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ParticipantEdit;
