import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  useParams,
  useNavigate
} from "react-router-dom";

export default function EditBalita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [simpan, setSimpan] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    tanggalLahir: "",
    umur: "",
    jk: "",
    berat: "",
    tinggi: "",
    imunisasi: "",
    asi: "",
    penyakit: "",
    gizi: "",
    orangTua: "",
    hp: "",
    alamat: "",
    wilayah: "",
    kader: "",
    catatan: ""
  });

  useEffect(() => {
    if (id) ambilData();
  }, [id]);

  async function ambilData() {
    try {
      const ref = doc(db, "balita", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setForm({
          nama: snap.data().nama || "",
          tanggalLahir: snap.data().tanggalLahir || "",
          umur: snap.data().umur || "",
          jk: snap.data().jk || "",
          berat: snap.data().berat || "",
          tinggi: snap.data().tinggi || "",
          imunisasi: snap.data().imunisasi || "",
          asi: snap.data().asi || "",
          penyakit: snap.data().penyakit || "",
          gizi: snap.data().gizi || "",
          orangTua: snap.data().orangTua || "",
          hp: snap.data().hp || "",
          alamat: snap.data().alamat || "",
          wilayah: snap.data().wilayah || "",
          kader: snap.data().kader || "",
          catatan: snap.data().catatan || ""
        });
      }
    } catch {
      alert("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }

  function isi(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function hitungRisiko() {
    let skor = 0;

    if (Number(form.berat) < 10) skor++;
    if (Number(form.tinggi) < 80) skor++;
    if (form.imunisasi === "Belum Lengkap") skor++;
    if (form.gizi === "Kurang") skor++;

    if (skor >= 3) return "Tinggi";
    if (skor >= 1) return "Sedang";
    return "Rendah";
  }

  async function updateData(e) {
    e.preventDefault();

    if (
      !form.nama ||
      !form.umur ||
      !form.berat ||
      !form.tinggi ||
      !form.wilayah
    ) {
      alert("Lengkapi data wajib");
      return;
    }

    try {
      setSimpan(true);

      await updateDoc(doc(db, "balita", id), {
        ...form,
        risiko: hitungRisiko()
      });

      navigate(`/balita/${id}`);
    } catch {
      alert("Gagal update data");
    } finally {
      setSimpan(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Edit Balita</h1>
        <span>Perbarui informasi data</span>
      </div>

      <form
        className="form-card data-card"
        onSubmit={updateData}
      >

        <div className="detail-grid">

          <div className="mini-box full">
            <span>Nama Balita</span>
            <input
              name="nama"
              value={form.nama}
              onChange={isi}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="mini-box">
            <span>Tanggal Lahir</span>
            <input
              type="date"
              name="tanggalLahir"
              value={form.tanggalLahir}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Umur (bulan)</span>
            <input
              name="umur"
              value={form.umur}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Jenis Kelamin</span>
            <select
              name="jk"
              value={form.jk}
              onChange={isi}
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">
                Laki-laki
              </option>
              <option value="Perempuan">
                Perempuan
              </option>
            </select>
          </div>

          <div className="mini-box">
            <span>Berat (kg)</span>
            <input
              name="berat"
              value={form.berat}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Tinggi (cm)</span>
            <input
              name="tinggi"
              value={form.tinggi}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Imunisasi</span>
            <select
              name="imunisasi"
              value={form.imunisasi}
              onChange={isi}
            >
              <option value="">Pilih</option>
              <option value="Lengkap">
                Lengkap
              </option>
              <option value="Belum Lengkap">
                Belum Lengkap
              </option>
            </select>
          </div>

          <div className="mini-box">
            <span>ASI Eksklusif</span>
            <select
              name="asi"
              value={form.asi}
              onChange={isi}
            >
              <option value="">Pilih</option>
              <option value="Ya">Ya</option>
              <option value="Tidak">
                Tidak
              </option>
            </select>
          </div>

          <div className="mini-box">
            <span>Status Gizi</span>
            <select
              name="gizi"
              value={form.gizi}
              onChange={isi}
            >
              <option value="">Pilih</option>
              <option value="Baik">
                Baik
              </option>
              <option value="Kurang">
                Kurang
              </option>
            </select>
          </div>

          <div className="mini-box full">
            <span>Riwayat Penyakit</span>
            <input
              name="penyakit"
              value={form.penyakit}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <span>Nama Orang Tua</span>
            <input
              name="orangTua"
              value={form.orangTua}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <span>No HP</span>
            <input
              name="hp"
              value={form.hp}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <span>Alamat</span>
            <input
              name="alamat"
              value={form.alamat}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Wilayah</span>
            <input
              name="wilayah"
              value={form.wilayah}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <span>Kader</span>
            <input
              name="kader"
              value={form.kader}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <span>Catatan</span>
            <input
              name="catatan"
              value={form.catatan}
              onChange={isi}
            />
          </div>

        </div>

        <div className="action-row">

          <button
            type="submit"
            className="save-btn"
            disabled={simpan}
          >
            {simpan
              ? "Menyimpan..."
              : "Update Data"}
          </button>

          <button
            type="button"
            className="mini-btn"
            onClick={() =>
              setShowCancel(true)
            }
          >
            Batal
          </button>

        </div>

      </form>

      {showCancel && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Batal Edit</h3>

            <p>
              Perubahan yang belum
              disimpan akan hilang.
            </p>

            <div className="modal-action">

              <button
                className="mini-btn"
                onClick={() =>
                  setShowCancel(false)
                }
              >
                Lanjut Edit
              </button>

              <button
                className="mini-btn delete-btn danger"
                onClick={() =>
                  navigate(
                    `/balita/${id}`
                  )
                }
              >
                Keluar
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}