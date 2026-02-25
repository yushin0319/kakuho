// src/test/fixtures.ts
// テスト用の共通フィクスチャデータ

export const mockStages = [
  {
    id: 1,
    event_id: 1,
    start_time: "2026-03-15T10:00:00",
    end_time: "2026-03-15T12:00:00",
  },
  {
    id: 2,
    event_id: 1,
    start_time: "2026-03-15T14:00:00",
    end_time: "2026-03-15T16:00:00",
  },
  {
    id: 3,
    event_id: 2,
    start_time: "2026-03-20T10:00:00",
    end_time: "2026-03-20T12:00:00",
  },
];

export const mockSeatGroups = [
  { id: 1, stage_id: 1, capacity: 50 },
  { id: 2, stage_id: 2, capacity: 0 }, // 完売
];
