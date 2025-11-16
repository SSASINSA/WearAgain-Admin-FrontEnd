import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import styles from "../AddProduct/AddProduct.module.css";

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

interface ProductState {
  id: number;
  name: string;
  price: number;
  category: string;
  status: "판매중" | "품절" | "판매완료";
  image: string;
  description: string;
  stock: number;
  createdAt: string;
}

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as Partial<ProductState>;

  const [productData, setProductData] = useState({
    name: state.name || "",
    description: state.description || "",
    price: state.price?.toString() || "",
  });

  const [images, setImages] = useState<ProductImage[]>([
    { file: null, preview: state.image || "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
  ]);

  const [pressedAction, setPressedAction] = useState<string | null>(null);

  const [options, setOptions] = useState<ProductOption[]>([]);
  const [optionCombinations, setOptionCombinations] = useState<OptionCombination[]>([]);
  const [isCombinedOption, setIsCombinedOption] = useState(false);
  const [requiredOptions, setRequiredOptions] = useState(false);
  const [quantity, setQuantity] = useState<string>(state.stock?.toString() || "");
  const [focusedPriceInput, setFocusedPriceInput] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      setProductData({
        name: state.name || "",
        description: state.description || "",
        price: state.price?.toString() || "",
      });
      setQuantity(state.stock?.toString() || "");
      if (state.image) {
        setImages([
          { file: null, preview: state.image },
          { file: null, preview: "" },
          { file: null, preview: "" },
          { file: null, preview: "" },
        ]);
      }
    }
  }, [state]);

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
        newImages[index] = { file, preview };
        return newImages;
      });
    }
  };

  const handleTempSave = () => {
    console.log("임시저장:", { ...productData, images });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("상품 수정:", { id, ...productData, images, options, optionCombinations, quantity });
    navigate(`/store/${id}`);
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
            <h1>상품 수정</h1>
            <p>상품 정보를 수정하고 변경사항을 저장하세요</p>
          </div>
          <div className={styles["header-actions"]}>
            <button className={styles["temp-save-btn"]} onClick={handleTempSave}>
              임시저장
            </button>
            <button className={styles["submit-btn"]} onClick={handleSubmit}>
              상품 수정
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
                      <img src={image.preview} alt={`상품 이미지 ${index + 1}`} />
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
    </div>
  );
};

export default ProductEdit;

