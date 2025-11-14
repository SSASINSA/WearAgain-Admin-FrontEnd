import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [images, setImages] = useState<ProductImage[]>([
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
    { file: null, preview: "" },
  ]);

  const [pressedAction, setPressedAction] = useState<string | null>(null);

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
    console.log("상품 등록:", { ...productData, images });
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
            <button className={styles["submit-btn"]} onClick={handleSubmit}>
              상품 등록
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
