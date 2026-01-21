// src/test/mocks.tsx
// テスト用のモックデータとプロバイダー
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { UserResponse, ReservationDetail, EventResponse } from "../services/interfaces";

// モックユーザーデータ
export const mockUser: UserResponse = {
  id: 1,
  email: "test@example.com",
  nickname: "テストユーザー",
  is_admin: false,
};

export const mockAdminUser: UserResponse = {
  id: 2,
  email: "admin@example.com",
  nickname: "管理者",
  is_admin: true,
};

// モックイベントデータ
export const mockEvent: EventResponse = {
  id: 1,
  name: "テストイベント",
  description: "テストイベントの説明",
};

// モック予約データ
export const mockReservations: ReservationDetail[] = [];

// テスト用テーマ
const testTheme = createTheme();

// 基本的なラッパー（Router + Theme）
export const TestWrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider theme={testTheme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

// モックのSnackContext
export const mockSnackContext = {
  snack: null,
  setSnack: vi.fn(),
};

// モックのAuthContext（デフォルト: 未ログイン）
export const createMockAuthContext = (overrides = {}) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
  ...overrides,
});

// モックのAppDataContext
export const createMockAppDataContext = (overrides = {}) => ({
  events: [],
  eventStartDates: {},
  eventEndDates: {},
  futureEvents: [],
  pastEvents: [],
  stages: [],
  seatGroups: [],
  seatGroupNames: {},
  ticketTypes: [],
  users: [],
  reservations: [],
  loading: false,
  error: null,
  reloadData: vi.fn(),
  ...overrides,
});
