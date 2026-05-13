import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/toast";
import AppRoutes from "./routes";
import './App.css'
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
        <ToastProvider />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;