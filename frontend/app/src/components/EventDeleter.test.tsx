// src/components/EventDeleter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDeleter from "./EventDeleter";
import { deleteEvent } from "../services/api/event";
import { TestWrapper, mockEvent } from "../test/mocks";

vi.mock("../context/AppData", () => ({
  useAppData: () => ({
    stages: [],
    seatGroups: [],
    ticketTypes: [],
    reservations: [],
    reloadData: vi.fn(),
  }),
}));

vi.mock("../context/SnackContext", () => ({
  useSnack: () => ({ setSnack: vi.fn() }),
}));

vi.mock("../services/api/event", () => ({
  deleteEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/api/seatGroup", () => ({
  deleteSeatGroup: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/api/stage", () => ({
  deleteStage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/api/ticketType", () => ({
  deleteTicketType: vi.fn().mockResolvedValue(undefined),
}));

describe("EventDeleter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("イベント削除の見出しを表示する", () => {
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    expect(screen.getByText("イベントの削除")).toBeInTheDocument();
  });

  it("削除ボタンを表示する", () => {
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("予約がない場合は削除ボタンが有効", () => {
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    expect(deleteButton).not.toBeDisabled();
  });

  it("削除ボタンクリックで確認ダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(screen.getByText("イベントを削除しますか？")).toBeInTheDocument();
  });

  it("確認ダイアログのキャンセルで「削除する」ボタンが非表示になる", async () => {
    const user = userEvent.setup();
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button", { name: "削除" }));
    // ダイアログが開いていることを確認
    expect(screen.getByText("イベントを削除しますか？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    // MUI Dialog: 閉じた後も DOM に残るが非表示になる
    expect(
      screen.queryByText("イベントを削除しますか？")
    ).not.toBeVisible();
  });

  it("確認ダイアログの「削除する」で deleteEvent が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<EventDeleter event={mockEvent} />, { wrapper: TestWrapper });
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));
    expect(vi.mocked(deleteEvent)).toHaveBeenCalledWith(mockEvent.id);
  });
});
