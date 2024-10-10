import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import EventList from "./pages/EventList";
import Layout from "./components/Layout"; // Layoutコンポーネントをインポート

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/events" element={<EventList />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
