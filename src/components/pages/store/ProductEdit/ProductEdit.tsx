import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../../../utils/api";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import styles from "./ProductEdit.module.css";

const ICONS = {
  camera: "/admin/img/icon/camera.svg",
  imageAdd: "/admin/img/icon/image-add.svg",
  info: "/admin/img/icon/info-circle.svg",
  pencil: "/admin/img/icon/pencil.svg",
  creditInfo: "/admin/img/icon/credit-info.svg",
  imagePlaceholder: "/admin/img/icon/image-placeholder.svg",
  eye: "/admin/img/icon/eye.svg",
  copy: "/admin/img/icon/copy.svg",
  share: "/admin/img/icon/share.svg",
  lightbulb: "/admin/img/icon/lightbulb.svg",
  checkCircle: "/admin/img/icon/check-circle.svg",
};

interface ProductImage {
  file: File | null;
  preview: string;
}

interface ProductImageResponse {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  maxPurchasePerUser?: number | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  images: ProductImageResponse[];
  pickupLocations: string[];
  createdAt: string;
  updatedAt: string;
}

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "ACTIVE",
  });

  const [images, setImages] = useState<ProductImage[]>([
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
  ]);

  const [quantity, setQuantity] = useState<string>("");
  const [maxPurchasePerUser, setMaxPurchasePerUser] = useState<string>("");
  const [pickupLocations, setPickupLocations] = useState<string[]>([""]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await apiRequest(`/admin/store/items/${id}`, {
          method: "GET",
        });

        if (response.ok) {
          const data: ProductDetail = await response.json();
          setProduct(data);
          setProductData({
            name: data.name,
            description: data.description || "",
            price: data.price.toString(),
            category: data.category,
            status: data.status,
          });
          setQuantity(data.stock.toString());
          const fetchedMaxPurchase = data.maxPurchasePerUser;
          setMaxPurchasePerUser(fetchedMaxPurchase != null ? fetchedMaxPurchase.toString() : "");
          setPickupLocations(data.pickupLocations && data.pickupLocations.length > 0 ? data.pickupLocations : [""]);

          const imagePreviews: ProductImage[] = [];
          if (data.images && data.images.length > 0) {
            const sortedImages = [...data.images].sort((a, b) => a.sortOrder - b.sortOrder);
            sortedImages.forEach((img) => {
              imagePreviews.push({ file: null, preview: img.imageUrl });
            });
          }
          const minSlots = 4;
          const targetLength = Math.max(minSlots, imagePreviews.length + 1);
          while (imagePreviews.length < targetLength) {
            imagePreviews.push({ file: null, preview: "" });
          }
          setImages(imagePreviews);
        } else {
          console.error("상품 조회 실패");
        }
      } catch (error) {
        console.error("상품 조회 중 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);

      setImages((prev) => {
        const newImages = [...prev];
        
        if (newImages[index].preview) {
          if (!newImages[index].preview.startsWith("http")) {
            URL.revokeObjectURL(newImages[index].preview);
          }
          newImages[index] = { file, preview };
        } else {
          let emptyIndex = -1;
          for (let i = 0; i < newImages.length; i++) {
            if (!newImages[i].preview) {
              emptyIndex = i;
              break;
            }
          }
          
          if (emptyIndex !== -1) {
            newImages[emptyIndex] = { file, preview };
          } else {
            newImages[index] = { file, preview };
          }
        }
        
        let lastImageIndex = -1;
        for (let i = newImages.length - 1; i >= 0; i--) {
          if (newImages[i].preview) {
            lastImageIndex = i;
            break;
          }
        }
        
        if (lastImageIndex >= 0 && lastImageIndex === newImages.length - 1 && newImages.length < 10) {
          newImages.push({ file: null, preview: "" });
        }
        
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
      
      for (let i = index; i < newImages.length - 1; i++) {
        newImages[i] = { ...newImages[i + 1] };
      }
      
      const lastIndex = newImages.length - 1;
      if (newImages[lastIndex].preview && !newImages[lastIndex].preview.startsWith("http")) {
        URL.revokeObjectURL(newImages[lastIndex].preview);
      }
      newImages[lastIndex] = { file: null, preview: "" };
      
      let lastImageIndex = -1;
      for (let i = newImages.length - 1; i >= 0; i--) {
        if (newImages[i].preview) {
          lastImageIndex = i;
          break;
        }
      }
      
      const minSlots = 4;
      const targetLength = Math.max(minSlots, lastImageIndex + 2);
      
      if (newImages.length > targetLength) {
        for (let i = targetLength; i < newImages.length; i++) {
          if (newImages[i].preview && !newImages[i].preview.startsWith("http")) {
            URL.revokeObjectURL(newImages[i].preview);
          }
        }
        return newImages.slice(0, targetLength);
      }
      
      return newImages;
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest("/admin/store/items/images", {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        console.error("이미지 업로드 실패");
        return null;
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!productData.name.trim()) {
      setError("상품명을 입력해주세요.");
      return;
    }
    if (!productData.price || parseInt(productData.price) <= 0) {
      setError("가격을 올바르게 입력해주세요.");
      return;
    }
    if (!productData.category) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    const parsedMaxPurchasePerUser = maxPurchasePerUser.trim() === "" ? null : parseInt(maxPurchasePerUser, 10);
    if (maxPurchasePerUser.trim() !== "" && (isNaN(parsedMaxPurchasePerUser as number) || (parsedMaxPurchasePerUser as number) <= 0)) {
      setError("구매 제한 수량은 0보다 큰 정수이거나 비워두세요.");
      return;
    }

    const validPickupLocations = pickupLocations
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0)
      .filter((loc, index, self) => self.indexOf(loc) === index);

    if (validPickupLocations.length === 0) {
      setError("최소 1개 이상의 수령 장소를 입력해주세요.");
      return;
    }

    if (validPickupLocations.length > 20) {
      setError("수령 장소는 최대 20개까지 입력 가능합니다.");
      return;
    }

    for (const loc of validPickupLocations) {
      if (loc.length > 255) {
        setError("수령 장소는 각각 255자 이하여야 합니다.");
        return;
      }
    }

    setError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);
    setShowConfirmModal(false);

    try {
      const parsedMaxPurchasePerUser =
        maxPurchasePerUser.trim() === "" ? null : parseInt(maxPurchasePerUser, 10);

      if (maxPurchasePerUser.trim() !== "" && (isNaN(parsedMaxPurchasePerUser as number) || (parsedMaxPurchasePerUser as number) <= 0)) {
        setError("구매 제한 수량은 0보다 큰 정수이거나 비워두세요.");
        setIsSubmitting(false);
        return;
      }

      const imageUrls: { imageUrl: string; sortOrder: number }[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image.file) {
          const uploadedUrl = await uploadImage(image.file);
          if (uploadedUrl) {
            imageUrls.push({ imageUrl: uploadedUrl, sortOrder: i + 1 });
          } else {
            setError("이미지 업로드에 실패했습니다.");
            setIsSubmitting(false);
            return;
          }
        } else if (image.preview && (image.preview.startsWith("http") || image.preview.startsWith("/"))) {
          imageUrls.push({ imageUrl: image.preview, sortOrder: i + 1 });
        }
      }
      const validPickupLocations = pickupLocations
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0)
        .filter((loc, index, self) => self.indexOf(loc) === index);

      const response = await apiRequest(`/admin/store/items/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: productData.name.trim(),
          description: productData.description.trim() || "",
          category: productData.category,
          price: parseInt(productData.price),
          stock: parseInt(quantity) || 0,
          maxPurchasePerUser: parsedMaxPurchasePerUser,
          status: productData.status,
          images: imageUrls.length > 0 ? imageUrls : undefined,
          pickupLocations: validPickupLocations,
        }),
      });

      if (response.ok) {
        navigate(`/store/${id}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: "상품 수정에 실패했습니다." }));
        setError(errorData.message || "상품 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 수정 중 오류:", error);
      setError(error instanceof Error ? error.message : "상품 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className={styles["product-edit-page"]}>
      <div className={styles["product-edit-header"]}>
        <button className={styles["back-btn"]} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src="/admin/img/icon/back-arrow.svg" alt="뒤로가기" />
        </button>
        <div className={styles["header-content"]}>
          <div className={styles["header-info"]}>
            <h1>상품 수정</h1>
            <p>상품 정보를 수정하고 변경사항을 저장하세요</p>
          </div>
          <div className={styles["header-actions"]}>
            <button className={styles["submit-btn"]} onClick={handleSubmit} disabled={isSubmitting || isLoading}>
              {isSubmitting ? "수정 중..." : "상품 수정"}
            </button>
          </div>
        </div>
      </div>

      {isLoading && <div>로딩 중...</div>}
      {error && (
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", margin: "1rem" }}>
          {error}
        </div>
      )}
      {!isLoading && (
        <div className={styles["product-edit-content"]}>
          <div className={styles["content-left"]}>
          <div className={`${styles["section"]} ${styles["product-images"]}`}>
            <div className={styles["section-header"]}>
              <div className={styles["icon"]}>
                <img src={ICONS.camera} alt="카메라 아이콘" />
              </div>
              <h2>상품 이미지</h2>
            </div>
            <div className={styles["image-grid"]}>
              {images.map((image, index) => (
                <div key={index} className={styles["image-upload-box"]}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, index)}
                    id={`image-${index}`}
                    hidden
                  />
                  <label htmlFor={`image-${index}`} className={styles["image-upload-label"]}>
                    {image.preview ? (
                      <div className={styles["image-preview-container"]}>
                        <img src={image.preview} alt={`상품 이미지 ${index + 1}`} />
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
                        <img src={ICONS.imageAdd} alt="이미지 추가" className={styles["upload-icon"]} />
                        <span className={styles["upload-text"]}>{index === 0 ? "메인 이미지" : "추가 이미지"}</span>
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <div className={styles["image-info"]}>
              <img src={ICONS.info} alt="정보" className={styles["info-icon"]} />
              <p>최대 10장까지 업로드 가능합니다. 권장 크기: 1000x1000px</p>
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["product-info"]}`}>
            <div className={styles["section-header"]}>
              <div className={styles["icon"]}>
                <img src={ICONS.pencil} alt="연필 아이콘" />
              </div>
              <h2>상품 정보</h2>
            </div>
            <div className={styles["form-group"]}>
              <label>상품명</label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                placeholder="상품명을 입력하세요"
              />
            </div>
            <div className={styles["form-group"]}>
              <label>상품 설명</label>
              <textarea
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows={6}
              />
            </div>
            <div className={styles["form-group"]}>
              <label>카테고리</label>
              <select
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                className={styles["form-select"]}
              >
                <option value="">카테고리 선택</option>
                <option value="수선 도구">수선 도구</option>
                <option value="환경 굿즈">환경 굿즈</option>
              </select>
            </div>
            <div className={styles["form-group"]}>
              <label>상태</label>
              <select
                name="status"
                value={productData.status}
                onChange={handleInputChange}
                className={styles["form-select"]}
              >
                <option value="ACTIVE">판매중</option>
                <option value="INACTIVE">판매중지</option>
              </select>
            </div>
            <div className={styles["form-group"]}>
              <label>상품 가격</label>
              <div className={styles["price-input-wrapper"]}>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
                <div className={styles["price-suffix"]}>
                  <span>C</span>
                  <img src={ICONS.creditInfo} alt="크레딧 정보" />
                </div>
              </div>
              <p className={styles["price-info"]}>크레딧 단위로 가격을 설정하세요</p>
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["product-quantity"]}`}>
            <div className={styles["section-header"]}>
              <div className={styles["icon"]}>
                <img src={ICONS.pencil} alt="수량 아이콘" />
              </div>
              <h2>상품 수량</h2>
            </div>
            <div className={styles["form-group"]}>
              <label>수량</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className={styles["form-group"]}>
              <label>구매 제한 수량 (선택)</label>
              <input
                type="number"
                value={maxPurchasePerUser}
                onChange={(e) => setMaxPurchasePerUser(e.target.value)}
                placeholder=""
                min={1}
              />
              <p className={styles["price-info"]}>입력 시 1인당 구매 가능 수량을 제한합니다.</p>
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["product-pickup-locations"]}`}>
            <div className={styles["section-header"]}>
              <div className={styles["icon"]}>
                <img src={ICONS.pencil} alt="수령 장소 아이콘" />
              </div>
              <h2>수령 장소</h2>
            </div>
            <div className={styles["form-group"]}>
              <label>수령 장소 (최소 1개, 최대 20개)</label>
              {pickupLocations.map((location, index) => (
                <div key={index} className={styles["pickup-location-input-row"]}>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      const newLocations = [...pickupLocations];
                      newLocations[index] = e.target.value;
                      setPickupLocations(newLocations);
                    }}
                    placeholder="수령 장소를 입력하세요 (예: 강남 점포)"
                    maxLength={255}
                  />
                  {pickupLocations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLocations = pickupLocations.filter((_, i) => i !== index);
                        setPickupLocations(newLocations);
                      }}
                      className={styles["remove-location-btn"]}
                    >
                      <img src="/admin/img/icon/x-reject.svg" alt="제거" />
                    </button>
                  )}
                </div>
              ))}
              {pickupLocations.length < 20 && (
                <button
                  type="button"
                  onClick={() => setPickupLocations([...pickupLocations, ""])}
                  className={styles["add-location-btn"]}
                >
                  + 수령 장소 추가
                </button>
              )}
              <p className={styles["pickup-location-info"]}>
                각 수령 장소는 255자 이내로 입력해주세요. 중복된 장소는 자동으로 제거됩니다.
              </p>
            </div>
          </div>

        </div>

        <div className={styles["content-right"]}>
          <div className={`${styles["section"]} ${styles["preview-section"]}`}>
            <h3>미리보기</h3>
            <div className={styles["preview-container"]}>
              <div className={styles["preview-image"]}>
                {images[0].preview ? (
                  <img src={images[0].preview} alt="상품 미리보기" />
                ) : (
                  <div className={styles["preview-placeholder"]}>
                    <img src={ICONS.imagePlaceholder} alt="이미지 플레이스홀더" />
                  </div>
                )}
              </div>
              <div className={styles["preview-info"]}>
                <h4>{productData.name || "상품명을 입력하세요"}</h4>
                <p>{productData.description || "상품 설명이 여기에 표시됩니다..."}</p>
                <div className={styles["preview-price"]}>
                  <div className={styles["price-display"]}>
                    <span>{productData.price || "0"}</span>
                    <span>C</span>
                    <img src={ICONS.creditInfo} alt="크레딧 정보" />
                  </div>
                  <button className={styles["preview-buy-btn"]}>구매하기</button>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["tips-section"]}`}>
            <div className={styles["tips-header"]}>
              <img src={ICONS.lightbulb} alt="팁" className={styles["icon"]} />
              <h3>수정 팁</h3>
            </div>
            <ul className={styles["tips-list"]}>
              <li>
                <img src={ICONS.checkCircle} alt="체크" className={styles["bullet"]} />
                고품질 이미지를 사용하세요
              </li>
              <li>
                <img src={ICONS.checkCircle} alt="체크" className={styles["bullet"]} />
                상세한 설명을 작성하세요
              </li>
              <li>
                <img src={ICONS.checkCircle} alt="체크" className={styles["bullet"]} />
                적정한 가격을 설정하세요
              </li>
            </ul>
          </div>
        </div>
      </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="상품 수정 확인"
        message="상품 정보를 수정하시겠습니까?"
        confirmText="수정"
        cancelText="취소"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        type="approve"
      />
    </div>
  );
};

export default ProductEdit;
