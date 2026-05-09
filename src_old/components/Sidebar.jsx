import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Baby,
  CirclePlus,
  FileText,
  User
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        PKM Nexus
      </div>

      <NavLink to="/">
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/balita">
        <Baby size={20} />
        <span>Balita</span>
      </NavLink>

      <NavLink to="/input">
        <CirclePlus size={20} />
        <span>Input</span>
      </NavLink>

      <NavLink to="/report">
        <FileText size={20} />
        <span>Report</span>
      </NavLink>

      <NavLink to="/akun">
        <User size={20} />
        <span>Akun</span>
      </NavLink>

    </aside>
  );
}