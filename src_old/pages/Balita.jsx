import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Balita() {
  const [data, setData] = useState([]);
  const [cari, setCari] = useState("");
  const [hapusId, setHapusId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "balita"),
      (snap) => {
        const hasil = snap.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        setData(hasil);
      }
    );

    return () => unsub();
  }, []);

  async function hapusData() {
    if (!hapusId) return;

    await deleteDoc(doc(db, "balita", hapusId));
    setHapusId(null);
  }

  const filterData = data.filter((item) =>
    item.nama
      ?.toLowerCase()
      .includes(cari.toLowerCase())
  );

  function warnaRisiko(r) {
  if (r === "Tinggi") return "#ef4444";
  if (r === "Sedang") return "#f59e0b";
  if (r === "Rendah") return "#22c55e";
  return "#64748b";
}

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Balita</h1>
        <span>Data Realtime Firebase</span>
      </div>

      <div className="form-card">
        <label>Total Data</label>
        <input
          value={filterData.length}
          readOnly
        />

        <label>Cari Nama Balita</label>
        <input
          placeholder="Ketik nama..."
          value={cari}
          onChange={(e) =>
            setCari(e.target.value)
          }
        />
      </div>

      {filterData.map((item) => (
        <div
          className="form-card data-card"
          key={item.id}
        >
          <div className="row-balita">

            <div className="left-balita">
              <h3 className="balita-title">
                {item.nama}
              </h3>

              <p className="mini-info">
                Umur {item.umur} bln
              </p>

              <p className="mini-info">
                {item.wilayah}
              </p>

              <span
                className="badge-mini"
                style={{
                  background:
                    warnaRisiko(
                      item.risiko
                    )
                }}
              >
                {item.risiko ||
                  "Rendah"}
              </span>
            </div>

            <div className="right-balita">

              <button
                className="mini-btn"
                onClick={() =>
                  navigate(
                    `/balita/${item.id}`
                  )
                }
              >
                Detail
              </button>

              <button
                className="mini-btn primary-btn"
                onClick={() =>
                  navigate(
                    `/edit/${item.id}`
                  )
                }
              >
                Edit
              </button>

              <button
                className="mini-btn delete-btn danger"
                onClick={() =>
                  setHapusId(item.id)
                }
              >
                Hapus
              </button>

            </div>

          </div>
        </div>
      ))}

      {hapusId && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Hapus Data</h3>

            <p>
              Yakin ingin menghapus
              data ini?
            </p>

            <div className="modal-action">

              <button
                className="mini-btn"
                onClick={() =>
                  setHapusId(null)
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