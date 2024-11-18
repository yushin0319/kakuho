// app/src/components/EditSeatGroup.tsx
import { useState, useEffect } from "react";
import { Button, TextField, Grid2 as Grid } from "@mui/material";
import { seatProps } from "./CreateEvent";
import { TicketTypeCreate } from "../services/interfaces";
import EditTicketType from "./EditTicketType";

interface EditSeatGroupProps {
  seatGroup: seatProps;
  onUpdate: (seatGroup: seatProps) => void;
  onDelete: () => void;
}

const EditSeatGroup = ({
  seatGroup,
  onUpdate,
  onDelete,
}: EditSeatGroupProps) => {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeCreate[]>(
    seatGroup.ticketTypes
  );

  useEffect(() => {
    onUpdate({ ...seatGroup, ticketTypes });
  }, [ticketTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onUpdate({
      ...seatGroup,
      seatGroup: {
        ...seatGroup.seatGroup,
        capacity: newValue,
      },
    });
  };
  const handleAddTicketType = () => {
    setTicketTypes((prev) => [...prev, { type_name: "", price: 0 }]);
  };
  const handleUpdateTicketType = (index: number, ticket: TicketTypeCreate) => {
    setTicketTypes((prev) => prev.map((t, i) => (i === index ? ticket : t)));
  };
  const handleDeleteTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <TextField
          label="座席数"
          value={seatGroup.seatGroup.capacity || 0}
          onChange={handleChange}
          type="number"
        />
      </Grid>
      <Button variant="contained" color="secondary" onClick={onDelete}>
        座席削除
      </Button>
      <Grid size={6}>
        {ticketTypes.map((ticket, index) => (
          <div key={index}>
            <EditTicketType
              ticket={ticket}
              onUpdate={(newTicket) => handleUpdateTicketType(index, newTicket)}
              onDelete={() => handleDeleteTicketType(index)}
            />
          </div>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTicketType}
        >
          チケット追加
        </Button>
      </Grid>
    </Grid>
  );
};

export default EditSeatGroup;
