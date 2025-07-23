import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
