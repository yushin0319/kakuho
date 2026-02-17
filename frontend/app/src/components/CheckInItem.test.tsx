// src/components/CheckInItem.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckInItem from "./CheckInItem";
import { TestWrapper } from "../test/mocks";
import { ReservationDetail } from "../context/AppData";

vi.mock("./ReservationChanger", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="reservation-changer">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("./ReservationDeleter", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="reservation-deleter">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("./PaidStatusController", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="paid-status-controller">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

const mockData: ReservationDetail = {
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
};

describe("CheckInItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザーのニックネームを表示する", () => {
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
  });

  it("チケットタイプと枚数を表示する", () => {
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    expect(screen.getByText(/一般 × 2枚/)).toBeInTheDocument();
  });

  it("合計金額を表示する", () => {
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    expect(screen.getByText("2,000円")).toBeInTheDocument();
  });

  it("設定メニューを開くと変更・削除メニューが表示される", async () => {
    const user = userEvent.setup();
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    const menuButton = screen.getByRole("button");
    await user.click(menuButton);
    expect(screen.getByText("変更")).toBeInTheDocument();
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("メニューから「変更」をクリックすると ReservationChanger が表示される", async () => {
    const user = userEvent.setup();
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("変更"));
    expect(screen.getByTestId("reservation-changer")).toBeInTheDocument();
  });

  it("メニューから「削除」をクリックすると ReservationDeleter が表示される", async () => {
    const user = userEvent.setup();
    render(<CheckInItem data={mockData} />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("削除"));
    expect(screen.getByTestId("reservation-deleter")).toBeInTheDocument();
  });

  it("ニックネームが空の場合はメールアドレスを表示する", () => {
    const dataWithoutNickname: ReservationDetail = {
      ...mockData,
      user: { ...mockData.user, nickname: undefined },
    };
    render(<CheckInItem data={dataWithoutNickname} />, { wrapper: TestWrapper });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
