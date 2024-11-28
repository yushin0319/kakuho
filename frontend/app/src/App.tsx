// app/src/App.tsx
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { EventDataProvider } from "./context/EventDataContext";
import { ReservationProvider } from "./context/ReservationContext";
import { NewItemProvider } from "./context/NewItemContext";
import { SnackProvider } from "./context/SnackContext";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <EventDataProvider>
          <ReservationProvider>
            <NewItemProvider>
              <SnackProvider>
                <Layout>
                  <AppRouter />
                </Layout>
              </SnackProvider>
            </NewItemProvider>
          </ReservationProvider>
        </EventDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
