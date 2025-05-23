// app/src/assets/styles/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#607d8b", // グレイッシュな青緑
    },
    secondary: {
      main: "#80cbc4",
    },
    background: {
      default: "#e8eaf6", // 淡いブルーグレー
      paper: "#ffffff", // 白
    },
    text: {
      primary: "#424242", // 濃いグレー
      secondary: "#757575", // 中間グレー
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800", // オレンジ
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif", // 好みのフォントを指定
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: "bold",
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        fixed: true,
      },
      styleOverrides: {
        root: {
          alignItems: "center",
          textAlign: "center",
        },
      },
    },
  },
});

export default theme;
