import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initialValues = { password: "", confirmPassword: "" };

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
            .required("Vui lòng nhập mật khẩu mới"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
            .required("Vui lòng xác nhận mật khẩu"),
    });

    const onSubmit = (values) => {
        console.log("New Password Set:", values);
        navigate("/login");
    };

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <Link to="/auth/verify-otp" className="back-link">
                        <FiArrowLeft className="me-2" /> Quay lại
                    </Link>

                    <h3 className="auth-title text-start mb-4">
                        Đặt lại mật khẩu
                    </h3>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
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
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                        <span
                                            className="input-group-text bg-white border-start-0 cursor-pointer"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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

                                <div className="mb-4">
                                    <label className="form-label">
                                        Nhập lại mật khẩu
                                    </label>
                                    <div className="input-group">
                                        <Field
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            className="form-control border-end-0"
                                            placeholder="Nhập lại mật khẩu"
                                        />
                                        <span
                                            className="input-group-text bg-white border-start-0 cursor-pointer"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff className="text-muted" />
                                            ) : (
                                                <FiEye className="text-muted" />
                                            )}
                                        </span>
                                    </div>
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary-custom"
                                    disabled={isSubmitting}
                                >
                                    Đổi mật khẩu
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
