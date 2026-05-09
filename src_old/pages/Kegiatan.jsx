import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

import {
  CalendarDays,
  Trash2,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Sparkles,
  MapPin
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

export default function Kegiatan() {
  const kosong = {
    nama: "",
    lokasi: "",
    tanggal: "",
    penanggungJawab: "",
    status: "Rencana",
    peserta: "",
    catatan: ""
  };

  const [form, setForm] = useState(kosong);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const [hapusId, setHapusId] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "kegiatan"),
      (snap) => {
        const hasil = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        setData(hasil);
      }
    );

    return () => unsub();
  }, []);

  function isi(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function simpan(e) {
    e.preventDefault();

    if (!form.nama || !form.lokasi || !form.tanggal) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "kegiatan"), {
        ...form,
        peserta: Number(form.peserta || 0),
        createdAt: serverTimestamp()
      });

      setForm(kosong);
    } finally {
      setLoading(false);
    }
  }

  async function hapus() {
    await deleteDoc(doc(db, "kegiatan", hapusId));

    setShowDelete(false);
    setHapusId("");
  }

  const hasil = data
    .filter((i) =>
      i.nama?.toLowerCase().includes(keyword.toLowerCase())
    )
    .filter((i) =>
      filter === "Semua"
        ? true
        : i.status === filter
    );

  const total = data.length;

  const selesai = data.filter(
    (i) => i.status === "Selesai"
  ).length;

  const berjalan = data.filter(
    (i) => i.status === "Berjalan"
  ).length;

  const rencana = data.filter(
    (i) => i.status === "Rencana"
  ).length;

  const pieData = [
    {
      name: "Selesai",
      value: selesai,
      color: "#22c55e"
    },
    {
      name: "Berjalan",
      value: berjalan,
      color: "#f59e0b"
    },
    {
      name: "Rencana",
      value: rencana,
      color: "#2563eb"
    }
  ];

  function insight() {
    if (total === 0) {
      return "Belum ada kegiatan terdaftar.";
    }

    if (rencana > selesai) {
      return "Agenda masih dominan rencana. Fokus pada pelaksanaan.";
    }

    if (selesai >= total / 2) {
      return "Mayoritas kegiatan telah selesai.";
    }

    return "Kegiatan berjalan stabil.";
  }

  function warnaStatus(status) {
    if (status === "Selesai") return "#22c55e";
    if (status === "Berjalan") return "#f59e0b";
    return "#2563eb";
  }

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Kegiatan</h1>
        <span>Manajemen kegiatan posyandu</span>
      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon blue">
            <CalendarDays size={18} />
          </div>
          <small>Total</small>
          <h2>{total}</h2>
        </div>

        <div className="box">
          <div className="card-icon green">
            <CheckCircle2 size={18} />
          </div>
          <small>Selesai</small>
          <h2>{selesai}</h2>
        </div>

        <div className="box">
          <div className="card-icon orange">
            <PlayCircle size={18} />
          </div>
          <small>Berjalan</small>
          <h2>{berjalan}</h2>
        </div>

        <div className="box">
          <div className="card-icon blue">
            <Clock3 size={18} />
          </div>
          <small>Rencana</small>
          <h2>{rencana}</h2>
        </div>

      </div>

      <div className="form-card">

        <div className="ai-top">
          <Sparkles size={18} />
          <h3>Status Kegiatan</h3>
        </div>

        <div style={{ width: "100%", height: 230 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {pieData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <form
        className="form-card"
        onSubmit={simpan}
      >

        <div className="detail-grid">

          <div className="mini-box full">
            <label>Nama Kegiatan</label>
            <input
              name="nama"
              value={form.nama}
              onChange={isi}
              placeholder="Contoh Posyandu Bulanan"
            />
          </div>

          <div className="mini-box full">
            <label>Lokasi</label>
            <input
              name="lokasi"
              value={form.lokasi}
              onChange={isi}
              placeholder="Balai RW 01"
            />
          </div>

          <div className="mini-box">
            <label>Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={isi}
            />
          </div>

          <div className="mini-box">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={isi}
            >
              <option>Rencana</option>
              <option>Berjalan</option>
              <option>Selesai</option>
            </select>
          </div>

          <div className="mini-box">
            <label>Peserta</label>
            <input
              name="peserta"
              value={form.peserta}
              onChange={isi}
              placeholder="0"
            />
          </div>

          <div className="mini-box full">
            <label>Penanggung Jawab</label>
            <input
              name="penanggungJawab"
              value={form.penanggungJawab}
              onChange={isi}
              placeholder="Nama kader"
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

        <button
          className="save-btn status-box"
          disabled={loading}
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Kegiatan"}
        </button>

      </form>

      <div className="ai-box">
        <div className="ai-top">
          <Sparkles size={18} />
          <h3>Insight AI</h3>
        </div>

        <p>{insight()}</p>
      </div>

      <div className="form-card">

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(160px,1fr))",
            gap: "12px",
            alignItems: "end"
          }}
        >

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "8px"
              }}
            >
              Cari
            </label>

            <input
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              placeholder="Cari kegiatan"
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                padding: "0 14px"
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "8px"
              }}
            >
              Filter
            </label>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                padding: "0 14px"
              }}
            >
              <option>Semua</option>
              <option>Rencana</option>
              <option>Berjalan</option>
              <option>Selesai</option>
            </select>
          </div>

        </div>

      </div>

      {hasil.map((item) => (
        <div
          key={item.id}
          className="form-card"
          style={{ marginTop: "14px" }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
              gap: "12px"
            }}
          >

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  marginBottom: "8px"
                }}
              >
                {item.nama}
              </h3>

              <p className="mini-info">
                <MapPin size={14} />
                {item.lokasi}
              </p>

              <p className="mini-info">
                {item.tanggal}
              </p>
            </div>

            <span
              style={{
                background:
                  warnaStatus(item.status),
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "700",
                whiteSpace: "nowrap"
              }}
            >
              {item.status}
            </span>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
              marginTop: "14px"
            }}
          >

            <div className="box">
              <small>Peserta</small>
              <h2>{item.peserta || 0}</h2>
            </div>

            <div className="box">
              <small>PJ</small>
              <h2
                style={{
                  fontSize: "15px"
                }}
              >
                {item.penanggungJawab || "-"}
              </h2>
            </div>

          </div>

          {item.catatan && (
            <p
              className="mini-info"
              style={{
                marginTop: "10px"
              }}
            >
              {item.catatan}
            </p>
          )}

          <button
            className="mini-btn delete-btn danger"
            style={{
              width: "100%",
              marginTop: "14px"
            }}
            onClick={() => {
              setHapusId(item.id);
              setShowDelete(true);
            }}
          >
            <Trash2 size={16} />
            Hapus
          </button>

        </div>
      ))}

      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Hapus Kegiatan</h3>
            <p>Yakin hapus data ini?</p>

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
                onClick={hapus}
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