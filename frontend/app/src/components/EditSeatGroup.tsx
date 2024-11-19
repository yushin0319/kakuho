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
  const [localSeatGroup, setLocalSeatGroup] = useState(seatGroup);
  const [inputValue, setInputValue] = useState<string>(
    localSeatGroup.seatGroup.capacity.toString()
  );

  const handleUpdate = () => {
    onUpdate(localSeatGroup);
  };

  const handleChangeNumOfSeats = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setInputValue(value);
    if (!isNaN(parseInt(value))) {
      setLocalSeatGroup({
        ...localSeatGroup,
        seatGroup: {
          ...localSeatGroup.seatGroup,
          capacity: parseInt(value),
        },
      });
    }
  };

  const handleAddTicketType = () => {
    setLocalSeatGroup({
      ...localSeatGroup,
      ticketTypes: [...localSeatGroup.ticketTypes, { type_name: "", price: 0 }],
    });
    handleUpdate();
  };

  const handleUpdateTicketType = (index: number, ticket: TicketTypeCreate) => {
    setLocalSeatGroup((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((t, i) => (i === index ? ticket : t)),
    }));
    handleUpdate();
  };

  const handleDeleteTicketType = (index: number) => {
    setLocalSeatGroup((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
    handleUpdate();
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
              onBlur={handleUpdate}
            />
          </Grid>
          <Grid>
            <IconButton aria-label="delete" onClick={onDelete}>
              <DeleteForeverIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container size={6}>
          {localSeatGroup.ticketTypes.map((ticket, index) => (
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
