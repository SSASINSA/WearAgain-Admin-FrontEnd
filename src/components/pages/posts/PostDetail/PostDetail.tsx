import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./PostDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";

interface PostState {
  id: number;
  title: string;
  content: string;
  date: string;
  status: "active" | "inactive" | "reported";
  author: string;
}

const PostDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as Partial<PostState>;

  const handleBack = () => {
    navigate(-1);
  };

  const renderStatus = (status?: string) => {
    if (!status) return null;
    if (status === "active") return <span className={`${styles["status-badge"]} ${styles["active"]}`}>활성</span>;
    if (status === "inactive") return <span className={`${styles["status-badge"]} ${styles["inactive"]}`}>비활성</span>;
    if (status === "reported") return <span className={`${styles["status-badge"]} ${styles["reported"]}`}>신고됨</span>;
    return null;
  };

  const notFound = !state || !state.id;

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const headerOffsetPx = 120; // 고정 헤더 하단 여백
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
        // 고정 위치 계산
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
      // 레이아웃 변경 시 기준점 재계산
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

  return (
    <div className={styles["event-detail-page"]}>
      <PageHeader title="게시글 상세" subtitle="게시글의 상세 정보를 확인하고 관리할 수 있습니다" />

      <div className={styles["event-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-detail-content"]}>
          {/* 게시글 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div className={styles["event-hero-image"]}>
              <img src="/admin/img/example/event-hero.png" alt="게시글 대표 이미지" />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                {renderStatus(state.status)}
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>게시글</span>
              </div>
              <h2 className={styles["event-title"]}>{state.title || "게시글 제목"}</h2>
              <p className={styles["event-description"]}>{state.content || "게시글 내용이 없습니다."}</p>
            </div>
          </div>

          {/* 게시글 상세 정보 섹션 */}
          <div className={styles["event-details-section"]}>
            <h3 className={styles["section-title"]}>게시글 상세 정보</h3>
            <div className={`${styles["event-details-grid"]} ${styles["post-details-grid"]}`}>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>작성일</p>
                <p className={styles["detail-value"]}>{state.date || "-"}</p>
              </div>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>작성자</p>
                <p className={styles["detail-value"]}>{state.author || "-"}</p>
              </div>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>조회수</p>
                <p className={styles["detail-value"]}>1,256</p>
              </div>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>좋아요</p>
                <p className={styles["detail-value"]}>342</p>
              </div>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>댓글</p>
                <p className={styles["detail-value"]}>58</p>
              </div>
              <div className={`${styles["detail-item"]} ${styles["post-detail-item"]}`}>
                <p className={styles["detail-label"]}>공유</p>
                <p className={styles["detail-value"]}>21</p>
              </div>
            </div>
          </div>

          {/* 댓글 목록 섹션 */}
          <div className={styles["event-results-section"]}>
            <h3 className={styles["section-title"]}>댓글 목록</h3>
            <div className={styles["comments-list"]}>
              <div className={styles["comment-item"]}>
                <div className={styles["comment-author"]}>
                  <img src="/admin/img/icon/basic-profile.svg" alt="사용자 프로필" className={styles["comment-avatar"]} />
                  <div className={styles["comment-author-info"]}>
                    <p className={styles["comment-author-name"]}>김민수</p>
                    <p className={styles["comment-date"]}>2024-01-20 14:30</p>
                  </div>
                </div>
                <p className={styles["comment-text"]}>옷 교환 행사에 참가해봤는데 정말 좋은 경험이었어요! 환경도 지키고 새 옷도 얻을 수 있어서 일석이조네요.</p>
              </div>
              <div className={styles["comment-item"]}>
                <div className={styles["comment-author"]}>
                  <img src="/admin/img/icon/basic-profile.svg" alt="사용자 프로필" className={styles["comment-avatar"]} />
                  <div className={styles["comment-author-info"]}>
                    <p className={styles["comment-author-name"]}>이영희</p>
                    <p className={styles["comment-date"]}>2024-01-20 15:45</p>
                  </div>
                </div>
                <p className={styles["comment-text"]}>21%파티 덕분에 옷을 버리지 않고 교환할 수 있어서 환경 보호에 기여할 수 있어 뿌듯합니다!</p>
              </div>
              <div className={styles["comment-item"]}>
                <div className={styles["comment-author"]}>
                  <img src="/admin/img/icon/basic-profile.svg" alt="사용자 프로필" className={styles["comment-avatar"]} />
                  <div className={styles["comment-author-info"]}>
                    <p className={styles["comment-author-name"]}>박철수</p>
                    <p className={styles["comment-date"]}>2024-01-21 09:15</p>
                  </div>
                </div>
                <p className={styles["comment-text"]}>다음 옷 교환 행사는 언제 열리나요? 친구들도 데리고 가고 싶어요!</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 - 게시글 수정 */}
        <div
          className={styles["event-detail-sidebar"]}
          ref={sidebarRef}
          style={{ alignSelf: "flex-start", height: "max-content" }}
        >
          <div ref={sidebarInnerRef} className={styles["staff-code-section"]}>
            <div className={styles["staff-code-content"]}>
              <div className={styles["staff-code-icon"]}>
                <img src="/admin/img/icon/edit-square.svg" alt="게시글 수정 아이콘" />
              </div>
              <h4 className={styles["staff-code-title"]}>게시글 수정</h4>
              <p className={styles["staff-code-description"]}>제목, 내용, 상태를 수정할 수 있습니다</p>
            </div>
            <button className={styles["staff-code-button"]} onClick={() => navigate(`/posts/${id}/edit`, { state })}>
              <img src="/admin/img/icon/code-generate.svg" alt="수정 아이콘" />
              게시글 수정
            </button>
            <div className={styles["staff-code-notice"]}>
              <img src="/admin/img/icon/alert.svg" alt="알림 아이콘" />
              <p>수정 내역은 즉시 적용됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
