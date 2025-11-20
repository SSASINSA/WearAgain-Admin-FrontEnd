const ACCESS_TOKEN_KEY = "wa_sess_2024";
const REFRESH_TOKEN_KEY = "wa_ref_2024";

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error("REACT_APP_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다.");
  throw new Error("서버 오류가 발생했습니다.");
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

const encrypt = (text: string): string => {
  try {
    const utf8Bytes = new TextEncoder().encode(text);
    let binaryString = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryString += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binaryString);

    let encrypted = "";
    for (let i = 0; i < base64.length; i++) {
      const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
      encrypted += String.fromCharCode(base64.charCodeAt(i) ^ keyChar.charCodeAt(0));
    }

    return btoa(encrypted);
  } catch (error) {
    console.error("암호화 실패:", error);
    return text;
  }
};

const decrypt = (encryptedText: string): string => {
  try {
    const base64 = atob(encryptedText);

    let decrypted = "";
    for (let i = 0; i < base64.length; i++) {
      const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
      decrypted += String.fromCharCode(base64.charCodeAt(i) ^ keyChar.charCodeAt(0));
    }

    const decodedBase64 = atob(decrypted);
    const utf8Bytes = new Uint8Array(decodedBase64.length);
    for (let i = 0; i < decodedBase64.length; i++) {
      utf8Bytes[i] = decodedBase64.charCodeAt(i);
    }
    return new TextDecoder().decode(utf8Bytes);
  } catch (error) {
    console.error("복호화 실패:", error);
    return encryptedText;
  }
};

export const authUtils = {
  setTokens: (tokens: TokenResponse): void => {
    const encryptedAccessToken = encrypt(tokens.accessToken);
    const encryptedRefreshToken = encrypt(tokens.refreshToken);

    localStorage.setItem(ACCESS_TOKEN_KEY, encryptedAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, encryptedRefreshToken);
  },

  getAccessToken: (): string | null => {
    const encrypted = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!encrypted) return null;

    try {
      return decrypt(encrypted);
    } catch (error) {
      console.error("토큰 복호화 실패:", error);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return null;
    }
  },

  getRefreshToken: (): string | null => {
    const encrypted = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!encrypted) return null;

    try {
      return decrypt(encrypted);
    } catch (error) {
      console.error("토큰 복호화 실패:", error);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getAccessToken();
  },
};
