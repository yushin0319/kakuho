// app/src/pages/Register.tsx
import { Box, Button, Container, Typography } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ValidatedForm from "../components/ValidatedForm";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { signup } = useAuth(); // AuthContextのsignup関数を取得

  // React Hook Formの設定
  const methods = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      nickname: "",
    },
  });

  const handleRegister = async (data: {
    email: string;
    password: string;
    nickname?: string;
  }) => {
    const { email, password, nickname } = data;

    try {
      // 新規登録処理を実行
      await signup({ email, password, nickname });
      navigate("/"); // 登録後にホームページへリダイレクト
    } catch (error) {
      setError(
        "登録に失敗しました。入力内容をご確認の上、再度お試しください。"
      );
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        新規登録
      </Typography>

      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleRegister)}>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <ValidatedForm
              name="nickname"
              label="ニックネーム（任意）"
              fieldType="nickname"
            />
            <ValidatedForm
              name="email"
              label="メールアドレス"
              fieldType="email"
            />
            <ValidatedForm
              name="password"
              label="パスワード"
              fieldType="password"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              新規登録
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Container>
  );
};

export default Register;
