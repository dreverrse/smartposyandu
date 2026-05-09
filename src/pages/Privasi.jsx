import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut
} from "firebase/auth";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import {
  Lock, EyeOff, Eye, Database, LogOut,
  Shield, ChevronRight, X, CheckCircle2,
  AlertTriangle, FileText, Trash2
} from "lucide-react";

export default function Privasi() {
  const navigate = useNavigate();
  const [sembunyikan, setSembunyikan] = useState(false);
  const [modal, setModal] = useState(null);

  const [pwForm, setPwForm] = useState({ current:"", baru:"", konfirmasi:"" });
  const [showPw, setShowPw] = useState({ current:false, baru:false, konfirmasi:false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type:"", text:"" });

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupDone, setBackupDone] = useState(false);

  const [hapusLoading, setHapusLoading] = useState(false);
  const [hapusKonfirmasi, setHapusKonfirmasi] = useState("");

  function tutupModal() {
    setModal(null);
    setPwForm({ current:"", baru:"", konfirmasi:"" });
    setPwMsg({ type:"", text:"" });
    setBackupDone(false);
    setHapusKonfirmasi("");
  }

  async function gantiPassword() {
    if (!pwForm.current || !pwForm.baru || !pwForm.konfirmasi) {
      setPwMsg({ type:"error", text:"Semua kolom wajib diisi." }); return;
    }
    if (pwForm.baru.length < 6) {
      setPwMsg({ type:"error", text:"Password baru minimal 6 karakter." }); return;
    }
    if (pwForm.baru !== pwForm.konfirmasi) {
      setPwMsg({ type:"error", text:"Password baru dan konfirmasi tidak cocok." }); return;
    }
    try {
      setPwLoading(true); setPwMsg({ type:"", text:"" });
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwForm.baru);
      setPwMsg({ type:"ok", text:"Password berhasil diubah." });
      setPwForm({ current:"", baru:"", konfirmasi:"" });
    } catch(err) {
      const map = {
        "auth/wrong-password":"Password lama salah.",
        "auth/invalid-credential":"Password lama salah.",
        "auth/too-many-requests":"Terlalu banyak percobaan. Coba lagi nanti."
      };
      setPwMsg({ type:"error", text: map[err.code] || "Gagal mengubah password." });
    } finally { setPwLoading(false); }
  }

  async function backupData() {
    try {
      setBackupLoading(true);
      const snap = await getDocs(collection(db, "balita"));
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "backup-balita-" + new Date().toISOString().slice(0,10) + ".json";
      a.click();
      URL.revokeObjectURL(url);
      setBackupDone(true);
    } catch { alert("Gagal mengunduh backup."); }
    finally { setBackupLoading(false); }
  }

  async function logoutSemua() {
    try { await signOut(auth); navigate("/login", { replace:true }); }
    catch { alert("Gagal logout."); }
  }

  async function hapusSemuaData() {
    if (hapusKonfirmasi !== "HAPUS") return;
    try {
      setHapusLoading(true);
      const snap = await getDocs(collection(db, "balita"));
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "balita", d.id))));
      tutupModal();
      alert("Semua data balita berhasil dihapus.");
    } catch { alert("Gagal menghapus data."); }
    finally { setHapusLoading(false); }
  }

  const MsgBox = ({ type, text }) => (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 16px", borderRadius:14, fontWeight:700, fontSize:14,
      background: type==="ok" ? "#f0fdf4" : "#fef2f2",
      color:       type==="ok" ? "#16a34a"  : "#dc2626"
    }}>
      {type==="ok" ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
      {text}
    </div>
  );

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Privasi &amp; Keamanan</h1>
        <span>Kelola keamanan akun dan data Anda</span>
      </div>

      <p className="privasi-section-title">Keamanan Akun</p>
      <div className="privasi-card">
        <div className="privasi-row" onClick={() => setModal("password")}>
          <div className="privasi-icon blue"><Lock size={18}/></div>
          <div className="privasi-info">
            <strong>Ganti Password</strong>
            <span>Ubah kata sandi akun Anda</span>
          </div>
          <div className="privasi-chevron"><ChevronRight size={18}/></div>
        </div>
        <div className="privasi-row" onClick={() => setModal("logout")}>
          <div className="privasi-icon orange"><LogOut size={18}/></div>
          <div className="privasi-info">
            <strong>Logout Semua Perangkat</strong>
            <span>Keluar dari semua sesi aktif</span>
          </div>
          <div className="privasi-chevron"><ChevronRight size={18}/></div>
        </div>
      </div>

      <p className="privasi-section-title">Data</p>
      <div className="privasi-card">
        <div className="privasi-row">
          <div className="privasi-icon purple"><EyeOff size={18}/></div>
          <div className="privasi-info">
            <strong>Sembunyikan Data Sensitif</strong>
            <span>Sensor berat dan tinggi di daftar balita</span>
          </div>
          <div className="privasi-action">
            <label className="privasi-toggle">
              <input type="checkbox" checked={sembunyikan} onChange={() => setSembunyikan(!sembunyikan)}/>
              <div className="privasi-toggle-track"/>
              <div className="privasi-toggle-thumb"/>
            </label>
          </div>
        </div>
        <div className="privasi-row" onClick={() => setModal("backup")}>
          <div className="privasi-icon green"><Database size={18}/></div>
          <div className="privasi-info">
            <strong>Backup Data</strong>
            <span>Unduh semua data balita sebagai JSON</span>
          </div>
          <div className="privasi-chevron"><ChevronRight size={18}/></div>
        </div>
        <div className="privasi-row" onClick={() => setModal("hapus")}>
          <div className="privasi-icon red"><Trash2 size={18}/></div>
          <div className="privasi-info">
            <strong>Hapus Semua Data Balita</strong>
            <span>Permanen dan tidak bisa dibatalkan</span>
          </div>
          <div className="privasi-chevron"><ChevronRight size={18}/></div>
        </div>
      </div>

      <p className="privasi-section-title">Informasi</p>
      <div className="privasi-card">
        <div className="privasi-row" onClick={() => setModal("kebijakan")}>
          <div className="privasi-icon blue"><FileText size={18}/></div>
          <div className="privasi-info">
            <strong>Kebijakan Privasi</strong>
            <span>Cara kami mengelola data Anda</span>
          </div>
          <div className="privasi-chevron"><ChevronRight size={18}/></div>
        </div>
        <div className="privasi-row">
          <div className="privasi-icon green"><Shield size={18}/></div>
          <div className="privasi-info">
            <strong>Status Enkripsi</strong>
            <span>Data disimpan terenkripsi di Firebase</span>
          </div>
          <div className="privasi-action">
            <span className="privasi-badge green">Aktif</span>
          </div>
        </div>
      </div>

      {/* MODAL GANTI PASSWORD */}
      {modal === "password" && (
        <div className="privasi-modal-overlay" onClick={tutupModal}>
          <div className="privasi-modal" onClick={e => e.stopPropagation()}>
            <div className="privasi-modal-head">
              <h3>Ganti Password</h3>
              <button className="privasi-modal-close" onClick={tutupModal}><X size={16}/></button>
            </div>
            <div className="privasi-modal-body">
              {pwMsg.text && <MsgBox type={pwMsg.type} text={pwMsg.text}/>}
              {["current","baru","konfirmasi"].map(k => (
                <div key={k}>
                  <label>{k==="current"?"Password Lama":k==="baru"?"Password Baru":"Konfirmasi Password Baru"}</label>
                  <div className="privasi-input-wrap">
                    <input
                      type={showPw[k] ? "text" : "password"}
                      placeholder={k==="current"?"Masukkan password lama":k==="baru"?"Minimal 6 karakter":"Ulangi password baru"}
                      value={pwForm[k]}
                      onChange={e => setPwForm({ ...pwForm, [k]:e.target.value })}
                    />
                    <button onClick={() => setShowPw({ ...showPw, [k]:!showPw[k] })}>
                      {showPw[k] ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="privasi-modal-footer">
              <button className="mini-btn" onClick={tutupModal}>Batal</button>
              <button className="save-btn" onClick={gantiPassword} disabled={pwLoading}>
                {pwLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BACKUP */}
      {modal === "backup" && (
        <div className="privasi-modal-overlay" onClick={tutupModal}>
          <div className="privasi-modal" onClick={e => e.stopPropagation()}>
            <div className="privasi-modal-head">
              <h3>Backup Data</h3>
              <button className="privasi-modal-close" onClick={tutupModal}><X size={16}/></button>
            </div>
            <div className="privasi-info-box">
              <strong>Apa yang diunduh?</strong>
              Semua data balita (nama, berat, tinggi, risiko, imunisasi, dan lokasi) diunduh sebagai file JSON.
            </div>
            {backupDone && <MsgBox type="ok" text="File berhasil diunduh."/>}
            <div className="privasi-modal-footer">
              <button className="mini-btn" onClick={tutupModal}>Tutup</button>
              <button className="save-btn" onClick={backupData} disabled={backupLoading}>
                {backupLoading ? "Mengunduh..." : "Unduh Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {modal === "logout" && (
        <div className="privasi-modal-overlay" onClick={tutupModal}>
          <div className="privasi-modal" onClick={e => e.stopPropagation()}>
            <div className="privasi-modal-head">
              <h3>Logout Semua Perangkat</h3>
              <button className="privasi-modal-close" onClick={tutupModal}><X size={16}/></button>
            </div>
            <div className="privasi-info-box">
              <strong>Perhatian</strong>
              Anda akan keluar dari semua sesi aktif dan perlu login kembali.
            </div>
            <div className="privasi-modal-footer">
              <button className="mini-btn" onClick={tutupModal}>Batal</button>
              <button className="save-btn" style={{background:"linear-gradient(135deg,#ef4444,#dc2626)"}} onClick={logoutSemua}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {modal === "hapus" && (
        <div className="privasi-modal-overlay" onClick={tutupModal}>
          <div className="privasi-modal" onClick={e => e.stopPropagation()}>
            <div className="privasi-modal-head">
              <h3>Hapus Semua Data</h3>
              <button className="privasi-modal-close" onClick={tutupModal}><X size={16}/></button>
            </div>
            <div className="privasi-info-box" style={{borderColor:"#fecaca",background:"#fff5f5"}}>
              <strong style={{color:"#dc2626"}}>Peringatan!</strong>
              <span style={{color:"#7f1d1d"}}>
                Semua data balita akan dihapus secara permanen. Tidak bisa dipulihkan.
              </span>
            </div>
            <div style={{marginTop:16}}>
              <label>Ketik HAPUS untuk konfirmasi</label>
              <input placeholder="HAPUS" value={hapusKonfirmasi} onChange={e => setHapusKonfirmasi(e.target.value)}/>
            </div>
            <div className="privasi-modal-footer">
              <button className="mini-btn" onClick={tutupModal}>Batal</button>
              <button
                className="save-btn delete-btn"
                onClick={hapusSemuaData}
                disabled={hapusKonfirmasi !== "HAPUS" || hapusLoading}
              >
                {hapusLoading ? "Menghapus..." : "Hapus Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KEBIJAKAN */}
      {modal === "kebijakan" && (
        <div className="privasi-modal-overlay" onClick={tutupModal}>
          <div className="privasi-modal" onClick={e => e.stopPropagation()}>
            <div className="privasi-modal-head">
              <h3>Kebijakan Privasi</h3>
              <button className="privasi-modal-close" onClick={tutupModal}><X size={16}/></button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[
                ["Pengumpulan Data","Aplikasi hanya mengumpulkan data yang Anda masukkan langsung, yaitu data balita seperti nama, usia, berat, tinggi, imunisasi, dan lokasi."],
                ["Penyimpanan Data","Semua data disimpan di Firebase Firestore milik Google dengan enkripsi standar industri. Tidak ada data yang dikirim ke server pihak ketiga lainnya."],
                ["Akses Data","Hanya pengguna yang telah login dengan akun terdaftar yang dapat mengakses data."],
                ["Penghapusan Data","Anda dapat menghapus semua data kapan saja melalui menu Hapus Semua Data di halaman ini."]
              ].map(([judul, isi]) => (
                <div key={judul} className="privasi-info-box">
                  <strong>{judul}</strong>
                  {isi}
                </div>
              ))}
            </div>
            <div className="privasi-modal-footer" style={{gridTemplateColumns:"1fr"}}>
              <button className="save-btn" onClick={tutupModal}>Mengerti</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
