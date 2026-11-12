import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const CreateUser = () => {
    const initialValues = {
        fullName: "",
        email: "",
        phone: "",
        role: "",
        specialty: "",
        skillLevel: "",
        workDate: "",
        shift: "",
    };

    const validationSchema = Yup.object({
        fullName: Yup.string().required("Bắt buộc nhập"),
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Bắt buộc nhập"),
        // Thêm các rules khác tùy nhu cầu
    });

    const onSubmit = (values) => {
        console.log("Create User Data:", values);
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
            {/* Background màu xám chỉ để demo tương tự ảnh, khi ráp vào layout admin bạn bỏ phần style này đi */}

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
                                    {/* Tên nhân viên & Email */}
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
                                            placeholder="..."
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
                                            placeholder="..."
                                        />
                                        <ErrorMessage
                                            name="email"
                                            component="div"
                                            className="text-danger small mt-1"
                                        />
                                    </div>

                                    {/* SĐT & Vai trò */}
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Số điện thoại
                                        </label>
                                        <Field
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            placeholder="..."
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
                                            name="role"
                                            className="form-select text-muted"
                                        >
                                            <option value="">...</option>
                                            <option value="admin">
                                                Quản trị viên
                                            </option>
                                            <option value="tech">
                                                Kỹ thuật viên
                                            </option>
                                        </Field>
                                    </div>

                                    {/* Chuyên môn & Mức độ */}
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Chuyên môn
                                        </label>
                                        <Field
                                            as="select"
                                            name="specialty"
                                            className="form-select text-muted"
                                        >
                                            <option value="">...</option>
                                            <option value="electric">
                                                Điện
                                            </option>
                                            <option value="mechanic">
                                                Cơ khí
                                            </option>
                                        </Field>
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Mức độ chuyên môn
                                        </label>
                                        <Field
                                            as="select"
                                            name="skillLevel"
                                            className="form-select text-muted"
                                        >
                                            <option value="">...</option>
                                            <option value="junior">
                                                Cơ bản
                                            </option>
                                            <option value="senior">
                                                Nâng cao
                                            </option>
                                        </Field>
                                    </div>

                                    {/* Ngày làm việc & Ca làm */}
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Ngày làm việc
                                        </label>
                                        <Field
                                            type="date"
                                            name="workDate"
                                            className="form-control text-muted"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label fw-semibold text-dark mb-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            Ca làm việc
                                        </label>
                                        <Field
                                            as="select"
                                            name="shift"
                                            className="form-select text-muted"
                                        >
                                            <option value="">...</option>
                                            <option value="morning">
                                                Ca sáng
                                            </option>
                                            <option value="afternoon">
                                                Ca chiều
                                            </option>
                                        </Field>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="d-flex justify-content-center gap-3 mt-5">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        style={{ width: "120px" }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn px-4 py-2 text-white"
                                        style={{
                                            backgroundColor: "#3f72af",
                                            width: "120px",
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Lưu thay đổi
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
