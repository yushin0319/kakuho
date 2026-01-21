// src/pages/Login.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { TestWrapper, mockUser, mockAdminUser } from "../test/mocks";

// モック関数
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    loading: false,
    signup: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  }),
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ログインフォームを表示する", () => {
    render(<Login />, { wrapper: TestWrapper });

    expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("新規登録リンクを表示する", () => {
    render(<Login />, { wrapper: TestWrapper });

    expect(screen.getByText("新規登録はこちら")).toBeInTheDocument();
  });

  it("一般ユーザーでログイン成功時、/bookingへ遷移する", async () => {
    mockLogin.mockResolvedValueOnce(mockUser);
    const user = userEvent.setup();

    render(<Login />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/booking");
    });
  });

  it("管理者でログイン成功時、/check-in-listへ遷移する", async () => {
    mockLogin.mockResolvedValueOnce(mockAdminUser);
    const user = userEvent.setup();

    render(<Login />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/メールアドレス/), "admin@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "adminpass");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "adminpass");
      expect(mockNavigate).toHaveBeenCalledWith("/check-in-list");
    });
  });

  it("ログイン失敗時、エラーメッセージを表示する", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    const user = userEvent.setup();

    render(<Login />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。"
        )
      ).toBeInTheDocument();
    });
  });
});
