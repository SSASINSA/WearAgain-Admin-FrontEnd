import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ParticipantDetail.css";

interface ParticipantDetailState {
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

const MOCK_PARTICIPANTS: ParticipantDetailState[] = [
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
];

const ParticipantDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as Partial<ParticipantDetailState>;

  const mock = MOCK_PARTICIPANTS.find((p) => p.id === Number(id));
  const display = {
    id: state.id ?? mock?.id ?? Number(id),
    name: state.name ?? mock?.name ?? "이름 미상",
    email: state.email ?? mock?.email ?? "-",
    avatar: state.avatar ?? mock?.avatar ?? "/admin/img/icon/basic-profile.svg",
    ticketCount: state.ticketCount ?? mock?.ticketCount ?? 0,
    ticketType: state.ticketType ?? mock?.ticketType ?? "일반",
    creditCount: state.creditCount ?? mock?.creditCount ?? 0,
    joinDate: state.joinDate ?? mock?.joinDate ?? "-",
    status: state.status ?? mock?.status ?? "활성",
  };

  const impactRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const syncHeights = () => {
      const container = impactRef.current;
      if (!container) return;
      const cards = container.querySelectorAll<HTMLDivElement>(".impact-card");
      cards.forEach((card) => {
        const width = card.clientWidth;
        card.style.height = `${width}px`;
      });
    };
    syncHeights();
    window.addEventListener("resize", syncHeights);
    return () => window.removeEventListener("resize", syncHeights);
  }, []);

  return (
    <div className="participant-detail-page">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
        <div className="header-content">
          <div className="header-info">
            <h1>참가자 상세</h1>
            <p>참가자 정보를 확인하고 관리하세요</p>
          </div>
        </div>
      </header>

      <main className="detail-content">
        {/* 상단 섹션 */}
        <section className="top-section">
          <div className="top-left">
            {/* 참가자 요약 카드 */}
            <section className="section summary-card">
              <div className="summary-left">
                <img className="avatar large" src={display.avatar} alt={display.name} />
                <div className="summary-meta">
                  <h2 className="summary-name">{display.name}</h2>
                  <div className="inline-stats">
                    <span className="chip">
                      <img src="/admin/img/icon/ticket-icon.svg" alt="티켓" />
                      티켓 {display.ticketCount}장
                    </span>
                    <span className="chip">
                      <img src="/admin/img/icon/credit-icon.svg" alt="크레딧" />
                      크레딧 {display.creditCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 환경 임팩트 기록 섹션 */}
            <section className="section impact-section" ref={impactRef}>
              <h3>환경 임팩트 기록</h3>
              <div className="impact-cards">
                <div className="impact-card green">
                  <div className="impact-icon">
                    <img src="/admin/img/icon/co2-impact.svg" alt="CO2" />
                  </div>
                  <div className="impact-title">CO2 절감량</div>
                  <div className="impact-value green">156.7</div>
                  <div className="impact-unit">kg</div>
                </div>
                <div className="impact-card yellow">
                  <div className="impact-icon">
                    <img src="/admin/img/icon/energy-impact.svg" alt="에너지" />
                  </div>
                  <div className="impact-title">에너지 절감량</div>
                  <div className="impact-value yellow">892.3</div>
                  <div className="impact-unit">kWh</div>
                </div>
                <div className="impact-card blue">
                  <div className="impact-icon">
                    <img src="/admin/img/icon/water-impact.svg" alt="물 절약" />
                  </div>
                  <div className="impact-title">물 절약량</div>
                  <div className="impact-value blue">2,450</div>
                  <div className="impact-unit">L</div>
                </div>
              </div>
            </section>
          </div>

          <aside className="top-right">
            {/* 옷 키우기 섹션 */}
            <section className="section grow-card">
              <h3>옷 키우기</h3>
              <div className="grow-hero">
                <img src="/admin/img/example/grow-hero.svg" alt="캐릭터" />
              </div>
              <div className="level">레벨 7</div>
              <div className="progress-bar">
                <div className="progress" style={{ width: "35%" }} />
              </div>
              <div className="progress-text">다음 레벨까지 35%</div>
              <div className="scissor-box">
                <div className="label">
                  <img src="/admin/img/icon/scissor-icon.svg" alt="가위" />
                  레벨업 가위
                </div>
                <div className="value">8개</div>
              </div>
            </section>
          </aside>
        </section>

        {/* 하단 섹션 */}
        <section className="bottom-section">
          {/* 획득한 옷 섹션 */}
          <section className="section clothes-section">
            <h3>획득한 옷</h3>
            <div className="clothes-grid">
              <div className="clothes-item">
                <img src="/admin/img/example/clothes-tshirt.png" alt="친환경 티셔츠" />
                <p>친환경 티셔츠</p>
              </div>
              <div className="clothes-item">
                <img src="/admin/img/example/clothes-jeans.png" alt="지속가능 청바지" />
                <p>지속가능 청바지</p>
              </div>
              <div className="clothes-item">
                <img src="/admin/img/example/clothes-shoes.png" alt="재활용 운동화" />
                <p>재활용 운동화</p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ParticipantDetail;
