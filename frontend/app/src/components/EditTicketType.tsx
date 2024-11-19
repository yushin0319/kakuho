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
  const [localTicket, setLocalTicket] = useState(ticket);

  const handleUpdate = () => {
    onUpdate(localTicket);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTicket({
      ...localTicket,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Grid container spacing={2} alignItems={"center"}>
      <Grid size={5}>
        <TextField
          label="チケット種別"
          value={localTicket.type_name}
          name="type_name"
          onChange={handleChange}
          size="small"
          onBlur={handleUpdate}
        />
      </Grid>
      <Grid size={5}>
        <TextField
          label="価格"
          value={localTicket.price}
          name="price"
          onChange={handleChange}
          size="small"
          error={isNaN(localTicket.price)}
          helperText={isNaN(localTicket.price) ? "数字を入力してください" : ""}
          onBlur={handleUpdate}
        />
      </Grid>
      <Grid size={2}>
        <IconButton aria-label="delete" onClick={onDelete}>
          <DeleteForeverIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default EditTicketType;
