// src/components/UserInfo.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserInfo from "./UserInfo";
import { TestWrapper, mockUser } from "../test/mocks";

const mockSetUser = vi.fn();
const mockLogout = vi.fn();
const mockSetSnack = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    setUser: mockSetUser,
    logout: mockLogout,
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
  }),
}));

vi.mock("../context/SnackContext", () => ({
  useSnack: () => ({
    snack: null,
    setSnack: mockSetSnack,
  }),
}));

vi.mock("../services/api/user", () => ({
  updateUser: vi.fn().mockResolvedValue({
    id: 1,
    email: "updated@example.com",
    nickname: "更新ユーザー",
    is_admin: false,
  }),
}));

describe("UserInfo", () => {
  const defaultProps = {
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ダイアログタイトルを表示する", () => {
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("ユーザー情報")).toBeInTheDocument();
  });

  it("サマリーフェーズでニックネームを表示する", () => {
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
  });

  it("サマリーフェーズでメールアドレスを表示する", () => {
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("サマリーフェーズで編集ボタンを表示する", () => {
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("編集")).toBeInTheDocument();
  });

  it("サマリーフェーズでログアウトボタンを表示する", () => {
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  it("編集ボタンクリックでフォームフェーズに切り替わる", async () => {
    const user = userEvent.setup();
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });

    await user.click(screen.getByText("編集"));

    // フォームフェーズではニックネームとメールの入力欄が表示される
    expect(screen.getByLabelText("ニックネーム")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
  });

  it("フォームフェーズでキャンセルするとサマリーに戻る", async () => {
    const user = userEvent.setup();
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });

    await user.click(screen.getByText("編集"));
    expect(screen.getByLabelText("ニックネーム")).toBeInTheDocument();

    await user.click(screen.getByText("キャンセル"));
    // サマリーフェーズに戻る
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByText("編集")).toBeInTheDocument();
  });

  it("ログアウトボタンクリックで確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    render(<UserInfo {...defaultProps} />, { wrapper: TestWrapper });

    await user.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      expect(
        screen.getByText("ログアウトしてよろしいですか？")
      ).toBeInTheDocument();
    });
  });

  it("確認ダイアログでOKを押すとログアウトが実行される", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserInfo onClose={onClose} />, { wrapper: TestWrapper });

    await user.click(screen.getByText("ログアウト"));

    await waitFor(() => {
      expect(
        screen.getByText("ログアウトしてよろしいですか？")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("OK"));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockSetSnack).toHaveBeenCalledWith({
      message: "ログアウトしました",
      severity: "info",
    });
    expect(onClose).toHaveBeenCalled();
  });
});
