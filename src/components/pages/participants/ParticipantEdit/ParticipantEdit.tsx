import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ParticipantEdit.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";

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

const ParticipantEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
                <input type="text" defaultValue="김철수" />
                <img src={ICONS.user} alt="이름" />
              </div>
            </div>
            <div className={styles["form-group"]}>
              <label>티켓 수</label>
              <div className={styles["input-with-icon"]}>
                <input type="number" defaultValue={15} />
                <img src={ICONS.ticket} alt="티켓" />
              </div>
            </div>
            <div className={`${styles["form-group"]} ${styles["full"]}`}>
              <label>크레딧</label>
              <div className={styles["input-with-icon"]}>
                <input type="number" defaultValue={2500} />
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
          <button className={styles["save-btn"]}>
            <img src={ICONS.save} alt="저장" />
            저장하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default ParticipantEdit;
