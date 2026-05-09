import {
  Shield,
  Lock,
  LogOut,
  EyeOff,
  Database
} from "lucide-react";

export default function Privasi() {
  return (
    <div className="page">

      <div className="akun-head">
        <h1>Privasi</h1>
        <span>Keamanan akun dan data</span>
      </div>

      <div className="form-card">

        <div className="setting-row">
          <div className="setting-left">
            <Lock size={18} />
            <span>Ganti Password</span>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <EyeOff size={18} />
            <span>Sembunyikan Data Sensitif</span>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <Database size={18} />
            <span>Backup Data</span>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <LogOut size={18} />
            <span>Logout Semua Perangkat</span>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <Shield size={18} />
            <span>Kebijakan Privasi</span>
          </div>
        </div>

      </div>

    </div>
  );
}