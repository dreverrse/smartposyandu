import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export default function Input() {
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    text: ""
  });

  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);

  const kosong = {
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

    provinsi: "",
    provinsiId: "",

    kota: "",
    kotaId: "",

    kecamatan: "",
    kecamatanId: "",

    wilayah: "",

    kader: "",
    catatan: ""
  };

  const [form, setForm] = useState(kosong);

  useEffect(() => {
    ambilProvinsi();
  }, []);

  async function ambilProvinsi() {
    try {
      const res = await fetch(
        "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
      );

      const data = await res.json();
      setProvinsiList(data);
    } catch {}
  }

  async function ambilKota(id) {
    try {
      const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`
      );

      const data = await res.json();
      setKotaList(data);
    } catch {}
  }

  async function ambilKecamatan(id) {
    try {
      const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`
      );

      const data = await res.json();
      setKecamatanList(data);
    } catch {}
  }

  function isi(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function isiModal(title, text) {
    setModal({
      open: true,
      title,
      text
    });
  }

  function tutupModal() {
    setModal({
      open: false,
      title: "",
      text: ""
    });
  }

  function pilihProvinsi(e) {
    const id = e.target.value;

    const pilih = provinsiList.find(
      (item) => item.id === id
    );

    setForm({
      ...form,
      provinsiId: id,
      provinsi: pilih?.name || "",

      kota: "",
      kotaId: "",

      kecamatan: "",
      kecamatanId: "",

      wilayah: ""
    });

    setKotaList([]);
    setKecamatanList([]);

    if (id) ambilKota(id);
  }

  function pilihKota(e) {
    const id = e.target.value;

    const pilih = kotaList.find(
      (item) => item.id === id
    );

    setForm({
      ...form,
      kotaId: id,
      kota: pilih?.name || "",

      kecamatan: "",
      kecamatanId: "",

      wilayah: ""
    });

    setKecamatanList([]);

    if (id) ambilKecamatan(id);
  }

  function pilihKecamatan(e) {
    const id = e.target.value;

    const pilih = kecamatanList.find(
      (item) => item.id === id
    );

    const namaKecamatan =
      pilih?.name || "";

    const wilayahGabung =
      `${namaKecamatan}, ${form.kota}, ${form.provinsi}`;

    setForm({
      ...form,
      kecamatanId: id,
      kecamatan: namaKecamatan,
      wilayah: wilayahGabung
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

  async function simpanData(e) {
    e.preventDefault();

    if (
      !form.nama ||
      !form.umur ||
      !form.berat ||
      !form.tinggi ||
      !form.provinsi ||
      !form.kota ||
      !form.kecamatan
    ) {
      isiModal(
        "Data Belum Lengkap",
        "Silakan isi semua data wajib."
      );
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "balita"), {
        ...form,
        risiko: hitungRisiko(),
        createdAt: serverTimestamp()
      });

      setForm(kosong);
      setKotaList([]);
      setKecamatanList([]);
      setShowSuccess(true);

    } catch {
      isiModal(
        "Gagal",
        "Data gagal disimpan."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(kosong);
    setKotaList([]);
    setKecamatanList([]);
    setShowReset(false);
  }

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Input Data</h1>
        <span>Tambah Data Balita Baru</span>
      </div>

      <form
        className="form-card"
        onSubmit={simpanData}
      >

        <div className="detail-grid">

          <div className="mini-box full">
            <label>Nama Balita</label>
            <input
              name="nama"
              value={form.nama}
              onChange={isi}
              placeholder="Masukkan nama balita"
            />
          </div>

          <div className="mini-box">
            <label>Tanggal Lahir</label>
            <input
              type="date"
              name="tanggalLahir"
              value={form.tanggalLahir}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <label>Umur (bulan)</label>
            <input
              name="umur"
              value={form.umur}
              onChange={isi}
              placeholder="24"
            />
          </div>

          <div className="mini-box">
            <label>Jenis Kelamin</label>
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
            <label>Berat (kg)</label>
            <input
              name="berat"
              value={form.berat}
              onChange={isi}
              placeholder="12"
            />
          </div>

          <div className="mini-box">
            <label>Tinggi (cm)</label>
            <input
              name="tinggi"
              value={form.tinggi}
              onChange={isi}
              placeholder="85"
            />
          </div>

          <div className="mini-box">
            <label>Imunisasi</label>
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
            <label>ASI Eksklusif</label>
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
            <label>Status Gizi</label>
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
            <label>Riwayat Penyakit</label>
            <input
              name="penyakit"
              value={form.penyakit}
              onChange={isi}
              placeholder="Opsional"
            />
          </div>

          <div className="mini-box">
            <label>Nama Orang Tua</label>
            <input
              name="orangTua"
              value={form.orangTua}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <label>No HP</label>
            <input
              name="hp"
              value={form.hp}
              onChange={isi}
              placeholder="08xxxx"
            />
          </div>

          <div className="mini-box full">
            <label>Alamat</label>
            <input
              name="alamat"
              value={form.alamat}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <label>Provinsi</label>
            <select
              value={form.provinsiId}
              onChange={pilihProvinsi}
            >
              <option value="">
                Pilih Provinsi
              </option>

              {provinsiList.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mini-box full">
            <label>Kabupaten / Kota</label>
            <select
              value={form.kotaId}
              onChange={pilihKota}
            >
              <option value="">
                Pilih Kota
              </option>

              {kotaList.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mini-box full">
            <label>Kecamatan</label>
            <select
              value={form.kecamatanId}
              onChange={pilihKecamatan}
            >
              <option value="">
                Pilih Kecamatan
              </option>

              {kecamatanList.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mini-box">
            <label>Kader</label>
            <input
              name="kader"
              value={form.kader}
              onChange={isi}
            />
          </div>

          <div className="mini-box full">
            <label>Catatan</label>
            <input
              name="catatan"
              value={form.catatan}
              onChange={isi}
              placeholder="Opsional"
            />
          </div>

        </div>

        <div className="action-row">

          <button
            className="save-btn"
            disabled={loading}
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Data"}
          </button>

          <button
            type="button"
            className="mini-btn"
            onClick={() =>
              setShowReset(true)
            }
          >
            Reset
          </button>

        </div>

      </form>

      {showReset && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Reset Form</h3>

            <p>
              Semua data yang diisi
              akan dikosongkan.
            </p>

            <div className="modal-action">

              <button
                className="mini-btn"
                onClick={() =>
                  setShowReset(false)
                }
              >
                Batal
              </button>

              <button
                className="mini-btn delete-btn danger"
                onClick={resetForm}
              >
                Reset
              </button>

            </div>

          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Berhasil</h3>

            <p>
              Data balita berhasil
              disimpan.
            </p>

            <div className="modal-action">
              <button
                className="save-btn"
                onClick={() =>
                  setShowSuccess(false)
                }
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>{modal.title}</h3>

            <p>{modal.text}</p>

            <div className="modal-action">
              <button
                className="save-btn"
                onClick={tutupModal}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}