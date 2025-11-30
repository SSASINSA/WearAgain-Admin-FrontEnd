import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import DaumPostcode from "react-daum-postcode";
import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "utils/api";
import styles from "./EventEdit.module.css";

const heroIcon = "/admin/img/icon/edit.svg";
const eventNameIcon = "/admin/img/icon/star.svg";
const eventContentIcon = "/admin/img/icon/document.svg";
const eventDateIcon = "/admin/img/icon/calendar.svg";
const eventLocationIcon = "/admin/img/icon/location-pin.svg";
const locationSearchIcon = "/admin/img/icon/search.svg";
const saveIcon = "/admin/img/icon/save.svg";
const updateIcon = "/admin/img/icon/edit.svg";
const lightbulbIcon = "/admin/img/icon/lightbulb.svg";
const checkIcon = "/admin/img/icon/check.svg";
const cameraIcon = "/admin/img/icon/camera.svg";
const imageAddIcon = "/admin/img/icon/image-add.svg";
const infoIcon = "/admin/img/icon/info-circle.svg";

interface EventImage {
  imageId: number;
  url: string;
  altText: string;
  displayOrder: number;
}

interface EventImageRequest {
  url: string;
  altText: string;
  displayOrder: number;
}

interface EventImageUploadResponse {
  imageName: string;
  imageUrl: string;
}

interface EventDetailResponse {
  eventId: number;
  title: string;
  description: string;
  usageGuide: string | null;
  precautions: string | null;
  location: string;
  organizerName: string;
  organizerContact: string;
  organizerAdminId: number;
  organizerAdminEmail: string;
  organizerAdminName: string;
  startDate: string;
  endDate: string;
  status: string;
  totalCapacity: number;
  appliedCount: number;
  remainingCount: number;
  staffCode: string | null;
  staffCodeIssuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: EventImage[];
  options: any[];
  applications: any[];
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  usageGuide?: string;
  precautions?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  images?: EventImageRequest[] | null;
  options?: any[] | null;
  status?: string;
}

interface EventImageState {
  file: File | null;
  preview: string;
  imageName: string | null;
  imageUrl: string | null;
  imageId: number | null;
}

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
    usageGuide: "",
    precautions: "",
    eventStartDate: null as Date | null,
    eventEndDate: null as Date | null,
    eventLocation: "",
    eventLocationDetail: "",
  });
  const [images, setImages] = useState<EventImageState[]>([
    { file: null, preview: "", imageName: null, imageUrl: null, imageId: null },
    { file: null, preview: "", imageName: null, imageUrl: null, imageId: null },
    { file: null, preview: "", imageName: null, imageUrl: null, imageId: null },
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest(`/admin/events/${id}`, {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "행사 정보를 가져오는데 실패했습니다.");
        }

        const data: EventDetailResponse = await response.json();

        const startDate = data.startDate ? new Date(data.startDate) : null;
        const endDate = data.endDate ? new Date(data.endDate) : null;

        setFormData({
          eventName: data.title,
          eventDescription: data.description,
          usageGuide: data.usageGuide || "",
          precautions: data.precautions || "",
          eventStartDate: startDate,
          eventEndDate: endDate,
          eventLocation: data.location,
          eventLocationDetail: "",
        });

        if (data.images && data.images.length > 0) {
          const imageStates: EventImageState[] = data.images
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((img) => ({
              file: null,
              preview: img.url,
              imageName: null,
              imageUrl: img.url,
              imageId: img.imageId,
            }));

          while (imageStates.length < 3) {
            imageStates.push({
              file: null,
              preview: "",
              imageName: null,
              imageUrl: null,
              imageId: null,
            });
          }

          setImages(imageStates.slice(0, 3));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "행사 정보를 가져오는데 실패했습니다.";
        setError(errorMessage);
        console.error("Error fetching event detail:", err);
      } finally {
        setIsLoading(false);
    }
    };

    fetchEventDetail();
  }, [id]);

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

  const uploadEventImage = async (file: File): Promise<EventImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiRequest("/admin/events/images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "이미지 업로드에 실패했습니다.");
    }

    const data: EventImageUploadResponse = await response.json();
    return data;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);

      setImages((prev) => {
        const newImages = [...prev];
        if (newImages[index].preview && !newImages[index].preview.startsWith("http")) {
          URL.revokeObjectURL(newImages[index].preview);
        }
        newImages[index] = { ...newImages[index], file, preview, imageName: null, imageUrl: null };
        return newImages;
      });
    }
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].preview && !newImages[index].preview.startsWith("http")) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages[index] = {
        file: null,
        preview: "",
        imageName: null,
        imageUrl: null,
        imageId: null,
      };
      return newImages;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.eventName || formData.eventName.trim().length === 0) {
        alert("행사 이름을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (formData.eventName.trim().length < 1 || formData.eventName.trim().length > 100) {
        alert("행사 이름은 1자 이상 100자 이하여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventDescription || formData.eventDescription.trim().length === 0) {
        alert("행사 내용을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      const descriptionLength = formData.eventDescription.trim().length;
      if (descriptionLength < 10 || descriptionLength > 2000) {
        alert("행사 내용은 10자 이상 2000자 이하여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventLocation || formData.eventLocation.trim().length === 0) {
        alert("행사 위치를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      const fullLocation = formData.eventLocationDetail
        ? `${formData.eventLocation} ${formData.eventLocationDetail}`
        : formData.eventLocation;

      if (fullLocation.trim().length < 1 || fullLocation.trim().length > 255) {
        alert("행사 위치는 1자 이상 255자 이하여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventStartDate) {
        alert("행사 시작일을 선택해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventEndDate) {
        alert("행사 종료일을 선택해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (formData.eventEndDate < formData.eventStartDate) {
        alert("종료일은 시작일보다 빠를 수 없습니다.");
        setIsSubmitting(false);
        return;
      }

      const daysDiff = Math.ceil(
        (formData.eventEndDate.getTime() - formData.eventStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 365) {
        alert("행사 기간은 최대 365일까지 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      const imagesToUploadForRequest = images.filter((img) => img.file !== null);
      const existingImages = images.filter((img) => img.imageUrl && !img.file);

      if (imagesToUploadForRequest.length === 0 && existingImages.length === 0) {
        alert("최소 1개 이상의 행사 이미지를 업로드해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (imagesToUploadForRequest.length + existingImages.length > 10) {
        alert("행사 이미지는 최대 10개까지 업로드 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      const uploadedImages: EventImageUploadResponse[] = [];

      for (let i = 0; i < imagesToUploadForRequest.length; i++) {
        const image = imagesToUploadForRequest[i];
        if (image.file) {
          try {
            const uploadResult = await uploadEventImage(image.file);
            uploadedImages.push(uploadResult);

            setImages((prev) => {
              const newImages = [...prev];
              const imageIndex = prev.findIndex((img) => img.file === image.file);
              if (imageIndex !== -1) {
                if (newImages[imageIndex].preview && !newImages[imageIndex].preview.startsWith("http")) {
                  URL.revokeObjectURL(newImages[imageIndex].preview);
                }
                newImages[imageIndex] = {
                  file: image.file,
                  imageName: uploadResult.imageName,
                  imageUrl: uploadResult.imageUrl,
                  preview: uploadResult.imageUrl,
                  imageId: newImages[imageIndex].imageId,
                };
              }
              return newImages;
            });
          } catch (error) {
            console.error(`이미지 ${i + 1} 업로드 실패:`, error);
            alert(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
            setIsSubmitting(false);
            return;
          }
        }
      }

      const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const eventImages: EventImageRequest[] = [
        ...existingImages
          .filter((img) => img.imageUrl)
          .map((img, index) => ({
            url: img.imageUrl!,
            altText: `행사 이미지 ${index + 1}`,
            displayOrder: index + 1,
          })),
        ...uploadedImages.map((img, index) => ({
          url: img.imageUrl.trim(),
          altText: `행사 이미지 ${existingImages.length + index + 1}`,
          displayOrder: existingImages.length + index + 1,
        })),
      ]
        .filter((img) => img && img.url && img.url.trim() !== "")
        .map((img, index) => {
          if (!img.url) {
            throw new Error(`이미지 ${index + 1}의 URL이 없습니다.`);
          }

          const altText = `행사 이미지 ${index + 1}`;
          if (altText.length > 255) {
            throw new Error(`이미지 ${index + 1}의 altText는 최대 255자까지 가능합니다.`);
          }

          const displayOrder = index + 1;
          if (displayOrder < 1) {
            throw new Error(`이미지 ${index + 1}의 displayOrder는 1 이상이어야 합니다.`);
          }

          return {
            url: img.url.trim(),
            altText: altText,
            displayOrder: displayOrder,
          };
        });

      const displayOrders = eventImages.map((img) => img.displayOrder);
      const uniqueDisplayOrders = new Set(displayOrders);
      if (displayOrders.length !== uniqueDisplayOrders.size) {
        alert("이미지 displayOrder가 중복되었습니다.");
        setIsSubmitting(false);
        return;
      }

      const validateOptions = (options: any[], depth: number = 0): void => {
        if (depth > 3) {
          throw new Error("options의 최대 depth는 3입니다.");
        }

        const displayOrders: number[] = [];
        const names: string[] = [];

        for (let i = 0; i < options.length; i++) {
          const option = options[i];

          if (!option.name || option.name.trim().length === 0) {
            throw new Error(`options[${i}]의 name은 필수이며 1자 이상 100자 이하여야 합니다.`);
          }

          if (option.name.trim().length < 1 || option.name.trim().length > 100) {
            throw new Error(`options[${i}]의 name은 1자 이상 100자 이하여야 합니다.`);
          }

          if (names.includes(option.name.trim())) {
            throw new Error(`options[${i}]의 name이 중복되었습니다.`);
          }
          names.push(option.name.trim());

          if (!option.type || option.type.trim().length === 0) {
            throw new Error(`options[${i}]의 type은 필수이며 1자 이상 50자 이하여야 합니다.`);
          }

          if (option.type.trim().length < 1 || option.type.trim().length > 50) {
            throw new Error(`options[${i}]의 type은 1자 이상 50자 이하여야 합니다.`);
          }

          if (option.displayOrder === undefined || option.displayOrder === null) {
            throw new Error(`options[${i}]의 displayOrder는 필수이며 1 이상이어야 합니다.`);
          }

          if (typeof option.displayOrder !== "number" || option.displayOrder < 1) {
            throw new Error(`options[${i}]의 displayOrder는 1 이상의 정수여야 합니다.`);
          }

          displayOrders.push(option.displayOrder);

          if (option.capacity !== undefined && option.capacity !== null) {
            if (typeof option.capacity !== "number" || !Number.isInteger(option.capacity)) {
              throw new Error(`options[${i}]의 capacity는 정수여야 합니다.`);
            }
          }

          if (option.children && Array.isArray(option.children) && option.children.length > 0) {
            validateOptions(option.children, depth + 1);
          }
        }

        const sortedDisplayOrders = [...displayOrders].sort((a, b) => a - b);
        for (let i = 0; i < sortedDisplayOrders.length; i++) {
          if (sortedDisplayOrders[i] !== i + 1) {
            throw new Error(`options의 displayOrder는 1부터 연속되어야 합니다.`);
          }
        }
      };

      const options: any[] = [];

      try {
        validateOptions(options);
      } catch (error) {
        alert(error instanceof Error ? error.message : "options 검증에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      const requestData: EventUpdateRequest = {
        title: formData.eventName.trim(),
        description: formData.eventDescription.trim(),
        usageGuide: formData.usageGuide || undefined,
        precautions: formData.precautions || undefined,
        location: fullLocation.trim(),
        startDate: formatDate(formData.eventStartDate),
        endDate: formatDate(formData.eventEndDate),
        images: eventImages.length > 0 ? eventImages : null,
        options: options.length > 0 ? options : null,
      };

      const response = await apiRequest(`/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "행사 수정에 실패했습니다.");
      }

    alert("행사가 수정되었습니다.");
    setShowConfirmModal(false);
    navigate(`/events/${id}`);
    } catch (error) {
      console.error("행사 수정 실패:", error);
      alert(error instanceof Error ? error.message : "행사 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  const handleSaveDraft = async () => {
    try {
      const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const fullLocation = formData.eventLocationDetail
        ? `${formData.eventLocation} ${formData.eventLocationDetail}`
        : formData.eventLocation;

      const existingImages = images.filter((img) => img.imageUrl && !img.file);
      const allImages: EventImageRequest[] = existingImages
        .filter((img) => img.imageUrl)
        .map((img, index) => ({
          url: img.imageUrl!,
          altText: `행사 이미지 ${index + 1}`,
          displayOrder: index + 1,
        }));

      const options: any[] = [];

      const requestData: EventUpdateRequest = {
        title: formData.eventName.trim(),
        description: formData.eventDescription.trim(),
        usageGuide: formData.usageGuide || undefined,
        precautions: formData.precautions || undefined,
        location: fullLocation.trim(),
        startDate: formatDate(formData.eventStartDate),
        endDate: formatDate(formData.eventEndDate),
        images: allImages.length > 0 ? allImages : null,
        options: options.length > 0 ? options : null,
        status: "DRAFT",
      };

      const response = await apiRequest(`/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "임시저장에 실패했습니다.");
      }

    alert("임시저장되었습니다.");
    } catch (error) {
      console.error("임시저장 실패:", error);
      alert(error instanceof Error ? error.message : "임시저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles["admin-dashboard"]}>
        <main className={styles["main-content"]}>
          <PageHeader title="행사 수정" subtitle="행사 정보를 수정하고 관리하세요" />
          <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["admin-dashboard"]}>
        <main className={styles["main-content"]}>
          <PageHeader title="행사 수정" subtitle="행사 정보를 수정하고 관리하세요" />
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>{error}</div>
        </main>
      </div>
    );
  }

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
                  placeholder="옷 교환 행사의 목적, 일정, 참가 방법 등을 자세히 입력해주세요(최소 10자)"
                  className={styles["form-textarea"]}
                  rows={6}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={eventContentIcon} alt="이용 방법" className={styles["label-icon"]} />
                  이용 방법 (선택)
                </label>
                <textarea
                  name="usageGuide"
                  value={formData.usageGuide}
                  onChange={handleInputChange}
                  placeholder="행사 이용 방법을 입력해주세요"
                  className={styles["form-textarea"]}
                  rows={4}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={eventContentIcon} alt="주의사항" className={styles["label-icon"]} />
                  주의사항 (선택)
                </label>
                <textarea
                  name="precautions"
                  value={formData.precautions}
                  onChange={handleInputChange}
                  placeholder="행사 주의사항을 입력해주세요"
                  className={styles["form-textarea"]}
                  rows={4}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  <img src={cameraIcon} alt="행사 이미지" className={styles["label-icon"]} />
                  행사 이미지
                </label>
                <div className={styles["image-grid"]}>
                  {images.map((image, index) => (
                    <div key={index} className={styles["image-upload-box"]}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        id={`event-image-${index}`}
                        hidden
                      />
                      <label htmlFor={`event-image-${index}`} className={styles["image-upload-label"]}>
                        {image.preview ? (
                          <div className={styles["image-preview-container"]}>
                            <img src={image.preview} alt={`행사 이미지 ${index + 1}`} />
                            <button
                              type="button"
                              className={styles["image-remove-btn"]}
                              onClick={(e) => {
                                e.preventDefault();
                                handleImageRemove(index);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <img src={imageAddIcon} alt="이미지 추가" className={styles["upload-icon"]} />
                            <span className={styles["upload-text"]}>{index === 0 ? "메인 이미지" : "추가 이미지"}</span>
                          </>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={styles["image-info"]}>
                  <img src={infoIcon} alt="정보" className={styles["info-icon"]} />
                  <p>최대 3장까지 업로드 가능합니다. 권장 크기: 1200x800px</p>
                </div>
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
                      minDate={new Date()}
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
                      minDate={formData.eventStartDate || new Date()}
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
                <button type="submit" className={styles["register-btn"]} disabled={isSubmitting}>
                  <img src={updateIcon} alt="수정" />
                  {isSubmitting ? "수정 중..." : "행사 수정하기"}
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

