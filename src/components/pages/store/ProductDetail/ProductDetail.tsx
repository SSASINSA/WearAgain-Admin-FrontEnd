import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";

interface ProductState {
  id: number;
  name: string;
  price: number;
  category: string;
  status: "판매중" | "품절" | "판매완료";
  image: string;
  description: string;
  stock: number;
  createdAt: string;
}

const MOCK_PRODUCTS: ProductState[] = [
  {
    id: 1,
    name: "바느질 도구 세트",
    price: 25000,
    category: "수선 도구",
    status: "판매중",
    image: "/admin/img/icon/product-placeholder.svg",
    description: "의류 수선에 필요한 기본 바느질 도구 세트입니다.",
    stock: 15,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "재봉실 세트 (다양한 색상)",
    price: 8000,
    category: "수선 도구",
    status: "판매중",
    image: "/admin/img/icon/product-placeholder.svg",
    description: "다양한 색상의 재봉실 세트입니다.",
    stock: 20,
    createdAt: "2024-01-14",
  },
];

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as Partial<ProductState>;

  const mock = MOCK_PRODUCTS.find((p) => p.id === Number(id));
  const display: ProductState = {
    id: state.id ?? mock?.id ?? Number(id) ?? 0,
    name: state.name ?? mock?.name ?? "상품명",
    price: state.price ?? mock?.price ?? 0,
    category: state.category ?? mock?.category ?? "카테고리",
    status: state.status ?? mock?.status ?? "판매중",
    image: state.image ?? mock?.image ?? "/admin/img/icon/product-placeholder.svg",
    description: state.description ?? mock?.description ?? "상품 설명이 없습니다.",
    stock: state.stock ?? mock?.stock ?? 0,
    createdAt: state.createdAt ?? mock?.createdAt ?? "-",
  };

  const renderStatus = (status: string) => {
    if (status === "판매중")
      return <span className={`${styles["status-badge"]} ${styles["selling"]}`}>판매중</span>;
    if (status === "품절") return <span className={`${styles["status-badge"]} ${styles["sold-out"]}`}>품절</span>;
    if (status === "판매완료")
      return <span className={`${styles["status-badge"]} ${styles["sold"]}`}>판매완료</span>;
    return null;
  };

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

  return (
    <div className={styles["product-detail-page"]}>
      <PageHeader title="상품 상세" subtitle="상품의 상세 정보를 확인하고 관리할 수 있습니다" />

      <div className={styles["product-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["product-detail-content"]}>
          {/* 상품 헤더 섹션 */}
          <div className={styles["product-hero-section"]}>
            <div className={styles["product-hero-image"]}>
              <img src={display.image} alt={display.name} />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["product-hero-content"]}>
              <div className={styles["product-tags"]}>
                {renderStatus(display.status)}
                <span className={`${styles["tag"]} ${styles["category"]}`}>{display.category}</span>
              </div>
              <h2 className={styles["product-title"]}>{display.name}</h2>
              <p className={styles["product-description"]}>{display.description}</p>
              <div className={styles["product-price-display"]}>
                <span className={styles["price-label"]}>가격</span>
                <span className={styles["price-value"]}>{display.price.toLocaleString()} C</span>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 섹션 */}
          <div className={styles["product-details-section"]}>
            <h3 className={styles["section-title"]}>상품 상세 정보</h3>
            <div className={styles["product-details-grid"]}>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>상품 ID</p>
                <p className={styles["detail-value"]}>{display.id}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>카테고리</p>
                <p className={styles["detail-value"]}>{display.category}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>재고</p>
                <p className={styles["detail-value"]}>{display.stock}개</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>등록일</p>
                <p className={styles["detail-value"]}>{display.createdAt}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>상태</p>
                <p className={styles["detail-value"]}>{display.status}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>가격</p>
                <p className={styles["detail-value"]}>{display.price.toLocaleString()} C</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 - 상품 수정 */}
        <div
          className={styles["product-detail-sidebar"]}
          ref={sidebarRef}
          style={{ alignSelf: "flex-start", height: "max-content" }}
        >
          <div ref={sidebarInnerRef} className={styles["staff-code-section"]}>
            <div className={styles["staff-code-content"]}>
              <div className={styles["staff-code-icon"]}>
                <img src="/admin/img/icon/edit-square.svg" alt="상품 수정 아이콘" />
              </div>
              <h4 className={styles["staff-code-title"]}>상품 수정</h4>
              <p className={styles["staff-code-description"]}>상품 정보를 수정할 수 있습니다</p>
            </div>
            <button
              className={styles["staff-code-button"]}
              onClick={() => navigate(`/store/${id}/edit`, { state: display })}
            >
              <img src="/admin/img/icon/code-generate.svg" alt="수정 아이콘" />
              수정하기
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

export default ProductDetail;

