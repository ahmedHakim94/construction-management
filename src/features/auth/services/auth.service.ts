export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(): Promise<AuthResponse> {
  return Promise.resolve({
    token: "mock-token",
    refreshToken: "mock-refresh-token",
    user: {
      id: 1,
      name: "Ahmed Abdelhakim",
      email: "admin@cms.com",
      role: "Admin",
    },
  });
}
