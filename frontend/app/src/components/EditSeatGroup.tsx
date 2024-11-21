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
  const [error, setError] = useState<string>("");

  const validateNum = (value: string): string => {
    if (!/^\d+$/.test(value)) return "数値のみ入力してください";
    const parsedNum = parseInt(value, 10);
    if (parsedNum < 0) return "0以上の数字を入力してください";
    return "";
  };

  const checkNumOfSeats = () => {
    const replaced = inputValue
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .trim();
    setInputValue(replaced);
    const error = validateNum(replaced);
    setError(error);
    if (!error) {
      const newSeatGroup = { ...seatGroup };
      newSeatGroup.seatGroup.capacity = parseInt(replaced, 10);
      onUpdate(newSeatGroup);
    } else {
      setInputValue(seatGroup.seatGroup.capacity.toString());
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
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={checkNumOfSeats}
              error={Boolean(error)}
              helperText={error}
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
