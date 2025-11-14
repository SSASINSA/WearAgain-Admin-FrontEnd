import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../common/PageHeader/PageHeader";
import styles from "./EventsManagement.module.css";

const searchIcon = "/admin/img/icon/search.svg";
const dropdownIcon = "/admin/img/icon/dropdown.svg";
const plusIcon = "/admin/img/icon/plus.svg";
const calendarIcon = "/admin/img/icon/calendar.svg";
const locationIcon = "/admin/img/icon/location.svg";
const staffIcon = "/admin/img/icon/staff.svg";
const participantIcon = "/admin/img/icon/user-group.svg";
const detailIcon = "/admin/img/icon/detail.svg";
const editIcon = "/admin/img/icon/edit.svg";
const deleteIcon = "/admin/img/icon/trash.svg";
const qrIcon = "/admin/img/icon/qr-code.svg";
const prevIcon = "/admin/img/icon/chevron-left.svg";
const nextIcon = "/admin/img/icon/arrow-right.svg";

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
      title: "서울 강남구 옷 교환 파티",
      date: "2024.03.15 - 2024.03.16",
      location: "서울 강남구 그린센터",
      participants: 250,
      staff: 12,
      status: "active",
      description: "옷을 버리는 대신 교환하는 환경 보호 행사",
    },
    {
      id: 2,
      title: "부산 해운대 옷 교환 행사",
      date: "2024.04.20 - 2024.04.21",
      location: "부산 해운대구 문화센터",
      participants: 180,
      staff: 8,
      status: "upcoming",
      description: "지속가능한 패션을 위한 옷 교환 행사",
    },
    {
      id: 3,
      title: "서울 DDP 옷 교환 데이",
      date: "2024.02.28 - 2024.02.28",
      location: "서울 DDP 디자인랩",
      participants: 320,
      staff: 15,
      status: "completed",
      description: "환경을 지키는 옷 교환 행사",
    },
    {
      id: 4,
      title: "서울 마포구 옷 교환 파티",
      date: "2024.03.15 - 2024.03.16",
      location: "서울 마포구 문화복합공간",
      participants: 250,
      staff: 12,
      status: "active",
      description: "21%파티 옷 교환으로 환경 보호하기",
    },
    {
      id: 5,
      title: "인천 송도 옷 교환 행사",
      date: "2024.04.20 - 2024.04.21",
      location: "인천 송도국제도시 컨벤션센터",
      participants: 180,
      staff: 8,
      status: "upcoming",
      description: "옷 교환을 통한 지속가능한 패션 실천",
    },
    {
      id: 6,
      title: "대전 유성구 옷 교환 데이",
      date: "2024.02.28 - 2024.02.28",
      location: "대전 유성구 과학문화센터",
      participants: 320,
      staff: 15,
      status: "completed",
      description: "환경 보호를 위한 옷 교환 행사",
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
        return <span className={`${styles["status-badge"]} ${styles["active"]}`}>진행중</span>;
      case "completed":
        return <span className={`${styles["status-badge"]} ${styles["completed"]}`}>완료</span>;
      case "upcoming":
        return <span className={`${styles["status-badge"]} ${styles["upcoming"]}`}>예정</span>;
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
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="행사 관리" subtitle="등록된 행사를 확인하고 관리할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          <div className={styles["events-controls"]}>
            <div className={styles["search-filter-section"]}>
              <div className={styles["search-input-container"]}>
                <div className={styles["search-icon"]}>
                  <img src={searchIcon} alt="검색" />
                </div>
                <input
                  type="text"
                  placeholder="행사 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles["search-input"]}
                />
              </div>
              <div className={styles["status-select-container"]}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={styles["status-select"]}
                >
                  <option value="all">전체 상태</option>
                  <option value="active">진행중</option>
                  <option value="upcoming">예정</option>
                  <option value="completed">완료</option>
                </select>
                <div className={styles["status-select-icon"]}>
                  <img src={dropdownIcon} alt="드롭다운" />
                </div>
              </div>
            </div>
            <button className={styles["add-event-btn"]} onClick={() => navigate("/events/register")}>
              <img src={plusIcon} alt="" />새 행사 만들기
            </button>
          </div>

          <div className={styles["events-grid"]}>
            {currentEvents.map((event) => (
              <div key={event.id} className={styles["event-card"]}>
                <div className={styles["event-card-content"]}>
                  <div className={styles["event-header"]}>
                    <h3 className={styles["event-title"]}>{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>

                  <div className={styles["event-details"]}>
                    <div className={styles["event-detail"]}>
                      <span className={styles["detail-icon"]}>
                        <img src={calendarIcon} alt="날짜" />
                      </span>
                      <span className={styles["detail-text"]}>{event.date}</span>
                    </div>
                    <div className={styles["event-detail"]}>
                      <span className={styles["detail-icon"]}>
                        <img src={locationIcon} alt="위치" />
                      </span>
                      <span className={styles["detail-text"]}>{event.location}</span>
                    </div>
                  </div>

                  <div className={styles["event-stats"]}>
                    <div className={styles["stat-item"]}>
                      <span className={styles["stat-icon"]}>
                        <img src={participantIcon} alt="참가자" />
                      </span>
                      <span className={styles["stat-text"]}>참가자 {event.participants}명</span>
                    </div>
                    <div className={styles["stat-item"]}>
                      <span className={styles["stat-icon"]}>
                        <img src={staffIcon} alt="스태프" />
                      </span>
                      <span className={styles["stat-text"]}>스태프 {event.staff}명</span>
                    </div>
                  </div>

                  <div className={styles["event-actions"]}>
                    <button
                      className={`${styles["action-btn"]} ${styles["primary"]}`}
                      onClick={() => handleViewDetails(event.id)}
                    >
                      <img src={detailIcon} alt="" />
                      상세보기
                    </button>
                    <div className={styles["action-icons-group"]}>
                      <button className={`${styles["action-btn"]} ${styles["secondary"]}`}>
                        <img src={editIcon} alt="수정" />
                      </button>
                      <button className={`${styles["action-btn"]} ${styles["secondary"]}`}>
                        <img src={qrIcon} alt="QR" />
                      </button>
                      <button className={`${styles["action-btn"]} ${styles["secondary"]} ${styles["delete"]}`}>
                        <img src={deleteIcon} alt="삭제" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles["pagination-section"]}>
            <div className={styles["pagination-info"]}>
              총 {filteredEvents.length}개 행사 중 {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)}개 표시
            </div>
            <div className={styles["pagination-controls"]}>
              <button
                className={styles["pagination-btn"]}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <img src={prevIcon} alt="이전" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles["pagination-btn"]} ${currentPage === page ? styles["active"] : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={styles["pagination-btn"]}
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
