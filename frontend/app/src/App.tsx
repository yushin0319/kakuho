// app/src/App.tsx
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ReservationProvider } from "./context/ReservationContext";

const App = () => {
  return (
    <AuthProvider>
      <ReservationProvider>
        <Layout>
          <AppRouter />
        </Layout>
      </ReservationProvider>
    </AuthProvider>
  );
};

export default App;
