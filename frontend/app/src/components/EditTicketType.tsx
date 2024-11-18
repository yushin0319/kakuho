// app/src/components/EditTicketType.tsx
import { TicketTypeCreate } from "../services/interfaces";
import { Button, Grid2 as Grid, TextField } from "@mui/material";

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...ticket, [e.target.name]: e.target.value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <TextField
          label="チケット種別"
          value={ticket.type_name}
          name="type_name"
          onChange={handleChange}
        />
      </Grid>
      <Grid size={4}>
        <TextField
          label="価格"
          value={ticket.price}
          name="price"
          onChange={handleChange}
        />
      </Grid>
      <Grid size={2}>
        <Button variant="contained" color="secondary" onClick={onDelete}>
          削除
        </Button>
      </Grid>
    </Grid>
  );
};

export default EditTicketType;
