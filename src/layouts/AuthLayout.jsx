import { Outlet } from "react-router-dom";
import "../styles/auth/Auth.scss";

const AuthLayout = ({ children }) => {
    return children || <Outlet />;
};

export default AuthLayout;
