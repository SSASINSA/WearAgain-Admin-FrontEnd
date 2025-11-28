import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ParticipantManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface ParticipantListResponse {
  participantId: number;
  name: string;
  email: string;
  avatarUrl: string;
  ticketBalance: number;
  creditBalance: number;
  suspended: boolean;
  joinedAt: string;
}

interface ParticipantPageResponse {
  content: ParticipantListResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ParticipantStatsResponse {
  totalParticipants: number;
  totalTickets: number;
  totalCredits: number;
}

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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<ParticipantStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("가입일 최신순");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showSuspensionModal, setShowSuspensionModal] = useState<boolean>(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [selectedParticipantSuspended, setSelectedParticipantSuspended] = useState<boolean>(false);

  const mapDisplayStatusToApiStatus = (displayStatus: string): string | null => {
    switch (displayStatus) {
      case "활성":
        return "false";
      case "비활성":
        return "true";
      default:
        return null;
    }
  };

  const mapDisplaySortToApiSort = (displaySort: string): string => {
    switch (displaySort) {
      case "가입일 최신순":
        return "CREATED_DESC";
      case "가입일 오래된 순":
        return "CREATED_ASC";
      case "이름순":
        return "NAME_ASC";
      default:
        return "CREATED_DESC";
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const suspendedParam = mapDisplayStatusToApiStatus(selectedStatus);
      if (suspendedParam !== null) {
        params.append("suspended", suspendedParam);
      }
      params.append("sortBy", mapDisplaySortToApiSort(sortBy));
      params.append("page", String(currentPage - 1));
      params.append("size", String(itemsPerPage));

      const response = await apiRequest(`/admin/participants?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("참가자 목록 조회에 실패했습니다.");
      }

      const data: ParticipantPageResponse = await response.json();
      const mappedParticipants: Participant[] = data.content.map((p) => ({
        id: p.participantId,
        name: p.name,
        email: p.email,
        avatar: p.avatarUrl || "/admin/img/icon/basic-profile.svg",
        ticketCount: p.ticketBalance,
        ticketType: "일반",
        creditCount: p.creditBalance,
        joinDate: formatDate(p.joinedAt),
        status: p.suspended ? "비활성" : "활성",
      }));

      setParticipants(mappedParticipants);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching participants:", error);
      alert("참가자 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, sortBy, currentPage, itemsPerPage]);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const response = await apiRequest("/admin/participants/stats", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("참가자 통계 조회에 실패했습니다.");
      }

      const data: ParticipantStatsResponse = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSuspensionClick = (participantId: number, suspended: boolean) => {
    setSelectedParticipantId(participantId);
    setSelectedParticipantSuspended(suspended);
    setShowSuspensionModal(true);
  };

  const handleSuspensionConfirm = async () => {
    if (selectedParticipantId === null) return;

    try {
      const response = await apiRequest(`/admin/participants/${selectedParticipantId}/suspension`, {
        method: "PUT",
        body: JSON.stringify({ suspended: !selectedParticipantSuspended }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "정지 상태 변경에 실패했습니다.");
      }

      setShowSuspensionModal(false);
      setSelectedParticipantId(null);
      await fetchParticipants();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "정지 상태 변경에 실패했습니다.";
      alert(errorMessage);
      console.error("Error updating suspension:", error);
    }
  };

  const handleSuspensionCancel = () => {
    setShowSuspensionModal(false);
    setSelectedParticipantId(null);
  };

  const currentParticipants = participants;

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
                <p className={styles["stat-number"]}>
                  {isStatsLoading ? "..." : stats?.totalParticipants.toLocaleString() || 0}
                </p>
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
                <p className={styles["stat-number"]}>
                  {isStatsLoading ? "..." : stats?.totalTickets.toLocaleString() || 0}
                </p>
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
                <p className={styles["stat-number"]}>
                  {isStatsLoading ? "..." : stats?.totalCredits.toLocaleString() || 0}
                </p>
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
              <div
                className={`${styles["filter-section"]} ${isFilterOpen ? styles["is-open"] : styles["is-collapsed"]}`}
              >
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
                render: (p: Participant) => p.ticketCount,
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
                  <button
                    className={`${styles["action-btn"]} ${styles["delete"]}`}
                    title={p.status === "비활성" ? "정지 해제" : "정지"}
                    onClick={() => handleSuspensionClick(p.id, p.status === "비활성")}
                  >
                    <img src="/admin/img/icon/delete.svg" alt={p.status === "비활성" ? "정지 해제" : "정지"} />
                  </button>
                ),
              },
            ]}
            data={isLoading ? [] : currentParticipants}
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
      <ConfirmModal
        isOpen={showSuspensionModal}
        title={selectedParticipantSuspended ? "정지 해제" : "참가자 정지"}
        message={
          selectedParticipantSuspended ? "이 참가자의 정지를 해제하시겠습니까?" : "이 참가자를 정지하시겠습니까?"
        }
        confirmText={selectedParticipantSuspended ? "해제" : "정지"}
        cancelText="취소"
        onConfirm={handleSuspensionConfirm}
        onCancel={handleSuspensionCancel}
        type="reject"
      />
    </div>
  );
};

export default ParticipantManagement;
