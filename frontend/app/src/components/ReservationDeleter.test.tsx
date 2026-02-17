// src/components/ReservationDeleter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationDeleter from "./ReservationDeleter";
import { deleteReservation } from "../services/api/reservation";
import { TestWrapper } from "../test/mocks";

// vi.mock はホイストされるため、ファクトリ内で直接 vi.fn() を定義する
vi.mock("../context/AppData", () => ({
  useAppData: () => ({ reloadData: vi.fn() }),
}));

vi.mock("../services/api/reservation", () => ({
  deleteReservation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./ReservationSummary", () => ({
  default: () => <div data-testid="reservation-summary">予約サマリー</div>,
}));

const mockDetail = {
  reservation: {
    id: 1,
    num_attendees: 2,
    user_id: 1,
    ticket_type_id: 1,
    is_paid: false,
    created_at: "2024-01-01T00:00:00",
  },
  event: { id: 1, name: "テストイベント", description: "説明" },
  stage: {
    id: 1,
    event_id: 1,
    start_time: "2024-06-01T14:00:00",
    end_time: "2024-06-01T16:00:00",
  },
  seatGroup: { id: 1, stage_id: 1, capacity: 10 },
  ticketType: { id: 1, seat_group_id: 1, type_name: "一般", price: 1000 },
  user: {
    id: 1,
    email: "test@example.com",
    nickname: "テストユーザー",
    is_admin: false,
  },
} as const;

describe("ReservationDeleter", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("削除確認ダイアログを表示する", () => {
    render(
      <ReservationDeleter reservationDetail={mockDetail as never} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByText("下記の予約を削除しますか？")).toBeInTheDocument();
    expect(screen.getByText("この操作は取り消せません。")).toBeInTheDocument();
  });

  it("予約サマリーを表示する", () => {
    render(
      <ReservationDeleter reservationDetail={mockDetail as never} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByTestId("reservation-summary")).toBeInTheDocument();
  });

  it("削除ボタンとキャンセルボタンを表示する", () => {
    render(
      <ReservationDeleter reservationDetail={mockDetail as never} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("キャンセルボタンで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <ReservationDeleter reservationDetail={mockDetail as never} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("削除ボタンクリックで deleteReservation が正しい ID で呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <ReservationDeleter reservationDetail={mockDetail as never} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(vi.mocked(deleteReservation)).toHaveBeenCalledWith(1);
  });
});
