import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>

      <BottomNav />

    </div>
  );
}