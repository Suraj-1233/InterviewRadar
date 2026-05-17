export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profilePicUrl?: string;
  bio?: string;
  collegeName?: string;
  currentCompany?: string;
  experienceYears?: number;
  skills?: string[];
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  profilePicUrl?: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}
