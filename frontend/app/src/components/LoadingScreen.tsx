import { Backdrop, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Backdrop
      open={true} // 表示/非表示を制御
      sx={{
        color: "#fff", // プログレスとテキストの色
        zIndex: (theme) => theme.zIndex.modal + 1, // モーダルより上に表示
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明の背景
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
