import React from "react";
import { Outlet } from "react-router-dom";
import "../styles/auth/Auth.scss";

const AuthLayout = () => {
    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
