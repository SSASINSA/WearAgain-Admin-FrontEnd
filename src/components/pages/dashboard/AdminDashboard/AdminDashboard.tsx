import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import styles from "./AdminDashboard.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "utils/api";

const PERIOD_OPTIONS: { key: "MONTH_1" | "MONTH_3" | "YEAR_1"; label: string }[] = [
  { key: "MONTH_1", label: "1개월" },
  { key: "MONTH_3", label: "3개월" },
  { key: "YEAR_1", label: "1년" },
];

const SERIES_CONFIG = [
  { key: "participants", name: "참가자 수", fill: "#4FB3B3", dotClass: "participant-dot" },
  { key: "donated", name: "기부된 옷", fill: "#93B5E1", dotClass: "donation-dot" },
  { key: "exchanged", name: "교환된 옷", fill: "#C8A2C8", dotClass: "exchange-dot" },
] as const;

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

interface EventMetric {
  eventId: number | string;
  name: string;
  location: string;
  participants: number;
  exchanged: number;
  donated: number;
}

interface OverviewResponse {
  overview: {
    totalOpenOrClosed: number;
    managerHosted: number;
    cumulativeParticipants: number;
    donatedClothes: number;
    exchangedClothes: number;
    exchangeRate: number;
  };
  impact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
  createdAt: string;
}

const StatusRow: React.FC<{
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  disabled?: boolean;
}> = ({ loading, error, onRetry, disabled }) => (
  <div className={styles["status-row"]}>
    {loading && <span className={styles["status-text"]}>로딩 중...</span>}
    {error && (
      <>
        <span className={styles["status-text"]}>{error}</span>
        <button className={styles["retry-button"]} onClick={onRetry} disabled={disabled}>
          다시 시도
        </button>
      </>
    )}
  </div>
);

const SkeletonStatCard = () => (
  <div className={`${styles["skeleton"]} ${styles["skeleton-card"]}`}>
    <div className={styles["row"]}>
      <div className={`${styles["icon-dot"]} ${styles["skeleton"]}`} />
      <div className={`${styles["line-short"]} ${styles["skeleton"]}`} />
    </div>
    <div className={`${styles["line-long"]} ${styles["skeleton"]}`} />
    <div className={`${styles["line-short"]} ${styles["skeleton"]}`} />
  </div>
);

const SkeletonImpactCard = () => (
  <div className={`${styles["skeleton"]} ${styles["skeleton-impact"]}`}>
    <div className={`${styles["pill"]} ${styles["skeleton"]}`} />
    <div className={`${styles["line-short"]} ${styles["skeleton"]}`} />
    <div className={`${styles["line-long"]} ${styles["skeleton"]}`} />
    <div className={`${styles["line-short"]} ${styles["skeleton"]}`} />
  </div>
);

const SkeletonBarChart = () => (
  <div className={`${styles["skeleton"]} ${styles["skeleton-bar"]}`}>
    <div className={`${styles["line-short"]} ${styles["skeleton"]}`} />
    <div className={styles["bar-row"]}>
      {Array.from({ length: 7 }).map((_, idx) => (
        <div key={idx} className={`${styles["bar"]} ${styles["skeleton"]}`} />
      ))}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewResponse["overview"] | null>(null);
  const [impactData, setImpactData] = useState<OverviewResponse["impact"] | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [eventMetrics, setEventMetrics] = useState<EventMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"MONTH_1" | "MONTH_3" | "YEAR_1">("MONTH_1");

  const chartWidth = Math.max((eventMetrics.length || 1) * 140, 780);
  const maxCount = eventMetrics.length
    ? Math.max(...eventMetrics.flatMap((event) => [event.participants, event.exchanged, event.donated]))
    : 0;
  const yAxisMax = maxCount ? Math.ceil(maxCount * 1.2) : 100;
  const chartRef = useRef<HTMLDivElement | null>(null);
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    eventMetrics.forEach((ev) => {
      const key = String(ev.eventId ?? ev.name);
      map.set(key, ev.name);
    });
    return map;
  }, [eventMetrics]);

  const countFormatter = (value: number) => `${value.toLocaleString()}`;
  const participantFormatter = (value: number) => `${value.toLocaleString()}`;
  const percentFormatter = (value: number) => `${((value || 0) * 100).toFixed(1)}%`;

  const statsData = useMemo(() => {
    const ov = overviewData;
    const totalOpenOrClosed = ov?.totalOpenOrClosed ?? 0;
    const managerHosted = ov?.managerHosted ?? 0;
    const cumulativeParticipants = ov?.cumulativeParticipants ?? 0;
    const donatedClothes = ov?.donatedClothes ?? 0;
    const exchangedClothes = ov?.exchangedClothes ?? 0;
    const exchangeRate = ov?.exchangeRate ?? 0;
    return [
      {
        title: "열림/종료 행사 수",
        value: totalOpenOrClosed.toLocaleString(),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/party.svg",
        iconBg: "rgba(6, 176, 183, 0.1)",
      },
      {
        title: "매니저 개최",
        value: managerHosted.toLocaleString(),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/support-party.svg",
        iconBg: "rgba(100, 44, 141, 0.1)",
      },
      {
        title: "누적 참가자",
        value: cumulativeParticipants.toLocaleString(),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/participants.svg",
        iconBg: "rgba(6, 176, 183, 0.1)",
      },
      {
        title: "기부된 옷",
        value: donatedClothes.toLocaleString(),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/clothes.svg",
        iconBg: "rgba(100, 44, 141, 0.1)",
      },
      {
        title: "교환된 옷",
        value: exchangedClothes.toLocaleString(),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/exchange.svg",
        iconBg: "rgba(6, 176, 183, 0.1)",
      },
      {
        title: "의류 교환율",
        value: percentFormatter(exchangeRate),
        change: "",
        changeType: "positive" as const,
        icon: "/admin/img/icon/exchange-rate.svg",
        iconBg: "rgba(100, 44, 141, 0.1)",
      },
    ];
  }, [overviewData]);

  const impactCards = useMemo(() => {
    const impact = impactData;
    if (!impact) {
      return [
        {
          title: "CO2(kg) 절감량",
          value: "0",
          description: "데이터 수신 전",
          icon: "/admin/img/icon/co2.svg",
          color: "#059669",
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
          badge: "환경보호",
        },
        {
          title: "에너지(KWh) 절약량",
          value: "0",
          description: "데이터 수신 전",
          icon: "/admin/img/icon/energy.svg",
          color: "#d97706",
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
          badge: "에너지",
        },
        {
          title: "물(L) 절약량",
          value: "0",
          description: "데이터 수신 전",
          icon: "/admin/img/icon/water.svg",
          color: "#2563eb",
          bgColor: "#ffffff",
          borderColor: "#e5e7eb",
          badge: "물 절약",
        },
      ];
    }

    const co2 = Math.round(impact.co2Saved || 0);
    const water = Math.round(impact.waterSaved || 0);
    const energy = Math.round(impact.energySaved || 0);

    return [
      {
        title: "CO2 절감량",
        value: co2.toLocaleString(),
        description: "실시간 누적 (단위: kg)",
        icon: "/admin/img/icon/co2.svg",
        color: "#059669",
        bgColor: "#ffffff",
        borderColor: "#e5e7eb",
        badge: "환경보호",
      },
      {
        title: "에너지 절약량",
        value: energy.toLocaleString(),
        description: "실시간 누적 (단위: kWh)",
        icon: "/admin/img/icon/energy.svg",
        color: "#d97706",
        bgColor: "#ffffff",
        borderColor: "#e5e7eb",
        badge: "에너지",
      },
      {
        title: "물 절약량",
        value: water.toLocaleString(),
        description: "실시간 누적 (단위: L)",
        icon: "/admin/img/icon/water.svg",
        color: "#2563eb",
        bgColor: "#ffffff",
        borderColor: "#e5e7eb",
        badge: "물 절약",
      },
    ];
  }, [impactData]);

  const tooltipFormatter = (value: ValueType, name: NameType) => {
    if (name === "participants") return [participantFormatter(Number(value)), "참가자 수"];
    if (name === "donated") return [countFormatter(Number(value)), "기부된 옷"];
    if (name === "exchanged") return [countFormatter(Number(value)), "교환된 옷"];
    return [value, name];
  };

  // Custom tooltip uses any to keep compatibility across Recharts type versions
  const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const eventPayload = payload[0]?.payload || {};
      const eventId = eventPayload.eventId ?? label;
      const eventName = eventPayload.name || nameById.get(String(eventId)) || "";
      return (
        <div className={styles["tooltip-container"]}>
          <p className={styles["tooltip-title"]}>
            {eventName || eventId}
          </p>
          {(payload as any[]).map((entry: any) => (
            <p key={entry.dataKey} className={styles["tooltip-item"]}>
              <span className={styles["tooltip-dot"]} style={{ backgroundColor: entry.fill || "#000" }} />
              <span className={styles["tooltip-label"]}>
                {entry.dataKey === "participants" && "참가자 수"}
                {entry.dataKey === "donated" && "기부된 옷"}
                {entry.dataKey === "exchanged" && "교환된 옷"}
              </span>
              <span className={styles["tooltip-value"]}>{tooltipFormatter(entry.value as number, entry.dataKey)[0]}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const fetchEventMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/admin/dashboard/metrics?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const apiItems = (data?.items || []) as any[];

      const mapped: EventMetric[] = apiItems.map((item, idx) => {
        const start = item.startDate ? String(item.startDate) : "";
        const end = item.endDate ? String(item.endDate) : "";
        const range = start && end ? `${start} ~ ${end}` : start || end || "일정 미정";
        return {
          eventId: item.eventId ?? item.id ?? idx + 1,
          name: item.title || item.eventName || "이벤트",
          location: range,
          participants: Number(item.participants ?? item.participantCount ?? 0),
          exchanged: Number(item.exchangedClothes ?? item.exchanged ?? item.exchangedCount ?? 0),
          donated: Number(item.donatedClothes ?? item.donated ?? item.donatedCount ?? 0),
        };
      });
      setEventMetrics(mapped);
    } catch (err) {
      console.error("Failed to load event metrics", err);
      setError("데이터를 불러오지 못했습니다. 다시 시도해주세요.");
      setEventMetrics([]);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const response = await apiRequest(`/admin/dashboard/overview`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: OverviewResponse = await response.json();
      setOverviewData(data.overview);
      setImpactData(data.impact);
    } catch (err) {
      console.error("Failed to load dashboard overview", err);
      setOverviewError("대시보드 개요를 불러오지 못했습니다.");
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventMetrics();
  }, [fetchEventMetrics]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const el = chartRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [eventMetrics.length]);

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="대시보드" subtitle="전체 현황과 통계를 한눈에 확인하세요" />

        <div className={styles["dashboard-content"]}>
          <section className={styles["event-metrics-section"]}>
            <div className={styles["section-header"]}>
              <div>
                <h2>행사별 지표</h2>
              </div>
              <div className={styles["control-row"]}>
                <div className={styles["legend"]}>
                  {SERIES_CONFIG.map((item) => (
                    <span key={item.key} className={styles["legend-item"]}>
                      <span className={`${styles["legend-dot"]} ${styles[item.dotClass]}`} /> {item.name}
                    </span>
                  ))}
                </div>
                <div className={styles["period-toggle"]}>
                  {PERIOD_OPTIONS.map((item) => (
                    <button
                      key={item.key}
                      className={`${styles["period-button"]} ${
                        period === item.key ? styles["period-button-active"] : ""
                      }`}
                      onClick={() => setPeriod(item.key as "MONTH_1" | "MONTH_3" | "YEAR_1")}
                      disabled={isLoading}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <StatusRow loading={isLoading} error={error} onRetry={fetchEventMetrics} disabled={isLoading} />

            <div className={styles["chart-scroll"]} ref={chartRef}>
              <div style={{ width: `${chartWidth}px`, minWidth: "100%" }}>
                {isLoading ? (
                  <SkeletonBarChart />
                ) : (
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart
                      data={eventMetrics}
                      width={chartWidth}
                      margin={{ top: 16, right: 24, left: 8, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="eventId"
                        tick={{ fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(value) => nameById.get(String(value)) || String(value)}
                      />
                      <YAxis
                        yAxisId="countAxis"
                        orientation="right"
                        domain={[0, yAxisMax]}
                        tickFormatter={(value) => `${(value as number).toLocaleString()}`}
                        tick={{ fontSize: 12 }}
                        label={{ value: "참가자/교환/기부(건)", angle: 90, position: "insideRight", offset: 10 }}
                      />
                      <Tooltip content={<CustomTooltip />} formatter={tooltipFormatter} />
                    {SERIES_CONFIG.map((series) => (
                      <Bar
                        key={series.key}
                        name={series.name}
                        dataKey={series.key}
                        yAxisId="countAxis"
                        fill={series.fill}
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey={series.key}
                          position="top"
                          formatter={(value: any) =>
                            series.key === "participants"
                              ? participantFormatter(Number(value))
                              : countFormatter(Number(value))
                          }
                          fill="#4b5563"
                        />
                      </Bar>
                    ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          <section className={styles["stats-title-section"]}>
            <h2>전체 행사 현황</h2>
            <div className={styles["status-row"]}>
              {overviewLoading && <span className={styles["status-text"]}>로딩 중...</span>}
              {overviewError && (
                <>
                  <span className={styles["status-text"]}>{overviewError}</span>
                  <button className={styles["retry-button"]} onClick={fetchOverview} disabled={overviewLoading}>
                    다시 시도
                  </button>
                </>
              )}
            </div>
          </section>
          <section className={styles["stats-cards-section"]}>
            <div className={styles["stats-grid"]}>
              {overviewLoading
                ? Array.from({ length: 6 }).map((_, idx) => <SkeletonStatCard key={idx} />)
                : statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
            </div>
          </section>

          <section className={styles["impact-section"]}>
            <h2>누적 환경 임팩트</h2>
            <StatusRow loading={overviewLoading} error={overviewError} onRetry={fetchOverview} disabled={overviewLoading} />
            <div className={styles["impact-grid"]}>
              {overviewLoading
                ? Array.from({ length: 3 }).map((_, idx) => <SkeletonImpactCard key={idx} />)
                : impactCards.map((impact, index) => <ImpactCard key={index} {...impact} />)}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
