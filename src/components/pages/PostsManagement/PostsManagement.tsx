import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsManagement.css";
import PageHeader from "../../common/PageHeader/PageHeader";
import DataList from "../../common/DataList/DataList";

interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
  status: "active" | "inactive" | "reported";
  author: string;
}

const PostsManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  const posts: Post[] = [
    {
      id: 1,
      title: "웹 개발의 최신 트렌드와 기술 동향",
      content: "2024년 웹 개발 분야에서 주목받고 있는 새로운 기술들과 프레임워크에 대해 알아보겠습니다...",
      date: "2024-01-15",
      status: "active",
      author: "관리자",
    },
    {
      id: 2,
      title: "React 18의 새로운 기능들",
      content: "React 18에서 추가된 Concurrent Features와 Suspense의 개선사항에...",
      date: "2024-01-14",
      status: "inactive",
      author: "관리자",
    },
    {
      id: 3,
      title: "TypeScript 활용 가이드",
      content: "JavaScript 개발자를 위한 TypeScript 도입 가이드와 실무 활용 팁을 소개합니다...",
      date: "2024-01-13",
      status: "reported",
      author: "관리자",
    },
    {
      id: 4,
      title: "CSS Grid와 Flexbox 비교",
      content: "모던 CSS 레이아웃 기술인 CSS Grid와 Flexbox의 특징과 사용 시나리오를 비교해보겠습니다...",
      date: "2024-01-12",
      status: "active",
      author: "관리자",
    },
    {
      id: 5,
      title: "Node.js 성능 최적화",
      content: "Node.js 애플리케이션의 성능을 향상시키기 위한 다양한 최적화 기법들을 알아보겠습니다...",
      date: "2024-01-11",
      status: "active",
      author: "관리자",
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = selectedStatus === "all" || post.status === selectedStatus;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="status-badge active">활성</span>;
      case "inactive":
        return <span className="status-badge inactive">비활성</span>;
      case "reported":
        return <span className="status-badge reported">신고됨</span>;
      default:
        return null;
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === currentPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map((post) => post.id));
    }
  };

  const handleSelectPost = (postId: number) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter((id) => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader title="게시글 관리" subtitle="등록된 게시글을 관리하고 편집할 수 있습니다" />

        <div className="dashboard-content">
          <DataList
            headerTitle="게시글 목록"
            headerRight={
              <>
                <span>총 {filteredPosts.length}개 게시글</span>
                <span>|</span>
                <span>
                  페이지 {currentPage}/{totalPages}
                </span>
              </>
            }
            renderFilters={() => (
              <div className={`filter-section ${isFilterOpen ? "is-open" : "is-collapsed"}`}>
                <div className="filter-header">
                  <h3>필터 및 검색</h3>
                  <button
                    className={`filter-toggle ${isFilterOpen ? "open" : ""}`}
                    aria-expanded={isFilterOpen}
                    onClick={() => setIsFilterOpen((v) => !v)}
                  >
                    ▼
                  </button>
                </div>
                <div className={`filter-controls ${isFilterOpen ? "is-open" : ""}`}>
                  <div className="search-container">
                    <div className="search-icon">
                      <img src="/img/icon/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="게시글 제목 또는 내용으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="all">전체 상태</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="reported">신고됨</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                    <option value="title">제목순</option>
                  </select>
                </div>
              </div>
            )}
            columns={[
              {
                key: "select",
                title: (
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === currentPosts.length && currentPosts.length > 0}
                    onChange={handleSelectAll}
                  />
                ),
                width: 50,
                align: "center",
                render: (row: any) => (
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(row.id)}
                    onChange={() => handleSelectPost(row.id)}
                  />
                ),
              },
              {
                key: "title",
                title: "제목",
                width: 200,
                className: "title-cell",
                render: (row: any) => (
                  <span className="clickable" onClick={() => navigate(`/posts/${row.id}`, { state: row })}>
                    {row.title}
                  </span>
                ),
              },
              {
                key: "content",
                title: "내용",
                width: 370,
                className: "content-cell",
                render: (row: any) => row.content,
              },
              {
                key: "date",
                title: "작성일",
                width: 120,
                className: "date-cell",
                render: (row: any) => (
                  <div>
                    <div>{row.date.split("-")[0]}-</div>
                    <div>{row.date.split("-").slice(1).join("-")}</div>
                  </div>
                ),
              },
              { key: "status", title: "상태", width: 100, render: (row: any) => getStatusBadge(row.status) },
              {
                key: "actions",
                title: "작업",
                width: 100,
                align: "center",
                render: () => (
                  <button className="action-btn delete" title="삭제">
                    <img src="/img/icon/delete.svg" alt="삭제" />
                  </button>
                ),
              },
            ]}
            data={currentPosts}
            rowKey={(row: any) => row.id}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setItemsPerPage(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default PostsManagement;
