import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const initialValues = { email: "" };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Vui lòng nhập email"),
    });

    const onSubmit = (values) => {
        console.log("Reset email sent to:", values);
        navigate("/verify-otp");
    };

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <Link to="/auth/login" className="back-link">
                        <FiArrowLeft className="me-2" /> Quay lại
                    </Link>

                    <h3 className="auth-title text-start mb-2">
                        Đặt lại mật khẩu
                    </h3>
                    <p className="auth-subtitle text-start mb-4">
                        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã khôi
                        phục để bạn đặt lại mật khẩu
                    </p>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-4">
                                    <label className="form-label">
                                        Địa chỉ Email
                                    </label>
                                    <Field
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Nhập email của bạn"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary-custom"
                                    disabled={isSubmitting}
                                >
                                    Gửi mã khôi phục
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
