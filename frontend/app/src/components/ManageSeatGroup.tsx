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
  const [numOfReservations, setNumOfReservations] = useState<[number, number]>([
    0, 0,
  ]);
  const [rate, setRate] = useState<[number, number]>([0, 0]);
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
    loadSeatGroupName();
  }, [seatGroup.id]);

  useEffect(() => {
    const countReservations = () => {
      const count = reservations
        .filter((data) => data.seatGroup.id === seatGroup.id)
        .reduce((acc, data) => acc + data.reservation.num_attendees, 0);
      const countPaid = reservations
        .filter((data) => data.seatGroup.id === seatGroup.id)
        .reduce(
          (acc, data) =>
            acc +
            Number(data.reservation.is_paid) * data.reservation.num_attendees,
          0
        );
      const rate = Math.round((count / (count + seatGroup.capacity)) * 100);
      const ratePaid = Math.round(
        (countPaid / (count + seatGroup.capacity)) * 100
      );
      setNumOfReservations([count, countPaid]);
      setRate([rate, ratePaid]);
    };

    countReservations();
  }, [seatGroup.id, reservations]);

  return (
    <div>
      <div key={seatGroup.id} className="seat-group">
        <div className="seat-group-header" onClick={toggle}>
          {isOpen ? "−" : "+"} {seatGroupName} {numOfReservations[0]}/
          {seatGroup.capacity + numOfReservations[0]}席
          <div className="seat-bar">
            <div
              className="seat-bar-fill"
              style={{ width: `${rate[0]}%`, transition: "width 0.3s ease" }}
            ></div>
            <div
              className="seat-bar-fill-paid"
              style={{ width: `${rate[1]}%`, transition: "width 0.3s ease" }}
            ></div>
          </div>
        </div>
        <div className={`reservations ${isOpen ? "open" : ""}`}>
          {reservations
            .filter((data) => data.seatGroup.id === seatGroup.id)
            .sort((a, b) => {
              const nameA = a.user.nickname || a.user.email;
              const nameB = b.user.nickname || b.user.email;
              return nameA.localeCompare(nameB); // 文字列のアルファベット順にソート
            })
            .sort(
              (a, b) =>
                Number(a.reservation.is_paid) - Number(b.reservation.is_paid)
            ) // is_paidでソート
            .map((data) => (
              <ManageItem data={data} key={data.reservation.id} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSeatGroup;
