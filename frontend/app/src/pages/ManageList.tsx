// app/src/pages/ManageList.tsx
import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api/event";
import { fetchEventStages } from "../services/api/stage";
import { fetchStageSeatGroups } from "../services/api/seatGroup";
import {
  EventResponse,
  StageResponse,
  SeatGroupResponse,
} from "../services/interfaces";
import { getDate, getHour } from "../services/utils";
import ManageItem from "../components/ManageItem";
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

  const loadEventsData = async () => {
    try {
      const eventsData = await fetchEvents();
      setEvents(eventsData);

      const stageData: { [key: number]: StageResponse[] } = {};
      const seatGroupData: { [key: number]: SeatGroupResponse[] } = {};

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

  const toggleEventOpen = (eventId: number) => {
    setOpenEventIds((prev) => {
      const isOpen = prev.includes(eventId);
      if (isOpen) {
        // 親イベントが閉じるときに、関連するステージもすべて閉じる
        setOpenStageIds([]);
        setOpenSeatGroupIds([]);
      }
      return isOpen ? prev.filter((id) => id !== eventId) : [...prev, eventId];
    });
  };

  const toggleStageOpen = (stageId: number) => {
    setOpenStageIds((prev) => {
      const isOpen = prev.includes(stageId);
      if (isOpen) {
        // ステージが閉じるときに、関連するシートグループもすべて閉じる
        setOpenSeatGroupIds([]);
      }
      return isOpen ? prev.filter((id) => id !== stageId) : [...prev, stageId];
    });
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
          <div
            className={`stages ${
              openEventIds.includes(event.id) ? "open" : ""
            }`}
          >
            {stages[event.id]?.map((stage) => (
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
                  {getDate(new Date(stage.start_time))}{" "}
                  {getHour(new Date(stage.start_time))}
                </div>
                <div
                  className={`seat-groups ${
                    openStageIds.includes(stage.id) ? "open" : ""
                  }`}
                >
                  {seatGroups[stage.id]?.map((seatGroup) => {
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
                        <div
                          className={`reservations ${
                            openSeatGroupIds.includes(seatGroup.id)
                              ? "open"
                              : ""
                          }`}
                        >
                          {reservations
                            .filter(
                              (data) => data.seatGroup.id === seatGroup.id
                            )
                            .map((data) => (
                              <ManageItem
                                data={data}
                                key={data.reservation.id}
                              />
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManageList;
