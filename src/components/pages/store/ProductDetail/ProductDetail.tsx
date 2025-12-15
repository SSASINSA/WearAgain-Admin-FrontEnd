import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ImageGalleryModal, { GalleryImage } from "../../../common/ImageGalleryModal/ImageGalleryModal";
import apiRequest from "../../../../utils/api";

interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
   maxPurchasePerUser?: number | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  images: ProductImage[];
  pickupLocations: string[];
  createdAt: string;
  updatedAt: string;
}

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await apiRequest(`/admin/store/items/${id}`, {
          method: "GET",
        });

        if (response.ok) {
          const data: ProductDetail = await response.json();
          setProduct(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("상품 상세 조회 실패:", errorData);
          setProduct(null);
        }
      } catch (error) {
        console.error("상품 상세 조회 중 오류:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
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

  const renderStatus = (status: string) => {
    if (status === "ACTIVE")
      return <span className={`${styles["status-badge"]} ${styles["selling"]}`}>판매중</span>;
    if (status === "INACTIVE")
      return <span className={`${styles["status-badge"]} ${styles["sold-out"]}`}>판매중지</span>;
    if (status === "DELETED")
      return <span className={`${styles["status-badge"]} ${styles["sold"]}`}>삭제됨</span>;
    return null;
  };

  const getMainImage = (): string => {
    if (product?.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
      return sortedImages[0].imageUrl;
    }
    return "/admin/img/icon/product-placeholder.svg";
  };

  const getSortedImages = (): ProductImage[] => {
    if (product?.images && product.images.length > 0) {
      return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [];
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
      id: image.id,
      url: image.imageUrl,
      altText: null,
    }));
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles["product-detail-page"]}>
      <PageHeader title="상품 상세" subtitle="상품의 상세 정보를 확인하고 관리할 수 있습니다" />

      <div className={styles["product-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["product-detail-content"]}>
          <div className={styles["product-hero-section"]}>
            <div className={styles["product-hero-image"]} onClick={handleImageClick} style={{ cursor: getSortedImages().length > 0 ? "pointer" : "default" }}>
              <img src={getMainImage()} alt={product.name} />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["product-hero-content"]}>
              <div className={styles["product-tags"]}>
                {renderStatus(product.status)}
                <span className={`${styles["tag"]} ${styles["category"]}`}>{product.category}</span>
              </div>
              <h2 className={styles["product-title"]}>{product.name}</h2>
              <p className={styles["product-description"]}>{product.description || "설명이 없습니다."}</p>
              <div className={styles["product-price-display"]}>
                <span className={styles["price-label"]}>가격</span>
                <span className={styles["price-value"]}>{product.price.toLocaleString()} C</span>
              </div>
            </div>
          </div>

          <div className={styles["product-details-section"]}>
            <h3 className={styles["section-title"]}>상품 상세 정보</h3>
            <div className={styles["product-details-grid"]}>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>상품 ID</p>
                <p className={styles["detail-value"]}>{product.id}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>카테고리</p>
                <p className={styles["detail-value"]}>{product.category}</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>재고</p>
                <p className={styles["detail-value"]}>{product.stock}개</p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>구매 제한 수량</p>
                <p className={styles["detail-value"]}>
                  {product.maxPurchasePerUser === null || product.maxPurchasePerUser === undefined
                    ? "제한 없음"
                    : `${product.maxPurchasePerUser}개`}
                </p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>등록일</p>
                <p className={styles["detail-value"]}>
                  {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>상태</p>
                <p className={styles["detail-value"]}>
                  {product.status === "ACTIVE" ? "판매중" : product.status === "INACTIVE" ? "판매중지" : "삭제됨"}
                </p>
              </div>
              <div className={styles["detail-item"]}>
                <p className={styles["detail-label"]}>가격</p>
                <p className={styles["detail-value"]}>{product.price.toLocaleString()} C</p>
              </div>
              <div className={styles["detail-item"]} style={{ gridColumn: "1 / -1" }}>
                <p className={styles["detail-label"]}>수령 장소</p>
                <div className={styles["pickup-locations-list"]}>
                  {product.pickupLocations && product.pickupLocations.length > 0 ? (
                    product.pickupLocations.map((location, index) => (
                      <span key={index} className={styles["pickup-location-tag"]}>
                        {location}
                      </span>
                    ))
                  ) : (
                    <p className={styles["detail-value"]}>수령 장소가 설정되지 않았습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              onClick={() => navigate(`/store/${id}/edit`)}
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

      <ImageGalleryModal
        isOpen={isImageModalOpen}
        images={getGalleryImages()}
        initialIndex={0}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductDetail;
