import api from "./api";
import { handleApiRequest } from "./utils";
import {
  SeatGroupCreate,
  SeatGroupUpdate,
  SeatGroupResponse,
  TicketTypeResponse,
} from "../interfaces";

// 1. 単一の座席グループを取得
export const fetchSeatGroup = async (
  id: number
): Promise<SeatGroupResponse> => {
  return handleApiRequest(api.get(`/seat_groups/${id}`));
};

// 2. Stageに紐づく座席グループ一覧を取得
export const fetchStageSeatGroups = async (
  stage_id: number
): Promise<SeatGroupResponse[]> => {
  return handleApiRequest(api.get(`/stages/${stage_id}/seat_groups`));
};

// 3. 座席グループを作成（管理者のみ）
export const createSeatGroup = async (
  stage_id: number,
  data: SeatGroupCreate
): Promise<SeatGroupResponse> => {
  return handleApiRequest(api.post(`/stages/${stage_id}/seat_groups`, data));
};

// 4. 座席グループを更新（管理者のみ）
export const updateSeatGroup = async (
  id: number,
  data: SeatGroupUpdate
): Promise<SeatGroupResponse> => {
  return handleApiRequest(api.put(`/seat_groups/${id}`, data));
};

// 5. 座席グループを削除（管理者のみ）
export const deleteSeatGroup = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/seat_groups/${id}`));
};

// 6. 座席グループの座席数を確認（ticket_type_idを受け取って、座席数を返す）
export const getCapacity = async (ticket_type_id: number): Promise<number> => {
  const ticketType = await handleApiRequest<TicketTypeResponse>(
    api.get(`/ticket_types/${ticket_type_id}`)
  );
  const seatGroup = await handleApiRequest<SeatGroupResponse>(
    api.get(`/seat_groups/${ticketType.seat_group_id}`)
  );
  return seatGroup.capacity;
};
