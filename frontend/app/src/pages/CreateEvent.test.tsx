// src/pages/CreateEvent.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateEvent from "./CreateEvent";
import { TestWrapper } from "../test/mocks";

// 子コンポーネントのモック
vi.mock("../components/ValidatedForm", () => ({
  default: ({
    name,
    label,
  }: {
    name: string;
    label: string;
    fieldType?: string;
    sx?: object;
  }) => (
    <div data-testid={`validated-form-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} />
    </div>
  ),
}));

vi.mock("../components/ValidatedDatePicker", () => ({
  default: ({
    name,
    label,
  }: {
    name: string;
    label: string;
    minDate?: Date;
    maxDate?: Date;
  }) => (
    <div data-testid={`date-picker-${name}`}>
      <span>{label}</span>
    </div>
  ),
}));

vi.mock("../components/ValidatedTimePicker", () => ({
  default: ({
    name,
    label,
  }: {
    name: string;
    label: string;
    date?: string;
    addSchedule?: (date: string, time: Date) => void;
  }) => (
    <div data-testid={`time-picker-${name}`}>
      <span>{label}</span>
    </div>
  ),
}));

vi.mock("../components/CreateSeatGroup", () => ({
  default: ({
    id,
    onDelete,
  }: {
    id: number;
    seatGroup: object;
    ticketTypes: object[];
    onUpdate: (sg: object, tt: object[]) => void;
    onDelete: () => void;
  }) => (
    <div data-testid={`seat-group-${id}`}>
      <span>座席グループ {id}</span>
      <button onClick={onDelete}>削除 {id}</button>
    </div>
  ),
}));

vi.mock("../components/ConfirmEvent", () => ({
  default: ({
    open,
    onClose,
  }: {
    title: string;
    description: string;
    schedule: object;
    seatDict: object;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onClose}>閉じる</button>
      </div>
    ) : null,
}));

describe("CreateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新規イベント作成フォームの基本要素を表示する", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(screen.getByText("新規イベント作成")).toBeInTheDocument();
    expect(screen.getByTestId("validated-form-title")).toBeInTheDocument();
    expect(screen.getByTestId("validated-form-description")).toBeInTheDocument();
    expect(screen.getByText("イベント名")).toBeInTheDocument();
    expect(screen.getByText("詳細")).toBeInTheDocument();
  });

  it("イベント日程入力セクションを表示する", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(screen.getByText("イベント日程入力")).toBeInTheDocument();
    expect(screen.getByTestId("date-picker-startDate")).toBeInTheDocument();
    expect(screen.getByTestId("date-picker-endDate")).toBeInTheDocument();
    expect(screen.getByText("開始日")).toBeInTheDocument();
    expect(screen.getByText("終了日")).toBeInTheDocument();
  });

  it("チケット情報入力セクションを表示する", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(screen.getByText("チケット情報入力")).toBeInTheDocument();
  });

  it("デフォルトで1つの座席グループが表示される", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(screen.getByTestId("seat-group-0")).toBeInTheDocument();
  });

  it("座席グループ追加ボタンが表示される", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(
      screen.getByText("特別席追加（座席数独立）")
    ).toBeInTheDocument();
  });

  it("座席グループを追加できる", async () => {
    const user = userEvent.setup();

    render(<CreateEvent />, { wrapper: TestWrapper });

    await user.click(screen.getByText("特別席追加（座席数独立）"));

    expect(screen.getByTestId("seat-group-0")).toBeInTheDocument();
    expect(screen.getByTestId("seat-group-1")).toBeInTheDocument();
  });

  it("座席グループを削除できる", async () => {
    const user = userEvent.setup();

    render(<CreateEvent />, { wrapper: TestWrapper });

    // まず追加
    await user.click(screen.getByText("特別席追加（座席数独立）"));
    expect(screen.getByTestId("seat-group-1")).toBeInTheDocument();

    // 追加した方を削除
    await user.click(screen.getByText("削除 1"));
    expect(screen.queryByTestId("seat-group-1")).not.toBeInTheDocument();
  });

  it("確認ボタンを表示する", () => {
    render(<CreateEvent />, { wrapper: TestWrapper });

    expect(
      screen.getByRole("button", { name: "確認" })
    ).toBeInTheDocument();
  });

  it("確認ボタンクリックで確認ダイアログが表示される", async () => {
    const user = userEvent.setup();

    render(<CreateEvent />, { wrapper: TestWrapper });

    await user.click(screen.getByRole("button", { name: "確認" }));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
  });

  it("確認ダイアログを閉じることができる", async () => {
    const user = userEvent.setup();

    render(<CreateEvent />, { wrapper: TestWrapper });

    await user.click(screen.getByRole("button", { name: "確認" }));
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    await user.click(screen.getByText("閉じる"));
    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });
});
