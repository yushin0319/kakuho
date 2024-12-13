import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  Button,
  Card,
  Grid2 as Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { SeatGroupCreate, TicketTypeCreate } from "../services/interfaces";
import CreateTicketType from "./CreateTicketType";
import ValidatedForm from "./ValidatedForm";

interface CreateSeatGroupProps {
  id: number;
  seatGroup: SeatGroupCreate;
  ticketTypes: TicketTypeCreate[];
  onUpdate: (
    seatGroup: SeatGroupCreate,
    ticketTypes: TicketTypeCreate[]
  ) => void;
  onDelete: () => void;
}

const CreateSeatGroup = ({
  seatGroup,
  ticketTypes,
  onUpdate,
  onDelete,
}: CreateSeatGroupProps) => {
  const methods = useForm({
    defaultValues: {
      capacity: "0",
    },
  });

  // チケット種別の追加
  const addTicketType = () => {
    const newTicketType: TicketTypeCreate = { type_name: "", price: 0 };
    ticketTypes.push(newTicketType);
    onUpdate(seatGroup, ticketTypes);
  };

  // チケット種別の更新
  const updateTicketType = (index: number, ticketType: TicketTypeCreate) => {
    ticketTypes[index] = ticketType;
    onUpdate(seatGroup, ticketTypes);
  };

  // チケット種別の削除
  const deleteTicketType = (index: number) => {
    ticketTypes.splice(index, 1);
    onUpdate(seatGroup, ticketTypes);
  };

  const onSubmit = (data: { capacity: string }) => {
    onUpdate(
      {
        ...seatGroup,
        capacity: parseInt(data.capacity),
      },
      ticketTypes
    );
  };

  return (
    <FormProvider {...methods}>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1} onBlur={methods.handleSubmit(onSubmit)}>
          <ValidatedForm
            name="capacity"
            label="座席数"
            fieldType="number"
            defaultValue={seatGroup.capacity.toString()}
          />
          <Grid container size={12} spacing={2}>
            {ticketTypes.map((ticketType, index) => (
              <Grid container size={12} key={index}>
                <Card sx={{ p: 1, my: 1, width: "100%" }}>
                  <CreateTicketType
                    key={index}
                    ticketType={ticketType}
                    onUpdate={(newTicketType) =>
                      updateTicketType(index, newTicketType)
                    }
                    onDelete={() => deleteTicketType(index)}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={addTicketType}
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

export default CreateSeatGroup;
