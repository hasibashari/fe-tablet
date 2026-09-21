export type UserRole = 'admin' | 'user' | 'patient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title?: string;
  phone?: string;
  age?: number;
  gender?: 'Laki-laki' | 'Perempuan';
  assignedDoctor?: string;
  bloodType?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  roleHint?: UserRole;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  age?: number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasCompletedOnboarding: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  quickLogin: (role: UserRole) => Promise<{ success: boolean; redirectTo: string }>;
  register: (
    data: RegisterCredentials,
  ) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}
