import api from "./api";
import { handleApiRequest } from "./utils";
import {
  EventCreate,
  EventUpdate,
  EventResponse,
  EventTimeResponse,
} from "../interfaces";

// 1. イベント一覧を取得
export const fetchEvents = async (): Promise<EventResponse[]> => {
  return handleApiRequest(api.get("/events"));
};

// 2. 単一のイベントを取得
export const fetchEvent = async (id: number): Promise<EventResponse> => {
  return handleApiRequest(api.get(`/events/${id}`));
};

// 3. イベントの開始・終了時間を取得
export const fetchEventTime = async (
  id: number
): Promise<EventTimeResponse> => {
  return handleApiRequest(api.get(`/events/${id}/duration`));
};

// 4. イベントを作成（管理者のみ）
export const createEvent = async (
  data: EventCreate
): Promise<EventResponse> => {
  return handleApiRequest(api.post("/events", data));
};

// 5. イベントを更新（管理者のみ）
export const updateEvent = async (
  id: number,
  data: EventUpdate
): Promise<EventResponse> => {
  return handleApiRequest(api.put(`/events/${id}`, data));
};

// 6. イベントを削除（管理者のみ）
export const deleteEvent = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/events/${id}`));
};
