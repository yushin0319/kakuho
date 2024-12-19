import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Controller, useFormContext } from "react-hook-form";

const ValidatedDatePicker = ({
  name,
  label,
  minDate,
  maxDate,
  onDateChange,
}: {
  name: string;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  onDateChange?: (value: Date | null) => void;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const styles = {
    mobiledialogprops: {
      ".MuiDatePickerToolbar-title": {
        fontSize: "1.5rem",
      },
    },
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (value) => {
          if (!value) {
            return "日付を選択してください";
          }
          const formatDate = format(value, "yyyy-MM-dd");
          if (minDate && value < minDate) {
            return `${formatDate}以降の日付を選択してください`;
          }
          if (maxDate && value > maxDate) {
            return `${formatDate}以前の日付を選択してください`;
          }
        },
      }}
      render={({ field }) => (
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={ja}
          localeText={{
            nextMonth: "次の月",
            previousMonth: "前の月",
            day: "日",
            month: "月",
            year: "年",
            cancelButtonLabel: "キャンセル",
            okButtonLabel: "OK",
          }}
        >
          <DatePicker
            {...field}
            onChange={(value) => {
              field.onChange(value);
              onDateChange && onDateChange(value);
            }}
            slotProps={{
              textField: {
                variant: "outlined",
                margin: "normal",
                label,
                error: !!errors[name],
                helperText: errors[name]?.message as string,
                inputProps: { readOnly: true },
              },
              calendarHeader: { format: "yyyy年MM月" },
              toolbar: { toolbarFormat: "yyyy年MM月dd日" },
              dialog: {
                sx: styles.mobiledialogprops,
              },
              popper: {
                disablePortal: true,
              },
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
        </LocalizationProvider>
      )}
    />
  );
};

export default ValidatedDatePicker;
