import React from "react";
import AppRouter from "./routes/AppRouter";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout>
        <AppRouter />
      </Layout>
    </AuthProvider>
  );
};

export default App;
