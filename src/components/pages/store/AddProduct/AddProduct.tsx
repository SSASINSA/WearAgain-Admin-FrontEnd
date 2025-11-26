import React, { useState, useEffect, useCallback } from "react";
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
  maxPurchasePerUser: number;
  status: string;
  images: ProductImageRequest[];
}

interface ProductRegistrationResponse {
  id: number;
  name: string;
  status: string;
}

interface OptionValue {
  id: string;
  value: string;
}

interface ProductOption {
  id: string;
  type: string;
  name: string;
  values: OptionValue[];
  required: boolean;
}

interface OptionCombination {
  id: string;
  optionValues: { [key: string]: string };
  optionPrice: string;
  stock: string;
  addStock: string;
  sku: string;
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

  const [options, setOptions] = useState<ProductOption[]>([]);
  const [optionCombinations, setOptionCombinations] = useState<OptionCombination[]>([]);
  const [isCombinedOption, setIsCombinedOption] = useState(false);
  const [requiredOptions, setRequiredOptions] = useState(false);
  const [quantity, setQuantity] = useState<string>("");
  const [focusedPriceInput, setFocusedPriceInput] = useState<string | null>(null);

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

  const handleTempSave = () => {
    console.log("임시저장:", { ...productData, images });
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
                  ...newImages[imageIndex],
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
        maxPurchasePerUser: 1,
        status: "ACTIVE",
        images: productImages,
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
      alert(error instanceof Error ? error.message : "상품 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOption = () => {
    const newOption: ProductOption = {
      id: `option-${Date.now()}`,
      type: "기본",
      name: "",
      values: [],
      required: false,
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    const filteredOptions = options.filter((opt) => opt.id !== optionId);
    setOptions(filteredOptions);
  };

  const handleOptionChange = (optionId: string, field: string, value: string | boolean) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, [field]: value };
        }
        return opt;
      })
    );
  };

  const handleAddOptionValue = (optionId: string, value: string) => {
    if (!value.trim()) return;

    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          const newValue: OptionValue = {
            id: `value-${Date.now()}-${Math.random()}`,
            value: value.trim(),
          };
          return { ...opt, values: [...opt.values, newValue] };
        }
        return opt;
      })
    );
  };

  const handleRemoveOptionValue = (optionId: string, valueId: string) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, values: opt.values.filter((v) => v.id !== valueId) };
        }
        return opt;
      })
    );
  };

  const generateCombinations = useCallback(
    (opts: ProductOption[]) => {
      if (!isCombinedOption || opts.length === 0) {
        setOptionCombinations([]);
        return;
      }

      const validOptions = opts.filter((opt) => opt.name && opt.values.length > 0);
      if (validOptions.length === 0) {
        setOptionCombinations([]);
        return;
      }

      const combinations: OptionCombination[] = [];
      const generate = (current: { [key: string]: string }, remaining: ProductOption[]) => {
        if (remaining.length === 0) {
          combinations.push({
            id: `comb-${Date.now()}-${Math.random()}`,
            optionValues: { ...current },
            optionPrice: "",
            stock: "0",
            addStock: "",
            sku: "",
            status: "판매중",
          });
          return;
        }

        const [first, ...rest] = remaining;
        first.values.forEach((val) => {
          generate({ ...current, [first.name]: val.value }, rest);
        });
      };

      generate({}, validOptions);
      setOptionCombinations(combinations);
    },
    [isCombinedOption]
  );

  useEffect(() => {
    generateCombinations(options);
  }, [options, generateCombinations]);

  const handleCombinationChange = (combinationId: string, field: string, value: string) => {
    setOptionCombinations(
      optionCombinations.map((comb) => {
        if (comb.id === combinationId) {
          return { ...comb, [field]: value };
        }
        return comb;
      })
    );
  };

  const formatPrice = (price: string) => {
    if (!price) return "";
    const numPrice = parseInt(price, 10);
    if (isNaN(numPrice)) return "";
    return `KRW ${numPrice.toLocaleString()}`;
  };

  const handlePriceInput = (combinationId: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    handleCombinationChange(combinationId, "optionPrice", numericValue);
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
            <button className={styles["temp-save-btn"]} onClick={handleTempSave}>
              임시저장
            </button>
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
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className={`${styles["section"]} ${styles["product-options"]}`}>
            <div className={styles["section-header"]}>
              <div className={styles["icon"]}>
                <img src={ICONS.pencil} alt="옵션 아이콘" />
              </div>
              <h2>상품 옵션</h2>
            </div>

            <div className={styles["options-section"]}>
              {options.map((option) => (
                <div key={option.id} className={styles["option-row"]}>
                  <div className={styles["option-type"]}>
                    <label>옵션타입</label>
                    <select
                      value={option.type}
                      onChange={(e) => handleOptionChange(option.id, "type", e.target.value)}
                    >
                      <option value="기본">기본</option>
                    </select>
                  </div>
                  <div className={styles["option-name"]}>
                    <label>옵션명</label>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => handleOptionChange(option.id, "name", e.target.value)}
                      placeholder="옵션명을 입력하세요"
                    />
                  </div>
                  <div className={styles["option-values"]}>
                    <label>옵션값</label>
                    <div className={styles["option-values-input"]}>
                      {option.values.map((val) => (
                        <span key={val.id} className={styles["option-tag"]}>
                          {val.value}
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionValue(option.id, val.id)}
                            className={styles["tag-remove"]}
                          >
                            <img src="/admin/img/icon/x-reject.svg" alt="제거" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="옵션값 입력 후 Enter"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOptionValue(option.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                        className={styles["option-value-input"]}
                      />
                    </div>
                  </div>
                  <div className={styles["option-required"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={option.required}
                        onChange={(e) => handleOptionChange(option.id, "required", e.target.checked)}
                      />
                      필수
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className={styles["option-remove-btn"]}
                  >
                    <img src="/admin/img/icon/x-reject.svg" alt="옵션 제거" />
                  </button>
                </div>
              ))}

              <button type="button" onClick={handleAddOption} className={styles["add-option-btn"]}>
                옵션 추가
              </button>
            </div>

            {optionCombinations.length > 0 && (
              <div className={styles["combinations-section"]}>
                <div className={styles["combinations-header"]}>
                  <div className={styles["checkbox-group"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={requiredOptions}
                        onChange={(e) => setRequiredOptions(e.target.checked)}
                      />
                      필수옵션
                      <img src={ICONS.info} alt="정보" className={styles["info-icon-small"]} />
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={isCombinedOption}
                        onChange={(e) => setIsCombinedOption(e.target.checked)}
                      />
                      조합형 옵션
                      <img src={ICONS.info} alt="정보" className={styles["info-icon-small"]} />
                    </label>
                  </div>
                </div>

                <div className={styles["combinations-table"]}>
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        {options
                          .filter((opt) => opt.name && opt.values.length > 0)
                          .map((opt) => (
                            <th key={opt.id}>{opt.name}</th>
                          ))}
                        <th>
                          옵션가격
                          <img src={ICONS.info} alt="정보" className={styles["info-icon-small"]} />
                        </th>
                        <th>재고</th>
                        <th>
                          재고추가?
                          <img src={ICONS.info} alt="정보" className={styles["info-icon-small"]} />
                        </th>
                        <th>
                          재고번호 (SKU)
                          <img src={ICONS.info} alt="정보" className={styles["info-icon-small"]} />
                        </th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionCombinations.map((combination) => (
                        <tr key={combination.id}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          {options
                            .filter((opt) => opt.name && opt.values.length > 0)
                            .map((opt) => (
                              <td key={opt.id}>{combination.optionValues[opt.name] || ""}</td>
                            ))}
                          <td>
                            <div className={styles["price-input-cell"]}>
                              <input
                                type="text"
                                value={
                                  focusedPriceInput === combination.id
                                    ? combination.optionPrice
                                    : combination.optionPrice
                                    ? formatPrice(combination.optionPrice)
                                    : ""
                                }
                                onChange={(e) => handlePriceInput(combination.id, e.target.value)}
                                onFocus={() => setFocusedPriceInput(combination.id)}
                                onBlur={() => setFocusedPriceInput(null)}
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={combination.stock}
                              onChange={(e) =>
                                handleCombinationChange(combination.id, "stock", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={combination.addStock}
                              onChange={(e) =>
                                handleCombinationChange(combination.id, "addStock", e.target.value)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={combination.sku}
                              onChange={(e) =>
                                handleCombinationChange(combination.id, "sku", e.target.value)
                              }
                              placeholder="SKU 번호"
                            />
                          </td>
                          <td>
                            <select
                              value={combination.status}
                              onChange={(e) =>
                                handleCombinationChange(combination.id, "status", e.target.value)
                              }
                            >
                              <option value="판매중">판매중</option>
                              <option value="품절">품절</option>
                              <option value="판매중지">판매중지</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

          <div className={`${styles["section"]} ${styles["quick-actions"]}`}>
            <h3>빠른 작업</h3>
            <div className={styles["action-buttons"]}>
              <button
                className={`${styles["action-btn"]} ${pressedAction === "preview" ? styles["is-pressed"] : ""}`}
                {...getPressHandlers("preview")}
              >
                <img src={ICONS.eye} alt="미리보기" className={styles["icon"]} />
                미리보기
              </button>
              <button
                className={`${styles["action-btn"]} ${pressedAction === "copy" ? styles["is-pressed"] : ""}`}
                {...getPressHandlers("copy")}
              >
                <img src={ICONS.copy} alt="복사하기" className={styles["icon"]} />
                복사하기
              </button>
              <button
                className={`${styles["action-btn"]} ${pressedAction === "share" ? styles["is-pressed"] : ""}`}
                {...getPressHandlers("share")}
              >
                <img src={ICONS.share} alt="공유하기" className={styles["icon"]} />
                공유하기
              </button>
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
