import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: "fixed", // 画面全体を覆う
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明の背景
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300, // モーダルなどの上に表示されるように高めの値
      }}
    >
      <Box
        sx={{
          textAlign: "center",
        }}
      >
        <CircularProgress size={60} thickness={4} color="inherit" />
        <Typography sx={{ mt: 2 }} variant="body1">
          読み込み中...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
