import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../../assets/favicon.svg";
import useAuthStore from "../../stores/authStore.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api.js";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const initialValues = { email: "", password: "" };
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Vui lòng nhập email"),
        password: Yup.string()
            .required("Vui lòng nhập mật khẩu")
            .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
            .matches(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
            .matches(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
            .matches(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
            .matches(
                /[^A-Za-z0-9]/,
                "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
            ),
    });

    const onSubmit = async (values) => {
        try {
            const response = await api.post("/auth/login", values);
            const { user, token } = response.data.data;
            login(user, token);
            toast.success("Đăng nhập thành công!");
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-logo-box">
                    <div className="logo-circle">
                        <img src={logo} alt="Risova Logo" />
                    </div>
                </div>

                <div className="auth-card">
                    <h3 className="auth-title">Đăng nhập hệ thống</h3>
                    <p className="auth-subtitle">
                        Quản lý bảo trì và tài sản doanh nghiệp tập trung
                    </p>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Nhập email"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Mật khẩu
                                    </label>
                                    <div className="input-group">
                                        <Field
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            className="form-control border-end-0"
                                            placeholder="Nhập mật khẩu"
                                        />
                                        <span
                                            className="input-group-text bg-white border-start-0 cursor-pointer"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="text-muted" />
                                            ) : (
                                                <FiEye className="text-muted" />
                                            )}
                                        </span>
                                    </div>
                                    <ErrorMessage
                                        name="password"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <div className="d-flex justify-content-end mb-4">
                                    <Link
                                        to="/auth/forgot-password"
                                        className="text-decoration-none small text-muted"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary-custom"
                                    disabled={isSubmitting}
                                >
                                    Đăng nhập
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            ``
        </div>
    );
};

export default Login;
