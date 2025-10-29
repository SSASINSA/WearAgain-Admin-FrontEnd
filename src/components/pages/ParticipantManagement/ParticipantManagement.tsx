import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ParticipantManagement.css";
import PageHeader from "../../common/PageHeader";
import DataList from "../../common/DataList";
import Pagination from "../../common/Pagination";

interface Participant {
  id: number;
  name: string;
  email: string;
  avatar: string;
  ticketCount: number;
  ticketType: "VIP" | "프리미엄" | "일반";
  creditCount: number;
  joinDate: string;
  status: "활성" | "대기" | "비활성";
}

const ParticipantManagement: React.FC = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: "김민지",
      email: "minji.kim@email.com",
      avatar: "/assets/exampleProfile.svg",
      ticketCount: 5,
      ticketType: "VIP",
      creditCount: 1250,
      joinDate: "2024.01.15",
      status: "활성",
    },
    {
      id: 2,
      name: "박준호",
      email: "junho.park@email.com",
      avatar: "/assets/exampleProfile.svg",
      ticketCount: 3,
      ticketType: "일반",
      creditCount: 850,
      joinDate: "2024.01.20",
      status: "활성",
    },
    {
      id: 3,
      name: "이서영",
      email: "seoyoung.lee@email.com",
      avatar: "/assets/exampleProfile.svg",
      ticketCount: 7,
      ticketType: "프리미엄",
      creditCount: 2100,
      joinDate: "2024.01.10",
      status: "대기",
    },
    {
      id: 4,
      name: "최대현",
      email: "daehyun.choi@email.com",
      avatar: "/assets/exampleProfile.svg",
      ticketCount: 2,
      ticketType: "일반",
      creditCount: 450,
      joinDate: "2024.01.25",
      status: "비활성",
    },
    {
      id: 5,
      name: "정수빈",
      email: "subin.jung@email.com",
      avatar: "/assets/exampleProfile.svg",
      ticketCount: 4,
      ticketType: "일반",
      creditCount: 720,
      joinDate: "2024.01.18",
      status: "활성",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("가입일 최신순");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  const filteredParticipants = participants
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => (selectedStatus ? p.status === selectedStatus : true));

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (sortBy === "이름순") return a.name.localeCompare(b.name);
    const dateA = new Date(a.joinDate.replace(/\./g, "-"));
    const dateB = new Date(b.joinDate.replace(/\./g, "-"));
    if (sortBy === "가입일 오래된 순") return dateA.getTime() - dateB.getTime();
    // 기본: 가입일 최신순
    return dateB.getTime() - dateA.getTime();
  });

  const totalPages = Math.ceil(sortedParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParticipants = sortedParticipants.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedParticipants.length === currentParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(currentParticipants.map((p) => p.id));
    }
  };

  const handleSelectParticipant = (id: number) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter((p) => p !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "활성":
        return "#10b981";
      case "대기":
        return "#f59e0b";
      case "비활성":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "#8b5cf6";
      case "프리미엄":
        return "#06b0b7";
      case "일반":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        {/* Header */}
        <header className="participant-header" style={{ padding: 0, borderBottom: "none", height: "auto" }}>
          <PageHeader title="참가자 관리" subtitle="이벤트 참가자 목록을 확인하고 관리하세요" />
        </header>

        {/* Statistics Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>총 참가자</h3>
                <p className="stat-number">1,247</p>
                <p className="stat-change positive">+12% 전월 대비</p>
              </div>
              <div className="stat-icon">
                <img src="/assets/users.svg" alt="참가자" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>총 티켓</h3>
                <p className="stat-number">3,891</p>
                <p className="stat-change positive">+8% 전월 대비</p>
              </div>
              <div className="stat-icon">
                <img src="/assets/ticket.svg" alt="티켓" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>총 크레딧</h3>
                <p className="stat-number">45,230</p>
                <p className="stat-change negative">-3% 전월 대비</p>
              </div>
              <div className="stat-icon">
                <img src="/assets/credit.svg" alt="크레딧" />
              </div>
            </div>
          </div>
        </div>

        {/* Participants Table via DataList */}
        <div className="participants-section">
          <DataList
            headerTitle="참가자 목록"
            renderFilters={() => (
              <div className="filter-section">
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
                      <img src="/assets/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="참가자 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="status-select"
                  >
                    <option value="">전체 상태</option>
                    <option value="활성">활성</option>
                    <option value="대기">대기</option>
                    <option value="비활성">비활성</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="sort-select"
                  >
                    <option value="가입일 최신순">가입일 최신순</option>
                    <option value="가입일 오래된 순">가입일 오래된 순</option>
                    <option value="이름순">이름순</option>
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
                    checked={
                      currentParticipants.length > 0 && selectedParticipants.length === currentParticipants.length
                    }
                    onChange={handleSelectAll}
                  />
                ),
                width: 40,
                align: "center",
                render: (p: Participant) => (
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(p.id)}
                    onChange={() => handleSelectParticipant(p.id)}
                  />
                ),
              },
              {
                key: "info",
                title: "참가자 정보",
                render: (p: Participant) => (
                  <div className="participant-info">
                    <img src={p.avatar} alt={p.name} className="participant-avatar" />
                    <div className="participant-details">
                      <p
                        className="participant-name clickable"
                        onClick={() => navigate(`/repair/${p.id}`, { state: p })}
                      >
                        {p.name}
                      </p>
                      <p className="participant-email">{p.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "tickets",
                title: "티켓 개수",
                width: 160,
                render: (p: Participant) => (
                  <div className="ticket-info-horizontal">
                    <span className="ticket-count">{p.ticketCount}</span>
                    <span className="ticket-type" style={{ backgroundColor: getTicketTypeColor(p.ticketType) }}>
                      {p.ticketType}
                    </span>
                  </div>
                ),
              },
              {
                key: "credit",
                title: "크레딧 수",
                width: 140,
                render: (p: Participant) => p.creditCount.toLocaleString(),
              },
              { key: "date", title: "가입일", width: 140, render: (p: Participant) => p.joinDate },
              {
                key: "status",
                title: "상태",
                width: 120,
                render: (p: Participant) => (
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(p.status) }}>
                    {p.status}
                  </span>
                ),
              },
              {
                key: "actions",
                title: "작업",
                width: 140,
                align: "center",
                render: (p: Participant) => (
                  <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => navigate(`/repair/${p.id}/edit`)}>
                      <img src="/assets/edit-square.svg" alt="수정" />
                    </button>
                    <button className="action-btn delete">
                      <img src="/assets/delete.svg" alt="삭제" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={currentParticipants}
            rowKey={(row: Participant) => row.id}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            onPageChange={handlePageChange}
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

export default ParticipantManagement;
