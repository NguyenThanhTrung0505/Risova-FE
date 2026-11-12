import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./MainLayout.scss";

function MainLayout() {
    return (
        <div className="app-layout d-flex">
            <aside className="app-sidebar-wrapper">
                <Sidebar />
            </aside>
            <div className="app-main-container flex-grow-1 d-flex flex-column min-vh-100">
                <Navbar />
                <main className="app-content p-4 flex-grow-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
