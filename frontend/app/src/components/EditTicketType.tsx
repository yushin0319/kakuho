import { useForm, Controller } from "react-hook-form";
import { Grid2 as Grid, TextField, IconButton } from "@mui/material";
import { TicketTypeCreate } from "../services/interfaces";
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
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type_name: ticket.type_name,
      price: ticket.price.toString(),
    },
  });

  const normalizeNumber = (value: string): string =>
    value.replace(/[０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    );

  const onSubmit = (data: { type_name: string; price: string }) => {
    const normalizedPrice = normalizeNumber(data.price);
    const parsedPrice = parseInt(normalizedPrice, 10);
    if (!isNaN(parsedPrice)) {
      onUpdate({ type_name: data.type_name, price: parsedPrice });
    }
  };

  return (
    <form onBlur={handleSubmit(onSubmit)}>
      <Grid container spacing={2} alignItems="center">
        <Grid container size={{ xs: 10, md: 11 }} spacing={1}>
          {/* チケット種別 */}
          <Grid size={6}>
            <Controller
              name="type_name"
              control={control}
              rules={{
                required: "チケット種別は必須です",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="チケット種別"
                  size="small"
                  error={Boolean(errors.type_name)}
                  helperText={errors.type_name?.message}
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* 価格 */}
          <Grid size={6}>
            <Controller
              name="price"
              control={control}
              rules={{
                required: "価格は必須です",
                validate: (value) => {
                  const normalizedValue = normalizeNumber(value);
                  if (!/^\d+$/.test(normalizedValue)) {
                    return "数値のみ入力してください";
                  }
                  if (parseInt(normalizedValue, 10) < 0) {
                    return "0以上の数字を入力してください";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="価格"
                  size="small"
                  error={Boolean(errors.price)}
                  helperText={errors.price?.message}
                  fullWidth
                  onBlur={(e) => {
                    const normalizedValue = normalizeNumber(e.target.value);
                    setValue("price", normalizedValue, {
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />
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
  );
};

export default EditTicketType;
