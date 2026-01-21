// src/components/Header.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";
import { TestWrapper, mockUser, mockAdminUser } from "../test/mocks";

// Context のモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../context/SnackContext", () => ({
  useSnack: () => ({ snack: null, setSnack: vi.fn() }),
}));

const mockAuthValue = {
  isAuthenticated: true,
  user: mockUser,
  loading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    reservations: [],
    events: [],
    stages: [],
    seatGroups: [],
    ticketTypes: [],
    users: [],
    loading: false,
    error: null,
    reloadData: vi.fn(),
    eventStartDates: {},
    eventEndDates: {},
    futureEvents: [],
    pastEvents: [],
    seatGroupNames: {},
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("一般ユーザーとして", () => {
    beforeEach(() => {
      mockAuthValue.user = mockUser;
    });

    it("ユーザー名を表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    it("予約するリンクを表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("予約する")).toBeInTheDocument();
    });

    it("マイチケットリンクを表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("マイチケット")).toBeInTheDocument();
    });

    it("管理者メニューを表示しない", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.queryByText("予約一覧")).not.toBeInTheDocument();
      expect(screen.queryByText("イベント管理")).not.toBeInTheDocument();
    });
  });

  describe("管理者として", () => {
    beforeEach(() => {
      mockAuthValue.user = mockAdminUser;
    });

    it("管理者名を表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("管理者")).toBeInTheDocument();
    });

    it("予約一覧リンクを表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("予約一覧")).toBeInTheDocument();
    });

    it("ユーザ一覧リンクを表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("ユーザ一覧")).toBeInTheDocument();
    });

    it("イベント管理リンクを表示する", () => {
      render(<Header />, { wrapper: TestWrapper });
      expect(screen.getByText("イベント管理")).toBeInTheDocument();
    });
  });
});
