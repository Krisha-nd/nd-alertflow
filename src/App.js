import React, { useState } from "react";
import AlertSidebar from "./components/AlertSidebar";
import AlertFlow from "./components/AlertFlow";
import Login from "./login.jsx"; // import the login component
import "./styles/App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <AlertSidebar
        selectedAlertId={selectedAlertId}
        onSelectAlert={setSelectedAlertId}
      />
      <main className="flow-container">
        {selectedAlertId ? (
          <AlertFlow selectedAlertId={selectedAlertId} />
        ) : (
          <div className="flow-placeholder">
            <h2>Please select an alert from the sidebar.</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;