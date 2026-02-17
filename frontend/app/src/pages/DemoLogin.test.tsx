// src/pages/DemoLogin.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DemoLogin from "./DemoLogin";
import { TestWrapper } from "../test/mocks";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

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
    user: null,
  }),
}));

vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    reservations: [],
    loading: false,
  }),
}));

describe("DemoLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("アプリタイトルを表示する", () => {
    render(<DemoLogin />, { wrapper: TestWrapper });
    expect(screen.getByText("Kakuho")).toBeInTheDocument();
  });

  it("体験モードの説明を表示する", () => {
    render(<DemoLogin />, { wrapper: TestWrapper });
    expect(screen.getByText("体験モード")).toBeInTheDocument();
  });

  it("管理者ログインボタンを表示する", () => {
    render(<DemoLogin />, { wrapper: TestWrapper });
    expect(screen.getByRole("button", { name: "管理者" })).toBeInTheDocument();
  });

  it("一般ユーザーログインボタンを表示する", () => {
    render(<DemoLogin />, { wrapper: TestWrapper });
    expect(
      screen.getByRole("button", { name: "一般ユーザー" })
    ).toBeInTheDocument();
  });

  it("通常ログイン画面へのリンクを表示する", () => {
    render(<DemoLogin />, { wrapper: TestWrapper });
    expect(screen.getByText("通常のログイン画面へ")).toBeInTheDocument();
  });

  it("管理者ボタンクリックで login が呼ばれる", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<DemoLogin />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button", { name: "管理者" }));
    expect(mockLogin).toHaveBeenCalledWith(
      "admin@example.com",
      "adminpassword"
    );
  });

  it("一般ユーザーボタンクリックで login が呼ばれる", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<DemoLogin />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button", { name: "一般ユーザー" }));
    expect(mockLogin).toHaveBeenCalledWith(
      "sample@example.com",
      "userpassword"
    );
  });
});
