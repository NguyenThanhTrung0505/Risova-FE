import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const VerifyOTP = () => {
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

    const handleVerify = () => {
        const otpCode = otp.join("");
        console.log("Verifying OTP:", otpCode);
        if (otpCode.length === 6) {
            navigate("/reset-password");
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

                    <button className="btn btn-light w-100 border text-muted fw-semibold mb-3">
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
