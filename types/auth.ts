// Authentication types
export type AuthUser = {
  id: string;
  username: string;
  email?: string;
  role?: string;
  permissions?: string[];
};

// Table/UI User type
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar?: string;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};
