// src/components/ReservationCreater.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationCreater from "./ReservationCreater";
import { TestWrapper, mockUser, mockEvent } from "../test/mocks";

// vi.mock はホイストされるため、ファクトリ内で直接 vi.fn() を定義する
vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    seatGroups: [{ id: 1, stage_id: 1, capacity: 10 }],
    ticketTypes: [{ id: 1, seat_group_id: 1, type_name: "一般", price: 1000 }],
    loading: false,
    reloadData: vi.fn(),
  }),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock("../context/SnackContext", () => ({
  useSnack: () => ({ setSnack: vi.fn() }),
}));

vi.mock("../context/NewItemContext", () => ({
  useNewItemContext: () => ({ addNewItem: vi.fn() }),
}));

vi.mock("../services/api/reservation", () => ({
  createReservation: vi.fn().mockResolvedValue({ id: 99 }),
}));

vi.mock("./ReservationSummary", () => ({
  default: () => (
    <div data-testid="reservation-summary">予約サマリー</div>
  ),
}));

const mockStage = {
  id: 1,
  event_id: 1,
  start_time: "2024-06-01T14:00:00",
  end_time: "2024-06-01T16:00:00",
};

describe("ReservationCreater", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("フォームフェーズのダイアログタイトルを表示する", () => {
    render(
      <ReservationCreater event={mockEvent} stage={mockStage} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByText("券種と人数を選択して下さい")).toBeInTheDocument();
  });

  it("予約ボタンとキャンセルボタンを表示する", () => {
    render(
      <ReservationCreater event={mockEvent} stage={mockStage} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByRole("button", { name: "予約" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("キャンセルボタンで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <ReservationCreater event={mockEvent} stage={mockStage} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("予約ボタンをクリックすると確認フェーズに遷移する", async () => {
    const user = userEvent.setup();
    render(
      <ReservationCreater event={mockEvent} stage={mockStage} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    await user.click(screen.getByRole("button", { name: "予約" }));
    expect(screen.getByText("予約してよろしいですか？")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確定" })).toBeInTheDocument();
  });

  it("確認フェーズでキャンセルするとフォームフェーズに戻る", async () => {
    const user = userEvent.setup();
    render(
      <ReservationCreater event={mockEvent} stage={mockStage} onClose={onClose} />,
      { wrapper: TestWrapper }
    );
    await user.click(screen.getByRole("button", { name: "予約" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.getByText("券種と人数を選択して下さい")).toBeInTheDocument();
  });
});
