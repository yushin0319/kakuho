// src/components/SeatGroupSelector.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SeatGroupSelector from "./SeatGroupSelector";
import { TestWrapper } from "../test/mocks";

const mockSeatDict = {
  pattern1: [
    {
      seatGroup: { id: 1, stage_id: 1, capacity: 50 },
      ticketTypes: [
        { id: 1, seat_group_id: 1, type_name: "一般", price: 3000 },
        { id: 2, seat_group_id: 1, type_name: "学生", price: 1500 },
      ],
    },
  ],
  pattern2: [
    {
      seatGroup: { id: 2, stage_id: 1, capacity: 30 },
      ticketTypes: [
        { id: 3, seat_group_id: 2, type_name: "VIP", price: 8000 },
      ],
    },
  ],
};

describe("SeatGroupSelector", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    seatDict: mockSeatDict,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ダイアログタイトルを表示する", () => {
    render(<SeatGroupSelector {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("チケット情報選択")).toBeInTheDocument();
  });

  it("パターン番号を表示する", () => {
    render(<SeatGroupSelector {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText("パターン 1")).toBeInTheDocument();
    expect(screen.getByText("パターン 2")).toBeInTheDocument();
  });

  it("チケット種別と価格を表示する", () => {
    render(<SeatGroupSelector {...defaultProps} />, { wrapper: TestWrapper });
    expect(
      screen.getByText("一般 (3000円), 学生 (1500円)")
    ).toBeInTheDocument();
    expect(screen.getByText("VIP (8000円)")).toBeInTheDocument();
  });

  it("選択ボタンをクリックするとonSelectが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SeatGroupSelector {...defaultProps} onSelect={onSelect} />,
      { wrapper: TestWrapper }
    );

    const selectButtons = screen.getAllByText("選択");
    await user.click(selectButtons[0]);
    expect(onSelect).toHaveBeenCalledWith("pattern1");
  });

  it("2番目の選択ボタンクリックで正しいキーが渡される", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SeatGroupSelector {...defaultProps} onSelect={onSelect} />,
      { wrapper: TestWrapper }
    );

    const selectButtons = screen.getAllByText("選択");
    await user.click(selectButtons[1]);
    expect(onSelect).toHaveBeenCalledWith("pattern2");
  });

  it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SeatGroupSelector {...defaultProps} onClose={onClose} />,
      { wrapper: TestWrapper }
    );

    await user.click(screen.getByText("キャンセル"));
    expect(onClose).toHaveBeenCalled();
  });

  it("open=falseの場合ダイアログが表示されない", () => {
    render(
      <SeatGroupSelector {...defaultProps} open={false} />,
      { wrapper: TestWrapper }
    );
    expect(screen.queryByText("チケット情報選択")).not.toBeInTheDocument();
  });

  it("空のseatDictではパターンが表示されない", () => {
    render(
      <SeatGroupSelector {...defaultProps} seatDict={{}} />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByText("チケット情報選択")).toBeInTheDocument();
    expect(screen.queryByText(/パターン/)).not.toBeInTheDocument();
  });
});
