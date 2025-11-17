import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import DaumPostcode from "react-daum-postcode";
import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import styles from "./EventEdit.module.css";

const heroIcon = "/admin/img/icon/edit.svg";
const eventNameIcon = "/admin/img/icon/star.svg";
const eventContentIcon = "/admin/img/icon/document.svg";
const eventDateIcon = "/admin/img/icon/calendar.svg";
const eventLocationIcon = "/admin/img/icon/location-pin.svg";
const locationSearchIcon = "/admin/img/icon/search.svg";
const staffIcon = "/admin/img/icon/staff.svg";
const participantIcon = "/admin/img/icon/user-group.svg";
const saveIcon = "/admin/img/icon/save.svg";
const updateIcon = "/admin/img/icon/edit.svg";
const lightbulbIcon = "/admin/img/icon/lightbulb.svg";
const checkIcon = "/admin/img/icon/check.svg";

// Custom input component for DatePicker with icon
const DateInputWithIcon = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { iconSrc: string; onIconClick: () => void }
>(({ iconSrc, onIconClick, ...props }, ref) => {
  return (
    <div className={styles["date-input-wrapper"]}>
      <input ref={ref} {...props} />
      <img src={iconSrc} alt="달력" className={styles["input-icon"]} onClick={onIconClick} />
    </div>
  );
});

DateInputWithIcon.displayName = "DateInputWithIcon";

const EventEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const startDatePickerRef = useRef<DatePicker>(null);
  const endDatePickerRef = useRef<DatePicker>(null);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventStartDate: null as Date | null,
    eventEndDate: null as Date | null,
    eventLocation: "",
    eventLocationDetail: "",
    staffCount: "",
    participantCount: "",
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 기존 행사 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    if (id) {
      // TODO: API에서 행사 데이터 가져오기
      // 현재는 mock 데이터로 설정
      const mockEvent = {
        eventName: "서울 강남구 옷 교환 파티",
        eventDescription: "옷을 버리는 대신 교환하는 환경 보호 행사",
        eventStartDate: new Date("2024-03-15"),
        eventEndDate: new Date("2024-03-16"),
        eventLocation: "서울 강남구 그린센터",
        eventLocationDetail: "1층 대강당",
        staffCount: "12",
        participantCount: "250",
      };
      setFormData({
        eventName: mockEvent.eventName,
        eventDescription: mockEvent.eventDescription,
        eventStartDate: mockEvent.eventStartDate,
        eventEndDate: mockEvent.eventEndDate,
        eventLocation: mockEvent.eventLocation,
        eventLocationDetail: mockEvent.eventLocationDetail,
        staffCount: mockEvent.staffCount,
        participantCount: mockEvent.participantCount,
      });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 숫자만 입력 가능하도록
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    console.log("행사 수정:", formData);
    // TODO: API 호출로 행사 수정
    alert("행사가 수정되었습니다.");
    setShowConfirmModal(false);
    navigate(`/events/${id}`);
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  const handleSaveDraft = () => {
    console.log("임시저장:", formData);
    // TODO: API 호출로 임시저장
    alert("임시저장되었습니다.");
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="행사 수정" subtitle="행사 정보를 수정하고 관리하세요" />

        <div className={styles["event-registration-content"]}>
          {/* 헤더 섹션 */}
          <div className={styles["hero-section"]}>
            <div className={styles["hero-icon"]}>
              <img src={heroIcon} alt="행사 수정" />
            </div>
            <h1 className={styles["hero-title"]}>행사 정보 수정</h1>
            <p className={styles["hero-description"]}>
              등록된 행사 정보를 수정하여 더 나은 옷 교환 행사를 만들어보세요
            </p>
          </div>

          {/* 수정 폼 섹션 */}
          <div className={styles["registration-form-container"]}>
            <form className={styles["registration-form"]} onSubmit={handleSubmit}>
              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={eventNameIcon} alt="행사 이름" className={styles["label-icon"]} />
                  행사 이름
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="행사명"
                  className={styles["form-input"]}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={eventContentIcon} alt="행사 내용" className={styles["label-icon"]} />
                  행사 내용
                </label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="옷 교환 행사의 목적, 일정, 참가 방법 등을 자세히 입력해주세요..."
                  className={styles["form-textarea"]}
                  rows={6}
                />
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    <img src={eventDateIcon} alt="행사 시작일" className={styles["label-icon"]} />
                    행사 시작일
                  </label>
                  <div className={styles["date-input-container"]}>
                    <DatePicker
                      ref={startDatePickerRef}
                      selected={formData.eventStartDate}
                      onChange={handleStartDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="YYYY-MM-DD"
                      customInput={
                        <DateInputWithIcon
                          iconSrc={eventDateIcon}
                          onIconClick={() => {
                            startDatePickerRef.current?.setOpen(true);
                          }}
                        />
                      }
                    />
                  </div>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    <img src={eventDateIcon} alt="행사 종료일" className={styles["label-icon"]} />
                    행사 종료일
                  </label>
                  <div className={styles["date-input-container"]}>
                    <DatePicker
                      ref={endDatePickerRef}
                      selected={formData.eventEndDate}
                      onChange={handleEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="YYYY-MM-DD"
                      minDate={formData.eventStartDate || undefined}
                      customInput={
                        <DateInputWithIcon
                          iconSrc={eventDateIcon}
                          onIconClick={() => {
                            endDatePickerRef.current?.setOpen(true);
                          }}
                        />
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    <img src={staffIcon} alt="스태프 수" className={`${styles["label-icon"]} ${styles["icon-colored"]}`} />
                    스태프 수
                  </label>
                  <input
                    type="text"
                    name="staffCount"
                    value={formData.staffCount}
                    onChange={handleNumberChange}
                    placeholder="스태프 인원 수"
                    className={styles["form-input"]}
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    <img src={participantIcon} alt="참가자 수" className={`${styles["label-icon"]} ${styles["icon-colored"]}`} />
                    참가자 수
                  </label>
                  <input
                    type="text"
                    name="participantCount"
                    value={formData.participantCount}
                    onChange={handleNumberChange}
                    placeholder="참가자 인원 수"
                    className={styles["form-input"]}
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={eventLocationIcon} alt="행사 위치" className={styles["label-icon"]} />
                  행사 위치
                </label>
                <div className={styles["location-input-container"]}>
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="도로명 주소"
                    className={styles["form-input"]}
                  />
                  <img
                    src={locationSearchIcon}
                    alt="위치 검색"
                    className={styles["input-icon"]}
                    onClick={() => setIsAddressModalOpen(true)}
                  />
                </div>
                <input
                  type="text"
                  name="eventLocationDetail"
                  value={formData.eventLocationDetail}
                  onChange={handleInputChange}
                  placeholder="상세 주소"
                  className={styles["form-input"]}
                  style={{ marginTop: "2px" }}
                />
              </div>

              <div className={styles["form-actions"]}>
                <button type="button" className={styles["save-draft-btn"]} onClick={handleSaveDraft}>
                  <img src={saveIcon} alt="저장" />
                  임시저장
                </button>
                <button type="submit" className={styles["register-btn"]}>
                  <img src={updateIcon} alt="수정" />
                  행사 수정하기
                </button>
              </div>
            </form>
          </div>

          {/* 팁 섹션 */}
          <div className={styles["tips-section"]}>
            <div className={styles["tips-icon"]}>
              <img src={lightbulbIcon} alt="팁" />
            </div>
            <div className={styles["tips-content"]}>
              <h3 className={styles["tips-title"]}>행사 수정 팁</h3>
              <ul className={styles["tips-list"]}>
                <li className={styles["tip-item"]}>
                  <img src={checkIcon} alt="체크" className={styles["tip-icon"]} />
                  <span>행사 이름은 지역명과 '옷 교환' 키워드를 포함하여 명확하게 작성해주세요</span>
                </li>
                <li className={styles["tip-item"]}>
                  <img src={checkIcon} alt="체크" className={styles["tip-icon"]} />
                  <span>행사 내용에는 옷 교환 방법, 가져올 옷의 조건, 환경 임팩트 등을 포함해주세요</span>
                </li>
                <li className={styles["tip-item"]}>
                  <img src={checkIcon} alt="체크" className={styles["tip-icon"]} />
                  <span>정확한 날짜와 시간을 입력하여 참가자들이 옷을 미리 준비할 수 있도록 해주세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {isAddressModalOpen && (
        <div className={styles["address-modal-overlay"]} onClick={() => setIsAddressModalOpen(false)}>
          <div className={styles["address-modal-content"]} onClick={(e) => e.stopPropagation()}>
            <DaumPostcode onComplete={handleAddressComplete} autoClose={false} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="행사 수정 확인"
        message="행사 정보를 수정하시겠습니까?"
        confirmText="수정"
        cancelText="취소"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        type="approve"
      />
    </div>
  );
};

export default EventEdit;

