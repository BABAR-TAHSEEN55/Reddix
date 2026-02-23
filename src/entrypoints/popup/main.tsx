import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// This is necessary for using Tailwind ( Tweak it according to your needs )
import "../global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
