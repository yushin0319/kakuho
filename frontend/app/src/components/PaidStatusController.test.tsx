// src/components/PaidStatusController.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaidStatusController from "./PaidStatusController";
import { updateReservation } from "../services/api/reservation";
import { createTestWrapper } from "../test/mocks";

const mockReloadData = vi.fn();
vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    reloadData: mockReloadData,
    reservations: [
      {
        reservation: { id: 1, num_attendees: 2, user_id: 1, ticket_type_id: 1, is_paid: false, created_at: "2024-01-01T00:00:00" },
        event: { id: 1, name: "テストイベント", description: "説明" },
        stage: { id: 1, event_id: 1, start_time: "2024-06-01T14:00:00", end_time: "2024-06-01T16:00:00" },
        seatGroup: { id: 1, stage_id: 1, capacity: 10 },
        ticketType: { id: 1, seat_group_id: 1, type_name: "一般", price: 1000 },
        user: { id: 1, email: "test@example.com", nickname: "テストユーザー", is_admin: false },
      },
    ],
  }),
}));

vi.mock("../services/api/reservation", () => ({
  updateReservation: vi.fn().mockResolvedValue({}),
}));

vi.mock("./ReservationSummary", () => ({
  default: () => <div data-testid="reservation-summary">予約サマリー</div>,
}));

const mockSetSnack = vi.fn();

describe("PaidStatusController", () => {
  const onClose = vi.fn();
  let wrapper: ReturnType<typeof createTestWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createTestWrapper({ setSnack: mockSetSnack });
  });

  it("受付ダイアログを表示する", () => {
    render(
      <PaidStatusController reservationId={1} onClose={onClose} />,
      { wrapper }
    );
    expect(screen.getByText("下記の予約を受付いたします")).toBeInTheDocument();
  });

  it("予約が見つからない場合に「予約が見つかりません」を表示する", () => {
    render(
      <PaidStatusController reservationId={999} onClose={onClose} />,
      { wrapper }
    );
    expect(screen.getByText("予約が見つかりません")).toBeInTheDocument();
  });

  it("更新成功時に onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <PaidStatusController reservationId={1} onClose={onClose} />,
      { wrapper }
    );
    await user.click(screen.getByRole("button", { name: "受付完了" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("更新失敗時に onClose が呼ばれない", async () => {
    vi.mocked(updateReservation).mockRejectedValueOnce(new Error("update failed"));
    const user = userEvent.setup();
    render(
      <PaidStatusController reservationId={1} onClose={onClose} />,
      { wrapper }
    );
    await user.click(screen.getByRole("button", { name: "受付完了" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("更新失敗時にエラーSnackbarを表示する", async () => {
    vi.mocked(updateReservation).mockRejectedValueOnce(new Error("update failed"));
    const user = userEvent.setup();
    render(
      <PaidStatusController reservationId={1} onClose={onClose} />,
      { wrapper }
    );
    await user.click(screen.getByRole("button", { name: "受付完了" }));
    expect(mockSetSnack).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" })
    );
  });
});
