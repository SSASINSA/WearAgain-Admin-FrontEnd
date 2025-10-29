import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../common/PageHeader";
import "./StoreManagement.css";

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
      name: "무선 블루투스 헤드폰",
      price: 89000,
      category: "전자제품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "고음질 무선 블루투스 헤드폰입니다.",
      stock: 5,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "스마트폰 케이스",
      price: 25000,
      category: "액세서리",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "스마트폰 보호 케이스입니다.",
      stock: 10,
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      name: "노트북 컴퓨터",
      price: 1250000,
      category: "전자제품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "고성능 노트북 컴퓨터입니다.",
      stock: 2,
      createdAt: "2024-01-13",
    },
    {
      id: 4,
      name: "세라믹 머그컵",
      price: 18000,
      category: "생활용품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "세련된 세라믹 머그컵입니다.",
      stock: 8,
      createdAt: "2024-01-12",
    },
    {
      id: 5,
      name: "여행용 백팩",
      price: 65000,
      category: "가방",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "여행에 최적화된 백팩입니다.",
      stock: 3,
      createdAt: "2024-01-11",
    },
    {
      id: 6,
      name: "스마트 워치",
      price: 320000,
      category: "전자제품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "스마트 기능이 탑재된 워치입니다.",
      stock: 4,
      createdAt: "2024-01-10",
    },
    {
      id: 7,
      name: "선글라스",
      price: 45000,
      category: "액세서리",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "스타일리시한 선글라스입니다.",
      stock: 6,
      createdAt: "2024-01-09",
    },
    {
      id: 8,
      name: "운동화",
      price: 95000,
      category: "신발",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "편안한 운동화입니다.",
      stock: 7,
      createdAt: "2024-01-08",
    },
    {
      id: 9,
      name: "베스트셀러 소설",
      price: 15000,
      category: "도서",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "인기 베스트셀러 소설입니다.",
      stock: 12,
      createdAt: "2024-01-07",
    },
    {
      id: 10,
      name: "인테리어 화분",
      price: 35000,
      category: "생활용품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "인테리어용 예쁜 화분입니다.",
      stock: 9,
      createdAt: "2024-01-06",
    },
    {
      id: 11,
      name: "면 티셔츠",
      price: 28000,
      category: "의류",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "편안한 면 티셔츠입니다.",
      stock: 15,
      createdAt: "2024-01-05",
    },
    {
      id: 12,
      name: "향수",
      price: 120000,
      category: "화장품",
      status: "판매중",
      image: "/assets/product-placeholder.svg",
      description: "고급스러운 향수입니다.",
      stock: 3,
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
                <img src="/assets/search.svg" alt="검색" />
              </div>
              <input
                type="text"
                placeholder="상품명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">전체 카테고리</option>
              <option value="전자제품">전자제품</option>
              <option value="액세서리">액세서리</option>
              <option value="생활용품">생활용품</option>
              <option value="가방">가방</option>
              <option value="신발">신발</option>
              <option value="도서">도서</option>
              <option value="의류">의류</option>
              <option value="화장품">화장품</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="가격 낮은순">가격 낮은순</option>
              <option value="가격 높은순">가격 높은순</option>
              <option value="이름순">이름순</option>
            </select>
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
      </main>
    </div>
  );
};

export default StoreManagement;
