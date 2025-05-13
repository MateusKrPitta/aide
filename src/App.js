import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/toast";
import AppRoutes from "./routes";
import './App.css'
function App() {
  return (
    <BrowserRouter>
        <AppRoutes />
        <ToastProvider />

    </BrowserRouter>
  );
}

export default App;