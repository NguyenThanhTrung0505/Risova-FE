import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthLayout from "./layouts/AuthLayout";
import CreateUser from "./pages/tempt";
import ProtectedRoute from "./routers/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route path="/*" element={<MainLayout />} />
            </Route>

            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="verify-otp" element={<VerifyOTP />} />
                <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="register" element={<CreateUser />} />
        </Routes>
    );
}

export default App;
