// app/src/App.tsx
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ReservationProvider } from "./context/ReservationContext";
import { NewItemProvider } from "./context/NewItemContext";

const App = () => {
  return (
    <AuthProvider>
      <ReservationProvider>
        <NewItemProvider>
          <Layout>
            <AppRouter />
          </Layout>
        </NewItemProvider>
      </ReservationProvider>
    </AuthProvider>
  );
};

export default App;
