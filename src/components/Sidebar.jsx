import { Menu, MenuItem, Sidebar as ProSidebar } from "react-pro-sidebar";
import { NavLink } from "react-router-dom";
import "./Sidebar.scss";
import {
    LuCalendar,
    LuChartColumn,
    LuChartLine,
    LuClipboardList,
    LuLayers,
    LuLayoutGrid,
    LuMapPin,
    LuPackage,
    LuScrollText,
    LuUser,
} from "react-icons/lu";

const menuItemStyles = {
    button: {
        color: "var(--sidebar-text)",
        backgroundColor: "transparent",
        borderRadius: "10px",
        height: "42px",
        padding: "0 12px",
        fontSize: "0.95rem",
        fontWeight: 500,
        "&:hover": {
            backgroundColor: "var(--sidebar-hover)",
            color: "var(--sidebar-text)",
        },
        "&.active": {
            backgroundColor: "var(--sidebar-active)",
            color: "#fff",
        },
        "&.active:hover": {
            backgroundColor: "var(--sidebar-active)",
            color: "#fff",
        },
    },
    icon: {
        color: "inherit",
        width: "22px",
        minWidth: "22px",
        fontSize: "1.1rem",
    },
    label: {
        fontWeight: 500,
    },
};

const groups = [
    {
        title: "Tổng quan",
        items: [
            {
                label: "Bảng điều khiển",
                to: "/",
                end: true,
                icon: <LuLayoutGrid size={18} strokeWidth={1.75} />,
            },
        ],
    },
    {
        title: "Vận hành",
        items: [
            {
                label: "Thiết bị",
                to: "/equipment",
                icon: <LuLayers size={18} strokeWidth={1.75} />,
            },
            {
                label: "Địa điểm",
                to: "/locations",
                icon: <LuMapPin size={18} strokeWidth={1.75} />,
            },
            {
                label: "Lệnh làm việc",
                to: "/work-orders",
                icon: <LuClipboardList size={18} strokeWidth={1.75} />,
            },
            {
                label: "Bảo trì định kỳ",
                to: "/maintenance",
                icon: <LuCalendar size={18} strokeWidth={1.75} />,
            },
        ],
    },
    {
        title: "Nguồn lực",
        items: [
            {
                label: "Kho vật tư",
                to: "/inventory",
                icon: <LuPackage size={18} strokeWidth={1.75} />,
            },
            {
                label: "Giám sát lot",
                to: "/lot-monitoring",
                icon: <LuChartLine size={18} strokeWidth={1.75} />,
            },
            {
                label: "Nhân sự",
                to: "/personnel",
                icon: <LuUser size={18} strokeWidth={1.75} />,
            },
        ],
    },
    {
        title: "Phân tích",
        items: [
            {
                label: "Báo cáo",
                to: "/reports",
                icon: <LuChartColumn size={18} strokeWidth={1.75} />,
            },
            {
                label: "Nhật ký kiểm toán",
                to: "/audit-logs",
                icon: <LuScrollText size={18} strokeWidth={1.75} />,
            },
        ],
    },
];

function BrandMark() {
    return (
        <span className="sidebar-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                    d="M9 18h6M10 21h4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                />
                <path
                    d="M8.4 14.1a5.6 5.6 0 1 1 7.2 0c-.8.8-1.1 1.6-1.3 2.4H9.7c-.2-.8-.5-1.6-1.3-2.4Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
                <path
                    d="M7.5 11.2h2.1l1.15-2.3 1.7 4.1 1.05-1.8H16.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

function Sidebar() {
    return (
        <ProSidebar
            className="risova-sidebar"
            width="var(--sidebar-width, 270px)"
            backgroundColor="var(--sidebar-bg)"
            rootStyles={{
                borderRight: "none",
                color: "var(--sidebar-text)",
            }}
        >
            <div className="sidebar-scroll">
                <div className="sidebar-brand">
                    <BrandMark />
                    <div>
                        <span className="sidebar-title">
                            Ri<span style={{ color: "#00AAFC" }}>sova</span>
                        </span>
                        <span className="sidebar-subtitle">
                            Enterprise CMMS
                        </span>
                    </div>
                </div>

                <nav aria-label="Điều hướng chính">
                    {groups.map((group) => (
                        <div className="sidebar-group" key={group.title}>
                            <p className="sidebar-section">{group.title}</p>
                            <Menu
                                menuItemStyles={menuItemStyles}
                                rootStyles={{
                                    padding: "0 12px",
                                }}
                            >
                                {group.items.map((item) => (
                                    <MenuItem
                                        key={item.to}
                                        icon={item.icon}
                                        component={
                                            <NavLink
                                                to={item.to}
                                                end={item.end}
                                            />
                                        }
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>
                    ))}
                </nav>
            </div>
        </ProSidebar>
    );
}

export default Sidebar;
