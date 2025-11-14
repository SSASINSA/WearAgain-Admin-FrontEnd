import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ParticipantManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

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
  const [participants] = useState<Participant[]>([
    {
      id: 1,
      name: "김민지",
      email: "minji.kim@email.com",
      avatar: "/admin/img/icon/basic-profile.svg",
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
      avatar: "/admin/img/icon/basic-profile.svg",
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
      avatar: "/admin/img/icon/basic-profile.svg",
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
      avatar: "/admin/img/icon/basic-profile.svg",
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
      avatar: "/admin/img/icon/basic-profile.svg",
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
    return dateB.getTime() - dateA.getTime();
  });

  const totalPages = Math.ceil(sortedParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParticipants = sortedParticipants.slice(startIndex, startIndex + itemsPerPage);

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
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <header className={styles["participant-header"]} style={{ padding: 0, borderBottom: "none", height: "auto" }}>
          <PageHeader title="참가자 관리" subtitle="이벤트 참가자 목록을 확인하고 관리하세요" />
        </header>

        {/* 통계 카드 섹션 */}
        <div className={styles["stats-section"]}>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>총 참가자</h3>
                <p className={styles["stat-number"]}>1,247</p>
                <p className={`${styles["stat-change"]} ${styles["positive"]}`}>+12% 전월 대비</p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/users.svg" alt="참가자" />
              </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>총 티켓</h3>
                <p className={styles["stat-number"]}>3,891</p>
                <p className={`${styles["stat-change"]} ${styles["positive"]}`}>+8% 전월 대비</p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/ticket.svg" alt="티켓" />
              </div>
            </div>
          </div>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-content"]}>
              <div className={styles["stat-info"]}>
                <h3>총 크레딧</h3>
                <p className={styles["stat-number"]}>45,230</p>
                <p className={`${styles["stat-change"]} ${styles["negative"]}`}>-3% 전월 대비</p>
              </div>
              <div className={styles["stat-icon"]}>
                <img src="/admin/img/icon/credit.svg" alt="크레딧" />
              </div>
            </div>
          </div>
        </div>

        {/* 참가자 목록 섹션 */}
        <div className={styles["participants-section"]}>
          <DataList
            headerTitle="참가자 목록"
            renderFilters={() => (
              <div className={`${styles["filter-section"]} ${isFilterOpen ? styles["is-open"] : styles["is-collapsed"]}`}>
                <div className={styles["filter-header"]}>
                  <h3>필터 및 검색</h3>
                  <button
                    className={`${styles["filter-toggle"]} ${isFilterOpen ? styles["open"] : ""}`}
                    aria-expanded={isFilterOpen}
                    onClick={() => setIsFilterOpen((v) => !v)}
                  >
                    ▼
                  </button>
                </div>
                <div className={`${styles["filter-controls"]} ${isFilterOpen ? styles["is-open"] : ""}`}>
                  <div className={styles["search-container"]}>
                    <div className={styles["search-icon"]}>
                      <img src="/admin/img/icon/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="참가자 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles["search-input"]}
                    />
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={styles["status-select"]}
                    >
                      <option value="">전체 상태</option>
                      <option value="활성">활성</option>
                      <option value="대기">대기</option>
                      <option value="비활성">비활성</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["sort-select-container"]}>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={styles["sort-select"]}
                    >
                      <option value="가입일 최신순">가입일 최신순</option>
                      <option value="가입일 오래된 순">가입일 오래된 순</option>
                      <option value="이름순">이름순</option>
                    </select>
                    <div className={styles["sort-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            columns={[
              {
                key: "info",
                title: "참가자 정보",
                width: 250,
                render: (p: Participant) => (
                  <div className={styles["participant-info"]}>
                    <img src={p.avatar} alt={p.name} className={styles["participant-avatar"]} />
                    <div className={styles["participant-details"]}>
                      <p
                        className={`${styles["participant-name"]} ${styles["clickable"]}`}
                        onClick={() => navigate(`/repair/${p.id}`, { state: p })}
                      >
                        {p.name}
                      </p>
                      <p className={styles["participant-email"]}>{p.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "tickets",
                title: "티켓 개수",
                width: 150,
                render: (p: Participant) => (
                  <div className={styles["ticket-info-horizontal"]}>
                    <span className={styles["ticket-count"]}>{p.ticketCount}</span>
                    <span className={styles["ticket-type"]} style={{ backgroundColor: getTicketTypeColor(p.ticketType) }}>
                      {p.ticketType}
                    </span>
                  </div>
                ),
              },
              {
                key: "credit",
                title: "크레딧 수",
                width: 130,
                render: (p: Participant) => p.creditCount.toLocaleString(),
              },
              { key: "date", title: "가입일", width: 130, render: (p: Participant) => p.joinDate },
              {
                key: "status",
                title: "상태",
                width: 100,
                render: (p: Participant) => (
                  <span className={styles["status-badge"]} style={{ backgroundColor: getStatusColor(p.status) }}>
                    {p.status}
                  </span>
                ),
              },
              {
                key: "actions",
                title: "작업",
                width: 60,
                align: "center",
                className: styles["actions-cell"],
                render: (p: Participant) => (
                  <button className={`${styles["action-btn"]} ${styles["delete"]}`} title="삭제">
                    <img src="/admin/img/icon/delete.svg" alt="삭제" />
                  </button>
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
