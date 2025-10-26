import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/ParticipantManagement.css";
import PageHeader from "./PageHeader";

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
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);

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
                <img src="/assets/0feaa8ab51947c65b8df39259010c80de9d3686c.svg" alt="참가자" />
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
                <img src="/assets/14ffc46a9c32402a6d92e76ca6694dd5f75757c2.svg" alt="티켓" />
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
                <img src="/assets/1db092d16dccfce416d263c40cb1e2e0f43b0757.svg" alt="크레딧" />
              </div>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="participants-section">
          <div className="section-header">
            <h2>참가자 목록</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="참가자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">
                <img src="/assets/037d414327aa68686a4c4df5147ba311fcc040dd.svg" alt="검색" />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedParticipants.length === currentParticipants.length && currentParticipants.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>참가자 정보</th>
                  <th>티켓 개수</th>
                  <th>크레딧 수</th>
                  <th>가입일</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {currentParticipants.map((participant) => (
                  <tr key={participant.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => handleSelectParticipant(participant.id)}
                      />
                    </td>
                    <td>
                      <div className="participant-info">
                        <img src={participant.avatar} alt={participant.name} className="participant-avatar" />
                        <div className="participant-details">
                          <p
                            className="participant-name clickable"
                            onClick={() => navigate(`/repair/${participant.id}`, { state: participant })}
                          >
                            {participant.name}
                          </p>
                          <p className="participant-email">{participant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ticket-info">
                        <span className="ticket-count">{participant.ticketCount}</span>
                        <span className="ticket-type" style={{ color: getTicketTypeColor(participant.ticketType) }}>
                          {participant.ticketType}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="credit-count">{participant.creditCount.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="join-date">{participant.joinDate}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(participant.status) }}>
                        {participant.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => navigate(`/repair/${participant.id}/edit`)}>
                          <img src="/assets/8033dce36e56395c2c73eaa07ada8a48bb110cc2.svg" alt="수정" />
                        </button>
                        <button className="action-btn delete">
                          <img src="/assets/3e682e096202cddfcfb144345efa2a7a99e1c493.svg" alt="삭제" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-section">
            <div className="pagination-info">
              총 {participants.length}명 중 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, participants.length)}
              명 표시
            </div>
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
                className={`pagination-btn ${currentPage === 125 ? "active" : ""}`}
                onClick={() => handlePageChange(125)}
              >
                125
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
        </div>
      </main>
    </div>
  );
};

export default ParticipantManagement;
