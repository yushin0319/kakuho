// app/src/components/EditTicketType.tsx
import { useState } from "react";
import { TicketTypeCreate } from "../services/interfaces";
import { IconButton, Grid2 as Grid, TextField } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

interface EditTicketTypeProps {
  ticket: TicketTypeCreate;
  onUpdate: (newTicket: TicketTypeCreate) => void;
  onDelete: () => void;
}

const EditTicketType = ({
  ticket,
  onUpdate,
  onDelete,
}: EditTicketTypeProps) => {
  const [inputValue, setInputValue] = useState<string>(ticket.price.toString());
  const [error, setError] = useState<string>("");

  const validatePrice = (value: string): string => {
    if (!/^\d+$/.test(value)) return "数値のみ入力してください";
    const parsedPrice = parseInt(value, 10);
    if (parsedPrice < 0) return "0以上の数字を入力してください";
    return "";
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...ticket, type_name: e.target.value });
  };

  const checkPrice = () => {
    const replaced = inputValue
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .trim();
    setInputValue(replaced);
    const error = validatePrice(replaced);
    setError(error);
    if (!error) {
      onUpdate({ ...ticket, price: parseInt(replaced, 10) });
    } else {
      setInputValue(ticket.price.toString()); // エラー時は元の値にリセット
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid container size={{ xs: 10, md: 11 }} spacing={1}>
        <Grid size={6}>
          <TextField
            label="チケット種別"
            value={ticket.type_name}
            name="type_name"
            onChange={handleChangeName}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="価格"
            value={inputValue}
            name="price"
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={checkPrice}
            size="small"
            error={Boolean(error)}
            helperText={error}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid size={{ xs: 2, md: 1 }}>
        <IconButton aria-label="delete" onClick={onDelete}>
          <DeleteForeverIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default EditTicketType;
