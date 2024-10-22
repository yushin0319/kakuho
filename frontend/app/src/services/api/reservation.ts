import api from "./api";
import { handleApiRequest } from "./utils";
import {
  ReservationCreate,
  ReservationUpdate,
  ReservationResponse,
} from "../interfaces";

// 1. 単一の予約を取得
export const fetchReservation = async (
  id: number
): Promise<ReservationResponse> => {
  return handleApiRequest(api.get(`/reservations/${id}`));
};

// 2. 予約一覧を取得
export const fetchReservations = async (): Promise<ReservationResponse[]> => {
  return handleApiRequest(api.get("/reservations"));
};

// 3. Userに紐づく予約一覧を取得
export const fetchUserReservations = async (
  user_id: number
): Promise<ReservationResponse[]> => {
  return handleApiRequest(api.get(`/users/${user_id}/reservations`));
};

// 4. TicketTypeに紐づく予約一覧を取得
export const fetchTicketTypeReservations = async (
  ticketTypeId: number
): Promise<ReservationResponse[]> => {
  return handleApiRequest(
    api.get(`/ticket_types/${ticketTypeId}/reservations`)
  );
};

// 5. 予約を作成
export const createReservation = async (
  ticket_type_id: number,
  data: ReservationCreate
): Promise<ReservationResponse> => {
  return handleApiRequest(
    api.post(`/ticket_types/${ticket_type_id}/reservations`, data)
  );
};

// 6. 予約を更新
export const updateReservation = async (
  id: number,
  data: ReservationUpdate
): Promise<ReservationResponse> => {
  return handleApiRequest(api.put(`/reservations/${id}`, data));
};

// 7. 予約を削除
export const deleteReservation = async (id: number): Promise<void> => {
  return handleApiRequest(api.delete(`/reservations/${id}`));
};
