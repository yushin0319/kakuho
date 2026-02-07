// src/components/Layout.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Layout from "./Layout";

// Header のモック
vi.mock("./Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

const testTheme = createTheme();

const renderWithRouter = (pathname: string) => {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <ThemeProvider theme={testTheme}>
        <Layout>
          <div data-testid="child-content">コンテンツ</div>
        </Layout>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("Layout", () => {
  it("子要素を表示する", () => {
    renderWithRouter("/booking");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ")).toBeInTheDocument();
  });

  it("通常ページでHeaderを表示する", () => {
    renderWithRouter("/booking");
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("/loginページではHeaderを非表示にする", () => {
    renderWithRouter("/login");
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("/registerページではHeaderを非表示にする", () => {
    renderWithRouter("/register");
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("ルートパス(/)ではHeaderを非表示にする", () => {
    renderWithRouter("/");
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("/my-reservationsページではHeaderを表示する", () => {
    renderWithRouter("/my-reservations");
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("/manage-eventページではHeaderを表示する", () => {
    renderWithRouter("/manage-event");
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });
});
