import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "utils/api";
import styles from "./AddProduct.module.css";

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
  imageName: string | null;
  imageUrl: string | null;
}

interface ProductImageUploadResponse {
  imageName: string;
  imageUrl: string;
}

interface ProductImageRequest {
  imageUrl: string;
  sortOrder: number;
}

interface ProductRegistrationRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  maxPurchasePerUser: number | null;
  status: string;
  images: ProductImageRequest[];
  pickupLocations: string[];
}

interface ProductRegistrationResponse {
  id: number;
  name: string;
  status: string;
}


const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    category: "bag",
    price: "",
  });

  const [images, setImages] = useState<ProductImage[]>([
    { file: null, preview: "", imageName: null, imageUrl: null },
    { file: null, preview: "", imageName: null, imageUrl: null },
    { file: null, preview: "", imageName: null, imageUrl: null },
    { file: null, preview: "", imageName: null, imageUrl: null },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pressedAction, setPressedAction] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<string>("");
  const [maxPurchasePerUser, setMaxPurchasePerUser] = useState<string>("");
  const [pickupLocations, setPickupLocations] = useState<string[]>([""]);

  const getPressHandlers = (id: string) => ({
    onMouseDown: () => setPressedAction(id),
    onMouseUp: () => setPressedAction(null),
    onMouseLeave: () => setPressedAction(null),
    onTouchStart: () => setPressedAction(id),
    onTouchEnd: () => setPressedAction(null),
    onTouchCancel: () => setPressedAction(null),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const uploadProductImage = async (file: File): Promise<ProductImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiRequest("/admin/store/items/images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "이미지 업로드에 실패했습니다.");
    }

    const data: ProductImageUploadResponse = await response.json();
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (!productData.name || productData.name.trim().length === 0) {
        alert("상품명을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (productData.name.trim().length < 1 || productData.name.trim().length > 255) {
        alert("상품명은 1자 이상 255자 이하여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!productData.description || productData.description.trim().length === 0) {
        alert("상품 설명을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (productData.description.trim().length > 4000) {
        alert("상품 설명은 최대 4000자까지 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!productData.category || productData.category.trim().length === 0) {
        alert("카테고리를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (productData.category.trim().length > 50) {
        alert("카테고리는 최대 50자까지 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!productData.price || productData.price.trim().length === 0) {
        alert("상품 가격을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      const price = parseFloat(productData.price);
      if (isNaN(price) || price <= 0) {
        alert("상품 가격은 0보다 큰 숫자여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      if (!quantity || quantity.trim().length === 0) {
        alert("상품 수량을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      const stock = parseInt(quantity, 10);
      if (isNaN(stock) || stock < 0) {
        alert("상품 수량은 0 이상의 숫자여야 합니다.");
        setIsSubmitting(false);
        return;
      }

      const imagesToUpload = images.filter((img) => img.file !== null);
      if (imagesToUpload.length === 0) {
        alert("최소 1개 이상의 상품 이미지를 업로드해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (imagesToUpload.length > 10) {
        alert("상품 이미지는 최대 10개까지 업로드 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      const validPickupLocations = pickupLocations
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0)
        .filter((loc, index, self) => self.indexOf(loc) === index);

      if (validPickupLocations.length === 0) {
        alert("최소 1개 이상의 수령 장소를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (validPickupLocations.length > 20) {
        alert("수령 장소는 최대 20개까지 입력 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      for (const loc of validPickupLocations) {
        if (loc.length > 255) {
          alert("수령 장소는 각각 255자 이하여야 합니다.");
          setIsSubmitting(false);
          return;
        }
      }

      let maxPurchasePerUserValue: number | null = null;
      if (maxPurchasePerUser.trim() !== "") {
        const parsedMax = parseInt(maxPurchasePerUser, 10);
        if (isNaN(parsedMax) || parsedMax <= 0) {
          alert("구매 제한 수량은 0보다 큰 정수이거나 비워두세요.");
          setIsSubmitting(false);
          return;
        }
        maxPurchasePerUserValue = parsedMax;
      }

      const uploadedImages: ProductImageUploadResponse[] = [];

      for (let i = 0; i < imagesToUpload.length; i++) {
        const image = imagesToUpload[i];
        if (image.file) {
          try {
            const uploadResult = await uploadProductImage(image.file);
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

      const productImages: ProductImageRequest[] = uploadedImages
        .filter((img) => img && img.imageUrl && img.imageUrl.trim() !== "")
        .map((img, index) => {
          if (!img.imageUrl) {
            throw new Error(`이미지 ${index + 1}의 URL이 없습니다.`);
          }

          return {
            imageUrl: img.imageUrl.trim(),
            sortOrder: index + 1,
          };
        });

      const requestData: ProductRegistrationRequest = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        category: productData.category.trim(),
        price: price,
        stock: stock,
        maxPurchasePerUser: maxPurchasePerUserValue,
        status: "ACTIVE",
        images: productImages,
        pickupLocations: validPickupLocations,
      };

      const response = await apiRequest("/admin/store/items", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "상품 등록에 실패했습니다.");
      }

      const responseData: ProductRegistrationResponse = await response.json();

      alert("상품이 성공적으로 등록되었습니다.");
      navigate("/store");
    } catch (error) {
      console.error("상품 등록 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={styles["add-product-page"]}>
      <div className={styles["add-product-header"]}>
        <button className={styles["back-btn"]} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <img src="/admin/img/icon/back-arrow.svg" alt="뒤로가기" />
        </button>
        <div className={styles["header-content"]}>
          <div className={styles["header-info"]}>
            <h1>상품 등록</h1>
            <p>새로운 상품을 등록하고 판매를 시작하세요</p>
          </div>
          <div className={styles["header-actions"]}>
            <button className={styles["submit-btn"]} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "상품 등록"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles["add-product-content"]}>
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
              <label>상품 가격</label>
              <div className={styles["price-input-wrapper"]}>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleInputChange}
                  placeholder="0"
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
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
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
              <h3>등록 팁</h3>
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
    </div>
  );
};

export default AddProduct;
