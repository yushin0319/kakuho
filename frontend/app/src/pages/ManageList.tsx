// app/src/components/ManageList.tsx
import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api/event";
import { fetchEventStages } from "../services/api/stage";
import { fetchStageSeatGroups } from "../services/api/seatGroup";
import {
  EventResponse,
  StageResponse,
  SeatGroupResponse,
} from "../services/interfaces";
import { useReservationContext } from "../context/ReservationContext";
import "../assets/styles/ManageList.scss";

const ManageList = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [stages, setStages] = useState<{ [key: number]: StageResponse[] }>({});
  const [seatGroups, setSeatGroups] = useState<{
    [key: number]: SeatGroupResponse[];
  }>({});
  const [openEventIds, setOpenEventIds] = useState<number[]>([]);
  const [openStageIds, setOpenStageIds] = useState<number[]>([]);
  const [openSeatGroupIds, setOpenSeatGroupIds] = useState<number[]>([]);

  const { reservations, isLoading } = useReservationContext();

  // イベント、ステージ、シートグループのデータをロードする
  const loadEventsData = async () => {
    try {
      const eventsData = await fetchEvents();
      setEvents(eventsData);

      const stageData: { [key: number]: StageResponse[] } = {};
      const seatGroupData: { [key: number]: SeatGroupResponse[] } = {};

      // 各イベントごとにステージとシートグループを取得
      for (const event of eventsData) {
        const stages = await fetchEventStages(event.id);
        stageData[event.id] = stages;

        for (const stage of stages) {
          const seatGroups = await fetchStageSeatGroups(stage.id);
          seatGroupData[stage.id] = seatGroups;
        }
      }

      setStages(stageData);
      setSeatGroups(seatGroupData);
    } catch (error) {
      console.error("Failed to load events data:", error);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  // 開閉制御の関数
  const toggleEventOpen = (eventId: number) => {
    setOpenEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleStageOpen = (stageId: number) => {
    setOpenStageIds((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const toggleSeatGroupOpen = (seatGroupId: number) => {
    setOpenSeatGroupIds((prev) =>
      prev.includes(seatGroupId)
        ? prev.filter((id) => id !== seatGroupId)
        : [...prev, seatGroupId]
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="manage-list">
      {events.map((event) => (
        <div
          key={event.id}
          className={`event ${openEventIds.includes(event.id) ? "open" : ""}`}
        >
          <div
            className="event-header"
            onClick={() => toggleEventOpen(event.id)}
          >
            {openEventIds.includes(event.id) ? "−" : "+"} {event.name}
          </div>
          {openEventIds.includes(event.id) &&
            stages[event.id]?.map((stage) => (
              <div
                key={stage.id}
                className={`stage ${
                  openStageIds.includes(stage.id) ? "open" : ""
                }`}
              >
                <div
                  className="stage-header"
                  onClick={() => toggleStageOpen(stage.id)}
                >
                  {openStageIds.includes(stage.id) ? "−" : "+"}{" "}
                  {new Date(stage.start_time).toLocaleString()}
                </div>
                {openStageIds.includes(stage.id) &&
                  seatGroups[stage.id]?.map((seatGroup) => {
                    const ticketTypeNames = reservations
                      .filter((res) => res.seatGroup.id === seatGroup.id)
                      .map((res) => res.ticketType.type_name)
                      .filter(
                        (value, index, self) => self.indexOf(value) === index
                      )
                      .join("・");
                    return (
                      <div
                        key={seatGroup.id}
                        className={`seat-group ${
                          openSeatGroupIds.includes(seatGroup.id) ? "open" : ""
                        }`}
                      >
                        <div
                          className="seat-group-header"
                          onClick={() => toggleSeatGroupOpen(seatGroup.id)}
                        >
                          {openSeatGroupIds.includes(seatGroup.id) ? "−" : "+"}{" "}
                          {ticketTypeNames} 残{seatGroup.capacity}席
                        </div>
                        {openSeatGroupIds.includes(seatGroup.id) && (
                          <div
                            className={`reservations ${
                              openSeatGroupIds.includes(seatGroup.id)
                                ? "open"
                                : ""
                            }`}
                          >
                            {reservations
                              .filter(
                                (reservation) =>
                                  reservation.seatGroup.id === seatGroup.id
                              )
                              .map((reservation) => (
                                <div
                                  key={reservation.reservation.id}
                                  className="reservation"
                                >
                                  {reservation.user.nickname ||
                                    reservation.user.email}{" "}
                                  - {reservation.reservation.num_attendees}人
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ManageList;
