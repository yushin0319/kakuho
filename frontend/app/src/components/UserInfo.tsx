import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useSnack } from "../context/SnackContext";
import { updateUser } from "../services/api/user";
import ValidatedForm from "./ValidatedForm";

interface UserInfoProps {
  onClose: () => void;
}

interface FormValues {
  nickname: string;
  email: string;
}

const UserInfo = ({ onClose }: UserInfoProps) => {
  const { user, setUser, logout } = useAuth();
  const [phase, setPhase] = useState<"form" | "summary">("summary");
  const [dialogOpen, setDialogOpen] = useState(false);

  const methods = useForm<FormValues>({
    defaultValues: {
      nickname: user?.nickname || "",
      email: user?.email || "",
    },
  });

  const { setSnack } = useSnack();

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const updatedUser = await updateUser(user?.id, data);
      setUser(updatedUser);
      setSnack({
        message: "ユーザー情報を更新しました",
        severity: "success",
      });
      setPhase("summary");
    } catch (error) {
      setSnack({
        message: "ユーザー情報の更新に失敗しました",
        severity: "error",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setSnack({
      message: "ログアウトしました",
      severity: "info",
    });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth disableAutoFocus>
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        ユーザー情報
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          {phase === "form" ? (
            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <ValidatedForm
                name="nickname"
                label="ニックネーム"
                fieldType="nickname"
              />
              <ValidatedForm
                name="email"
                label="メールアドレス"
                fieldType="email"
              />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                ニックネーム（ご予約名に使われます）
              </Typography>
              <Typography
                sx={{
                  mb: 2,
                  p: 1,
                  border: "1px solid lightgray",
                  borderRadius: 1,
                  color: "GrayText",
                  fontWeight: "bold",
                }}
              >
                {user?.nickname || "未設定"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                メールアドレス
              </Typography>
              <Typography
                sx={{
                  mb: 2,
                  p: 1,
                  border: "1px solid lightgray",
                  borderRadius: 1,
                  color: "GrayText",
                  fontWeight: "bold",
                }}
              >
                {user?.email || "未設定"}
              </Typography>
            </Box>
          )}
        </FormProvider>
      </DialogContent>
      {phase === "form" ? (
        <DialogActions>
          <Button
            onClick={methods.handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
          >
            保存
          </Button>
          <Button onClick={() => setPhase("summary")} variant="outlined">
            キャンセル
          </Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button
            onClick={() => setPhase("form")}
            variant="contained"
            color="primary"
          >
            編集
          </Button>
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outlined"
            color="error"
            sx={{ ml: 1 }}
          >
            ログアウト
          </Button>
          <Button onClick={onClose} variant="outlined">
            キャンセル
          </Button>
        </DialogActions>
      )}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-hidden={!dialogOpen}
      >
        <DialogContent>
          <Typography>ログアウトしてよろしいですか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="primary"
            fullWidth
          >
            OK
          </Button>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            fullWidth
          >
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default UserInfo;
