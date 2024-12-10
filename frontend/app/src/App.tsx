// app/src/App.tsx
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { EventDataProvider } from "./context/EventDataContext";
import { NewItemProvider } from "./context/NewItemContext";
import { ReservationProvider } from "./context/ReservationContext";
import { SnackProvider } from "./context/SnackContext";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackProvider>
        <AuthProvider>
          <EventDataProvider>
            <ReservationProvider>
              <NewItemProvider>
                <Layout>
                  <AppRouter />
                </Layout>
              </NewItemProvider>
            </ReservationProvider>
          </EventDataProvider>
        </AuthProvider>
      </SnackProvider>
    </ThemeProvider>
  );
};

export default App;
