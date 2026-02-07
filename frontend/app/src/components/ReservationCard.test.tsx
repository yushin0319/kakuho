// src/components/ReservationCard.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationCard from "./ReservationCard";
import { TestWrapper } from "../test/mocks";
import { ReservationDetail } from "../context/AppData";

// 子コンポーネントのモック
vi.mock("./ReservationChanger", () => ({
  default: () => <div data-testid="reservation-changer" />,
}));

vi.mock("./ReservationDeleter", () => ({
  default: () => <div data-testid="reservation-deleter" />,
}));

// QRCodeSVGのモック
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code">{value}</div>
  ),
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

// toJSTは文字列に"Z"を付加するため、末尾にZを含まない形式で指定する
const futureDate = "2030-06-15T10:00:00";
const pastDate = "2020-01-01T10:00:00";

const createMockReservationDetail = (
  overrides: Partial<{
    startTime: string;
    isPaid: boolean;
  }> = {}
): ReservationDetail => ({
  reservation: {
    id: 1,
    num_attendees: 2,
    user_id: 1,
    created_at: "2026-01-01T00:00:00",
    ticket_type_id: 1,
    is_paid: overrides.isPaid ?? false,
  },
  event: {
    id: 1,
    name: "テストイベント",
    description: "テストイベントの説明",
  },
  stage: {
    id: 1,
    event_id: 1,
    start_time: overrides.startTime ?? futureDate,
    end_time: overrides.startTime ?? futureDate,
  },
  seatGroup: {
    id: 1,
    stage_id: 1,
    capacity: 100,
  },
  ticketType: {
    id: 1,
    seat_group_id: 1,
    type_name: "一般チケット",
    price: 3000,
  },
  user: {
    id: 1,
    email: "test@example.com",
    nickname: "テストユーザー",
    is_admin: false,
  },
});

describe("ReservationCard", () => {
  const defaultProps = {
    reservationDetail: createMockReservationDetail(),
    isExpanded: false,
    isNew: false,
    onCardClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("イベント名を表示する", () => {
    render(<ReservationCard {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("テストイベント")).toBeInTheDocument();
  });

  it("カードクリック時にonCardClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCardClick = vi.fn();
    render(
      <ReservationCard {...defaultProps} onCardClick={onCardClick} />,
      { wrapper: TestWrapper }
    );

    await user.click(screen.getByText("テストイベント"));
    expect(onCardClick).toHaveBeenCalled();
  });

  describe("展開状態", () => {
    it("展開時にチケットタイプ名を表示する", () => {
      render(
        <ReservationCard {...defaultProps} isExpanded />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText("一般チケット")).toBeInTheDocument();
    });

    it("展開時に枚数を表示する", () => {
      render(
        <ReservationCard {...defaultProps} isExpanded />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText(/3,000 × 2枚/)).toBeInTheDocument();
    });

    it("展開時にQRコードを表示する", () => {
      render(
        <ReservationCard {...defaultProps} isExpanded />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByTestId("qr-code")).toHaveTextContent("Kakuho-1");
    });

    it("展開時に合計金額を表示する", () => {
      render(
        <ReservationCard {...defaultProps} isExpanded />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText("6,000円")).toBeInTheDocument();
    });

    it("未来のステージで未支払いの場合、変更・削除ボタンが有効", () => {
      render(
        <ReservationCard {...defaultProps} isExpanded />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText("変更")).not.toBeDisabled();
      expect(screen.getByText("削除")).not.toBeDisabled();
    });

    it("過去のステージの場合、変更・削除ボタンが無効", () => {
      const pastDetail = createMockReservationDetail({ startTime: pastDate });
      render(
        <ReservationCard
          {...defaultProps}
          reservationDetail={pastDetail}
          isExpanded
        />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText("変更").closest("button")).toBeDisabled();
      expect(screen.getByText("削除").closest("button")).toBeDisabled();
    });

    it("支払い済みの場合、変更・削除ボタンが無効", () => {
      const paidDetail = createMockReservationDetail({ isPaid: true });
      render(
        <ReservationCard
          {...defaultProps}
          reservationDetail={paidDetail}
          isExpanded
        />,
        { wrapper: TestWrapper }
      );
      expect(screen.getByText("変更").closest("button")).toBeDisabled();
      expect(screen.getByText("削除").closest("button")).toBeDisabled();
    });
  });

  describe("非展開状態", () => {
    it("チケット詳細は非表示", () => {
      render(<ReservationCard {...defaultProps} />, { wrapper: TestWrapper });
      expect(screen.queryByText("一般チケット")).not.toBeVisible();
    });
  });
});
