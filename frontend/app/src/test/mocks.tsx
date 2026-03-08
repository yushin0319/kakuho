// src/test/mocks.tsx
// テスト用のモックデータとプロバイダー

import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { ReservationDetail } from '../context/AppData';
import type { SnackContextType } from '../context/SnackContext';
import { SnackContext } from '../context/SnackContext';
import type { EventResponse, UserResponse } from '../services/interfaces';

// モックユーザーデータ
export const mockUser: UserResponse = {
  id: 1,
  email: 'test@example.com',
  nickname: 'テストユーザー',
  is_admin: false,
};

export const mockAdminUser: UserResponse = {
  id: 2,
  email: 'admin@example.com',
  nickname: '管理者',
  is_admin: true,
};

// モックイベントデータ
export const mockEvent: EventResponse = {
  id: 1,
  name: 'テストイベント',
  description: 'テストイベントの説明',
};

// モック予約データ
export const mockReservations: ReservationDetail[] = [];

// テスト用テーマ
const testTheme = createTheme();

// 基本的なラッパー（Router + Theme）
export const TestWrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
  </BrowserRouter>
);

// SnackContextを注入できるTestWrapper（vi.mock不要）
export const createTestWrapper = (
  snackOverrides?: Partial<SnackContextType>,
) => {
  const snackValue: SnackContextType = {
    snack: null,
    setSnack: vi.fn(),
    ...snackOverrides,
  };
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <ThemeProvider theme={testTheme}>
        <SnackContext.Provider value={snackValue}>
          {children}
        </SnackContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

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
