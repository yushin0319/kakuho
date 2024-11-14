// app/src/App.tsx
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { ReservationProvider } from "./context/ReservationContext";
import { NewItemProvider } from "./context/NewItemContext";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ReservationProvider>
          <NewItemProvider>
            <Layout>
              <AppRouter />
            </Layout>
          </NewItemProvider>
        </ReservationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
