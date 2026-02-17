// app/src/App.tsx
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { AppDataProvider } from "./context/AppData";
import { AuthProvider } from "./context/AuthContext";
import { NewItemProvider } from "./context/NewItemContext";
import { SnackProvider } from "./context/SnackContext";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackProvider>
        <AuthProvider>
          <AppDataProvider>
            <NewItemProvider>
              <Layout>
                <AppRouter />
              </Layout>
            </NewItemProvider>
          </AppDataProvider>
        </AuthProvider>
      </SnackProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
