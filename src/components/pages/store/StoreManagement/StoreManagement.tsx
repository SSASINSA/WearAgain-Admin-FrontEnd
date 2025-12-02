import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "../../../../utils/api";
import styles from "./StoreManagement.module.css";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  stock: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
}

interface ProductListResponse {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

const StoreManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getPageFromUrl = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 0;
  };

  const getSearchTermFromUrl = () => {
    return searchParams.get("keyword") || "";
  };

  const getSearchScopeFromUrl = () => {
    return searchParams.get("keywordScope") || "ALL";
  };

  const getCategoryFromUrl = () => {
    return searchParams.get("category") || "";
  };

  const getStatusFromUrl = () => {
    return searchParams.get("status") || "";
  };

  const getSortFromUrl = () => {
    return searchParams.get("sort") || "LATEST";
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl());
  const [selectedStatus, setSelectedStatus] = useState<string>(getStatusFromUrl());
  const [sort, setSort] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const itemsPerPage = 10;

  const updateUrlParams = (updates: {
    page?: number;
    keyword?: string;
    keywordScope?: string;
    category?: string;
    status?: string;
    sort?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.page !== undefined) {
      if (updates.page === 0) {
        newParams.delete("page");
      } else {
        newParams.set("page", updates.page.toString());
      }
    }
    
    if (updates.keyword !== undefined) {
      if (updates.keyword === "") {
        newParams.delete("keyword");
      } else {
        newParams.set("keyword", updates.keyword);
      }
    }
    
    if (updates.keywordScope !== undefined) {
      if (updates.keywordScope === "ALL") {
        newParams.delete("keywordScope");
      } else {
        newParams.set("keywordScope", updates.keywordScope);
      }
    }
    
    if (updates.category !== undefined) {
      if (updates.category === "") {
        newParams.delete("category");
      } else {
        newParams.set("category", updates.category);
      }
    }
    
    if (updates.status !== undefined) {
      if (updates.status === "") {
        newParams.delete("status");
      } else {
        newParams.set("status", updates.status);
      }
    }
    
    if (updates.sort !== undefined) {
      if (updates.sort === "LATEST") {
        newParams.delete("sort");
      } else {
        newParams.set("sort", updates.sort);
      }
    }
    
    setSearchParams(newParams, { replace: true });
  };

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("size", itemsPerPage.toString());

      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      if (selectedStatus) {
        params.append("status", selectedStatus);
      }
      params.append("sort", sort);

      const response = await apiRequest(`/admin/store/items?${params.toString()}`, {
        method: "GET",
      });

      if (response.ok) {
        const data: ProductListResponse = await response.json();
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("상품 목록 조회 실패:", errorData);
        setProducts([]);
      }
    } catch (error) {
      console.error("상품 목록 조회 중 오류:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedSearchScope, selectedCategory, selectedStatus, sort, itemsPerPage]);

  useEffect(() => {
    const urlPage = getPageFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();
    const urlCategory = getCategoryFromUrl();
    const urlStatus = getStatusFromUrl();
    const urlSort = getSortFromUrl();

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlKeyword !== appliedSearchTerm) {
      setSearchTerm(urlKeyword);
      setAppliedSearchTerm(urlKeyword);
    }
    if (urlKeywordScope !== appliedSearchScope) {
      setSearchScope(urlKeywordScope);
      setAppliedSearchScope(urlKeywordScope);
    }
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    if (urlSort !== sort) setSort(urlSort);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedSearchScope(searchScope);
    setCurrentPage(0);
    updateUrlParams({
      keyword: searchTerm,
      keywordScope: searchScope,
      page: 0,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(0);
    updateUrlParams({ sort: newSort, page: 0 });
  };

  const getProductImage = (product: Product): string => {
    if (product.thumbnailUrl) {
      return product.thumbnailUrl;
    }
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
      return sortedImages[0].imageUrl;
    }
    return "/admin/img/icon/product-placeholder.svg";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>판매중</span>;
      case "INACTIVE":
        return <span className={`${styles["status-badge"]} ${styles["inactive"]}`}>판매중지</span>;
      case "DELETED":
        return <span className={`${styles["status-badge"]} ${styles["deleted"]}`}>삭제됨</span>;
      default:
        return null;
    }
  };


  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader
          title="크레딧 상점 관리"
          subtitle="등록된 상품을 관리하고 새로운 상품을 추가하세요"
          rightSlot={
            <button className={styles["add-product-btn"]} onClick={() => navigate("/store/add")}>
              <span>+</span>
              상품 추가
            </button>
          }
        />

        <div className={styles["search-filter-bar"]}>
          <div className={styles["search-filters"]}>
            <div className={styles["search-input-container"]}>
              <div className={styles["search-icon"]} onClick={handleSearch} style={{ cursor: "pointer" }}>
                <img src="/admin/img/icon/search.svg" alt="검색" />
              </div>
              <input
                type="text"
                placeholder="상품 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles["search-input"]}
              />
            </div>
            <div className={styles["status-select-container"]}>
              <select
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value)}
                className={styles["filter-select"]}
              >
                <option value="ALL">전체</option>
                <option value="NAME">상품명</option>
                <option value="DESCRIPTION">설명</option>
                <option value="CATEGORY">카테고리</option>
              </select>
              <div className={styles["category-select-icon"]}>
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
            <div className={styles["category-select-container"]}>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  setCurrentPage(0);
                  updateUrlParams({ category: newCategory, page: 0 });
                }}
                className={styles["filter-select"]}
              >
                <option value="">전체 카테고리</option>
                <option value="수선 도구">수선 도구</option>
                <option value="환경 굿즈">환경 굿즈</option>
              </select>
              <div className={styles["category-select-icon"]}>
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
            <div className={styles["status-select-container"]}>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setSelectedStatus(newStatus);
                  setCurrentPage(0);
                  updateUrlParams({ status: newStatus, page: 0 });
                }}
                className={styles["filter-select"]}
              >
                <option value="">전체 상태</option>
                <option value="ACTIVE">판매중</option>
                <option value="INACTIVE">판매중지</option>
                <option value="DELETED">삭제됨</option>
              </select>
              <div className={styles["category-select-icon"]}>
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
            <div className={styles["sort-select-container"]}>
              <select value={sort} onChange={(e) => handleSortChange(e.target.value)} className={styles["filter-select"]}>
                <option value="LATEST">최신순</option>
                <option value="OLDEST">오래된순</option>
                <option value="TITLE_ASC">제목순</option>
              </select>
              <div className={styles["sort-select-icon"]}>
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
          </div>
          <div className={styles["view-controls"]}>
            <span className={styles["product-count"]}>총 {totalElements}개 상품</span>
            <div className={styles["view-toggle"]}>
              <button
                className={`${styles["view-btn"]} ${viewMode === "grid" ? styles["active"] : ""}`}
                onClick={() => setViewMode("grid")}
              >
                ⊞
              </button>
              <button
                className={`${styles["view-btn"]} ${viewMode === "list" ? styles["active"] : ""}`}
                onClick={() => setViewMode("list")}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <section className={styles["products-section"]}>
          <div className={styles["products-container"]}>
            <div className={`${styles["products-grid"]} ${styles[viewMode]}`}>
              {isLoading ? (
                <div>로딩 중...</div>
              ) : products.length === 0 ? (
                <div>상품이 없습니다.</div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className={styles["product-card"]}
                    onClick={() => navigate(`/store/${product.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles["product-image-container"]}>
                      <img src={getProductImage(product)} alt={product.name} className={styles["product-image"]} />
                      <div className={styles["product-status-overlay"]}>{getStatusBadge(product.status)}</div>
                    </div>
                    <div className={styles["product-info"]}>
                      <div className={styles["product-name-container"]}>
                        <h3 className={styles["product-name"]}>{product.name}</h3>
                        <span className={styles["product-category"]}>{product.category}</span>
                      </div>
                      <div className={styles["product-price-container"]}>
                        <span className={styles["product-price"]}>{product.price.toLocaleString()} C</span>
                        <button
                          className={styles["product-menu-btn"]}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {totalPages > 0 && (
            <div className={styles["pagination-container"]}>
              <div className={styles["pagination"]}>
                <button
                  className={styles["pagination-btn"]}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                  if (page === 0 || page === totalPages - 1 || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        className={`${styles["pagination-btn"]} ${currentPage === page ? styles["active"] : ""}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page + 1}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className={styles["pagination-dots"]}>
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  className={styles["pagination-btn"]}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StoreManagement;
