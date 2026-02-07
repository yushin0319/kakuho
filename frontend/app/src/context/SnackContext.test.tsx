// src/context/SnackContext.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackProvider, useSnack } from "./SnackContext";

// テスト用コンポーネント
const TestConsumer = () => {
  const { snack, setSnack } = useSnack();

  return (
    <div>
      <button
        onClick={() => setSnack({ message: "成功しました", severity: "success" })}
      >
        成功通知
      </button>
      <button
        onClick={() => setSnack({ message: "エラー発生", severity: "error" })}
      >
        エラー通知
      </button>
      <button onClick={() => setSnack(null)}>通知クリア</button>
      <div data-testid="snack-state">
        {snack ? `${snack.severity}: ${snack.message}` : "none"}
      </div>
    </div>
  );
};

describe("SnackContext", () => {
  it("useSnackがSnackProvider外で使われた場合エラーをスローする", () => {
    // コンソールエラーを抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useSnack must be used within a SnackProvider"
    );

    consoleSpy.mockRestore();
  });

  it("初期状態ではsnackがnullである", () => {
    render(
      <SnackProvider>
        <TestConsumer />
      </SnackProvider>
    );

    expect(screen.getByTestId("snack-state")).toHaveTextContent("none");
  });

  it("setSnackでスナックバーが表示される", async () => {
    const user = userEvent.setup();

    render(
      <SnackProvider>
        <TestConsumer />
      </SnackProvider>
    );

    await user.click(screen.getByText("成功通知"));

    await waitFor(() => {
      expect(screen.getByText("成功しました")).toBeInTheDocument();
    });
  });

  it("エラー通知が表示される", async () => {
    const user = userEvent.setup();

    render(
      <SnackProvider>
        <TestConsumer />
      </SnackProvider>
    );

    await user.click(screen.getByText("エラー通知"));

    await waitFor(() => {
      expect(screen.getByText("エラー発生")).toBeInTheDocument();
    });
  });

  it("setSnack(null)でスナックバーが非表示になる", async () => {
    const user = userEvent.setup();

    render(
      <SnackProvider>
        <TestConsumer />
      </SnackProvider>
    );

    // 表示してからクリア
    await user.click(screen.getByText("成功通知"));
    await waitFor(() => {
      expect(screen.getByText("成功しました")).toBeInTheDocument();
    });

    await user.click(screen.getByText("通知クリア"));
    await waitFor(() => {
      expect(screen.getByTestId("snack-state")).toHaveTextContent("none");
    });
  });

  it("snackのseverityが正しく設定される", async () => {
    const user = userEvent.setup();

    render(
      <SnackProvider>
        <TestConsumer />
      </SnackProvider>
    );

    await user.click(screen.getByText("エラー通知"));

    await waitFor(() => {
      expect(screen.getByTestId("snack-state")).toHaveTextContent(
        "error: エラー発生"
      );
    });
  });
});
