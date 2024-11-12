//Event関連の型定義

interface EventBase {
  name: string;
  description: string;
}

export interface EventCreate extends EventBase {}

export interface EventUpdate {
  name?: string; // Noneを許可するためにoptionalにする
  description?: string;
}

export interface EventResponse extends EventBase {
  id: number;
}

export interface EventTimeResponse {
  start_time: string;
  end_time: string;
}

//Stage関連の型定義

interface StageBase {
  start_time: string; // datetime型はstringとして扱う
  end_time: string;
}

export interface StageCreate extends StageBase {}

export interface StageUpdate {
  start_time?: string;
  end_time?: string;
}

export interface StageResponse extends StageBase {
  id: number;
  event_id: number;
}

//SeatGroup関連の型定義

interface SeatGroupBase {
  capacity: number;
}

export interface SeatGroupCreate extends SeatGroupBase {}

export interface SeatGroupUpdate {
  capacity?: number;
}

export interface SeatGroupResponse extends SeatGroupBase {
  id: number;
  stage_id: number;
}

//TicketType関連の型定義

interface TicketTypeBase {
  type_name: string;
  price: number;
}

export interface TicketTypeCreate extends TicketTypeBase {}

export interface TicketTypeUpdate {
  type_name?: string;
  price?: number;
}

export interface TicketTypeResponse extends TicketTypeBase {
  id: number;
  seat_group_id: number;
}

//Reservation関連の型定義

interface ReservationBase {
  num_attendees: number;
  user_id: number;
}

export interface ReservationCreate extends ReservationBase {}

export interface ReservationUpdate {
  num_attendees?: number;
  is_paid?: boolean;
  user_id: number;
}

export interface ReservationResponse extends ReservationBase {
  id: number;
  created_at: string; // datetimeはstringで扱う
  user_id: number;
  ticket_type_id: number;
  is_paid: boolean;
}

//User関連の型定義

interface UserBase {
  email: string; // EmailStrもstringとして扱う
  nickname?: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  nickname?: string;
}

export interface UserResponse extends UserBase {
  id: number;
  is_admin: boolean;
}
