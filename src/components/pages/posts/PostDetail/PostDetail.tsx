import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./PostDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "../../../../utils/api";

const deleteIcon = "/admin/img/icon/x-reject.svg";

interface Author {
  authorId: number;
  displayName: string;
  email: string;
}

interface Comment {
  commentId: number;
  content: string;
  status: string;
  author: Author;
  createdAt: string;
}

interface PostDetailResponse {
  postId: number;
  status: string;
  title: string;
  content: string;
  categoryName: string;
  author: Author;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

const PostDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [postData, setPostData] = useState<PostDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  const fetchPostDetail = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest(`/admin/posts/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }
        throw new Error(errorData.message || "게시글 상세 정보를 가져오는데 실패했습니다.");
      }

      const data: PostDetailResponse = await response.json();
      setPostData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "게시글 상세 정보를 가져오는데 실패했습니다.";
      setError(errorMessage);
      console.error("게시글 상세 정보 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!id || !postData) return;

    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await apiRequest(`/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "게시글 삭제에 실패했습니다.");
      }

      alert("게시글이 삭제되었습니다.");
      navigate("/posts");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
    }
  };

  const renderStatus = (status?: string) => {
    if (!status) return null;
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>활성</span>;
      case "HIDDEN":
        return <span className={`${styles["status-badge"]} ${styles["inactive"]}`}>비활성</span>;
      case "REPORTED":
        return <span className={`${styles["status-badge"]} ${styles["reported"]}`}>신고됨</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const renderCommentStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <span style={{ color: "#10b981" }}>활성</span>;
      case "REPORTED":
        return <span style={{ color: "#ef4444" }}>신고됨</span>;
      case "INACTIVE":
        return <span style={{ color: "#6b7280" }}>비활성</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={styles["event-detail-page"]}>
        <PageHeader title="게시글 상세" subtitle="게시글의 상세 정보를 확인하고 관리할 수 있습니다" />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className={styles["event-detail-page"]}>
        <PageHeader title="게시글 상세" subtitle="게시글의 상세 정보를 확인하고 관리할 수 있습니다" />
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          <p>{error || "게시글을 찾을 수 없습니다."}</p>
          <button
            onClick={handleBack}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#06b0b7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["event-detail-page"]}>
      <PageHeader title="게시글 상세" subtitle="게시글의 상세 정보를 확인하고 관리할 수 있습니다" />

      <div className={styles["event-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-detail-content"]}>
          {/* 게시글 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div className={styles["event-hero-image"]}>
              {postData.imageUrls && postData.imageUrls.length > 0 ? (
                <img src={postData.imageUrls[0]} alt="게시글 대표 이미지" />
              ) : (
                <img src="/admin/img/example/event-hero.png" alt="게시글 대표 이미지" />
              )}
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>{postData.categoryName || "게시글"}</span>
              </div>
              <h2 className={styles["event-title"]}>{postData.title}</h2>
              <p className={styles["event-description"]}>{postData.content}</p>
            </div>
          </div>

          {/* 이미지 갤러리 섹션 */}
          {postData.imageUrls && postData.imageUrls.length > 1 && (
            <div className={styles["event-details-section"]}>
              <h3 className={styles["section-title"]}>이미지 갤러리</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {postData.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={`게시글 이미지 ${index + 1}`} style={{ width: "100%", borderRadius: "8px" }} />
                ))}
              </div>
            </div>
          )}

          {/* 댓글 목록 섹션 */}
          <div className={styles["event-results-section"]}>
            <h3 className={styles["section-title"]}>댓글 목록 ({postData.comments.length}개)</h3>
            {postData.comments && postData.comments.length > 0 ? (
              <div className={styles["comments-list"]}>
                {postData.comments.map((comment) => (
                  <div key={comment.commentId} className={styles["comment-item"]}>
                    <div className={styles["comment-author"]}>
                      <img
                        src="/admin/img/icon/basic-profile.svg"
                        alt="사용자 프로필"
                        className={styles["comment-avatar"]}
                      />
                      <div className={styles["comment-author-info"]}>
                        <p className={styles["comment-author-name"]}>
                          {comment.author.displayName} ({comment.author.email})
                        </p>
                        <p className={styles["comment-date"]}>
                          {formatDateTime(comment.createdAt)} {renderCommentStatus(comment.status)}
                        </p>
                      </div>
                    </div>
                    <p className={styles["comment-text"]}>{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                <p>댓글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 사이드바 - 삭제 버튼 및 정보 */}
        <div className={styles["event-detail-sidebar"]} ref={sidebarRef} style={{ alignSelf: "flex-start" }}>
          <div ref={sidebarInnerRef}>
            {/* 게시글 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>게시글 정보</h4>
              <div className={styles["info-list"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>좋아요 수</span>
                  <span className={styles["info-value"]}>{postData.likeCount}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>댓글 수</span>
                  <span className={styles["info-value"]}>{postData.commentCount}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>생성일</span>
                  <span className={styles["info-value"]}>{formatDateTime(postData.createdAt)}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>수정일</span>
                  <span className={styles["info-value"]}>{formatDateTime(postData.updatedAt)}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>게시글 상태</span>
                  <span className={styles["info-value"]}>{renderStatus(postData.status)}</span>
                </div>
              </div>

              {/* 삭제 버튼 - 게시글 정보 카드 내부 하단 */}
              <div className={styles["delete-actions-section"]}>
                <button className={styles["delete-button"]} onClick={handleDelete}>
                  <img src={deleteIcon} alt="삭제 아이콘" />
                  게시글 삭제
                </button>
              </div>
            </div>

            {/* 사용자 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>사용자 정보</h4>
              <div className={styles["info-list"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>사용자 이름</span>
                  <span className={styles["info-value"]}>{postData.author.displayName}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>이메일</span>
                  <span className={styles["info-value"]}>{postData.author.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
