import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable all console statements across frontend
console.log = () => {};
console.warn = () => {};
console.info = () => {};
console.debug = () => {};
console.error = () => {};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
