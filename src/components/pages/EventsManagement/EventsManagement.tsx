import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../common/PageHeader/PageHeader";
import "./EventsManagement.css";

const searchIcon = "/img/icon/search.svg";
const dropdownIcon = "/img/icon/dropdown.svg";
const plusIcon = "/img/icon/plus.svg";
const calendarIcon = "/img/icon/calendar.svg";
const locationIcon = "/img/icon/location.svg";
const staffIcon = "/img/icon/staff.svg";
const participantIcon = "/img/icon/user-group.svg";
const detailIcon = "/img/icon/detail.svg";
const editIcon = "/img/icon/edit.svg";
const deleteIcon = "/img/icon/trash.svg";
const qrIcon = "/img/icon/qr-code.svg";
const prevIcon = "/img/icon/chevron-left.svg";
const nextIcon = "/img/icon/arrow-right.svg";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  participants: number;
  staff: number;
  status: "active" | "completed" | "upcoming";
  description: string;
}

const EventsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const events: Event[] = [
    {
      id: 1,
      title: "2024 스프링 컨퍼런스",
      date: "2024.03.15 - 2024.03.16",
      location: "서울 코엑스 컨벤션센터",
      participants: 250,
      staff: 12,
      status: "active",
      description: "스프링 프레임워크 컨퍼런스",
    },
    {
      id: 2,
      title: "AI 혁신 워크숍",
      date: "2024.04.20 - 2024.04.21",
      location: "부산 벡스코",
      participants: 180,
      staff: 8,
      status: "upcoming",
      description: "AI 기술 혁신 워크숍",
    },
    {
      id: 3,
      title: "스타트업 데모데이",
      date: "2024.02.28 - 2024.02.28",
      location: "서울 DDP",
      participants: 320,
      staff: 15,
      status: "completed",
      description: "스타트업 데모데이",
    },
    {
      id: 4,
      title: "2024 스프링 컨퍼런스",
      date: "2024.03.15 - 2024.03.16",
      location: "서울 코엑스 컨벤션센터",
      participants: 250,
      staff: 12,
      status: "active",
      description: "스프링 프레임워크 컨퍼런스",
    },
    {
      id: 5,
      title: "AI 혁신 워크숍",
      date: "2024.04.20 - 2024.04.21",
      location: "부산 벡스코",
      participants: 180,
      staff: 8,
      status: "upcoming",
      description: "AI 기술 혁신 워크숍",
    },
    {
      id: 6,
      title: "스타트업 데모데이",
      date: "2024.02.28 - 2024.02.28",
      location: "서울 DDP",
      participants: 320,
      staff: 15,
      status: "completed",
      description: "스타트업 데모데이",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="status-badge active">진행중</span>;
      case "completed":
        return <span className="status-badge completed">완료</span>;
      case "upcoming":
        return <span className="status-badge upcoming">예정</span>;
      default:
        return null;
    }
  };

  const getStatusCount = (status: string) => {
    return events.filter((event) => event.status === status).length;
  };

  const handleViewDetails = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader title="행사 관리" subtitle="등록된 행사를 확인하고 관리할 수 있습니다" />

        <div className="dashboard-content">
          <div className="events-controls">
            <div className="search-filter-section">
              <div className="search-input-container">
                <div className="search-icon">
                  <img src={searchIcon} alt="검색" />
                </div>
                <input
                  type="text"
                  placeholder="행사 검색..."
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
                <option value="active">진행중</option>
                <option value="upcoming">예정</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <button className="add-event-btn" onClick={() => navigate("/events/register")}>
              <img src={plusIcon} alt="" />새 행사 만들기
            </button>
          </div>

          <div className="events-grid">
            {currentEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-content">
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>

                  <div className="event-details">
                    <div className="event-detail">
                      <span className="detail-icon">
                        <img src={calendarIcon} alt="날짜" />
                      </span>
                      <span className="detail-text">{event.date}</span>
                    </div>
                    <div className="event-detail">
                      <span className="detail-icon">
                        <img src={locationIcon} alt="위치" />
                      </span>
                      <span className="detail-text">{event.location}</span>
                    </div>
                  </div>

                  <div className="event-stats">
                    <div className="stat-item">
                      <span className="stat-icon">
                        <img src={staffIcon} alt="스태프" />
                      </span>
                      <span className="stat-text">스태프 {event.staff}명</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">
                        <img src={participantIcon} alt="참가자" />
                      </span>
                      <span className="stat-text">참가자 {event.participants}명</span>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button className="action-btn primary" onClick={() => handleViewDetails(event.id)}>
                      <img src={detailIcon} alt="" />
                      상세보기
                    </button>
                    <div className="action-icons-group">
                      <button className="action-btn secondary">
                        <img src={editIcon} alt="수정" />
                      </button>
                      <button className="action-btn secondary">
                        <img src={qrIcon} alt="QR" />
                      </button>
                      <button className="action-btn secondary delete">
                        <img src={deleteIcon} alt="삭제" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-section">
            <div className="pagination-info">
              총 {filteredEvents.length}개 행사 중 {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)}개 표시
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <img src={prevIcon} alt="이전" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <img src={nextIcon} alt="다음" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventsManagement;
