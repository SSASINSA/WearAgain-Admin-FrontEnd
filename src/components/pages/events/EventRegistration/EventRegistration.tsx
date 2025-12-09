import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import DaumPostcode from "react-daum-postcode";
import "react-datepicker/dist/react-datepicker.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import apiRequest from "utils/api";
import styles from "./EventRegistration.module.css";

const heroIcon = "/admin/img/icon/calendar-plus.svg";
const eventNameIcon = "/admin/img/icon/star.svg";
const eventContentIcon = "/admin/img/icon/document.svg";
const eventDateIcon = "/admin/img/icon/calendar.svg";
const eventTimeIcon = "/admin/img/icon/clock.svg";
const eventLocationIcon = "/admin/img/icon/location-pin.svg";
const locationSearchIcon = "/admin/img/icon/search.svg";
const registerIcon = "/admin/img/icon/calendar-plus.svg";
const lightbulbIcon = "/admin/img/icon/lightbulb.svg";
const checkIcon = "/admin/img/icon/check.svg";
const cameraIcon = "/admin/img/icon/camera.svg";
const imageAddIcon = "/admin/img/icon/image-add.svg";
const infoIcon = "/admin/img/icon/info-circle.svg";
const ticketIcon = "/admin/img/icon/ticket.svg";

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

interface EventImageUploadResponse {
  imageName: string;
  imageUrl: string;
}

interface EventImageRequest {
  url: string;
  altText: string;
  displayOrder: number;
}

interface EventRegistrationRequest {
  title: string;
  description: string;
  usageGuide?: string;
  precautions?: string;
  location: string;
  startDate: string;
  endDate: string;
  images: EventImageRequest[];
  options: any[];
  optionDepth: number;
}

interface EventRegistrationResponse {
  eventId: number;
  title: string;
  description: string;
  usageGuide?: string;
  precautions?: string;
  location: string;
  organizerName: string;
  organizerContact: string;
  organizerAdminId: number;
  organizerAdminEmail: string;
  organizerAdminName: string;
  startDate: string;
  endDate: string;
  status: string;
  images: Array<{
    eventImageId: number;
    url: string;
    altText: string;
    displayOrder: number;
  }>;
  options: any[];
  createdAt: string;
}

interface EventImage {
  file: File | null;
  preview: string;
  imageName: string | null;
  imageUrl: string | null;
}

interface EventOptionNode {
  id: string;
  name: string;
  displayOrder: number;
  capacity: number | null;
  children: EventOptionNode[];
  parentId: string | null;
}

interface EventAdminCreateOptionRequest {
  name: string;
  displayOrder: number;
  capacity: number | null;
  children: EventAdminCreateOptionRequest[];
}

const EventRegistration: React.FC = () => {
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
  const [images, setImages] = useState<EventImage[]>([
    { file: null, preview: "", imageName: null, imageUrl: null },
    { file: null, preview: "", imageName: null, imageUrl: null },
    { file: null, preview: "", imageName: null, imageUrl: null },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [options, setOptions] = useState<EventOptionNode[]>([]);
  const [optionDepth, setOptionDepth] = useState<number>(1);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showMoreMenuId, setShowMoreMenuId] = useState<string | null>(null);
  const addDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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
        newImages[index] = { file, preview, imageName: null, imageUrl: null };
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
      newImages[index] = { file: null, preview: "", imageName: null, imageUrl: null };
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        ? `${formData.eventLocation}, ${formData.eventLocationDetail}`
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

      const imagesToUpload = images.filter((img) => img.file !== null);
      if (imagesToUpload.length === 0) {
        alert("최소 1개 이상의 행사 이미지를 업로드해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (imagesToUpload.length > 10) {
        alert("행사 이미지는 최대 10개까지 업로드 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      const uploadedImages: EventImageUploadResponse[] = [];

      for (let i = 0; i < imagesToUpload.length; i++) {
        const image = imagesToUpload[i];
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

      const eventImages: EventImageRequest[] = uploadedImages
        .filter((img) => img && img.imageUrl && img.imageUrl.trim() !== "")
        .map((img, index) => {
          if (!img.imageUrl) {
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
            url: img.imageUrl.trim(),
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

      const validateOptions = (opts: EventOptionNode[]): void => {
        const getDepthInOpts = (optionId: string): number => {
          const option = opts.find((o) => o.id === optionId);
          if (!option) return 0;
          if (option.parentId === null) return 0;
          return 1 + getDepthInOpts(option.parentId);
        };

        const validateNode = (node: EventOptionNode, depth: number, parentId: string | null): void => {
          if (depth >= optionDepth) {
            throw new Error(`선택한 옵션 Depth(${optionDepth}레벨)를 초과할 수 없습니다.`);
          }

          if (!node.name || node.name.trim().length === 0) {
            throw new Error(`옵션의 이름을 입력해주세요.`);
          }

          if (node.name.trim().length < 1 || node.name.trim().length > 100) {
            throw new Error(`옵션 "${node.name}"의 이름은 1자 이상 100자 이하여야 합니다.`);
          }

          const siblings = opts.filter((opt) => opt.parentId === parentId && opt.id !== node.id);
          const duplicateName = siblings.find((sibling) => sibling.name.trim() === node.name.trim());
          if (duplicateName) {
            throw new Error(`옵션 "${node.name}"의 이름이 중복되었습니다.`);
          }

          const siblingDisplayOrders = siblings.map((s) => s.displayOrder).sort((a, b) => a - b);
          const allSiblingDisplayOrders = [...siblingDisplayOrders, node.displayOrder].sort((a, b) => a - b);
          for (let i = 0; i < allSiblingDisplayOrders.length; i++) {
            if (allSiblingDisplayOrders[i] !== i + 1) {
              throw new Error(`옵션 "${node.name}"의 displayOrder는 동일 레벨에서 1부터 연속된 순번이어야 합니다.`);
            }
          }

          const children = opts.filter((opt) => opt.parentId === node.id);
          if (children.length > 0) {
            if (node.capacity !== null && node.capacity !== undefined) {
              throw new Error(`옵션 "${node.name}"은 자식이 있으므로 수용 인원을 설정할 수 없습니다.`);
            }
            children.forEach((child) => validateNode(child, depth + 1, node.id));
          } else {
            if (depth < optionDepth - 1) {
              throw new Error(`옵션 "${node.name}"의 하위 옵션을 입력해주세요.`);
            }
            if (node.capacity !== null && node.capacity !== undefined) {
              if (typeof node.capacity !== "number" || !Number.isInteger(node.capacity) || node.capacity < 1 || node.capacity > 999) {
                throw new Error(`옵션 "${node.name}"의 수용 인원은 1 이상 999 이하의 정수여야 합니다.`);
              }
            }
          }
        };

        const rootOptions = opts.filter((opt) => opt.parentId === null);
        if (rootOptions.length === 0) {
          throw new Error("최소 1개 이상의 옵션이 필요합니다.");
        }
        rootOptions.forEach((root) => validateNode(root, 0, null));

        for (let depth = 0; depth < optionDepth; depth++) {
          const optionsAtDepth = opts.filter((opt) => {
            const optDepth = getDepthInOpts(opt.id);
            return optDepth === depth;
          });
          if (optionsAtDepth.length === 0) {
            if (depth === 0) {
              throw new Error("최상위 옵션을 입력해주세요.");
            } else {
              const parentOptions = opts.filter((opt) => {
                const optDepth = getDepthInOpts(opt.id);
                return optDepth === depth - 1;
              });
              if (parentOptions.length > 0) {
                const parentNames = parentOptions.map((opt) => `"${opt.name}"`).join(", ");
                throw new Error(`옵션 ${parentNames}의 하위 옵션을 입력해주세요.`);
              } else {
                throw new Error(`하위 옵션을 입력해주세요.`);
              }
            }
          }
        }
      };

      try {
        const cleanedOptions = options.map((opt) => {
          const hasChildren = options.some((o) => o.parentId === opt.id);
          if (hasChildren) {
            return { ...opt, capacity: null };
          }
          return opt;
        });
        validateOptions(cleanedOptions);
        
        const apiOptions = convertToApiFormat(cleanedOptions);

        const requestData: EventRegistrationRequest = {
          title: formData.eventName.trim(),
          description: formData.eventDescription.trim(),
          usageGuide: formData.usageGuide.trim() || undefined,
          precautions: formData.precautions.trim() || undefined,
          location: fullLocation.trim(),
          startDate: formatDate(formData.eventStartDate),
          endDate: formatDate(formData.eventEndDate),
          images: eventImages,
          options: apiOptions,
          optionDepth: optionDepth,
        };

        const response = await apiRequest("/admin/events", {
          method: "POST",
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "행사 등록에 실패했습니다.");
        }

        const responseData: EventRegistrationResponse = await response.json();

        alert("행사가 성공적으로 등록되었습니다.");
        navigate("/events");
      } catch (error) {
        alert(error instanceof Error ? error.message : "options 검증에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("행사 등록 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const generateOptionId = () => `option-${Date.now()}-${Math.random()}`;

  const getNextDisplayOrder = (parentId: string | null): number => {
    const siblings = options.filter((opt) => opt.parentId === parentId);
    if (siblings.length === 0) return 1;
    return Math.max(...siblings.map((opt) => opt.displayOrder)) + 1;
  };

  const handleAddCategory = () => {
    const newCategory: EventOptionNode = {
      id: generateOptionId(),
      name: "",
      displayOrder: getNextDisplayOrder(null),
      capacity: null,
      children: [],
      parentId: null,
    };
    setOptions([...options, newCategory]);
    setEditingOptionId(newCategory.id);
    setShowAddDropdown(false);
  };

  const getOptionDepth = (optionId: string): number => {
    const option = options.find((opt) => opt.id === optionId);
    if (!option || !option.parentId) return 0;
    return 1 + getOptionDepth(option.parentId);
  };

  const handleAddChild = (parentId: string) => {
    const parent = options.find((opt) => opt.id === parentId);
    if (!parent) {
      console.error("부모 옵션을 찾을 수 없음:", parentId);
      return;
    }

    const parentDepth = getOptionDepth(parentId);
    if (parentDepth >= optionDepth - 1) {
      const parentName = parent ? parent.name : "해당 옵션";
      alert(`옵션 "${parentName}"은 최대 깊이에 도달했습니다. 더 이상 하위 옵션을 추가할 수 없습니다.`);
      return;
    }

    const siblings = options.filter((opt) => opt.parentId === parentId);
    const newChild: EventOptionNode = {
      id: generateOptionId(),
      name: "",
      displayOrder: siblings.length > 0 ? Math.max(...siblings.map((opt) => opt.displayOrder)) + 1 : 1,
      capacity: null,
      children: [],
      parentId: parentId,
    };
    
    setOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((opt) => {
        if (opt.id === parentId) {
          return { ...opt, capacity: null };
        }
        return opt;
      });
      return [...updatedOptions, newChild];
    });
    setEditingOptionId(newChild.id);
    setShowAddDropdown(false);
    setTimeout(() => {
      setShowMoreMenuId(null);
    }, 0);
  };

  const handleRemoveOption = (optionId: string) => {
    if (!window.confirm("이 옵션을 삭제하시겠습니까? 하위 항목도 함께 삭제됩니다.")) {
      return;
    }

    setOptions((prevOptions) => {
      const idsToRemove = new Set<string>();
      const collectIds = (nodeId: string) => {
        idsToRemove.add(nodeId);
        prevOptions.filter((opt) => opt.parentId === nodeId).forEach((child) => collectIds(child.id));
      };
      collectIds(optionId);

      const newOptions = prevOptions.filter((opt) => !idsToRemove.has(opt.id));
      return reorderDisplayOrders(newOptions);
    });
    
    setShowMoreMenuId(null);
  };

  const reorderDisplayOrders = (opts: EventOptionNode[]): EventOptionNode[] => {
    const groupedByParent = new Map<string | null, EventOptionNode[]>();
    opts.forEach((opt) => {
      const parentId = opt.parentId;
      if (!groupedByParent.has(parentId)) {
        groupedByParent.set(parentId, []);
      }
      groupedByParent.get(parentId)!.push(opt);
    });

    const reordered: EventOptionNode[] = [];
    groupedByParent.forEach((siblings, parentId) => {
      siblings
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach((opt, index) => {
          reordered.push({
            ...opt,
            displayOrder: index + 1,
          });
        });
    });

    return reordered;
  };

  const handleOptionChange = (optionId: string, field: string, value: string | number | null) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          if (field === "capacity") {
            return { ...opt, capacity: value as number | null };
          }
          return { ...opt, [field]: value };
        }
        return opt;
      })
    );
  };

  const convertToApiFormat = (opts: EventOptionNode[]): EventAdminCreateOptionRequest[] => {
    const rootOptions = opts.filter((opt) => opt.parentId === null);
    return rootOptions
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((opt) => convertNodeToApiFormat(opt, opts));
  };

  const convertNodeToApiFormat = (
    node: EventOptionNode,
    allOptions: EventOptionNode[]
  ): EventAdminCreateOptionRequest => {
    const children = allOptions
      .filter((opt) => opt.parentId === node.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((child) => convertNodeToApiFormat(child, allOptions));

    const hasChildren = allOptions.some((opt) => opt.parentId === node.id);

    return {
      name: node.name,
      displayOrder: node.displayOrder,
      capacity: hasChildren ? null : node.capacity,
      children: children,
    };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (addDropdownRef.current && !addDropdownRef.current.contains(target)) {
        setShowAddDropdown(false);
      }
      
      const clickedMoreMenu = target.closest('[class*="option-more-menu"]');
      const clickedMoreBtn = target.closest('[class*="option-more-btn"]');
      
      if (!clickedMoreMenu && !clickedMoreBtn) {
        setShowMoreMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="행사 등록" subtitle="새로운 행사를 등록하고 관리하세요" />

        <div className={styles["event-registration-content"]}>
          {/* 헤더 섹션 */}
          <div className={styles["hero-section"]}>
            <div className={styles["hero-icon"]}>
              <img src={heroIcon} alt="행사 등록" />
            </div>
            <h1 className={styles["hero-title"]}>새로운 행사 등록</h1>
            <p className={styles["hero-description"]}>
              옷 교환을 통해 환경을 지키는 21%파티 행사를 등록하고 참가자들과 함께 지속가능한 패션을 실천해보세요
            </p>
          </div>

          {/* 등록 폼 섹션 */}
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
                <input
                  type="text"
                  value={
                    formData.eventLocationDetail
                      ? `${formData.eventLocation}, ${formData.eventLocationDetail}`
                      : formData.eventLocation
                  }
                  readOnly
                  placeholder="합쳐진 주소가 여기에 표시됩니다"
                  className={styles["form-input"]}
                  style={{ marginTop: "2px", backgroundColor: "#f9fafb", cursor: "not-allowed" }}
                />
              </div>

              {/* 행사 옵션 섹션 */}
              <div className={styles["form-group"]}>
                <div className={styles["option-header"]}>
                  <label className={styles["form-label"]}>
                    <img
                      src={ticketIcon}
                      alt="티켓"
                      className={`${styles["label-icon"]} ${styles["icon-colored"]}`}
                    />
                    티켓 설정
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <select
                      value={optionDepth}
                      onChange={(e) => {
                        const newOptionDepth = parseInt(e.target.value, 10);
                        const oldOptionDepth = optionDepth;
                        setOptionDepth(newOptionDepth);
                        setOptions((prevOptions) => {
                          // 레벨이 낮아질 때만 초과 옵션 제거
                          if (newOptionDepth < oldOptionDepth) {
                            const getOptionDepth = (optionId: string): number => {
                              const option = prevOptions.find((o) => o.id === optionId);
                              if (!option) return 0;
                              if (option.parentId === null) return 0;
                              return 1 + getOptionDepth(option.parentId);
                            };
                            const filteredOptions = prevOptions.filter((opt) => {
                              const depth = getOptionDepth(opt.id);
                              return depth < newOptionDepth;
                            });
                            return filteredOptions.map((opt, index) => ({
                              ...opt,
                              displayOrder: index + 1,
                            }));
                          }
                          // 레벨이 높아지거나 같을 때는 기존 옵션 유지
                          return prevOptions;
                        });
                      }}
                      style={{
                        padding: "6px 32px 6px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#1f2937",
                        background: "white",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                      }}
                    >
                      <option value="" disabled style={{ color: "#9ca3af" }}>세부 레벨</option>
                      <option value={1}>1레벨</option>
                      <option value={2}>2레벨</option>
                      <option value={3}>3레벨</option>
                    </select>
                    <img
                      src="/admin/img/icon/dropdown.svg"
                      alt="드롭다운"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "12px",
                        height: "12px",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  <div className={styles["add-option-container"]} ref={addDropdownRef} style={{ marginLeft: "auto" }}>
                    <button
                      type="button"
                      className={styles["add-option-button"]}
                      onClick={() => setShowAddDropdown(!showAddDropdown)}
                    >
                      추가
                      <img src="/admin/img/icon/dropdown.svg" alt="드롭다운" className={styles["dropdown-icon"]} />
                    </button>
                    {showAddDropdown && (
                      <div className={styles["add-option-dropdown"]}>
                        <button type="button" onClick={handleAddCategory}>
                          카테고리 추가
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles["options-tree"]}>
                  {options
                    .filter((opt) => opt.parentId === null)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((category) => (
                      <div key={category.id} className={styles["option-tree-item"]}>
                        <div className={styles["option-item-row"]}>
                          <img src="/admin/img/icon/dropdown.svg" alt="드래그" className={styles["drag-icon"]} />
                          {editingOptionId === category.id ? (
                            <div className={styles["option-edit-form"]}>
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => handleOptionChange(category.id, "name", e.target.value)}
                                placeholder="카테고리 이름"
                                className={styles["option-name-input"]}
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    setEditingOptionId(null);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className={styles["option-save-btn"]}
                                onClick={() => setEditingOptionId(null)}
                              >
                                완료
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className={styles["option-name"]}>{category.name || "이름 없음"}</span>
                            </>
                          )}
                          <div className={styles["option-actions"]}>
                            <button
                              type="button"
                              className={styles["option-edit-btn"]}
                              onClick={() => setEditingOptionId(category.id)}
                            >
                              수정
                            </button>
                            <div className={styles["option-more-container"]} ref={moreMenuRef}>
                              <button
                                type="button"
                                className={styles["option-more-btn"]}
                                onClick={() => setShowMoreMenuId(showMoreMenuId === category.id ? null : category.id)}
                              >
                                <span className={styles["more-dots"]}>⋯</span>
                              </button>
                              {showMoreMenuId === category.id && (
                                <div className={styles["option-more-menu"]} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddChild(category.id);
                                    }}
                                  >
                                    항목 추가
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveOption(category.id);
                                    }}
                                    style={{ display: "block" }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {options
                          .filter((opt) => opt.parentId === category.id)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((item) => {
                            const itemDepth = getOptionDepth(item.id);
                            const hasChildren = options.some((opt) => opt.parentId === item.id);
                            return (
                              <div key={item.id} className={styles["option-tree-item-child"]}>
                                <div className={styles["option-item-row"]}>
                                  <img src="/admin/img/icon/dropdown.svg" alt="드래그" className={styles["drag-icon"]} />
                                  {editingOptionId === item.id ? (
                                    <div className={styles["option-edit-form"]}>
                                      <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleOptionChange(item.id, "name", e.target.value)}
                                        placeholder="항목 이름"
                                        className={styles["option-name-input"]}
                                        autoFocus
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            setEditingOptionId(null);
                                          }
                                        }}
                                      />
                                      {!hasChildren && (
                                        <input
                                          type="number"
                                          value={item.capacity || ""}
                                          onChange={(e) =>
                                            handleOptionChange(
                                              item.id,
                                              "capacity",
                                              e.target.value ? parseInt(e.target.value, 10) : null
                                            )
                                          }
                                          placeholder="수용 인원"
                                          className={styles["option-capacity-input"]}
                                          min={1}
                                          max={999}
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              setEditingOptionId(null);
                                            }
                                          }}
                                        />
                                      )}
                                      <button
                                        type="button"
                                        className={styles["option-save-btn"]}
                                        onClick={() => setEditingOptionId(null)}
                                      >
                                        완료
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className={styles["option-name"]}>{item.name || "이름 없음"}</span>
                                      {!hasChildren && (
                                        <>
                                          <span className={styles["option-quantity"]}>
                                            수량 : 0/{item.capacity || 0}
                                          </span>
                                        </>
                                      )}
                                    </>
                                  )}
                                  <div className={styles["option-actions"]}>
                                    <button
                                      type="button"
                                      className={styles["option-edit-btn"]}
                                      onClick={() => setEditingOptionId(item.id)}
                                    >
                                      수정
                                    </button>
                                    <div className={styles["option-more-container"]}>
                                      <button
                                        type="button"
                                        className={styles["option-more-btn"]}
                                        onClick={() => setShowMoreMenuId(showMoreMenuId === item.id ? null : item.id)}
                                      >
                                        <span className={styles["more-dots"]}>⋯</span>
                                      </button>
                                      {showMoreMenuId === item.id && (
                                        <div className={styles["option-more-menu"]} onClick={(e) => e.stopPropagation()}>
                                          {itemDepth < 3 && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddChild(item.id);
                                              }}
                                            >
                                              항목 추가
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveOption(item.id);
                                            }}
                                            style={{ display: "block" }}
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {options
                                  .filter((opt) => opt.parentId === item.id)
                                  .sort((a, b) => a.displayOrder - b.displayOrder)
                                  .map((subItem) => {
                                    const subItemDepth = getOptionDepth(subItem.id);
                                    const subItemHasChildren = options.some((opt) => opt.parentId === subItem.id);
                                    return (
                                      <div key={subItem.id} className={styles["option-tree-item-child"]} style={{ paddingLeft: "40px" }}>
                                        <div className={styles["option-item-row"]}>
                                          <img src="/admin/img/icon/dropdown.svg" alt="드래그" className={styles["drag-icon"]} />
                                          {editingOptionId === subItem.id ? (
                                            <div className={styles["option-edit-form"]}>
                                              <input
                                                type="text"
                                                value={subItem.name}
                                                onChange={(e) => handleOptionChange(subItem.id, "name", e.target.value)}
                                                placeholder="항목 이름"
                                                className={styles["option-name-input"]}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                  if (e.key === "Enter") {
                                                    setEditingOptionId(null);
                                                  }
                                                }}
                                              />
                                              {!subItemHasChildren && (
                                                <input
                                                  type="number"
                                                  value={subItem.capacity || ""}
                                                  onChange={(e) =>
                                                    handleOptionChange(
                                                      subItem.id,
                                                      "capacity",
                                                      e.target.value ? parseInt(e.target.value, 10) : null
                                                    )
                                                  }
                                                  placeholder="수용 인원"
                                                  className={styles["option-capacity-input"]}
                                                  min={1}
                                                  max={999}
                                                  onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                      setEditingOptionId(null);
                                                    }
                                                  }}
                                                />
                                              )}
                                              <button
                                                type="button"
                                                className={styles["option-save-btn"]}
                                                onClick={() => setEditingOptionId(null)}
                                              >
                                                완료
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              <span className={styles["option-name"]}>{subItem.name || "이름 없음"}</span>
                                              {!subItemHasChildren && (
                                                <>
                                                  <span className={styles["option-quantity"]}>
                                                    수량 : 0/{subItem.capacity || 0}
                                                  </span>
                                                </>
                                              )}
                                            </>
                                          )}
                                          <div className={styles["option-actions"]}>
                                            <button
                                              type="button"
                                              className={styles["option-edit-btn"]}
                                              onClick={() => setEditingOptionId(subItem.id)}
                                            >
                                              수정
                                            </button>
                                            <div className={styles["option-more-container"]}>
                                              <button
                                                type="button"
                                                className={styles["option-more-btn"]}
                                                onClick={() => setShowMoreMenuId(showMoreMenuId === subItem.id ? null : subItem.id)}
                                              >
                                                <span className={styles["more-dots"]}>⋯</span>
                                              </button>
                                              {showMoreMenuId === subItem.id && (
                                                <div className={styles["option-more-menu"]} onClick={(e) => e.stopPropagation()}>
                                                  {subItemDepth < 2 && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddChild(subItem.id);
                                                      }}
                                                    >
                                                      항목 추가
                                                    </button>
                                                  )}
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRemoveOption(subItem.id);
                                                    }}
                                                    style={{ display: "block" }}
                                                  >
                                                    삭제
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {options
                                          .filter((opt) => opt.parentId === subItem.id)
                                          .sort((a, b) => a.displayOrder - b.displayOrder)
                                          .map((finalItem) => {
                                            const finalItemHasChildren = options.some((opt) => opt.parentId === finalItem.id);
                                            return (
                                              <div key={finalItem.id} className={styles["option-tree-item-child"]} style={{ paddingLeft: "80px" }}>
                                                <div className={styles["option-item-row"]}>
                                                  <img src="/admin/img/icon/dropdown.svg" alt="드래그" className={styles["drag-icon"]} />
                                                  {editingOptionId === finalItem.id ? (
                                                    <div className={styles["option-edit-form"]}>
                                                      <input
                                                        type="text"
                                                        value={finalItem.name}
                                                        onChange={(e) => handleOptionChange(finalItem.id, "name", e.target.value)}
                                                        placeholder="항목 이름"
                                                        className={styles["option-name-input"]}
                                                        autoFocus
                                                        onKeyPress={(e) => {
                                                          if (e.key === "Enter") {
                                                            setEditingOptionId(null);
                                                          }
                                                        }}
                                                      />
                                                      {!finalItemHasChildren && (
                                                        <input
                                                          type="number"
                                                          value={finalItem.capacity || ""}
                                                          onChange={(e) =>
                                                            handleOptionChange(
                                                              finalItem.id,
                                                              "capacity",
                                                              e.target.value ? parseInt(e.target.value, 10) : null
                                                            )
                                                          }
                                                          placeholder="수용 인원"
                                                          className={styles["option-capacity-input"]}
                                                          min={1}
                                                          max={999}
                                                          onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                              setEditingOptionId(null);
                                                            }
                                                          }}
                                                        />
                                                      )}
                                                      <button
                                                        type="button"
                                                        className={styles["option-save-btn"]}
                                                        onClick={() => setEditingOptionId(null)}
                                                      >
                                                        완료
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <span className={styles["option-name"]}>{finalItem.name || "이름 없음"}</span>
                                                      {!finalItemHasChildren && (
                                                        <>
                                                          <span className={styles["option-quantity"]}>
                                                            수량 : 0/{finalItem.capacity || 0}
                                                          </span>
                                                        </>
                                                      )}
                                                    </>
                                                  )}
                                                  <div className={styles["option-actions"]}>
                                                    <button
                                                      type="button"
                                                      className={styles["option-edit-btn"]}
                                                      onClick={() => setEditingOptionId(finalItem.id)}
                                                    >
                                                      수정
                                                    </button>
                                                    <div className={styles["option-more-container"]}>
                                                      <button
                                                        type="button"
                                                        className={styles["option-more-btn"]}
                                                        onClick={() => setShowMoreMenuId(showMoreMenuId === finalItem.id ? null : finalItem.id)}
                                                      >
                                                        <span className={styles["more-dots"]}>⋯</span>
                                                      </button>
                                                      {showMoreMenuId === finalItem.id && (
                                                        <div className={styles["option-more-menu"]} onClick={(e) => e.stopPropagation()}>
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleRemoveOption(finalItem.id);
                                                            }}
                                                            style={{ display: "block" }}
                                                          >
                                                            삭제
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        {options.filter((opt) => opt.parentId === subItem.id).length === 0 && subItemDepth < 2 && (
                                          <div className={styles["option-add-child"]}>
                                            <button type="button" onClick={() => handleAddChild(subItem.id)}>
                                              + 항목 추가
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                {options.filter((opt) => opt.parentId === item.id).length === 0 && itemDepth < 3 && (
                                  <div className={styles["option-add-child"]}>
                                    <button type="button" onClick={() => handleAddChild(item.id)}>
                                      + 항목 추가
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {options.filter((opt) => opt.parentId === category.id).length === 0 && (
                          <div className={styles["option-add-child"]}>
                            <button type="button" onClick={() => handleAddChild(category.id)}>
                              + 항목 추가
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  {options.filter((opt) => opt.parentId === null).length === 0 && (
                    <div className={styles["option-empty"]}>옵션을 추가해주세요.</div>
                  )}
                </div>
              </div>

              <div className={styles["form-actions"]}>
                <button type="submit" className={styles["register-btn"]} disabled={isSubmitting}>
                  <img src={registerIcon} alt="등록" />
                  {isSubmitting ? "등록 중..." : "행사 등록하기"}
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
              <h3 className={styles["tips-title"]}>행사 등록 팁</h3>
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
    </div>
  );
};

export default EventRegistration;
