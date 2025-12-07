import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./OrderManagement.module.css";
import PageHeader from "../../../common/PageHeader/PageHeader";
import DataList from "../../../common/DataList/DataList";
import ConfirmModal from "../../../common/ConfirmModal/ConfirmModal";
import apiRequest from "../../../../utils/api";

const dropdownIcon = "/admin/img/icon/dropdown.svg";

interface Order {
  orderId: number;
  userId: number;
  userEmail: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pickupLocation: string;
  status: "PURCHASED" | "CANCELED" | "FAILED";
  purchasedAt: string;
  canceledAt: string | null;
}

interface OrderListResponse {
  orders: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface OrderCancelResponse {
  orderId: number;
  status: "CANCELED";
  refundedAmount: number;
  canceledAt: string;
}

const OrderManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getPageFromUrl = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 0;
  };

  const getSearchTermFromUrl = () => {
    return searchParams.get("keyword") || "";
  };

  const getSearchScopeFromUrl = () => {
    return searchParams.get("keywordScope") || "ALL";
  };

  const getStatusFromUrl = () => {
    return searchParams.get("status") || "all";
  };

  const getSortFromUrl = () => {
    return searchParams.get("sort") || "LATEST";
  };

  const getSizeFromUrl = () => {
    const size = searchParams.get("size");
    return size ? parseInt(size, 10) : 20;
  };

  const [selectedStatus, setSelectedStatus] = useState<string>(getStatusFromUrl());
  const [searchTerm, setSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>(getSearchTermFromUrl());
  const [searchScope, setSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [appliedSearchScope, setAppliedSearchScope] = useState<string>(getSearchScopeFromUrl());
  const [sortBy, setSortBy] = useState<string>(getSortFromUrl());
  const [currentPage, setCurrentPage] = useState<number>(getPageFromUrl());
  const [pageSize, setPageSize] = useState<number>(getSizeFromUrl());
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const updateUrlParams = (updates: {
    page?: number;
    keyword?: string;
    keywordScope?: string;
    status?: string;
    sort?: string;
    size?: number;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.page !== undefined) {
      if (updates.page === 0) {
        newParams.delete("page");
      } else {
        newParams.set("page", updates.page.toString());
      }
    }

    if (updates.keyword !== undefined) {
      if (updates.keyword === "") {
        newParams.delete("keyword");
      } else {
        newParams.set("keyword", updates.keyword);
      }
    }

    if (updates.keywordScope !== undefined) {
      if (updates.keywordScope === "ALL") {
        newParams.delete("keywordScope");
      } else {
        newParams.set("keywordScope", updates.keywordScope);
      }
    }

    if (updates.status !== undefined) {
      if (updates.status === "all") {
        newParams.delete("status");
      } else {
        newParams.set("status", updates.status);
      }
    }

    if (updates.sort !== undefined) {
      if (updates.sort === "LATEST") {
        newParams.delete("sort");
      } else {
        newParams.set("sort", updates.sort);
      }
    }

    if (updates.size !== undefined) {
      if (updates.size === 20) {
        newParams.delete("size");
      } else {
        newParams.set("size", updates.size.toString());
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    const urlPage = getPageFromUrl();
    const urlKeyword = getSearchTermFromUrl();
    const urlKeywordScope = getSearchScopeFromUrl();
    const urlStatus = getStatusFromUrl();
    const urlSort = getSortFromUrl();
    const urlSize = getSizeFromUrl();

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlKeyword !== appliedSearchTerm) {
      setSearchTerm(urlKeyword);
      setAppliedSearchTerm(urlKeyword);
    }
    if (urlKeywordScope !== appliedSearchScope) {
      setSearchScope(urlKeywordScope);
      setAppliedSearchScope(urlKeywordScope);
    }
    if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    if (urlSort !== sortBy) setSortBy(urlSort);
    if (urlSize !== pageSize) setPageSize(urlSize);
  }, [searchParams]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (appliedSearchTerm.trim()) {
        params.append("keyword", appliedSearchTerm.trim());
        if (appliedSearchScope && appliedSearchScope !== "ALL") {
          params.append("keywordScope", appliedSearchScope);
        }
      }
      params.append("sort", sortBy);
      params.append("page", currentPage.toString());
      params.append("size", pageSize.toString());

      const response = await apiRequest(`/admin/store/orders?${params.toString()}`, {
        method: "GET",
      });

      if (response.ok) {
        const data: OrderListResponse = await response.json();
        setOrders(data.orders);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        console.error("주문 목록 조회 실패");
      }
    } catch (error) {
      console.error("주문 목록 조회 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, appliedSearchTerm, appliedSearchScope, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      const response = await apiRequest(`/admin/store/orders/${selectedOrderId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        const cancelData: OrderCancelResponse = await response.json();
        await fetchOrders();
        setCancelModalOpen(false);
        setSelectedOrderId(null);
        alert(`주문이 취소되었습니다.\n환불 금액: ${formatPrice(cancelData.refundedAmount)}원`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "주문 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("주문 취소 중 오류:", error);
      alert("주문 취소 중 오류가 발생했습니다.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PURCHASED":
        return <span className={`${styles["status-badge"]} ${styles["purchased"]}`}>결제 완료</span>;
      case "CANCELED":
        return <span className={`${styles["status-badge"]} ${styles["canceled"]}`}>취소됨</span>;
      case "FAILED":
        return <span className={`${styles["status-badge"]} ${styles["failed"]}`}>실패</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedSearchScope(searchScope);
    setCurrentPage(0);
    updateUrlParams({
      keyword: searchTerm,
      keywordScope: searchScope,
      page: 0,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={styles["admin-dashboard"]}>
      <main className={styles["main-content"]}>
        <PageHeader title="상품 주문 관리" subtitle="상품 주문 내역을 조회하고 관리할 수 있습니다" />

        <div className={styles["dashboard-content"]}>
          <DataList
            headerTitle="주문 목록"
            headerRight={
              <>
                <span>총 {totalElements}개 주문</span>
                <span>|</span>
                <span>
                  페이지 {currentPage + 1}/{totalPages || 1}
                </span>
              </>
            }
            renderFilters={() => (
              <div className={`${styles["filter-section"]} ${isFilterOpen ? styles["is-open"] : styles["is-collapsed"]}`}>
                <div className={styles["filter-header"]}>
                  <h3>필터 및 검색</h3>
                  <button
                    className={`${styles["filter-toggle"]} ${isFilterOpen ? styles["open"] : ""}`}
                    aria-expanded={isFilterOpen}
                    onClick={() => setIsFilterOpen((v) => !v)}
                  >
                    ▼
                  </button>
                </div>
                <div className={`${styles["filter-controls"]} ${isFilterOpen ? styles["is-open"] : ""}`}>
                  <div className={styles["search-container"]}>
                    <div className={styles["search-icon"]} onClick={handleSearch} style={{ cursor: "pointer" }}>
                      <img src="/admin/img/icon/search.svg" alt="검색" />
                    </div>
                    <input
                      type="text"
                      placeholder="사용자 이메일 또는 상품명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={styles["search-input"]}
                    />
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={searchScope}
                      onChange={(e) => setSearchScope(e.target.value)}
                      className={styles["status-select"]}
                    >
                      <option value="ALL">전체</option>
                      <option value="ITEM_NAME">상품명</option>
                      <option value="USER_EMAIL">사용자 이메일</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["status-select-container"]}>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedStatus(newStatus);
                        setCurrentPage(0);
                        updateUrlParams({ status: newStatus, page: 0 });
                      }}
                      className={styles["status-select"]}
                    >
                      <option value="all">전체 상태</option>
                      <option value="PURCHASED">결제 완료</option>
                      <option value="CANCELED">취소됨</option>
                      <option value="FAILED">실패</option>
                    </select>
                    <div className={styles["status-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                  <div className={styles["sort-select-container"]}>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const newSort = e.target.value;
                        setSortBy(newSort);
                        setCurrentPage(0);
                        updateUrlParams({ sort: newSort, page: 0 });
                      }}
                      className={styles["sort-select"]}
                    >
                      <option value="LATEST">최신순</option>
                      <option value="OLDEST">오래된순</option>
                    </select>
                    <div className={styles["sort-select-icon"]}>
                      <img src={dropdownIcon} alt="드롭다운" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            columns={[
              {
                key: "orderId",
                title: "주문번호",
                width: 100,
                dataIndex: "orderId",
                className: styles["order-id-cell"],
              },
              {
                key: "userEmail",
                title: "사용자 이메일",
                width: 180,
                dataIndex: "userEmail",
                className: styles["email-cell"],
              },
              {
                key: "itemName",
                title: "상품명",
                width: 200,
                dataIndex: "itemName",
                className: styles["item-name-cell"],
              },
              {
                key: "quantity",
                title: "수량",
                width: 80,
                align: "center",
                dataIndex: "quantity",
                className: styles["quantity-cell"],
              },
              {
                key: "unitPrice",
                title: "단가",
                width: 100,
                className: styles["price-cell"],
                render: (row: Order) => `${formatPrice(row.unitPrice)}원`,
              },
              {
                key: "totalPrice",
                title: "총액",
                width: 120,
                className: styles["price-cell"],
                render: (row: Order) => `${formatPrice(row.totalPrice)}원`,
              },
              {
                key: "pickupLocation",
                title: "픽업 장소",
                width: 120,
                dataIndex: "pickupLocation",
                className: styles["location-cell"],
              },
              {
                key: "purchasedAt",
                title: "주문일",
                width: 120,
                className: styles["date-cell"],
                render: (row: Order) => (
                  <div>
                    <div>{formatDate(row.purchasedAt).split("-")[0]}-</div>
                    <div>{formatDate(row.purchasedAt).split("-").slice(1).join("-")}</div>
                  </div>
                ),
              },
              {
                key: "canceledAt",
                title: "취소일",
                width: 120,
                className: styles["date-cell"],
                render: (row: Order) => (
                  row.canceledAt ? (
                    <div>
                      <div>{formatDate(row.canceledAt).split("-")[0]}-</div>
                      <div>{formatDate(row.canceledAt).split("-").slice(1).join("-")}</div>
                    </div>
                  ) : "-"
                ),
              },
              {
                key: "status",
                title: "상태",
                width: 100,
                align: "center",
                render: (row: Order) => getStatusBadge(row.status),
              },
              {
                key: "actions",
                title: "작업",
                width: 80,
                align: "center",
                className: styles["actions-cell"],
                render: (row: Order) =>
                  row.status === "PURCHASED" ? (
                    <button
                      className={`${styles["action-btn"]} ${styles["cancel"]}`}
                      title="주문 취소"
                      onClick={() => {
                        setSelectedOrderId(row.orderId);
                        setCancelModalOpen(true);
                      }}
                    >
                      취소
                    </button>
                  ) : (
                    <span className={styles["no-action"]}>-</span>
                  ),
              },
            ]}
            data={orders}
            rowKey={(row: Order) => row.orderId}
            currentPage={currentPage + 1}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={(p) => {
              setCurrentPage(p - 1);
              updateUrlParams({ page: p - 1 });
            }}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(0);
              updateUrlParams({ page: 0, size: s });
            }}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={cancelModalOpen}
        title="주문 취소 확인"
        message="정말로 이 주문을 취소하시겠습니까? 취소된 주문은 환불 처리됩니다."
        confirmText="취소하기"
        cancelText="닫기"
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedOrderId(null);
        }}
        type="reject"
      />
    </div>
  );
};

export default OrderManagement;

