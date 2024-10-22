import api from "./api";
import { handleApiRequest } from "./utils";
import {
  TicketTypeCreate,
  TicketTypeUpdate,
  TicketTypeResponse,
} from "../interfaces";

// 1. 単一のチケットタイプを取得
export const fetchTicketType = async (
  id: number
): Promise<TicketTypeResponse> => {
  return handleApiRequest(api.get(`/ticket_types/${id}`));
};

// 2. Stageに紐づくチケットタイプ一覧を取得
export const fetchStageTicketTypes = async (
  stageId: number
): Promise<TicketTypeResponse[]> => {
  return handleApiRequest(api.get(`/stages/${stageId}/ticket_types`));
};

// 3. チケットタイプを作成（管理者のみ）
export const createTicketType = async (
  stage_id: number,
  data: TicketTypeCreate
): Promise<TicketTypeResponse> => {
  return handleApiRequest(api.post(`/stages/${stage_id}/ticket_types`, data));
};

// 4. チケットタイプを更新（管理者のみ）
export const updateTicketType = async (
  id: number,
  data: TicketTypeUpdate
): Promise<TicketTypeResponse> => {
  return handleApiRequest(api.put(`/ticket_types/${id}`, data));
};

// 5. チケットタイプを削除（管理者のみ）
export const deleteTicketType = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/ticket_types/${id}`));
};
