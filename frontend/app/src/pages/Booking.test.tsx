// src/pages/Booking.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Booking from "./Booking";
import { TestWrapper, mockEvent } from "../test/mocks";
import { EventResponse } from "../services/interfaces";

// AppData モック
const mockAppData = {
  futureEvents: [] as EventResponse[],
  eventStartDates: {} as Record<number, Date>,
  eventEndDates: {} as Record<number, Date>,
  loading: false,
  error: null as string | null,
  events: [],
  pastEvents: [],
  stages: [],
  seatGroups: [],
  seatGroupNames: {},
  ticketTypes: [],
  users: [],
  reservations: [],
  reloadData: vi.fn(),
};

vi.mock("../context/AppData", () => ({
  useAppData: () => mockAppData,
}));

// Calendar コンポーネントモック
vi.mock("../components/Calendar", () => ({
  default: ({
    event,
    onBack,
  }: {
    event: EventResponse;
    onBack: () => void;
  }) => (
    <div data-testid="calendar">
      <span>{event.name}</span>
      <button onClick={onBack}>戻る</button>
    </div>
  ),
}));

// LoadingScreen モック
vi.mock("../components/LoadingScreen", () => ({
  default: () => <div data-testid="loading-screen">Loading...</div>,
}));

describe("Booking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの状態にリセット
    mockAppData.futureEvents = [];
    mockAppData.eventStartDates = {};
    mockAppData.eventEndDates = {};
    mockAppData.loading = false;
    mockAppData.error = null;
  });

  it("イベント選択案内テキストを表示する", () => {
    render(<Booking />, { wrapper: TestWrapper });

    expect(
      screen.getByText("ご予約するイベントをお選びください")
    ).toBeInTheDocument();
  });

  it("ローディング中にLoadingScreenを表示する", () => {
    mockAppData.loading = true;

    render(<Booking />, { wrapper: TestWrapper });

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockAppData.error = "データ取得失敗";

    render(<Booking />, { wrapper: TestWrapper });

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  it("未来のイベント一覧を表示する", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    mockAppData.futureEvents = [
      { id: 1, name: "テストイベント1", description: "説明1" },
      { id: 2, name: "テストイベント2", description: "説明2" },
    ];
    mockAppData.eventEndDates = {
      1: futureDate,
      2: futureDate,
    };
    mockAppData.eventStartDates = {
      1: new Date(),
      2: new Date(),
    };

    render(<Booking />, { wrapper: TestWrapper });

    expect(screen.getByText("テストイベント1")).toBeInTheDocument();
    expect(screen.getByText("テストイベント2")).toBeInTheDocument();
    expect(screen.getByText("説明1")).toBeInTheDocument();
    expect(screen.getByText("説明2")).toBeInTheDocument();
  });

  it("終了日が過ぎたイベントは表示しない", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    mockAppData.futureEvents = [
      { id: 1, name: "終了イベント", description: "過去" },
      { id: 2, name: "開催中イベント", description: "未来" },
    ];
    mockAppData.eventEndDates = {
      1: pastDate,
      2: futureDate,
    };
    mockAppData.eventStartDates = {
      1: new Date(),
      2: new Date(),
    };

    render(<Booking />, { wrapper: TestWrapper });

    expect(screen.queryByText("終了イベント")).not.toBeInTheDocument();
    expect(screen.getByText("開催中イベント")).toBeInTheDocument();
  });

  it("イベントクリックでCalendarが表示される", async () => {
    const user = userEvent.setup();
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    mockAppData.futureEvents = [
      { id: 1, name: "テストイベント", description: "説明" },
    ];
    mockAppData.eventEndDates = { 1: futureDate };
    mockAppData.eventStartDates = { 1: new Date() };

    render(<Booking />, { wrapper: TestWrapper });

    await user.click(screen.getByText("テストイベント"));

    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    expect(
      screen.queryByText("ご予約するイベントをお選びください")
    ).not.toBeInTheDocument();
  });

  it("Calendar の戻るボタンでイベント一覧に戻る", async () => {
    const user = userEvent.setup();
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    mockAppData.futureEvents = [
      { id: 1, name: "テストイベント", description: "説明" },
    ];
    mockAppData.eventEndDates = { 1: futureDate };
    mockAppData.eventStartDates = { 1: new Date() };

    render(<Booking />, { wrapper: TestWrapper });

    // イベントをクリック -> Calendar表示
    await user.click(screen.getByText("テストイベント"));
    expect(screen.getByTestId("calendar")).toBeInTheDocument();

    // 戻るボタン -> イベント一覧に戻る
    await user.click(screen.getByText("戻る"));
    expect(screen.queryByTestId("calendar")).not.toBeInTheDocument();
    expect(
      screen.getByText("ご予約するイベントをお選びください")
    ).toBeInTheDocument();
  });
});
