import {
  TicketTypeCreate,
  TicketTypeResponse,
  TicketTypeUpdate,
} from "../interfaces";
import api from "./api";
import { handleApiRequest } from "./utils";

// 1. すべてのチケットタイプを取得
export const fetchTicketTypes = async (): Promise<TicketTypeResponse[]> => {
  return handleApiRequest(api.get("/ticket_types"));
};

// 2. 単一のチケットタイプを取得
export const fetchTicketType = async (
  id: number
): Promise<TicketTypeResponse> => {
  return handleApiRequest(api.get(`/ticket_types/${id}`));
};

// 3. SeatGroupに紐づくチケットタイプ一覧を取得
export const fetchSeatGroupTicketTypes = async (
  seat_group_id: number
): Promise<TicketTypeResponse[]> => {
  return handleApiRequest(
    api.get(`/seat_groups/${seat_group_id}/ticket_types`)
  );
};

// 4. チケットタイプを作成（管理者のみ）
export const createTicketType = async (
  seat_group_id: number,
  data: TicketTypeCreate
): Promise<TicketTypeResponse> => {
  return handleApiRequest(
    api.post(`/seat_groups/${seat_group_id}/ticket_types`, data)
  );
};

// 5. チケットタイプを更新（管理者のみ）
export const updateTicketType = async (
  id: number,
  data: TicketTypeUpdate
): Promise<TicketTypeResponse> => {
  return handleApiRequest(api.put(`/ticket_types/${id}`, data));
};

// 6. チケットタイプを削除（管理者のみ）
export const deleteTicketType = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/ticket_types/${id}`));
};
