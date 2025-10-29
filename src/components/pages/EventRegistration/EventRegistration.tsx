import React, { useState } from "react";
import PageHeader from "../../common/PageHeader";
import "./EventRegistration.css";

// 피그마에서 가져온 아이콘들
const heroIcon = "/assets/figma/calendar-plus.svg";
const eventNameIcon = "/assets/figma/star.svg";
const eventContentIcon = "/assets/figma/document.svg";
const eventDateIcon = "/assets/figma/calendar.svg";
const eventTimeIcon = "/assets/figma/clock.svg";
const eventLocationIcon = "/assets/figma/location-pin.svg";
const locationSearchIcon = "/assets/figma/search.svg";
const saveIcon = "/assets/figma/save.svg";
const registerIcon = "/assets/figma/calendar-plus.svg";
const lightbulbIcon = "/assets/figma/lightbulb.svg";
const checkIcon = "/assets/figma/check.svg";

const EventRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 행사 등록 로직 구현
    console.log("행사 등록:", formData);
  };

  const handleSaveDraft = () => {
    // TODO: 임시저장 로직 구현
    console.log("임시저장:", formData);
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader title="행사 등록" subtitle="새로운 행사를 등록하고 관리하세요" />

        <div className="event-registration-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-icon">
              <img src={heroIcon} alt="행사 등록" />
            </div>
            <h1 className="hero-title">새로운 행사 등록</h1>
            <p className="hero-description">멋진 행사를 계획하고 참가자들과 함께 특별한 순간을 만들어보세요</p>
          </div>

          {/* Registration Form */}
          <div className="registration-form-container">
            <form className="registration-form" onSubmit={handleSubmit}>
              {/* 행사 이름 */}
              <div className="form-group">
                <label className="form-label">
                  <img src={eventNameIcon} alt="행사 이름" className="label-icon" style={{ marginRight: "8px" }} />
                  행사 이름
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="행사 이름을 입력해주세요"
                  className="form-input"
                />
              </div>

              {/* 행사 내용 */}
              <div className="form-group">
                <label className="form-label">
                  <img src={eventContentIcon} alt="행사 내용" className="label-icon" style={{ marginRight: "8px" }} />
                  행사 내용
                </label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="행사에 대한 자세한 설명을 입력해주세요..."
                  className="form-textarea"
                  rows={6}
                />
              </div>

              {/* 날짜와 시간 */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <img src={eventDateIcon} alt="행사 날짜" className="label-icon" style={{ marginRight: "8px" }} />
                    행사 날짜
                  </label>
                  <div className="date-input-container">
                    <input
                      type="text"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      placeholder="mm/dd/yyyy"
                      className="form-input"
                    />
                    <img src={eventDateIcon} alt="달력" className="input-icon" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <img src={eventTimeIcon} alt="행사 시간" className="label-icon" style={{ marginRight: "8px" }} />
                    행사 시간
                  </label>
                  <div className="time-input-container">
                    <input
                      type="text"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      placeholder="--:-- --"
                      className="form-input"
                    />
                    <img src={eventTimeIcon} alt="시간" className="input-icon" />
                  </div>
                </div>
              </div>

              {/* 행사 위치 */}
              <div className="form-group">
                <label className="form-label">
                  <img src={eventLocationIcon} alt="행사 위치" className="label-icon" style={{ marginRight: "8px" }} />
                  행사 위치
                </label>
                <div className="location-input-container">
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="행사가 열릴 장소를 입력해주세요"
                    className="form-input"
                  />
                  <img src={locationSearchIcon} alt="위치 검색" className="input-icon" />
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="form-actions">
                <button type="button" className="save-draft-btn" onClick={handleSaveDraft}>
                  <img src={saveIcon} alt="저장" />
                  임시저장
                </button>
                <button type="submit" className="register-btn">
                  <img src={registerIcon} alt="등록" />
                  행사 등록하기
                </button>
              </div>
            </form>
          </div>

          {/* 팁 섹션 */}
          <div className="tips-section">
            <div className="tips-icon">
              <img src={lightbulbIcon} alt="팁" />
            </div>
            <div className="tips-content">
              <h3 className="tips-title">행사 등록 팁</h3>
              <ul className="tips-list">
                <li className="tip-item">
                  <img src={checkIcon} alt="체크" className="tip-icon" />
                  <span>행사 이름은 참가자들이 쉽게 기억할 수 있도록 간결하고 명확하게 작성해주세요</span>
                </li>
                <li className="tip-item">
                  <img src={checkIcon} alt="체크" className="tip-icon" />
                  <span>행사 내용에는 프로그램, 참가 대상, 준비물 등을 포함해주세요</span>
                </li>
                <li className="tip-item">
                  <img src={checkIcon} alt="체크" className="tip-icon" />
                  <span>정확한 날짜와 시간을 입력하여 참가자들의 혼란을 방지해주세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventRegistration;
