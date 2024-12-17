import { TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

// ルールの定義
const validationRules = {
  title: {
    required: "名前を入力してください",
    maxLength: {
      value: 50,
      message: "50文字以内で入力してください",
    },
  },
  description: {
    required: "説明を入力してください",
    maxLength: {
      value: 500,
      message: "500文字以内で入力してください",
    },
  },
  email: {
    required: "メールアドレスを入力してください",
    pattern: {
      value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      message: "正しいメールアドレス形式で入力してください",
    },
  },
  password: {
    required: "パスワードを入力してください",
    minLength: {
      value: 6,
      message: "パスワードは6文字以上で入力してください",
    },
    maxLength: {
      value: 20,
      message: "パスワードは20文字以内で入力してください",
    },
  },
  nickname: {
    maxLength: {
      value: 50,
      message: "ニックネームは50文字以内で入力してください",
    },
  },
  number: {
    required: "数字を入力してください",
    pattern: {
      value: /^[0-9０-９]+$/,
      message: "数字のみで入力してください",
    },
  },
  default: {},
};

// カスタムフィールドコンポーネント
interface CustomFieldProps {
  name: string;
  label: string;
  fieldType?:
    | "title"
    | "description"
    | "email"
    | "password"
    | "nickname"
    | "number"
    | "default";
  disabled?: boolean;
  variant?: "filled" | "outlined" | "standard";
  size?: "small" | "medium";
  defaultValue?: string;
  sx?: any;
}

const ValidatedForm = ({
  name,
  label,
  fieldType = "default",
  disabled = false,
  variant = "outlined",
  size = "medium",
  defaultValue = "",
  sx = {},
}: CustomFieldProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const rules = validationRules[fieldType] || {};

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    onChange: (value: string) => void
  ) => {
    let value = e.target.value;

    if (fieldType === "number") {
      value = value
        .replace(/[０-９]/g, (s) =>
          String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        ) // 全角数字を半角に変換
        .replace(/[^0-9]/g, ""); // 数字以外を削除
    }

    onChange(value); // 修正済みの値をReact Hook Formに反映
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          fullWidth
          autoComplete="off"
          variant={variant}
          size={size}
          disabled={disabled}
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          type={
            fieldType === "password"
              ? "password"
              : fieldType === "email"
              ? "email"
              : "text"
          }
          onBlur={(e) => handleBlur(e, field.onChange)}
          multiline={fieldType === "description"}
          rows={fieldType === "description" ? 3 : 1}
          sx={sx}
        />
      )}
    />
  );
};

export default ValidatedForm;
