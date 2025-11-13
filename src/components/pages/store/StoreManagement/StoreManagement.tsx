import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import "./StoreManagement.css";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface Product {
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

const StoreManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([
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
    {
      id: 3,
      name: "의류 패치 키트",
      price: 12000,
      category: "수선 도구",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "구멍 난 옷을 수선할 수 있는 패치 키트입니다.",
      stock: 12,
      createdAt: "2024-01-13",
    },
    {
      id: 4,
      name: "친환경 텀블러",
      price: 18000,
      category: "환경 굿즈",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "재사용 가능한 친환경 텀블러입니다.",
      stock: 25,
      createdAt: "2024-01-12",
    },
    {
      id: 5,
      name: "천 장바구니",
      price: 15000,
      category: "환경 굿즈",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "재사용 가능한 천 장바구니입니다.",
      stock: 18,
      createdAt: "2024-01-11",
    },
    {
      id: 6,
      name: "지퍼 수리 키트",
      price: 10000,
      category: "수선 도구",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "고장 난 지퍼를 수리할 수 있는 키트입니다.",
      stock: 10,
      createdAt: "2024-01-10",
    },
    {
      id: 7,
      name: "업사이클링 토트백",
      price: 35000,
      category: "환경 굿즈",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "재활용 소재로 만든 토트백입니다.",
      stock: 8,
      createdAt: "2024-01-09",
    },
    {
      id: 8,
      name: "바늘 세트 (다양한 크기)",
      price: 6000,
      category: "수선 도구",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "다양한 크기의 바늘 세트입니다.",
      stock: 22,
      createdAt: "2024-01-08",
    },
    {
      id: 9,
      name: "친환경 밀랍랩",
      price: 12000,
      category: "환경 굿즈",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "재사용 가능한 친환경 밀랍랩입니다.",
      stock: 14,
      createdAt: "2024-01-07",
    },
    {
      id: 10,
      name: "단추 수리 키트",
      price: 9000,
      category: "수선 도구",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "떨어진 단추를 다시 달 수 있는 키트입니다.",
      stock: 16,
      createdAt: "2024-01-06",
    },
    {
      id: 11,
      name: "재활용 소재 에코백",
      price: 22000,
      category: "환경 굿즈",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "재활용 소재로 만든 에코백입니다.",
      stock: 11,
      createdAt: "2024-01-05",
    },
    {
      id: 12,
      name: "수선 가이드북",
      price: 15000,
      category: "수선 도구",
      status: "판매중",
      image: "/admin/img/icon/product-placeholder.svg",
      description: "의류 수선 방법을 알려주는 가이드북입니다.",
      stock: 7,
      createdAt: "2024-01-04",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("가격 낮은순");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const itemsPerPage = 12;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "가격 낮은순") return a.price - b.price;
    if (sortBy === "가격 높은순") return b.price - a.price;
    if (sortBy === "이름순") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader
          title="상품 관리"
          subtitle="등록된 상품을 관리하고 새로운 상품을 추가하세요"
          rightSlot={
            <button className="add-product-btn" onClick={() => navigate("/store/add")}>
              <span>+</span>
              상품 추가
            </button>
          }
        />

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-filters">
            <div className="search-input-container">
              <div className="search-icon">
                <img src="/admin/img/icon/search.svg" alt="검색" />
              </div>
              <input
                type="text"
                placeholder="상품명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-select-container">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 카테고리</option>
                <option value="수선 도구">수선 도구</option>
                <option value="환경 굿즈">환경 굿즈</option>
              </select>
              <div className="category-select-icon">
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
            <div className="sort-select-container">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="가격 낮은순">가격 낮은순</option>
                <option value="가격 높은순">가격 높은순</option>
                <option value="이름순">이름순</option>
              </select>
              <div className="sort-select-icon">
                <img src={dropdownIcon} alt="드롭다운" />
              </div>
            </div>
          </div>
          <div className="view-controls">
            <span className="product-count">총 {products.length}개 상품</span>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                ⊞
              </button>
              <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className="products-section">
          {/* Products Grid */}
          <div className="products-container">
            <div className={`products-grid ${viewMode}`}>
              {currentProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price-container">
                      <span className="product-price">{product.price.toLocaleString()} C</span>
                      <button className="product-menu-btn">⋯</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            <button
              className={`pagination-btn ${currentPage === 2 ? "active" : ""}`}
              onClick={() => handlePageChange(2)}
            >
              2
            </button>
            <button
              className={`pagination-btn ${currentPage === 3 ? "active" : ""}`}
              onClick={() => handlePageChange(3)}
            >
              3
            </button>
            <span className="pagination-dots">...</span>
            <button
              className={`pagination-btn ${currentPage === 15 ? "active" : ""}`}
              onClick={() => handlePageChange(15)}
            >
              15
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StoreManagement;
