import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import DaumPostcode from "react-daum-postcode";
import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import "./EventRegistration.css";

const heroIcon = "/admin/img/icon/calendar-plus.svg";
const eventNameIcon = "/admin/img/icon/star.svg";
const eventContentIcon = "/admin/img/icon/document.svg";
const eventDateIcon = "/admin/img/icon/calendar.svg";
const eventTimeIcon = "/admin/img/icon/clock.svg";
const eventLocationIcon = "/admin/img/icon/location-pin.svg";
const locationSearchIcon = "/admin/img/icon/search.svg";
const saveIcon = "/admin/img/icon/save.svg";
const registerIcon = "/admin/img/icon/calendar-plus.svg";
const lightbulbIcon = "/admin/img/icon/lightbulb.svg";
const checkIcon = "/admin/img/icon/check.svg";

const EventRegistration: React.FC = () => {
  const startDatePickerRef = useRef<DatePicker>(null);
  const endDatePickerRef = useRef<DatePicker>(null);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventStartDate: null as Date | null,
    eventEndDate: null as Date | null,
    eventLocation: "",
    eventLocationDetail: "",
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      eventStartDate: date,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      eventEndDate: date,
    }));
  };

  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setFormData((prev) => ({
      ...prev,
      eventLocation: fullAddress,
    }));
    setIsAddressModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("행사 등록:", formData);
  };

  const handleSaveDraft = () => {
    console.log("임시저장:", formData);
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <PageHeader title="행사 등록" subtitle="새로운 행사를 등록하고 관리하세요" />

        <div className="event-registration-content">
          {/* 헤더 섹션 */}
          <div className="hero-section">
            <div className="hero-icon">
              <img src={heroIcon} alt="행사 등록" />
            </div>
            <h1 className="hero-title">새로운 행사 등록</h1>
            <p className="hero-description">
              옷 교환을 통해 환경을 지키는 21%파티 행사를 등록하고 참가자들과 함께 지속가능한 패션을 실천해보세요
            </p>
          </div>

          {/* 등록 폼 섹션 */}
          <div className="registration-form-container">
            <form className="registration-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <img src={eventNameIcon} alt="행사 이름" className="label-icon" />
                  행사 이름
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="예: 서울 강남구 옷 교환 파티"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <img src={eventContentIcon} alt="행사 내용" className="label-icon" />
                  행사 내용
                </label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="옷 교환 행사의 목적, 일정, 참가 방법 등을 자세히 입력해주세요..."
                  className="form-textarea"
                  rows={6}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <img src={eventDateIcon} alt="행사 시작일" className="label-icon" />
                    행사 시작일
                  </label>
                  <div className="date-input-container">
                    <DatePicker
                      ref={startDatePickerRef}
                      selected={formData.eventStartDate}
                      onChange={handleStartDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="form-input"
                      placeholderText="YYYY-MM-DD"
                      minDate={new Date()}
                    />
                    <img
                      src={eventDateIcon}
                      alt="달력"
                      className="input-icon"
                      onClick={() => {
                        startDatePickerRef.current?.setOpen(true);
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <img src={eventDateIcon} alt="행사 종료일" className="label-icon" />
                    행사 종료일
                  </label>
                  <div className="date-input-container">
                    <DatePicker
                      ref={endDatePickerRef}
                      selected={formData.eventEndDate}
                      onChange={handleEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="form-input"
                      placeholderText="YYYY-MM-DD"
                      minDate={formData.eventStartDate || new Date()}
                    />
                    <img
                      src={eventDateIcon}
                      alt="달력"
                      className="input-icon"
                      onClick={() => {
                        endDatePickerRef.current?.setOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <img src={eventLocationIcon} alt="행사 위치" className="label-icon" />
                  행사 위치
                </label>
                <div className="location-input-container">
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="예: 서울 강남구 그린센터"
                    className="form-input"
                  />
                  <img
                    src={locationSearchIcon}
                    alt="위치 검색"
                    className="input-icon"
                    onClick={() => setIsAddressModalOpen(true)}
                  />
                </div>
                <input
                  type="text"
                  name="eventLocationDetail"
                  value={formData.eventLocationDetail}
                  onChange={handleInputChange}
                  placeholder="상세 주소"
                  className="form-input"
                  style={{ marginTop: "2px" }}
                />
              </div>

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
                  <span>행사 이름은 지역명과 '옷 교환' 키워드를 포함하여 명확하게 작성해주세요</span>
                </li>
                <li className="tip-item">
                  <img src={checkIcon} alt="체크" className="tip-icon" />
                  <span>행사 내용에는 옷 교환 방법, 가져올 옷의 조건, 환경 임팩트 등을 포함해주세요</span>
                </li>
                <li className="tip-item">
                  <img src={checkIcon} alt="체크" className="tip-icon" />
                  <span>정확한 날짜와 시간을 입력하여 참가자들이 옷을 미리 준비할 수 있도록 해주세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {isAddressModalOpen && (
        <div className="address-modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
            <DaumPostcode onComplete={handleAddressComplete} autoClose={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistration;
