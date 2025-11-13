import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import "./EventApproval.css";

const searchIcon = "/admin/img/icon/search.svg";
const dropdownIcon = "/admin/img/icon/dropdown.svg";
const calendarIcon = "/admin/img/icon/calendar.svg";
const locationIcon = "/admin/img/icon/location.svg";
const detailIcon = "/admin/img/icon/detail.svg";
const approveIcon = "/admin/img/icon/check-approve.svg";
const rejectIcon = "/admin/img/icon/x-reject.svg";
const prevIcon = "/admin/img/icon/chevron-left.svg";
const nextIcon = "/admin/img/icon/arrow-right.svg";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  maxParticipants: number;
  staff: number;
  status: "pending" | "approved" | "rejected";
  description: string;
  registeredBy: string;
  registeredDate: string;
}

const EventApproval: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const itemsPerPage = 9;

  const events: Event[] = [
    {
      id: 1,
      title: "서울 종로구 옷 교환 페스티벌",
      date: "2024.05.25 - 2024.05.26",
      location: "서울 종로구 문화예술회관",
      maxParticipants: 300,
      staff: 15,
      status: "pending",
      description: "옷 교환을 통한 지속가능한 패션 문화 확산",
      registeredBy: "김지원",
      registeredDate: "2024.03.20",
    },
    {
      id: 2,
      title: "경기 성남시 옷 교환 행사",
      date: "2024.06.10 - 2024.06.11",
      location: "경기 성남시 분당구 문화센터",
      maxParticipants: 200,
      staff: 10,
      status: "pending",
      description: "환경 보호와 함께하는 옷 교환 파티",
      registeredBy: "이수진",
      registeredDate: "2024.03.18",
    },
    {
      id: 3,
      title: "서울 용산구 옷 교환 데이",
      date: "2024.07.05 - 2024.07.05",
      location: "서울 용산구 이촌동 커뮤니티센터",
      maxParticipants: 150,
      staff: 8,
      status: "pending",
      description: "21%파티로 시작하는 친환경 라이프스타일",
      registeredBy: "박민호",
      registeredDate: "2024.03.15",
    },
    {
      id: 4,
      title: "부산 서면 옷 교환 파티",
      date: "2024.08.15 - 2024.08.16",
      location: "부산 부산진구 서면 문화공간",
      maxParticipants: 250,
      staff: 12,
      status: "pending",
      description: "옷을 버리지 않고 교환하는 환경 보호 실천",
      registeredBy: "최영희",
      registeredDate: "2024.03.22",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.registeredBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const handleViewDetails = (eventId: number) => {
    navigate(`/events/approval/${eventId}`);
  };

  const handleApproveClick = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowApproveModal(true);
  };

  const handleRejectClick = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = () => {
    if (selectedEventId !== null) {
      console.log("승인:", selectedEventId);
      alert(`행사 ID ${selectedEventId}가 승인되었습니다.`);
      setShowApproveModal(false);
      setSelectedEventId(null);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedEventId !== null) {
      console.log("거부:", selectedEventId);
      alert(`행사 ID ${selectedEventId}가 거부되었습니다.`);
      setShowRejectModal(false);
      setSelectedEventId(null);
    }
  };

  const handleModalCancel = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedEventId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="status-badge pending">승인 대기</span>;
      case "approved":
        return <span className="status-badge approved">승인됨</span>;
      case "rejected":
        return <span className="status-badge rejected">거부됨</span>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader title="행사등록 승인" subtitle="하위 관리자가 등록한 행사를 확인하고 승인할 수 있습니다" />

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
              <div className="status-select-container">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="all">전체 상태</option>
                  <option value="pending">승인 대기</option>
                  <option value="approved">승인됨</option>
                  <option value="rejected">거부됨</option>
                </select>
                <div className="status-select-icon">
                  <img src={dropdownIcon} alt="드롭다운" />
                </div>
              </div>
            </div>
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

                  <div className="event-registration-info">
                    <span className="registration-text">등록자: {event.registeredBy}</span>
                    <span className="registration-text">등록일: {event.registeredDate}</span>
                    <span className="registration-text">스태프: {event.staff}명</span>
                    <span className="registration-text">최대 신청 참가자: {event.maxParticipants}명</span>
                  </div>

                  <div className="event-actions">
                    <button className="action-btn primary" onClick={() => handleViewDetails(event.id)}>
                      <img src={detailIcon} alt="" />
                      상세보기
                    </button>
                    <div className="action-icons-group">
                      <button className="action-btn secondary approve" onClick={() => handleApproveClick(event.id)} title="승인">
                        <img src={approveIcon} alt="승인" />
                      </button>
                      <button className="action-btn secondary reject" onClick={() => handleRejectClick(event.id)} title="거부">
                        <img src={rejectIcon} alt="거부" />
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

      <ConfirmModal
        isOpen={showApproveModal}
        title="행사 승인"
        message="이 행사를 승인하시겠습니까?"
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApproveConfirm}
        onCancel={handleModalCancel}
        type="approve"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        title="행사 거부"
        message="이 행사를 거부하시겠습니까?"
        confirmText="거부"
        cancelText="취소"
        onConfirm={handleRejectConfirm}
        onCancel={handleModalCancel}
        type="reject"
      />
    </div>
  );
};

export default EventApproval;

