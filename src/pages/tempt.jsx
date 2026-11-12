import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateUser = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const initialValues = {
        fullName: "",
        email: "",
        phone: "",
        role: "",
        employee_code: "",
        password: "",
    };

    const validationSchema = Yup.object({
        employee_code: Yup.string().required("Bắt buộc nhập"),
        fullName: Yup.string().required("Bắt buộc nhập"),
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Bắt buộc nhập"),
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
        phone: Yup.string().required("Bắt buộc nhập"),
        role: Yup.string().required("Bắt buộc nhập"),
    });

    const onSubmit = async (values, { resetForm }) => {
        try {
            const response = await api.post("/auth/register", values);
            toast.success("Đăng ký tài khoản thành công!");
            resetForm();
            setShowPassword(false);
            setTimeout(() => {
                navigate("/auth/login");
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại!");
        }
    };

    return (
        <div
            className="container-fluid p-4"
            style={{
                backgroundColor: "#a4b0be",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                className="card border-0 shadow-sm rounded-3 w-100"
                style={{ maxWidth: "800px" }}
            >
                <div className="card-body p-4 p-md-5">
                    <h4
                        className="card-title fw-bold mb-4"
                        style={{ color: "#112d4e" }}
                    >
                        Tạo tài khoản
                    </h4>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Mã nhân viên
                                        </label>
                                        <Field
                                            type="text"
                                            name="employee_code"
                                            className="form-control"
                                            placeholder="Nhập mã nhân viên"
                                        />
                                        <ErrorMessage
                                            name="employee_code"
                                            component="div"
                                            className="text-danger small mt-1"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Tên nhân viên
                                        </label>
                                        <Field
                                            type="text"
                                            name="fullName"
                                            className="form-control"
                                            placeholder="Nhập tên"
                                        />
                                        <ErrorMessage
                                            name="fullName"
                                            component="div"
                                            className="text-danger small mt-1"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Email
                                        </label>
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
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
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
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
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

                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Số điện thoại
                                        </label>
                                        <Field
                                            type="phone"
                                            name="phone"
                                            className="form-control"
                                            placeholder="Nhập số điện thoại"
                                        />
                                        <ErrorMessage
                                            name="phone"
                                            component="div"
                                            className="text-danger small mt-1"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Vai trò
                                        </label>
                                        <Field
                                            as="select"
                                            type="role"
                                            name="role"
                                            className="form-select text-muted"
                                        >
                                            <option value="">
                                                Chọn vai trò
                                            </option>
                                            <option value="ADMIN">
                                                Quản trị viên
                                            </option>
                                            <option value="MANAGER">
                                                Quản lý
                                            </option>
                                            <option value="TECHNICIAN">
                                                Kỹ thuật viên
                                            </option>
                                            <option value="STAFF">
                                                Nhân viên
                                            </option>
                                            <option value="INVENTORY_STAFF">
                                                Thủ kho
                                            </option>
                                        </Field>
                                        <ErrorMessage
                                            name="phone"
                                            component="div"
                                            className="text-danger small mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="d-flex justify-content-center gap-3 mt-5">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2 border-dark"
                                        style={{ width: "120px" }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn px-4 py-2 text-white"
                                        style={{
                                            backgroundColor: "#3f72af",
                                            width: "150px",
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default CreateUser;
