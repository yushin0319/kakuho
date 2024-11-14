// app/src/assets/styles/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5", // メインカラー
    },
    secondary: {
      main: "#f50057", // セカンダリーカラー
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif", // 好みのフォントを指定
  },
});

export default theme;
