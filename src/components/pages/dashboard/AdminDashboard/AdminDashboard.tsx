import React from "react";
import styles from "./AdminDashboard.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, iconBg }) => (
  <div className={styles["stat-card"]}>
    <div className={styles["stat-card-header"]}>
      <div className={styles["stat-icon"]} style={{ backgroundColor: iconBg }}>
        <img src={icon} alt="" />
      </div>
      <span
        className={`${styles["stat-change"]} ${changeType === "positive" ? styles["positive"] : styles["negative"]}`}
      >
        {change}
      </span>
    </div>
    <h4 className={styles["stat-title"]}>{title}</h4>
    <p className={styles["stat-value"]}>{value}</p>
  </div>
);

interface ImpactCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badge: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
  bgColor,
  borderColor,
  badge,
}) => (
  <div className={styles["impact-card"]} style={{ backgroundColor: bgColor, borderColor }}>
    <div className={styles["impact-card-header"]}>
      <div className={styles["impact-icon"]} style={{ backgroundColor: color }}>
        <img src={icon} alt="" />
      </div>
      <span className={styles["impact-badge"]} style={{ backgroundColor: "#ffffff", color }}>
        {badge}
      </span>
    </div>
    <p className={styles["impact-title"]} style={{ color }}>
      {title}
    </p>
    <p className={styles["impact-value"]} style={{ color }}>
      {value}
    </p>
    <p className={styles["impact-description"]} style={{ color }}>
      {description}
    </p>
  </div>
);

interface PartyRankingProps {
  rank: number;
  name: string;
  participants: number;
  exchanges: number;
  rate: number;
  rating: number;
  isTop?: boolean;
}

const PartyRanking: React.FC<PartyRankingProps> = ({
  rank,
  name,
  participants,
  exchanges,
  rate,
  rating,
  isTop = false,
}) => (
  <div className={`${styles["party-ranking"]} ${isTop ? styles["top-party"] : ""}`}>
    <div className={styles["party-info"]}>
      <div className={styles["party-rank"]} style={{ backgroundColor: isTop ? "#06b0b7" : "#9ca3af" }}>
        {rank}
      </div>
      <div className={styles["party-details"]}>
        <h4 className={styles["party-name"]}>{name}</h4>
        <div className={styles["party-stats"]}>
          <span className={`${styles["stat-badge"]} ${styles["stat-badge-participants"]}`}>
            참가자 {participants}명
          </span>
          <span className={`${styles["stat-badge"]} ${styles["stat-badge-exchanges"]}`}>교환량 {exchanges}벌</span>
          <span className={`${styles["stat-badge"]} ${styles["stat-badge-rate"]}`}>교환율 {rate}%</span>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const statsData = [
    {
      title: "개최 파티 횟수",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      icon: "/admin/img/icon/party.svg",
      iconBg: "rgba(6, 176, 183, 0.1)",
    },
    {
      title: "누적 파티 참가자 수",
      value: "24,563",
      change: "+8%",
      changeType: "positive" as const,
      icon: "/admin/img/icon/participants.svg",
      iconBg: "rgba(100, 44, 141, 0.1)",
    },
    {
      title: "누적 파티 참가 아이템 수",
      value: "89,231",
      change: "+15%",
      changeType: "positive" as const,
      icon: "/admin/img/icon/clothes.svg",
      iconBg: "rgba(6, 176, 183, 0.1)",
    },
    {
      title: "누적 교환 아이템 수",
      value: "67,892",
      change: "+21%",
      changeType: "positive" as const,
      icon: "/admin/img/icon/exchange.svg",
      iconBg: "rgba(100, 44, 141, 0.1)",
    },
    {
      title: "의류 교환율",
      value: "76.1%",
      change: "-2%",
      changeType: "negative" as const,
      icon: "/admin/img/icon/exchange-rate.svg",
      iconBg: "rgba(6, 176, 183, 0.1)",
    },
    {
      title: "지원 파티 횟수",
      value: "342",
      change: "+5%",
      changeType: "positive" as const,
      icon: "/admin/img/icon/support-party.svg",
      iconBg: "rgba(100, 44, 141, 0.1)",
    },
  ];

  const impactData = [
    {
      title: "CO2(kg) 절감량",
      value: "12,847",
      description: "승용차 54,231km 주행량과 동일",
      icon: "/admin/img/icon/co2.svg",
      color: "#059669",
      bgColor: "#dcfce7",
      borderColor: "#bbf7d0",
      badge: "환경보호",
    },
    {
      title: "에너지(KWh) 절약량",
      value: "89,234",
      description: "일반 가정 24가구 1년 사용량",
      icon: "/admin/img/icon/energy.svg",
      color: "#d97706",
      bgColor: "#fef3c7",
      borderColor: "#fde68a",
      badge: "에너지",
    },
    {
      title: "물(L) 절약량",
      value: "456,789",
      description: "수영장 1.2개 분량",
      icon: "/admin/img/icon/water.svg",
      color: "#2563eb",
      bgColor: "#dbeafe",
      borderColor: "#bfdbfe",
      badge: "물 절약",
    },
  ];

  const partyRankings = [
    {
      rank: 1,
      name: "홍대 빈티지 파티",
      participants: 247,
      exchanges: 317,
      rate: 89,
      rating: 4.9,
      isTop: true,
    },
    {
      rank: 2,
      name: "강남 럭셔리 교환",
      participants: 189,
      exchanges: 243,
      rate: 82,
      rating: 4.7,
    },
    {
      rank: 3,
      name: "이태원 글로벌 마켓",
      participants: 156,
      exchanges: 170,
      rate: 76,
      rating: 4.5,
    },
    {
      rank: 4,
      name: "신촌 대학생 파티",
      participants: 134,
      exchanges: 126,
      rate: 71,
      rating: 4.3,
    },
    {
      rank: 5,
      name: "건대 캐주얼 마켓",
      participants: 98,
      exchanges: 87,
      rate: 68,
      rating: 4.1,
    },
  ];

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="대시보드" subtitle="전체 현황과 통계를 한눈에 확인하세요" />

        <div className={styles["dashboard-content"]}>
          <section className={styles["stats-title-section"]}>
            <h2>전체 행사 현황</h2>
          </section>
          <section className={styles["stats-cards-section"]}>
            <div className={styles["stats-grid"]}>
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </section>

          <section className={styles["impact-section"]}>
            <h2>누적 환경 임팩트</h2>
            <div className={styles["impact-grid"]}>
              {impactData.map((impact, index) => (
                <ImpactCard key={index} {...impact} />
              ))}
            </div>
          </section>

          <section className={styles["ranking-section"]}>
            <div className={styles["ranking-header"]}>
              <h2>인기 21% 파티 현황</h2>
              <p className={styles["update-time"]}>실시간 업데이트</p>
            </div>
            <div className={styles["ranking-list"]}>
              {partyRankings.map((party, index) => (
                <PartyRanking key={index} {...party} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
