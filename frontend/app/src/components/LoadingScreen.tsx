import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface LoadingScreenProps {
  /** fullscreen: 全画面Backdrop（初期ロード用）, inline: コンテンツ内スピナー（データ更新用） */
  variant?: "fullscreen" | "inline";
}

const LoadingScreen = ({ variant = "fullscreen" }: LoadingScreenProps) => {
  if (variant === "inline") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Backdrop
      open={true}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} color="inherit" />
        <Typography sx={{ mt: 2 }} variant="body1">
          読み込み中...
        </Typography>
      </div>
    </Backdrop>
  );
};

export default LoadingScreen;
