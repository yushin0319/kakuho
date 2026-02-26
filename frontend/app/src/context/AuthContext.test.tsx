// src/context/AuthContext.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { mockUser } from "../test/mocks";

// API モック
const mockApiLogin = vi.fn();
const mockApiLogout = vi.fn().mockResolvedValue(undefined);
const mockGetCurrentUser = vi.fn();
const mockSignupUser = vi.fn();

vi.mock("../services/api/auth", () => ({
  login: (...args: unknown[]) => mockApiLogin(...args),
  logout: (...args: unknown[]) => mockApiLogout(...args),
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("../services/api/user", () => ({
  signupUser: (...args: unknown[]) => mockSignupUser(...args),
}));

// SnackContext モック
const mockSetSnack = vi.fn();
vi.mock("./SnackContext", () => ({
  useSnack: () => ({ snack: null, setSnack: mockSetSnack }),
}));

// テスト用コンシューマーコンポーネント
const TestConsumer = () => {
  const { isAuthenticated, user, loading, login, signup, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login("test@example.com", "password123");
    } catch {
      // エラーは無視（テストで確認）
    }
  };

  const handleSignup = async () => {
    try {
      await signup({
        email: "new@example.com",
        password: "newpass123",
        nickname: "新規ユーザー",
      });
    } catch {
      // エラーは無視
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading ? "true" : "false"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "true" : "false"}</div>
      <div data-testid="user">{user ? user.email : "null"}</div>
      <button onClick={handleLogin}>ログイン</button>
      <button onClick={handleSignup}>新規登録</button>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルト: 初期ロード時に未認証
    mockGetCurrentUser.mockRejectedValue(new Error("Not authenticated"));
  });

  it("useAuthがAuthProvider外で使われた場合エラーをスローする", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    consoleSpy.mockRestore();
  });

  it("初期状態ではloadingがtrueで、認証チェック後にfalseになる", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // 初期ロード完了後
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("初期ロード時にトークンが有効ならユーザー情報を取得する", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });
  });

  it("ログイン成功時にユーザー情報が設定される", async () => {
    const user = userEvent.setup();
    mockApiLogin.mockResolvedValue("token123");
    mockGetCurrentUser
      .mockRejectedValueOnce(new Error("Not authenticated")) // 初期ロード
      .mockResolvedValue(mockUser); // ログイン後

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // 初期ロード完了待ち
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("ログイン"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });

    expect(mockApiLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("ログイン失敗時にエラーがスローされる", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockApiLogin.mockRejectedValue(new Error("Invalid credentials"));

    const ErrorTestConsumer = () => {
      const { login } = useAuth();
      const [error, setError] = useState("");

      const handleLogin = async () => {
        try {
          await login("test@example.com", "wrong");
        } catch (e) {
          setError("ログイン失敗");
        }
      };

      return (
        <div>
          <button onClick={handleLogin}>ログイン</button>
          <div data-testid="error">{error}</div>
        </div>
      );
    };

    // useState をインポートに追加
    const { useState } = await import("react");

    render(
      <AuthProvider>
        <ErrorTestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {});

    await user.click(screen.getByText("ログイン"));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("ログイン失敗");
    });

    consoleSpy.mockRestore();
  });

  it("ログアウト時にユーザー情報がクリアされる", async () => {
    const user = userEvent.setup();
    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // ログイン状態になるまで待機
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    await user.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    expect(mockApiLogout).toHaveBeenCalled();
  });

  it("ユーザー設定時にスナック通知が表示される", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockSetSnack).toHaveBeenCalledWith({
        message: "こんにちは、 テストユーザーさん！",
        severity: "success",
      });
    });
  });
});
