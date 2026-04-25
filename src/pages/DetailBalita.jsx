import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  useParams,
  useNavigate
} from "react-router-dom";
import {
  User,
  Calendar,
  Weight,
  Ruler,
  MapPin,
  Phone,
  FileText,
  Shield
} from "lucide-react";

export default function DetailBalita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (id) ambilData();
  }, [id]);

  async function ambilData() {
    try {
      setLoading(true);

      const ref = doc(db, "balita", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setData({
          id: snap.id,
          ...snap.data()
        });
      } else {
        setData(null);
      }
    } catch {
      alert("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }

  async function hapusData() {
    await deleteDoc(doc(db, "balita", id));
    navigate("/balita");
  }

  function warnaRisiko(r) {
    if (r === "Tinggi") return "#ef4444";
    if (r === "Sedang") return "#f59e0b";
    return "#22c55e";
  }

  if (loading) {
    return (
      <div className="page">
        <div>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <div className="form-card">
          Data tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Detail Balita</h1>
        <span>Data lengkap Firebase</span>
      </div>

      <div className="form-card data-card">

        <div className="detail-top">

          <div>
            <h3 className="balita-title">
              {data.nama || "-"}
            </h3>

            <p className="mini-info">
              ID: {data.id}
            </p>
          </div>

          <span
            className="badge-mini"
            style={{
              background: warnaRisiko(
                data.risiko
              )
            }}
          >
            {data.risiko || "Rendah"}
          </span>

        </div>

        <div className="detail-grid">

          <div className="mini-box">
            <span>
              <Calendar size={14} /> Umur
            </span>
            <strong>
              {data.umur || "-"} bln
            </strong>
          </div>

          <div className="mini-box">
            <span>
              <Weight size={14} /> Berat
            </span>
            <strong>
              {data.berat || "-"} kg
            </strong>
          </div>

          <div className="mini-box">
            <span>
              <Ruler size={14} /> Tinggi
            </span>
            <strong>
              {data.tinggi || "-"} cm
            </strong>
          </div>

          <div className="mini-box">
            <span>
              <User size={14} /> Gender
            </span>
            <strong>
              {data.jk || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <Shield size={14} /> Status Gizi
            </span>
            <strong>
              {data.gizi || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <Shield size={14} /> Imunisasi
            </span>
            <strong>
              {data.imunisasi || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <Shield size={14} /> ASI Eksklusif
            </span>
            <strong>
              {data.asi || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <User size={14} /> Orang Tua
            </span>
            <strong>
              {data.orangTua || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <Phone size={14} /> No HP
            </span>
            <strong>
              {data.hp || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <MapPin size={14} /> Alamat
            </span>
            <strong>
              {data.alamat || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <MapPin size={14} /> Provinsi
            </span>
            <strong>
              {data.provinsi || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <MapPin size={14} /> Kota / Kabupaten
            </span>
            <strong>
              {data.kota || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <MapPin size={14} /> Kecamatan
            </span>
            <strong>
              {data.kecamatan || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <MapPin size={14} /> Wilayah
            </span>
            <strong>
              {data.wilayah || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <User size={14} /> Kader
            </span>
            <strong>
              {data.kader || "-"}
            </strong>
          </div>

          <div className="mini-box full">
            <span>
              <FileText size={14} /> Catatan
            </span>
            <strong>
              {data.catatan || "-"}
            </strong>
          </div>

        </div>

        <div className="action-row">

          <button
            className="mini-btn primary-btn"
            onClick={() =>
              navigate(`/edit/${id}`)
            }
          >
            Edit
          </button>

          <button
            className="mini-btn delete-btn danger"
            onClick={() =>
              setShowDelete(true)
            }
          >
            Hapus
          </button>

        </div>

        <button
          className="mini-btn"
          onClick={() =>
            navigate("/balita")
          }
        >
          Kembali
        </button>

      </div>

      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Hapus Data</h3>

            <p>
              Yakin ingin menghapus
              data balita ini?
            </p>

            <div className="modal-action">

              <button
                className="mini-btn"
                onClick={() =>
                  setShowDelete(false)
                }
              >
                Batal
              </button>

              <button
                className="mini-btn delete-btn danger"
                onClick={hapusData}
              >
                Hapus
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}