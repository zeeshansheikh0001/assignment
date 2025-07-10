import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./component/Header";
import TabComponent from "./component/TabComponent";
import Login from "./component/Login";

function App() {
  const [login, setLogin] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      setLogin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLogin(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            login ? (
              <Navigate to="/soundmixer" />
            ) : (
              <Login setLogin={setLogin} />
            )
          }
        />
        <Route
          path="/soundmixer"
          element={
            login ? (
              <>
                <Header onLogout={handleLogout} />
                <TabComponent />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
