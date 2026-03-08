// src/context/AppData.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AppDataProvider, useAppData } from "./AppData";
import { mockAdminUser, mockUser } from "../test/mocks";

// API モック
const mockFetchEvents = vi.fn();
const mockFetchStages = vi.fn();
const mockFetchSeatGroups = vi.fn();
const mockFetchTicketTypes = vi.fn();
const mockFetchReservations = vi.fn();
const mockFetchUserReservations = vi.fn();
const mockFetchUsers = vi.fn();

vi.mock("../services/api/event", () => ({
  fetchEvents: () => mockFetchEvents(),
}));
vi.mock("../services/api/stage", () => ({
  fetchStages: () => mockFetchStages(),
}));
vi.mock("../services/api/seatGroup", () => ({
  fetchSeatGroups: () => mockFetchSeatGroups(),
}));
vi.mock("../services/api/ticketType", () => ({
  fetchTicketTypes: () => mockFetchTicketTypes(),
}));
vi.mock("../services/api/reservation", () => ({
  fetchReservations: () => mockFetchReservations(),
  fetchUserReservations: (_id: number) => mockFetchUserReservations(_id),
}));
vi.mock("../services/api/user", () => ({
  fetchUsers: () => mockFetchUsers(),
}));

// AuthContext モック（デフォルト: 管理者ユーザー）
let mockAuthUser: typeof mockAdminUser | null = mockAdminUser;
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

// テスト用コンシューマー
const TestConsumer = () => {
  const {
    eventStartDates,
    eventEndDates,
    seatGroupNames,
    loading,
    error,
    events,
  } = useAppData();

  return (
    <div>
      <div data-testid="loading">{loading ? "true" : "false"}</div>
      <div data-testid="error">{error ?? "null"}</div>
      <div data-testid="events">{events.length}</div>
      <div data-testid="start-dates">{JSON.stringify(eventStartDates)}</div>
      <div data-testid="end-dates">{JSON.stringify(eventEndDates)}</div>
      <div data-testid="seat-group-names">{JSON.stringify(seatGroupNames)}</div>
    </div>
  );
};

const renderProvider = () =>
  render(
    <AppDataProvider>
      <TestConsumer />
    </AppDataProvider>
  );

const waitForLoaded = () =>
  waitFor(() => {
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

// 最小限のデフォルトデータ（各テストで上書き可）
const defaultData = () => {
  mockFetchEvents.mockResolvedValue([]);
  mockFetchStages.mockResolvedValue([]);
  mockFetchSeatGroups.mockResolvedValue([]);
  mockFetchTicketTypes.mockResolvedValue([]);
  mockFetchReservations.mockResolvedValue([]);
  mockFetchUsers.mockResolvedValue([mockAdminUser]);
};

describe("AppDataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = mockAdminUser;
    defaultData();
  });

  describe("eventStartDates / eventEndDates（stagesByEvent Map）", () => {
    it("イベントに紐づくステージの最小 start_time と最大 end_time を設定する", async () => {
      mockFetchEvents.mockResolvedValue([{ id: 1, name: "E1", description: "" }]);
      mockFetchStages.mockResolvedValue([
        { id: 1, event_id: 1, start_time: "2025-06-01T10:00:00", end_time: "2025-06-01T12:00:00" },
        { id: 2, event_id: 1, start_time: "2025-06-01T14:00:00", end_time: "2025-06-01T16:00:00" },
      ]);

      renderProvider();
      await waitForLoaded();

      const startDates = JSON.parse(screen.getByTestId("start-dates").textContent!);
      const endDates = JSON.parse(screen.getByTestId("end-dates").textContent!);

      // 最古の start_time = 10:00
      expect(new Date(startDates["1"]).getHours()).toBe(10);
      // 最新の end_time = 16:00
      expect(new Date(endDates["1"]).getHours()).toBe(16);
    });

    it("複数イベントのステージが互いに混入しない", async () => {
      mockFetchEvents.mockResolvedValue([
        { id: 1, name: "E1", description: "" },
        { id: 2, name: "E2", description: "" },
      ]);
      mockFetchStages.mockResolvedValue([
        { id: 1, event_id: 1, start_time: "2025-06-01T10:00:00", end_time: "2025-06-01T12:00:00" },
        { id: 2, event_id: 2, start_time: "2025-07-01T09:00:00", end_time: "2025-07-01T11:00:00" },
      ]);

      renderProvider();
      await waitForLoaded();

      const startDates = JSON.parse(screen.getByTestId("start-dates").textContent!);

      // イベント1: 6月
      expect(new Date(startDates["1"]).getMonth()).toBe(5); // 0-indexed
      // イベント2: 7月
      expect(new Date(startDates["2"]).getMonth()).toBe(6);
    });
  });

  describe("seatGroupNames（ticketTypesBySeatGroup Map）", () => {
    it("SeatGroup に紐づく TicketType の type_name をソートして設定する", async () => {
      mockFetchSeatGroups.mockResolvedValue([{ id: 1, stage_id: 1, capacity: 10 }]);
      mockFetchTicketTypes.mockResolvedValue([
        { id: 1, seat_group_id: 1, type_name: "VIP", price: 5000 },
        { id: 2, seat_group_id: 1, type_name: "一般", price: 1000 },
      ]);

      renderProvider();
      await waitForLoaded();

      const names = JSON.parse(screen.getByTestId("seat-group-names").textContent!);
      // ソート済みであること（"VIP" < "一般" の辞書順）
      expect(names["1"]).toEqual(["VIP", "一般"].sort());
    });

    it("TicketType がない SeatGroup は空配列になる", async () => {
      mockFetchSeatGroups.mockResolvedValue([{ id: 99, stage_id: 1, capacity: 5 }]);
      mockFetchTicketTypes.mockResolvedValue([]);

      renderProvider();
      await waitForLoaded();

      const names = JSON.parse(screen.getByTestId("seat-group-names").textContent!);
      expect(names["99"]).toEqual([]);
    });

    it("異なる SeatGroup の TicketType が混入しない", async () => {
      mockFetchSeatGroups.mockResolvedValue([
        { id: 1, stage_id: 1, capacity: 10 },
        { id: 2, stage_id: 1, capacity: 10 },
      ]);
      mockFetchTicketTypes.mockResolvedValue([
        { id: 1, seat_group_id: 1, type_name: "A席", price: 3000 },
        { id: 2, seat_group_id: 2, type_name: "B席", price: 2000 },
      ]);

      renderProvider();
      await waitForLoaded();

      const names = JSON.parse(screen.getByTestId("seat-group-names").textContent!);
      expect(names["1"]).toEqual(["A席"]);
      expect(names["2"]).toEqual(["B席"]);
    });
  });

  describe("ユーザー状態", () => {
    it("user が null の場合は API を呼ばずデータが空のまま", async () => {
      mockAuthUser = null;

      renderProvider();

      // loading が false になるのを待つ（API未呼び出しなので即座）
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(mockFetchEvents).not.toHaveBeenCalled();
      expect(screen.getByTestId("events")).toHaveTextContent("0");
    });
  });

  describe("エラーハンドリング", () => {
    it("API が失敗した場合に error が設定される", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetchEvents.mockRejectedValue(new Error("Network error"));

      renderProvider();
      await waitForLoaded();

      expect(screen.getByTestId("error")).toHaveTextContent("データの取得に失敗しました");
      consoleSpy.mockRestore();
    });
  });
});
