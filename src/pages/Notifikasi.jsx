import { Bell, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

export default function Notifikasi() {
  return (
    <div className="page">

      <div className="akun-head">
        <h1>Notifikasi</h1>
        <span>Pusat pemberitahuan sistem</span>
      </div>

      <div className="form-card">

        <div className="setting-row">
          <div className="setting-left">
            <Bell size={18} />
            <span>Reminder Imunisasi</span>
          </div>

          <div className="status-mini">
            Aktif
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <ShieldAlert size={18} />
            <span>Risiko Tinggi Baru</span>
          </div>

          <div className="status-mini warning-mini">
            Penting
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <Clock3 size={18} />
            <span>Laporan Bulanan</span>
          </div>

          <div className="status-mini">
            Otomatis
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <CheckCircle2 size={18} />
            <span>Status Database</span>
          </div>

          <div className="status-mini success-mini">
            Online
          </div>
        </div>

      </div>

    </div>
  );
}