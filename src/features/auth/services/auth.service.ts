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

// ── Mock credentials (replace with real API call later) ──
const MOCK_USERNAME = "admin";
const MOCK_PASSWORD = "admin123";

const MOCK_USER: AuthUser = {
  id: 1,
  name: "Ahmed Abdelhakim",
  email: "admin@cms.com",
  role: "Admin",
};

/**
 * Authenticate a user with username and password.
 *
 * Currently returns mock data. Replace the body of this function
 * with a real API call (e.g. `apiClient.post(endpoints.auth.login, …)`)
 * without changing the function signature or return type.
 */
export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (username !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
    throw new Error("InvalidCredentials");
  }

  return {
    token: "mock-token",
    refreshToken: "mock-refresh-token",
    user: MOCK_USER,
  };
}
