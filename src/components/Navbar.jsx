import React from "react";
import { Dropdown } from "react-bootstrap";
import { FiSearch, FiBell } from "react-icons/fi";
import "./Navbar.scss";

const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    const middleInitial = words[words.length - 2].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return `${middleInitial}${lastInitial}`.toUpperCase();
};

const Navbar = ({
    breadcrumbParent = "Không gian làm việc",
    breadcrumbCurrent = "Thiết bị",
    user = { name: "Minh Anh", role: "Quản lý bảo trì" },
    unreadNotifications = 3,
}) => {
    const avatarText = getInitials(user?.name);

    return (
        <header className="app-navbar d-flex align-items-center justify-content-between px-4 bg-white border-bottom">
            <div className="navbar-breadcrumb d-flex flex-column">
                <span className="breadcrumb-parent text-muted small">
                    {breadcrumbParent} /
                </span>
                <h5 className="breadcrumb-current mb-0 fw-bold">
                    {breadcrumbCurrent}
                </h5>
            </div>

            <div className="navbar-search flex-grow-1 max-w-md mx-4">
                <div className="input-group search-input-group">
                    <span className="input-group-text border-end-0 bg-transparent ps-3">
                        <FiSearch className="search-icon" />
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0 shadow-none"
                        placeholder="Tìm thiết bị, phiếu công việc, vật tư"
                    />
                </div>
            </div>

            <div className="navbar-actions d-flex align-items-center gap-4">
                <div className="position-relative notification-btn">
                    <button className="btn btn-link p-0 text-secondary border-0 shadow-none">
                        <FiBell size={22} />
                    </button>
                    {unreadNotifications > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-light">
                            {unreadNotifications}
                        </span>
                    )}
                </div>

                <Dropdown align="end" className="user-profile-dropdown">
                    <Dropdown.Toggle
                        as="div"
                        className="d-flex align-items-center cursor-pointer"
                    >
                        <div className="avatar-circle me-2 d-flex align-items-center justify-content-center">
                            <span>{avatarText}</span>
                        </div>
                        <div className="user-details d-flex flex-column">
                            <span className="user-name fw-bold">
                                {user?.name}
                            </span>
                            <span className="user-role text-muted">
                                {user?.role}
                            </span>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-sm border-0 mt-2">
                        <Dropdown.Item href="#profile">
                            Hồ sơ cá nhân
                        </Dropdown.Item>
                        <Dropdown.Item href="#settings">
                            Cài đặt tài khoản
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item href="#logout" className="text-danger">
                            Đăng xuất
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </header>
    );
};

export default Navbar;
