import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./styles/main.scss";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick={false}
            pauseOnHover={true}
            draggable={true}
            progress={undefined}
            theme="light"
        />
    </BrowserRouter>,
);
