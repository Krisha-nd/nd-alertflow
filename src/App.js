import React, { useState } from "react";
import AlertSidebar from "./components/AlertSidebar";
import AlertFlow from "./components/AlertFlow";
import "../src/styles/App.css";

function App() {
  const [selectedAlertId, setSelectedAlertId] = useState(null);

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