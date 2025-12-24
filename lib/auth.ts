import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

// Define interfaces for your user data
export interface User {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
  menus: string[];
  ulb_id: number;
  iat?: number;
  exp?: number;
}

export interface AuthStorage {
  setTokens: (accessToken: string) => void;
  getAccessToken: () => string | undefined;
  setUser: (user: User) => void;
  getUser: () => User | null;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const authStorage: AuthStorage = {
  setTokens: (accessToken: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  setUser: (user: User): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) as User : null;
  },

  clearAuth: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken();
  },
};