import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  Button,
  Card,
  Grid2 as Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { seatProps } from "../pages/CreateEvent";
import { TicketTypeCreate } from "../services/interfaces";
import EditTicketType from "./EditTicketType";
import ValidatedForm from "./ValidatedForm";

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
  const methods = useForm({
    defaultValues: {
      capacity: "0",
    },
  });

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

  const onSubmit = (data: { capacity: string }) => {
    onUpdate({
      ...seatGroup,
      seatGroup: {
        ...seatGroup.seatGroup,
        capacity: parseInt(data.capacity, 10),
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1} onBlur={methods.handleSubmit(onSubmit)}>
          <ValidatedForm
            name="capacity"
            label="座席数"
            fieldType="number"
            defaultValue={seatGroup.seatGroup.capacity.toString()}
          />
          <Grid container size={12} spacing={2}>
            {seatGroup.ticketTypes.map((ticket, index) => (
              <Grid container size={12} key={index}>
                <Card sx={{ p: 1, my: 1, width: "100%" }}>
                  <EditTicketType
                    key={index}
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
    </FormProvider>
  );
};

export default EditSeatGroup;
