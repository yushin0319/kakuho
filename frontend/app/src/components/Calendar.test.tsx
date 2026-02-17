// src/components/Calendar.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calendar from "./Calendar";
import { TestWrapper } from "../test/mocks";
import { EventResponse } from "../services/interfaces";

// ReservationCreater のモック
vi.mock("./ReservationCreater", () => ({
  default: ({
    event,
    stage,
    onClose,
  }: {
    event: EventResponse;
    stage: { id: number };
    onClose: () => void;
  }) => (
    <div data-testid="reservation-creater">
      <span>{event.name}</span>
      <span>stage-{stage.id}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

const mockStages = [
  {
    id: 1,
    event_id: 1,
    start_time: "2026-03-15T10:00:00",
    end_time: "2026-03-15T12:00:00",
  },
  {
    id: 2,
    event_id: 1,
    start_time: "2026-03-15T14:00:00",
    end_time: "2026-03-15T16:00:00",
  },
  {
    id: 3,
    event_id: 2,
    start_time: "2026-03-20T10:00:00",
    end_time: "2026-03-20T12:00:00",
  },
];

const mockSeatGroups = [
  { id: 1, stage_id: 1, capacity: 50 },
  { id: 2, stage_id: 2, capacity: 0 }, // 完売
];

vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    stages: mockStages,
    seatGroups: mockSeatGroups,
    events: [],
    reservations: [],
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

const mockEvent: EventResponse = {
  id: 1,
  name: "テストイベント",
  description: "テストの説明",
};

describe("Calendar", () => {
  const defaultProps = {
    event: mockEvent,
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("イベント名を表示する", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("テストイベント")).toBeInTheDocument();
  });

  it("曜日ヘッダーを表示する", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });
    ["月", "火", "水", "木", "金", "土", "日"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("イベント一覧に戻るボタンを表示する", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("イベント一覧に戻る")).toBeInTheDocument();
  });

  it("戻るボタンクリック時にonBackが呼ばれる", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<Calendar {...defaultProps} onBack={onBack} />, {
      wrapper: TestWrapper,
    });

    await user.click(screen.getByText("イベント一覧に戻る"));
    expect(onBack).toHaveBeenCalled();
  });

  it("前月・翌月ボタンを表示する", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("前月")).toBeInTheDocument();
    expect(screen.getByText("翌月")).toBeInTheDocument();
  });

  it("ステージが同一月のみの場合、前月ボタンが無効化される", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });

    // 初期表示は2026年3月（ステージの最も早い日付）
    expect(screen.getByText("2026年3月")).toBeInTheDocument();

    // 全ステージが3月のため、前月ボタンは無効
    expect(screen.getByText("前月").closest("button")).toBeDisabled();
  });

  it("ステージが同一月のみの場合、翌月ボタンが無効化される", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });

    // 全ステージが3月のため、翌月ボタンは無効
    expect(screen.getByText("翌月").closest("button")).toBeDisabled();
  });

  it("完売ステージは完売と表示される", () => {
    render(<Calendar {...defaultProps} />, { wrapper: TestWrapper });
    // stage_id 2 は capacity 0 なので完売
    const soldOutButtons = screen.getAllByText(/完売/);
    expect(soldOutButtons.length).toBeGreaterThan(0);
  });
});
