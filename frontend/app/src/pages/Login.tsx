// app/src/pages/Login.tsx
import { Box, Button, Container, Typography } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ValidatedForm from "../components/ValidatedForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [error, setError] = useState("");

  // React Hook Formの設定
  const methods = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: { email: string; password: string }) => {
    const { email, password } = data;

    try {
      // ログイン処理を実行
      await login(email, password);
      navigate("/"); // ログイン成功時にホームへリダイレクト
      console.log(user);
    } catch (error) {
      setError(
        "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。"
      );
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>

      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleLogin)}>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
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
              ログイン
            </Button>
          </Box>
        </form>
      </FormProvider>

      <Typography variant="body2" sx={{ mt: 2 }}>
        アカウントをお持ちでないですか？{" "}
        <Link
          to="/register"
          style={{ textDecoration: "none", color: "#1976d2" }}
        >
          新規登録はこちら
        </Link>
      </Typography>
    </Container>
  );
};

export default Login;
