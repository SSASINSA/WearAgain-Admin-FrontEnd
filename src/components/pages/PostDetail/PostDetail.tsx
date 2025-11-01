import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../EventDetail/EventDetail.css";
import "./PostDetail.css";
import PageHeader from "../../common/PageHeader/PageHeader";

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
    if (status === "active") return <span className="status-badge active">활성</span>;
    if (status === "inactive") return <span className="status-badge inactive">비활성</span>;
    if (status === "reported") return <span className="status-badge reported">신고됨</span>;
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
    <div className="event-detail-page">
      <PageHeader title="게시글 상세" />

      <div className="event-detail-main" style={{ alignItems: "flex-start" }}>
        <div className="event-detail-content">
          {/* Hero 섹션 (행사 상세와 동일 레이아웃) */}
          <div className="event-hero-section">
            <div className="event-hero-image">
              <img src="/img/example/event-hero.png" alt="게시글 대표 이미지" />
              <div className="image-overlay"></div>
            </div>
            <div className="event-hero-content">
              <div className="event-tags">
                {/* 상태 뱃지를 태그처럼 표시 */}
                {renderStatus(state.status)}
                <span className="tag workshop">게시글</span>
              </div>
              <h2 className="event-title">{state.title || "게시글 제목"}</h2>
              <p className="event-description">{state.content || "게시글 내용이 없습니다."}</p>
            </div>
          </div>

          {/* 상세 정보 섹션 */}
          <div className="event-details-section">
            <h3 className="section-title">게시글 상세 정보</h3>
            <div className="event-details-grid post-details-grid">
              <div className="detail-item post-detail-item">
                <p className="detail-label">작성일</p>
                <p className="detail-value">{state.date || "-"}</p>
              </div>
              <div className="detail-item post-detail-item">
                <p className="detail-label">작성자</p>
                <p className="detail-value">{state.author || "-"}</p>
              </div>
              <div className="detail-item post-detail-item">
                <p className="detail-label">조회수</p>
                <p className="detail-value">1,256</p>
              </div>
              <div className="detail-item post-detail-item">
                <p className="detail-label">좋아요</p>
                <p className="detail-value">342</p>
              </div>
              <div className="detail-item post-detail-item">
                <p className="detail-label">댓글</p>
                <p className="detail-value">58</p>
              </div>
              <div className="detail-item post-detail-item">
                <p className="detail-label">공유</p>
                <p className="detail-value">21</p>
              </div>
            </div>
          </div>

          {/* 댓글 목록 섹션 */}
          <div className="event-results-section">
            <h3 className="section-title">댓글 목록</h3>
            <div className="comments-list">
              <div className="comment-item">
                <div className="comment-author">
                  <img src="/img/icon/basic-profile.svg" alt="사용자 프로필" className="comment-avatar" />
                  <div className="comment-author-info">
                    <p className="comment-author-name">김민수</p>
                    <p className="comment-date">2024-01-20 14:30</p>
                  </div>
                </div>
                <p className="comment-text">정말 유용한 정보네요! 감사합니다.</p>
              </div>
              <div className="comment-item">
                <div className="comment-author">
                  <img src="/img/icon/basic-profile.svg" alt="사용자 프로필" className="comment-avatar" />
                  <div className="comment-author-info">
                    <p className="comment-author-name">이영희</p>
                    <p className="comment-date">2024-01-20 15:45</p>
                  </div>
                </div>
                <p className="comment-text">좋은 글 잘 봤습니다. 더 많은 내용 기대합니다!</p>
              </div>
              <div className="comment-item">
                <div className="comment-author">
                  <img src="/img/icon/basic-profile.svg" alt="사용자 프로필" className="comment-avatar" />
                  <div className="comment-author-info">
                    <p className="comment-author-name">박철수</p>
                    <p className="comment-date">2024-01-21 09:15</p>
                  </div>
                </div>
                <p className="comment-text">추가로 궁금한 점이 있는데요, 다음 글에서 다뤄주시면 좋겠습니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="event-detail-sidebar" ref={sidebarRef} style={{ alignSelf: "flex-start", height: "max-content" }}>
          <div ref={sidebarInnerRef} className="staff-code-section">
            <div className="staff-code-content">
              <div className="staff-code-icon">
                <img src="/img/icon/edit-square.svg" alt="게시글 수정 아이콘" />
              </div>
              <h4 className="staff-code-title">게시글 수정</h4>
              <p className="staff-code-description">제목, 내용, 상태를 수정할 수 있습니다</p>
            </div>
            <button className="staff-code-button" onClick={() => navigate(`/posts/${id}/edit`, { state })}>
              <img src="/img/icon/code-generate.svg" alt="수정 아이콘" />
              게시글 수정
            </button>
            <div className="staff-code-notice">
              <img src="/img/icon/alert.svg" alt="알림 아이콘" />
              <p>수정 내역은 즉시 적용됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;


