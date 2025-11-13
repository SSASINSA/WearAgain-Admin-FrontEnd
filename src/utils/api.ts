import { authUtils, TokenResponse } from "./auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/v1";

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse | null> | null = null;

interface ApiError {
  errorCode?: string;
  message?: string;
  statusCode?: number;
}

const refreshAccessToken = async (): Promise<TokenResponse | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      if (!refreshToken) {
        throw new Error("리프레시 토큰을 찾을 수 없습니다.");
      }

      const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const tokenResponse: TokenResponse = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenType: data.tokenType,
          expiresIn: data.expiresIn,
        };
        authUtils.setTokens(tokenResponse);
        return tokenResponse;
      } else {
        authUtils.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return null;
      }
    } catch (error) {
      authUtils.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = authUtils.getAccessToken();

  const existingHeaders = (options.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    ...existingHeaders,
  };

  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const makeRequest = async (): Promise<Response> => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest();

  if (!response.ok) {
    try {
      const errorData: ApiError = await response.json();

      if (errorData.errorCode === "AD1009") {
        const newTokens = await refreshAccessToken();

        if (newTokens) {
          headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          throw new Error("토큰 재발급에 실패했습니다.");
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === "토큰 재발급에 실패했습니다.") {
        throw error;
      }
    }
  }

  return response;
};

export default apiRequest;
