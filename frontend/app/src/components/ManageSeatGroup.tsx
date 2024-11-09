// app/src/components/ManageSeatGroup.tsx
import { useState, useEffect } from "react";
import { SeatGroupResponse } from "../services/interfaces";
import { fetchSeatGroupTicketTypes } from "../services/api/ticketType";
import ManageItem from "./ManageItem";
import { useReservationContext } from "../context/ReservationContext";

interface ManageSeatGroupProps {
  seatGroup: SeatGroupResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageSeatGroup = ({
  seatGroup,
  isOpen,
  toggle,
}: ManageSeatGroupProps) => {
  const [seatGroupName, setSeatGroupName] = useState<string>("");
  const [numOfReservations, setNumOfReservations] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const { reservations } = useReservationContext();

  useEffect(() => {
    const loadSeatGroupName = async () => {
      try {
        const ticketTypes = await fetchSeatGroupTicketTypes(seatGroup.id);
        setSeatGroupName(ticketTypes.map((type) => type.type_name).join("・"));
      } catch (error) {
        console.error("Failed to load seat group name:", error);
      }
    };

    const countReservations = () => {
      const count = reservations
        .filter((data) => data.seatGroup.id === seatGroup.id)
        .reduce((acc, data) => acc + data.reservation.num_attendees, 0);
      setNumOfReservations(count);
    };

    loadSeatGroupName();
    countReservations();
  }, [seatGroup.id, reservations]);

  useEffect(() => {
    setRate(
      Math.round(
        (numOfReservations / (seatGroup.capacity + numOfReservations)) * 100
      )
    );
  }, [numOfReservations, seatGroup.capacity]);

  return (
    <div>
      <div key={seatGroup.id} className="seat-group">
        <div className="seat-group-header" onClick={toggle}>
          {isOpen ? "−" : "+"} {seatGroupName} {numOfReservations}/
          {numOfReservations + seatGroup.capacity}席
          <div className="seat-bar">
            <div
              className="seat-bar-fill"
              style={{ width: `${rate}%`, transition: "width 0.3s ease" }}
            ></div>
          </div>
        </div>
        <div className={`reservations ${isOpen ? "open" : ""}`}>
          {reservations
            .filter((data) => data.seatGroup.id === seatGroup.id)
            .map((data) => (
              <ManageItem data={data} key={data.reservation.id} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSeatGroup;
