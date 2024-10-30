// app/src/App.tsx
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <AppRouter />
      </Layout>
    </AuthProvider>
  );
};

export default App;
