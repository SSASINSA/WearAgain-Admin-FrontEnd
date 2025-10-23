import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, iconBg }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div className="stat-icon" style={{ backgroundColor: iconBg }}>
        <img src={icon} alt="" />
      </div>
      <span className={`stat-change ${changeType === 'positive' ? 'positive' : 'negative'}`}>
        {change}
      </span>
    </div>
    <h4 className="stat-title">{title}</h4>
    <p className="stat-value">{value}</p>
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
}

const ImpactCard: React.FC<ImpactCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  color, 
  bgColor, 
  borderColor 
}) => (
  <div className="impact-card" style={{ borderColor }}>
    <div className="impact-card-header">
      <div className="impact-icon" style={{ backgroundColor: color }}>
        <img src={icon} alt="" />
      </div>
      <span className="impact-badge" style={{ backgroundColor: bgColor, color }}>
        환경보호
      </span>
    </div>
    <p className="impact-title" style={{ color }}>{title}</p>
    <p className="impact-value" style={{ color }}>{value}</p>
    <p className="impact-description" style={{ color }}>{description}</p>
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
  isTop = false 
}) => (
  <div className={`party-ranking ${isTop ? 'top-party' : ''}`}>
    <div className="party-info">
      <div className="party-rank" style={{ backgroundColor: isTop ? '#06b0b7' : '#9ca3af' }}>
        {rank}
      </div>
      <div className="party-details">
        <h4 className="party-name">{name}</h4>
        <p className="party-stats">
          참가자 {participants}명 • 교환량 {exchanges}벌 • 교환율 {rate}%
        </p>
      </div>
    </div>
    <div className="party-rating">
      <p className="rating-score" style={{ color: isTop ? '#06b0b7' : '#374151' }}>
        {rating}점
      </p>
      <p className="rating-label">만족도</p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const statsData = [
    {
      title: '개최 파티 횟수',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '/assets/party-icon.svg',
      iconBg: 'rgba(6, 176, 183, 0.1)'
    },
    {
      title: '누적 파티 참가자 수',
      value: '24,563',
      change: '+8%',
      changeType: 'positive' as const,
      icon: '/assets/participants-icon.svg',
      iconBg: 'rgba(100, 44, 141, 0.1)'
    },
    {
      title: '누적 파티 참가 아이템 수',
      value: '89,231',
      change: '+15%',
      changeType: 'positive' as const,
      icon: '/assets/items-icon.svg',
      iconBg: 'rgba(6, 176, 183, 0.1)'
    },
    {
      title: '누적 교환 아이템 수',
      value: '67,892',
      change: '+21%',
      changeType: 'positive' as const,
      icon: '/assets/exchange-icon.svg',
      iconBg: 'rgba(100, 44, 141, 0.1)'
    },
    {
      title: '의류 교환율',
      value: '76.1%',
      change: '-2%',
      changeType: 'negative' as const,
      icon: '/assets/rate-icon.svg',
      iconBg: 'rgba(6, 176, 183, 0.1)'
    },
    {
      title: '지원 파티 횟수',
      value: '342',
      change: '+5%',
      changeType: 'positive' as const,
      icon: '/assets/support-icon.svg',
      iconBg: 'rgba(100, 44, 141, 0.1)'
    }
  ];

  const impactData = [
    {
      title: '전체 CO2(kg) 절감량',
      value: '12,847',
      description: '승용차 54,231km 주행량과 동일',
      icon: '/assets/co2-icon.svg',
      color: '#059669',
      bgColor: '#dcfce7',
      borderColor: '#bbf7d0'
    },
    {
      title: '에너지(KWh) 절약량',
      value: '89,234',
      description: '일반 가정 24가구 1년 사용량',
      icon: '/assets/energy-icon.svg',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fde68a'
    },
    {
      title: '물(L) 절약량',
      value: '456,789',
      description: '수영장 1.2개 분량',
      icon: '/assets/water-icon.svg',
      color: '#2563eb',
      bgColor: '#dbeafe',
      borderColor: '#bfdbfe'
    }
  ];

  const partyRankings = [
    {
      rank: 1,
      name: '홍대 빈티지 파티',
      participants: 247,
      exchanges: 317,
      rate: 89,
      rating: 4.9,
      isTop: true
    },
    {
      rank: 2,
      name: '강남 럭셔리 교환',
      participants: 189,
      exchanges: 243,
      rate: 82,
      rating: 4.7
    },
    {
      rank: 3,
      name: '이태원 글로벌 마켓',
      participants: 156,
      exchanges: 170,
      rate: 76,
      rating: 4.5
    },
    {
      rank: 4,
      name: '신촌 대학생 파티',
      participants: 134,
      exchanges: 126,
      rate: 71,
      rating: 4.3
    },
    {
      rank: 5,
      name: '건대 캐주얼 마켓',
      participants: 98,
      exchanges: 87,
      rate: 68,
      rating: 4.1
    }
  ];

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>관리자 페이지</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/" className="nav-item">
                <img src="/assets/dashboard-icon.svg" alt="" />
                <span>전체 행사 대시보드</span>
              </Link>
            </li>
            <li className={location.pathname === '/events' ? 'active' : ''}>
              <Link to="/events" className="nav-item">
                <img src="/assets/events-icon.svg" alt="" />
                <span>행사 관리</span>
              </Link>
            </li>
            <li>
              <div className="nav-item">
                <img src="/assets/posts-icon.svg" alt="" />
                <span>게시글 관리</span>
              </div>
            </li>
            <li>
              <div className="nav-item">
                <img src="/assets/store-icon.svg" alt="" />
                <span>상점 관리</span>
              </div>
            </li>
            <li>
              <div className="nav-item">
                <img src="/assets/repair-icon.svg" alt="" />
                <span>수선 관리</span>
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>전체 행사 대시보드</h1>
        </header>

        <div className="dashboard-content">
          <section className="stats-section">
            <h2>전체 행사 현황</h2>
            <div className="stats-grid">
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </section>

          <section className="impact-section">
            <h2>전체 누적 환경 임팩트</h2>
            <div className="impact-grid">
              {impactData.map((impact, index) => (
                <ImpactCard key={index} {...impact} />
              ))}
            </div>
          </section>

          <section className="ranking-section">
            <div className="ranking-header">
              <h2>인기 21% 파티 현황</h2>
              <p className="update-time">실시간 업데이트</p>
            </div>
            <div className="ranking-list">
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
