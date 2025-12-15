import React, { useState, useEffect } from "react";
import styles from "./ImageGalleryModal.module.css";

export interface GalleryImage {
  id: string | number;
  url: string;
  altText?: string | null;
}

interface ImageGalleryModalProps {
  isOpen: boolean;
  images: GalleryImage[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePrevImage = () => {
      if (images.length > 0) {
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };

    const handleNextImage = () => {
      if (images.length > 0) {
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, images.length, onClose]);

  const handlePrevImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  if (!isOpen || images.length === 0) {
    return null;
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const currentImage = images[selectedImageIndex];

  return (
    <div
      className={styles["image-modal-overlay"]}
      onClick={handleOverlayClick}
      tabIndex={-1}
    >
      <div className={styles["image-modal-container"]} onClick={handleContainerClick}>
        <h2 className={styles["modal-title"]}>확대보기</h2>
        <div className={styles["modal-main-content"]}>
          <div className={styles["modal-image-wrapper"]}>
            <img
              src={currentImage.url}
              alt={currentImage.altText || `이미지 ${selectedImageIndex + 1}`}
              className={styles["modal-image"]}
            />
            {images.length > 1 && (
              <>
                <button
                  className={styles["modal-nav-btn"]}
                  onClick={handlePrevImage}
                  style={{ left: "20px" }}
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
                <button
                  className={styles["modal-nav-btn"]}
                  onClick={handleNextImage}
                  style={{ right: "20px" }}
                  aria-label="다음 이미지"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles["modal-thumbnails"]}>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`${styles["modal-thumbnail"]} ${
                    index === selectedImageIndex ? styles["active"] : ""
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `썸네일 ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <button className={styles["modal-close-button"]} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ImageGalleryModal;

