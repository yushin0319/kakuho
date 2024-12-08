import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Grid2 as Grid, IconButton } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { TicketTypeCreate } from "../services/interfaces";
import ValidatedForm from "./ValidatedForm";

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
  const methods = useForm({
    defaultValues: {
      type_name: ticket.type_name,
      price: "0",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: { type_name: string; price: string }) => {
    onUpdate({
      type_name: data.type_name,
      price: parseInt(data.price, 10),
    });
  };

  return (
    <FormProvider {...methods}>
      <form onBlur={handleSubmit(onSubmit)}>
        <Grid container spacing={2} alignItems="center">
          <Grid container size={{ xs: 10, md: 11 }} spacing={1}>
            {/* チケット種別 */}
            <Grid size={6}>
              <ValidatedForm
                name="type_name"
                label="チケット種別"
                fieldType="title"
              />
            </Grid>

            {/* 価格 */}
            <Grid size={6}>
              <ValidatedForm name="price" label="価格" fieldType="number" />
            </Grid>
          </Grid>

          {/* 削除ボタン */}
          <Grid size={{ xs: 2, md: 1 }}>
            <IconButton aria-label="delete" onClick={onDelete}>
              <DeleteForeverIcon />
            </IconButton>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default EditTicketType;
