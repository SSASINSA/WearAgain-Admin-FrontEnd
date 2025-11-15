import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "./EventDetail.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";

const imgImg = "/admin/img/example/event-hero.png";
const imgFrame1 = "/admin/img/icon/date-time.svg";
const imgFrame2 = "/admin/img/icon/location-pin.svg";
const imgFrame3 = "/admin/img/icon/user-count.svg";
const imgFrame4 = "/admin/img/icon/co2.svg";
const imgFrame5 = "/admin/img/icon/energy.svg";
const imgFrame6 = "/admin/img/icon/water.svg";
const imgFrame7 = "/admin/img/icon/staff-badge.svg";
const imgFrame8 = "/admin/img/icon/code-generate.svg";
const imgFrame9 = "/admin/img/icon/alert.svg";
const imgFrame10 = "/admin/img/icon/clothes.svg";
const imgFrame11 = "/admin/img/icon/exchange-rate.svg";

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const headerOffsetPx = 120;
    let sidebarTopAbs = 0;

    const computeAnchors = () => {
      const el = sidebarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      sidebarTopAbs = window.scrollY + rect.top - headerOffsetPx;
    };

    const onScroll = () => {
      const el = sidebarRef.current;
      const inner = sidebarInnerRef.current;
      if (!el || !inner) return;
      const containerRect = el.getBoundingClientRect();
      if (window.scrollY >= sidebarTopAbs) {
        const fixedLeft = containerRect.left + window.scrollX;
        const width = containerRect.width;
        inner.style.position = "fixed";
        inner.style.top = `${headerOffsetPx}px`;
        inner.style.left = `${fixedLeft}px`;
        inner.style.width = `${width}px`;
        inner.style.zIndex = "2";
      } else {
        inner.style.position = "static";
        inner.style.top = "";
        inner.style.left = "";
        inner.style.width = "";
        inner.style.zIndex = "";
      }
    };

    const onResize = () => {
      computeAnchors();
      onScroll();
    };

    computeAnchors();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={styles["event-detail-page"]}>
      <PageHeader title="행사 상세정보" />

      <div className={styles["event-detail-main"]} style={{ alignItems: "flex-start" }}>
        <div className={styles["event-detail-content"]}>
          {/* 행사 헤더 섹션 */}
          <div className={styles["event-hero-section"]}>
            <div className={styles["event-hero-image"]}>
              <img src={imgImg} alt="행사 이미지" />
              <div className={styles["image-overlay"]}></div>
            </div>
            <div className={styles["event-hero-content"]}>
              <div className={styles["event-tags"]}>
                <span className={`${styles["tag"]} ${styles["environment"]}`}>환경보호</span>
                <span className={`${styles["tag"]} ${styles["workshop"]}`}>워크샵</span>
              </div>
              <h2 className={styles["event-title"]}>서울 강남구 옷 교환 파티</h2>
              <p className={styles["event-description"]}>
                옷을 버리는 대신 교환함으로써 환경을 지키는 21%파티 행사입니다. 더 이상 입지 않는 옷을 가져와서 다른 사람의 옷과 교환하고, 
                지속가능한 패션을 실천해보세요. 함께하면 환경도 지키고 새로운 스타일도 찾을 수 있습니다.
              </p>
            </div>
          </div>

          {/* 행사 상세 정보 섹션 */}
          <div className={styles["event-details-section"]}>
            <h3 className={styles["section-title"]}>행사 상세 정보</h3>
            <div className={styles["event-details-grid"]}>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame1} alt="날짜 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>날짜 및 시간</p>
                  <p className={styles["detail-value"]}>2024년 3월 15일 (금)</p>
                  <p className={styles["detail-value"]}>오후 2:00 - 5:00 (3시간)</p>
                </div>
              </div>
              <div className={styles["detail-item"]}>
                <div className={styles["detail-icon"]}>
                  <img src={imgFrame2} alt="위치 아이콘" />
                </div>
                <div className={styles["detail-content"]}>
                  <p className={styles["detail-label"]}>위치</p>
                  <p className={styles["detail-value"]}>서울시 강남구 테헤란로 123</p>
                  <p className={styles["detail-value"]}>그린센터 2층 컨퍼런스룸</p>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 방법 섹션 */}
          <div className={styles["event-usage-section"]}>
            <h3 className={styles["section-title"]}>이용 방법</h3>
            <ul className={styles["usage-list"]}>
              <li>깨끗한 옷을 행사장으로 들고옵니다.</li>
              <li>행사장 입구에서 가져온 옷을 QR을 통해 등록합니다.</li>
              <li>등록 후 교환 티켓이 잘 들어왔는지 확인합니다.</li>
              <li>교환 티켓 만큼 행사장에 있는 옷들을 고릅니다.</li>
              <li>교환 존에서 담당자에게 QR 제시 후 수령합니다.</li>
            </ul>
          </div>

          {/* 주의사항 섹션 */}
          <div className={styles["event-precaution-section"]}>
            <h3 className={styles["section-title"]}>주의사항</h3>
            <ul className={styles["precaution-list"]}>
              <li>가져온 옷은 반드시 세탁 필수!</li>
              <li>행사장 내에서 음식물 섭취는 제한 될 수 있습니다.</li>
            </ul>
          </div>

          {/* 행사 결과 섹션 */}
          <div className={styles["event-results-section"]}>
            <h3 className={styles["section-title"]}>행사 결과</h3>
            <div className={styles["results-grid"]}>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame3} alt="참가자 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>156</p>
                  <p className={styles["result-label"]}>참가자 수</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame4} alt="CO2 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>2,340</p>
                  <p className={styles["result-label"]}>CO₂ 절감량 (kg)</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame5} alt="에너지 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>1,890</p>
                  <p className={styles["result-label"]}>에너지 절감량 (kWh)</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame6} alt="물 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>4,567</p>
                  <p className={styles["result-label"]}>물 절약량 (L)</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame10} alt="의류 교환량 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>312</p>
                  <p className={styles["result-label"]}>의류 교환량 (벌)</p>
                </div>
              </div>
              <div className={styles["result-item"]}>
                <div className={styles["result-icon"]}>
                  <img src={imgFrame11} alt="교환율 아이콘" />
                </div>
                <div className={styles["result-content"]}>
                  <p className={styles["result-number"]}>85.2%</p>
                  <p className={styles["result-label"]}>교환율</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 - 스태프 코드 발급 */}
        <div className={styles["event-detail-sidebar"]} ref={sidebarRef} style={{ alignSelf: "flex-start" }}>
          <div ref={sidebarInnerRef}>
            <div className={styles["staff-code-section"]}>
            <div className={styles["staff-code-content"]}>
              <div className={styles["staff-code-icon"]}>
                <img src={imgFrame7} alt="스태프 코드 아이콘" />
              </div>
              <h4 className={styles["staff-code-title"]}>스태프 코드 발급</h4>
              <p className={styles["staff-code-description"]}>행사 운영진을 위한 전용 코드를 발급받으세요</p>
            </div>
            <button className={styles["staff-code-button"]}>
              <img src={imgFrame8} alt="발급 아이콘" />
              스태프 코드 발급
            </button>
            <div className={styles["staff-code-notice"]}>
              <img src={imgFrame9} alt="알림 아이콘" />
              <p>코드는 행사 당일에만 유효합니다</p>
            </div>
            </div>

            {/* 행사 정보 섹션 */}
            <div className={styles["event-info-section"]}>
              <h4 className={styles["info-title"]}>행사 정보</h4>
              <div className={styles["info-list"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>상태</span>
                  <span className={`${styles["info-value"]} ${styles["status-completed"]}`}>완료</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>카테고리</span>
                  <span className={styles["info-value"]}>환경보호</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>주최자</span>
                  <span className={styles["info-value"]}>그린라이프</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>참가비</span>
                  <span className={styles["info-value"]}>무료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
