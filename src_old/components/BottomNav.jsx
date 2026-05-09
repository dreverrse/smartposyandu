import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Baby,
  Plus,
  BarChart3,
  UserCircle2
} from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">

      <NavLink to="/" end>
        <LayoutGrid strokeWidth={2.2} size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/balita">
        <Baby strokeWidth={2.2} size={22} />
        <span>Balita</span>
      </NavLink>

      <NavLink to="/input" className="nav-center">
        <div className="plus-float">
          <Plus strokeWidth={2.5} size={22} />
        </div>
        <span>Input</span>
      </NavLink>

      <NavLink to="/report">
        <BarChart3 strokeWidth={2.2} size={22} />
        <span>Report</span>
      </NavLink>

      <NavLink to="/akun">
        <UserCircle2 strokeWidth={2.2} size={22} />
        <span>Akun</span>
      </NavLink>

    </nav>
  );
}