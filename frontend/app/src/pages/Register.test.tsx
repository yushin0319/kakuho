// src/pages/Register.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./Register";
import { TestWrapper, mockUser, mockAdminUser } from "../test/mocks";

// モック関数
const mockSignup = vi.fn();
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
    signup: mockSignup,
    login: vi.fn(),
    isAuthenticated: false,
    user: null,
    loading: false,
    logout: vi.fn(),
    setUser: vi.fn(),
  }),
}));

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新規登録フォームを表示する", () => {
    render(<Register />, { wrapper: TestWrapper });

    expect(
      screen.getByRole("heading", { name: "新規登録" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/ニックネーム/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新規登録" })
    ).toBeInTheDocument();
  });

  it("一般ユーザーで登録成功時、/bookingへ遷移する", async () => {
    mockSignup.mockResolvedValueOnce(mockUser);
    const user = userEvent.setup();

    render(<Register />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/ニックネーム/), "テストユーザー");
    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "password123");
    await user.click(screen.getByRole("button", { name: "新規登録" }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        nickname: "テストユーザー",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/booking");
    });
  });

  it("管理者で登録成功時、/check-in-listへ遷移する", async () => {
    mockSignup.mockResolvedValueOnce(mockAdminUser);
    const user = userEvent.setup();

    render(<Register />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/ニックネーム/), "管理者");
    await user.type(
      screen.getByLabelText(/メールアドレス/),
      "admin@example.com"
    );
    await user.type(screen.getByLabelText(/パスワード/), "adminpass");
    await user.click(screen.getByRole("button", { name: "新規登録" }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "adminpass",
        nickname: "管理者",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/check-in-list");
    });
  });

  it("登録失敗時、エラーメッセージを表示する", async () => {
    mockSignup.mockRejectedValueOnce(new Error("Registration failed"));
    const user = userEvent.setup();

    render(<Register />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/メールアドレス/), "test@example.com");
    await user.type(screen.getByLabelText(/パスワード/), "password123");
    await user.click(screen.getByRole("button", { name: "新規登録" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "登録に失敗しました。入力内容をご確認の上、再度お試しください。"
        )
      ).toBeInTheDocument();
    });
  });
});
