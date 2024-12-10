import { StageCreate, StageResponse, StageUpdate } from "../interfaces";
import api from "./api";
import { handleApiRequest } from "./utils";

// 1. すべてのステージを取得
export const fetchStages = async (): Promise<StageResponse[]> => {
  return handleApiRequest(api.get("/stages"));
};

// 2. 単一のステージを取得
export const fetchStage = async (id: number): Promise<StageResponse> => {
  return handleApiRequest(api.get(`/stages/${id}`));
};

// 3. イベントに紐づくステージ一覧を取得
export const fetchEventStages = async (
  eventId: number
): Promise<StageResponse[]> => {
  return handleApiRequest(api.get(`/events/${eventId}/stages`));
};

// 4. ステージを作成（管理者のみ）
export const createStage = async (
  event_id: number,
  data: StageCreate
): Promise<StageResponse> => {
  return handleApiRequest(api.post(`/events/${event_id}/stages`, data));
};

// 5. ステージを更新（管理者のみ）
export const updateStage = async (
  id: number,
  data: StageUpdate
): Promise<StageResponse> => {
  return handleApiRequest(api.put(`/stages/${id}`, data));
};

// 6. ステージを削除（管理者のみ）
export const deleteStage = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/stages/${id}`));
};
