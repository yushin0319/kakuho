// src/pages/ReservationList.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationList from "./ReservationList";
import { TestWrapper } from "../test/mocks";
import { ReservationDetail } from "../context/AppData";

// AppData モック
const mockAppData = {
  reservations: [] as ReservationDetail[],
  loading: false,
  error: null as string | null,
  events: [],
  eventStartDates: {},
  eventEndDates: {},
  futureEvents: [],
  pastEvents: [],
  stages: [],
  seatGroups: [],
  seatGroupNames: {},
  ticketTypes: [],
  users: [],
  reloadData: vi.fn(),
};

vi.mock("../context/AppData", () => ({
  useAppData: () => mockAppData,
}));

// NewItemContext モック
const mockNewItemContext = {
  newItems: [] as number[],
  addNewItem: vi.fn(),
  clearNewItems: vi.fn(),
};

vi.mock("../context/NewItemContext", () => ({
  useNewItemContext: () => mockNewItemContext,
}));

// LoadingScreen モック
vi.mock("../components/LoadingScreen", () => ({
  default: () => <div data-testid="loading-screen">Loading...</div>,
}));

// ReservationCard モック
vi.mock("../components/ReservationCard", () => ({
  default: ({
    reservationDetail,
    isExpanded,
    isNew,
    onCardClick,
  }: {
    reservationDetail: ReservationDetail;
    isExpanded: boolean;
    isNew: boolean;
    onCardClick: () => void;
  }) => (
    <div
      data-testid={`reservation-card-${reservationDetail.reservation.id}`}
      onClick={onCardClick}
    >
      <span>{reservationDetail.event.name}</span>
      {isExpanded && <span data-testid="expanded">展開中</span>}
      {isNew && <span data-testid="new-badge">新規</span>}
    </div>
  ),
}));

// 未来・過去の日時ヘルパー
const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const createMockReservation = (
  id: number,
  eventName: string,
  startTime: string
): ReservationDetail => ({
  reservation: {
    id,
    num_attendees: 1,
    user_id: 1,
    created_at: "2026-01-01T00:00:00",
    ticket_type_id: 1,
    is_paid: false,
  },
  event: { id: 1, name: eventName, description: "説明" },
  stage: { id: 1, event_id: 1, start_time: startTime, end_time: startTime },
  seatGroup: { id: 1, stage_id: 1, capacity: 100 },
  ticketType: { id: 1, seat_group_id: 1, type_name: "一般", price: 1000 },
  user: {
    id: 1,
    email: "test@example.com",
    nickname: "テスト",
    is_admin: false,
  },
});

describe("ReservationList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppData.reservations = [];
    mockAppData.loading = false;
    mockAppData.error = null;
    mockNewItemContext.newItems = [];
  });

  it("予約がない場合に空メッセージを表示する", () => {
    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByText("予約がありません")).toBeInTheDocument();
  });

  it("予約がある場合にQRコード案内を表示する", () => {
    mockAppData.reservations = [
      createMockReservation(1, "テストイベント", futureDate),
    ];

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(
      screen.getByText("タップするとQRコードが表示されます")
    ).toBeInTheDocument();
  });

  it("ローディング中にLoadingScreenを表示する", () => {
    mockAppData.loading = true;

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージを表示する", () => {
    mockAppData.error = "データ取得失敗";

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByText(/Error: データ取得失敗/)).toBeInTheDocument();
  });

  it("未来の予約を表示する", () => {
    mockAppData.reservations = [
      createMockReservation(1, "未来のイベント", futureDate),
    ];

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByText("未来のイベント")).toBeInTheDocument();
  });

  it("過去のイベントセクションが表示される", () => {
    mockAppData.reservations = [
      createMockReservation(1, "過去のイベント1", pastDate),
    ];

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByText("過去のイベント")).toBeInTheDocument();
  });

  it("カードクリックで展開状態が切り替わる", async () => {
    const user = userEvent.setup();
    mockAppData.reservations = [
      createMockReservation(1, "テストイベント", futureDate),
    ];

    render(<ReservationList />, { wrapper: TestWrapper });

    // クリックして展開
    await user.click(screen.getByTestId("reservation-card-1"));
    expect(screen.getByTestId("expanded")).toBeInTheDocument();

    // 再クリックで閉じる
    await user.click(screen.getByTestId("reservation-card-1"));
    expect(screen.queryByTestId("expanded")).not.toBeInTheDocument();
  });

  it("新規予約にはnewバッジが表示される", () => {
    mockAppData.reservations = [
      createMockReservation(1, "新規予約", futureDate),
    ];
    mockNewItemContext.newItems = [1];

    render(<ReservationList />, { wrapper: TestWrapper });

    expect(screen.getByTestId("new-badge")).toBeInTheDocument();
  });
});
