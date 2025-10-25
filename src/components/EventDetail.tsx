import React from "react";
import { useParams } from "react-router-dom";
import "../styles/components/EventDetail.css";

// 피그마에서 가져온 이미지 상수들
const imgImg = "/assets/4d2714ec2a42c5075a817afb135100e88cdcbc39.png";
const imgFrame = "/assets/62d7d6bb02b7dbe461a56d51c8e42be5793499ab.svg";
const imgFrame1 = "/assets/e156fcda94dc7363e317325ed126c4c98fd7f229.svg";
const imgFrame2 = "/assets/5275e8f4a59ae9a14bb88c976f2783e059988c8b.svg";
const imgFrame3 = "/assets/f501f8d36c88ae53b924b29d205fde3022daf692.svg";
const imgFrame4 = "/assets/cc97c00ae63d5865792cc51daad633e92390a327.svg";
const imgFrame5 = "/assets/4e6ef7213bc8a604ca43d1bdf47b78f2973f0789.svg";
const imgFrame6 = "/assets/3432e30e98ce26608b8395711c6a818ec6b982f1.svg";
const imgFrame7 = "/assets/63176c627731b00938cb0cc2a28239b36146ecec.svg";
const imgFrame8 = "/assets/3a1a38f2b018f644790ba86c4f3e0bdebb91e012.svg";
const imgFrame9 = "/assets/a28a5d264aa55383e6e6ce5bcd548297bbc81e47.svg";

interface EventDetailProps {
  eventId?: string;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventId }) => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="event-detail-page">
      {/* Header */}
      <div className="event-detail-header">
        <div className="header-content">
          <h1 className="header-title">행사 상세정보</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="event-detail-main">
        <div className="event-detail-content">
          {/* Event Hero Section */}
          <div className="event-hero-section">
            <div className="event-hero-image">
              <img src={imgImg} alt="행사 이미지" />
              <div className="image-overlay"></div>
            </div>
            <div className="event-hero-content">
              <div className="event-tags">
                <span className="tag environment">환경보호</span>
                <span className="tag workshop">워크샵</span>
              </div>
              <h2 className="event-title">제로웨이스트 라이프스타일 워크샵</h2>
              <p className="event-description">
                일상생활에서 실천할 수 있는 제로웨이스트 방법을 배우고, 지속가능한 라이프스타일을 시작 해보세요. 전문
                강사와 함께하는 실습 중심의 워크샵으로 친환경 제품 만들기와 생활 속 실천 방법을 익힐 수 있습니다.
              </p>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="event-details-section">
            <h3 className="section-title">행사 상세 정보</h3>
            <div className="event-details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <img src={imgFrame1} alt="날짜 아이콘" />
                </div>
                <div className="detail-content">
                  <p className="detail-label">날짜 및 시간</p>
                  <p className="detail-value">2024년 3월 15일 (금)</p>
                  <p className="detail-value">오후 2:00 - 5:00 (3시간)</p>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <img src={imgFrame2} alt="위치 아이콘" />
                </div>
                <div className="detail-content">
                  <p className="detail-label">위치</p>
                  <p className="detail-value">서울시 강남구 테헤란로 123</p>
                  <p className="detail-value">그린센터 2층 컨퍼런스룸</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Results Section */}
          <div className="event-results-section">
            <h3 className="section-title">행사 결과</h3>
            <div className="results-grid">
              <div className="result-item">
                <div className="result-icon">
                  <img src={imgFrame3} alt="참가자 아이콘" />
                </div>
                <div className="result-content">
                  <p className="result-number">156</p>
                  <p className="result-label">참가자 수</p>
                </div>
              </div>
              <div className="result-item">
                <div className="result-icon">
                  <img src={imgFrame4} alt="CO2 아이콘" />
                </div>
                <div className="result-content">
                  <p className="result-number">2,340</p>
                  <p className="result-label">CO₂ 절감량 (kg)</p>
                </div>
              </div>
              <div className="result-item">
                <div className="result-icon">
                  <img src={imgFrame5} alt="에너지 아이콘" />
                </div>
                <div className="result-content">
                  <p className="result-number">1,890</p>
                  <p className="result-label">에너지 절감량 (kWh)</p>
                </div>
              </div>
              <div className="result-item">
                <div className="result-icon">
                  <img src={imgFrame6} alt="물 아이콘" />
                </div>
                <div className="result-content">
                  <p className="result-number">4,567</p>
                  <p className="result-label">물 절약량 (L)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="event-detail-sidebar">
          {/* Staff Code Section */}
          <div className="staff-code-section">
            <div className="staff-code-content">
              <div className="staff-code-icon">
                <img src={imgFrame7} alt="스태프 코드 아이콘" />
              </div>
              <h4 className="staff-code-title">스태프 코드 발급</h4>
              <p className="staff-code-description">행사 운영진을 위한 전용 코드를 발급받으세요</p>
            </div>
            <button className="staff-code-button">
              <img src={imgFrame8} alt="발급 아이콘" />
              스태프 코드 발급
            </button>
            <div className="staff-code-notice">
              <img src={imgFrame9} alt="알림 아이콘" />
              <p>코드는 행사 당일에만 유효합니다</p>
            </div>
          </div>

          {/* Event Info Section */}
          <div className="event-info-section">
            <h4 className="info-title">행사 정보</h4>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">상태</span>
                <span className="info-value status-completed">완료</span>
              </div>
              <div className="info-item">
                <span className="info-label">카테고리</span>
                <span className="info-value">환경보호</span>
              </div>
              <div className="info-item">
                <span className="info-label">주최자</span>
                <span className="info-value">그린라이프</span>
              </div>
              <div className="info-item">
                <span className="info-label">참가비</span>
                <span className="info-value">무료</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
