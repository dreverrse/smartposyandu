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
  Users,
  Search,
  Trophy,
  Trash2,
  UserPlus
} from "lucide-react";

export default function Kader() {
  const kosong = {
    nama: "",
    wilayah: "",
    hp: "",
    status: "Aktif",
    laporan: "",
    catatan: ""
  };

  const [form, setForm] = useState(kosong);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const [hapusId, setHapusId] = useState("");
  const [showDelete, setShowDelete] =
    useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "kader"),
      (snap) => {
        const hasil =
          snap.docs.map((d) => ({
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
      [e.target.name]:
        e.target.value
    });
  }

  async function simpan(e) {
    e.preventDefault();

    if (
      !form.nama ||
      !form.wilayah
    )
      return;

    try {
      setLoading(true);

      await addDoc(
        collection(db, "kader"),
        {
          ...form,
          laporan: Number(
            form.laporan || 0
          ),
          createdAt:
            serverTimestamp()
        }
      );

      setForm(kosong);
    } finally {
      setLoading(false);
    }
  }

  async function hapus() {
    await deleteDoc(
      doc(
        db,
        "kader",
        hapusId
      )
    );

    setShowDelete(false);
    setHapusId("");
  }

  const hasil = data
    .filter((i) =>
      i.nama
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    )
    .filter((i) =>
      filter === "Semua"
        ? true
        : i.status === filter
    );

  const total = data.length;

  const aktif = data.filter(
    (i) =>
      i.status === "Aktif"
  ).length;

  const top =
    [...data].sort(
      (a, b) =>
        (b.laporan || 0) -
        (a.laporan || 0)
    )[0];

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Kader</h1>
        <span>
          Manajemen kader posyandu
        </span>
      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon blue">
            <Users size={18} />
          </div>

          <small>Total</small>
          <h2>{total}</h2>
        </div>

        <div className="box">
          <div className="card-icon green">
            <UserPlus size={18} />
          </div>

          <small>Aktif</small>
          <h2>{aktif}</h2>
        </div>
      </div>

      <form
        className="form-card"
        onSubmit={simpan}
      >
        <div className="detail-grid">

          <div className="mini-box full">
            <label>
              Nama Kader
            </label>

            <input
              name="nama"
              value={form.nama}
              onChange={isi}
              placeholder="Masukkan nama kader"
            />
          </div>

          <div className="mini-box full">
            <label>
              Wilayah
            </label>

            <input
              name="wilayah"
              value={
                form.wilayah
              }
              onChange={isi}
              placeholder="Contoh Gayamsari"
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

          <div className="mini-box">
            <label>
              Status
            </label>

            <select
              name="status"
              value={
                form.status
              }
              onChange={isi}
            >
              <option>
                Aktif
              </option>

              <option>
                Nonaktif
              </option>
            </select>
          </div>

          <div className="mini-box">
            <label>
              Jumlah Laporan
            </label>

            <input
              name="laporan"
              value={
                form.laporan
              }
              onChange={isi}
              placeholder="0"
            />
          </div>

          <div className="mini-box full">
            <label>
              Catatan
            </label>

            <input
              name="catatan"
              value={
                form.catatan
              }
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
            : "Simpan Kader"}
        </button>

      </form>

      <div className="form-card">

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(140px,1fr))",
            gap: "10px"
          }}
        >

          <div className="mini-box">
            <label>Cari</label>

            <div
              style={{
                position:
                  "relative"
              }}
            >

              <input
                value={
                  keyword
                }
                onChange={(
                  e
                ) =>
                  setKeyword(
                    e.target
                      .value
                  )
                }
                placeholder="Cari nama"
                style={{
                  paddingLeft:
                    "36px"
                }}
              />
            </div>
          </div>

          <div className="mini-box">
            <label>
              Filter
            </label>

            <select
              value={filter}
              onChange={(
                e
              ) =>
                setFilter(
                  e.target
                    .value
                )
              }
            >
              <option>
                Semua
              </option>

              <option>
                Aktif
              </option>

              <option>
                Nonaktif
              </option>
            </select>
          </div>

        </div>

      </div>

      {hasil.map((item) => (
        <div
          key={item.id}
          className="form-card"
          style={{
            marginTop:
              "14px"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <div>
              <h3>
                {item.nama}
              </h3>

              <p className="mini-info">
                {
                  item.wilayah
                }
              </p>

              <p className="mini-info">
                {item.hp}
              </p>
            </div>

            <span
              className="badge-mini"
              style={{
                background:
                  item.status ===
                  "Aktif"
                    ? "#22c55e"
                    : "#ef4444",
                padding:
                  "6px 12px",
                borderRadius:
                  "999px",
                fontSize:
                  "12px",
                minWidth:
                  "78px",
                textAlign:
                  "center"
              }}
            >
              {item.status}
            </span>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(120px,1fr))",
              gap: "10px",
              marginTop:
                "12px"
            }}
          >

            <div className="box">
              <small>
                Laporan
              </small>

              <h2>
                {item.laporan ||
                  0}
              </h2>
            </div>

            <div className="box">
              <small>
                Catatan
              </small>

              <h2
                style={{
                  fontSize:
                    "14px"
                }}
              >
                {item.catatan ||
                  "-"}
              </h2>
            </div>

          </div>

          <button
            className="mini-btn delete-btn danger"
            style={{
              width: "100%",
              marginTop:
                "14px",
              marginBottom:
                "8px"
            }}
            onClick={() => {
              setHapusId(
                item.id
              );

              setShowDelete(
                true
              );
            }}
          >
            <Trash2
              size={16}
            />
            Hapus
          </button>

        </div>
      ))}

      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>
              Hapus Kader
            </h3>

            <p>
              Yakin hapus data
              ini?
            </p>

            <div className="modal-action">

              <button
                className="mini-btn"
                onClick={() =>
                  setShowDelete(
                    false
                  )
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