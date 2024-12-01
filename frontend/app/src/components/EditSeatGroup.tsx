// app/src/components/EditSeatGroup.tsx
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  Button,
  Card,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { seatProps } from "../pages/CreateEvent";
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

  // 数値のバリデーション
  const validateNum = (value: string): string => {
    if (!/^\d+$/.test(value)) return "数値のみ入力してください";
    const parsedNum = parseInt(value, 10);
    if (parsedNum < 0) return "0以上の数字を入力してください";
    return "";
  };

  // 座席数のバリデーション
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

  // チケット種別の追加
  const handleAddTicketType = () => {
    const newTicketType: TicketTypeCreate = { type_name: "", price: 0 };
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes.push(newTicketType);
    onUpdate(newSeatGroup);
  };

  // チケット種別の更新
  const handleUpdateTicketType = (index: number, ticket: TicketTypeCreate) => {
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes[index] = ticket;
    onUpdate(newSeatGroup);
  };

  // チケット種別の削除
  const handleDeleteTicketType = (index: number) => {
    const newSeatGroup = { ...seatGroup };
    newSeatGroup.ticketTypes.splice(index, 1);
    onUpdate(newSeatGroup);
  };

  return (
    <Card sx={{ p: 4, mb: 2 }}>
      <Grid container spacing={2}>
        <TextField
          label="座席数"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={checkNumOfSeats}
          error={Boolean(error)}
          helperText={error}
          fullWidth
        />
        <Grid container size={12} spacing={2}>
          {seatGroup.ticketTypes.map((ticket, index) => (
            <Grid container size={12} key={index}>
              <Card sx={{ p: 2, my: 1, width: "100%" }}>
                <EditTicketType
                  ticket={ticket}
                  onUpdate={(newTicket) =>
                    handleUpdateTicketType(index, newTicket)
                  }
                  onDelete={() => handleDeleteTicketType(index)}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTicketType}
          fullWidth
        >
          チケット追加
        </Button>
        <IconButton aria-label="delete" onClick={onDelete}>
          <DeleteForeverIcon />
          <Typography>まとめて削除</Typography>
        </IconButton>
      </Grid>
    </Card>
  );
};

export default EditSeatGroup;
