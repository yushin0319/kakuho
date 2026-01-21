// src/components/LoadingScreen.test.tsx
import { render, screen } from "@testing-library/react";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen", () => {
  it("読み込み中のテキストを表示する", () => {
    render(<LoadingScreen />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("CircularProgressが表示される", () => {
    render(<LoadingScreen />);
    // Backdropはaria-hidden="true"を使用するため、hidden: trueオプションが必要
    expect(screen.getByRole("progressbar", { hidden: true })).toBeInTheDocument();
  });
});
