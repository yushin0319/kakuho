// app/src/components/EditSeatGroup.tsx
import { useState } from "react";
import {
  Button,
  TextField,
  Grid2 as Grid,
  Card,
  IconButton,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
  const [inputValue, setInputValue] = useState<string>(
    seatGroup.seatGroup.capacity.toString()
  );

  const handleChangeNumOfSeats = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setInputValue(value);
    if (!isNaN(parseInt(value))) {
      const newSeatGroup = { ...seatGroup };
      newSeatGroup.seatGroup.capacity = parseInt(value);
      onUpdate(newSeatGroup);
    }
  };

  const handleAddTicketType = () => {
    const newTicketType: TicketTypeCreate = { type_name: "", price: 0 };
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes.push(newTicketType);
    onUpdate(newSeatGroup);
  };

  const handleUpdateTicketType = (index: number, ticket: TicketTypeCreate) => {
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes[index] = ticket;
    onUpdate(newSeatGroup);
  };

  const handleDeleteTicketType = (index: number) => {
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes.splice(index, 1);
    onUpdate(newSeatGroup);
  };

  return (
    <Card sx={{ margin: "16px", padding: "16px" }}>
      <Grid container spacing={2}>
        <Grid container size={6} alignItems={"center"}>
          <Grid>
            <TextField
              label="座席数"
              value={inputValue}
              onChange={handleChangeNumOfSeats}
              error={isNaN(parseInt(inputValue))}
              helperText={
                isNaN(parseInt(inputValue)) ? "数値を入力してください" : ""
              }
              fullWidth
            />
          </Grid>
          <Grid>
            <IconButton aria-label="delete" onClick={onDelete}>
              <DeleteForeverIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container size={6}>
          {seatGroup.ticketTypes.map((ticket, index) => (
            <div key={index}>
              <EditTicketType
                ticket={ticket}
                onUpdate={(newTicket) =>
                  handleUpdateTicketType(index, newTicket)
                }
                onDelete={() => handleDeleteTicketType(index)}
              />
            </div>
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTicketType}
            fullWidth
          >
            チケット追加
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default EditSeatGroup;
