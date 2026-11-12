import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
const VerifyOTP = () => {
    const location = useLocation();
    const { values } = location.state || {};
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.warning("Vui lòng nhập đủ 6 số OTP!");
            return;
        }
        try {
            const { email } = values;
            const payload = {
                otp: otpCode,
                email,
            };
            const res = await api.post("/auth/verify-otp", payload);
            navigate("/auth/reset-password", {
                state: { resetToken: res.data.data.resetToken },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi hệ thống!");
        }
    };
    const handleResendOTP = async () => {
        try {
            const { email } = values;
            await api.post("/auth/forgot-password", {
                email,
            });
            toast.success("Mã OTP mới đã được gửi đến email!");
            setOtp(["", "", "", "", "", ""]);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Không thể gửi lại mã OTP!",
            );
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-card">
                    <Link to="/auth/forgot-password" className="back-link">
                        <FiArrowLeft className="me-2" /> Quay lại
                    </Link>

                    <h3 className="auth-title text-start mb-2">Nhập mã</h3>
                    <p className="auth-subtitle text-start mb-4">
                        Hãy nhập mã chúng tôi đã gửi vào email của bạn
                    </p>

                    <div className="d-flex justify-content-between mb-4 gap-2">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    className="form-control text-center p-2"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    onChange={(e) =>
                                        handleChange(e.target, index)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    style={{
                                        width: "45px",
                                        height: "50px",
                                        fontSize: "1.2rem",
                                        borderRadius: "8px",
                                    }}
                                />
                            );
                        })}
                    </div>

                    <button
                        onClick={handleVerify}
                        className="btn btn-primary-custom mb-3"
                    >
                        Xác thực
                    </button>

                    <button
                        onClick={handleResendOTP}
                        className="btn btn-light w-100 border text-muted fw-semibold mb-3"
                    >
                        Gửi lại mã
                    </button>

                    <div className="text-center">
                        <Link
                            to="/auth/forgot-password"
                            className="text-decoration-none small text-muted"
                        >
                            Thử với email khác
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
