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
                label: "Nhật ký",
                to: "/audit-logs",
                icon: <LuScrollText size={18} strokeWidth={1.75} />,
            },
        ],
    },
];

function BrandMark() {
    return (
        <span className="sidebar-logo" aria-hidden="true">
            <img src="/favicon.svg" alt="" width="42" height="42" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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
