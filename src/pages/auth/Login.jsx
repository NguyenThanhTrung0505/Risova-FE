import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../../../public/favicon.svg";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = { email: "", password: "" };
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Vui lòng nhập email"),
        password: Yup.string().required("Vui lòng nhập mật khẩu"),
    });

    const onSubmit = (values) => {
        console.log("Login Data:", values);
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
        </div>
    );
};

export default Login;
