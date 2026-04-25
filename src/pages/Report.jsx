import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  YAxis
} from "recharts";

import {
  Users,
  ShieldAlert,
  Activity,
  Syringe,
  Sparkles,
  UserCheck,
  MapPin,
  RefreshCw
} from "lucide-react";

export default function Report() {
  const [data, setData] = useState([]);
  const [kader, setKader] = useState([]);
  const [kegiatan, setKegiatan] =
    useState([]);

  const [loadingAi, setLoadingAi] =
    useState(false);

  const [aiText, setAiText] =
    useState("");

  const [modelUsed, setModelUsed] =
    useState("");

  useEffect(() => {
    const unsub1 = onSnapshot(
      collection(db, "balita"),
      (snap) => {
        setData(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    const unsub2 = onSnapshot(
      collection(db, "kader"),
      (snap) => {
        setKader(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    const unsub3 = onSnapshot(
      collection(db, "kegiatan"),
      (snap) => {
        setKegiatan(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const total = data.length;

  const tinggi = data.filter(
    (i) => i.risiko === "Tinggi"
  ).length;

  const sedang = data.filter(
    (i) => i.risiko === "Sedang"
  ).length;

  const rendah =
    total - tinggi - sedang;

  const giziKurang = data.filter(
    (i) => i.gizi === "Kurang"
  ).length;

  const imunLengkap =
    data.filter(
      (i) =>
        i.imunisasi ===
        "Lengkap"
    ).length;

  const persenImun =
    total > 0
      ? Math.round(
          (imunLengkap /
            total) *
            100
        )
      : 0;

  const totalKader =
    kader.length;

  const kaderAktif =
    kader.filter(
      (i) =>
        i.status ===
        "Aktif"
    ).length;

  const totalKegiatan =
    kegiatan.length;

  const pieData = [
    {
      name: "Rendah",
      value: rendah,
      color: "#22c55e"
    },
    {
      name: "Sedang",
      value: sedang,
      color: "#f59e0b"
    },
    {
      name: "Tinggi",
      value: tinggi,
      color: "#ef4444"
    }
  ];

  const wilayahMap = {};

  data.forEach((item) => {
    const nama =
      item.kecamatan ||
      item.wilayah ||
      "Lainnya";

    wilayahMap[nama] =
      (wilayahMap[nama] || 0) + 1;
  });

  kader.forEach((item) => {
    const nama =
      item.wilayah ||
      "Lainnya";

    wilayahMap[nama] =
      (wilayahMap[nama] || 0) + 1;
  });

  kegiatan.forEach((item) => {
    const nama =
      item.lokasi ||
      "Lainnya";

    wilayahMap[nama] =
      (wilayahMap[nama] || 0) + 1;
  });

  const wilayahData =
    Object.keys(
      wilayahMap
    )
      .map((key) => ({
        name: key,
        total:
          wilayahMap[key]
      }))
      .sort(
        (a, b) =>
          b.total -
          a.total
      )
      .slice(0, 5);

  const bulanNama = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des"
  ];

  const trenMap = {};

  data.forEach((item) => {
    if (!item.createdAt)
      return;

    const tgl =
      item.createdAt.toDate();

    const key =
      bulanNama[
        tgl.getMonth()
      ];

    if (!trenMap[key]) {
      trenMap[key] = {
        bulan: key,
        total: 0,
        berat: 0
      };
    }

    trenMap[key].total += 1;

    trenMap[key].berat +=
      Number(
        item.berat || 0
      );
  });

  const trenData =
    Object.values(
      trenMap
    ).map((item) => ({
      bulan: item.bulan,
      berat: Number(
        (
          item.berat /
          item.total
        ).toFixed(1)
      )
    }));

  async function generateAI() {
    try {
      setLoadingAi(true);

      const topWilayah =
        wilayahData[0]?.name ||
        "Tidak ada";

      const prompt = `
Buat insight report kesehatan balita maksimal 2 kalimat.

Total balita ${total}
Risiko tinggi ${tinggi}
Risiko sedang ${sedang}
Risiko rendah ${rendah}
Gizi kurang ${giziKurang}
Imunisasi ${persenImun}%
Total kader ${totalKader}
Kegiatan ${totalKegiatan}
Wilayah utama ${topWilayah}

Gunakan bahasa Indonesia singkat dan profesional.
`;

      const models = [
        "anthropic/claude-3-haiku",
        "google/gemini-flash-1.5",
        "meta-llama/llama-3.1-8b-instruct",
        "mistralai/mistral-small",
        "qwen/qwen-2.5-7b-instruct"
      ];

      for (const model of models) {
        try {
          const res =
            await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method:
                  "POST",
                headers: {
                  Authorization:
                    `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
                  "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                  model,
                  messages: [
                    {
                      role: "user",
                      content:
                        prompt
                    }
                  ]
                })
              }
            );

          const json =
            await res.json();

          const text =
            json.choices?.[0]
              ?.message
              ?.content;

          if (text) {
            setAiText(text);
            setModelUsed(model);
            return;
          }
        } catch {}
      }

      setAiText(
        "Semua model sedang sibuk."
      );
    } catch {
      setAiText(
        "AI gagal membaca data."
      );
    } finally {
      setLoadingAi(false);
    }
  }

  useEffect(() => {
    if (
      total > 0 ||
      totalKader > 0 ||
      totalKegiatan > 0
    ) {
      generateAI();
    }
  }, [data, kader, kegiatan]);

  function exportPDF() {
    const doc =
      new jsPDF();

    doc.setFontSize(18);
    doc.text(
      "PKM Nexus Report",
      14,
      18
    );

    autoTable(doc, {
      startY: 30,
      head: [["Statistik", "Nilai"]],
      body: [
        [
          "Total Balita",
          total
        ],
        [
          "Risiko Tinggi",
          tinggi
        ],
        [
          "Total Kader",
          totalKader
        ],
        [
          "Kader Aktif",
          kaderAktif
        ],
        [
          "Total Kegiatan",
          totalKegiatan
        ],
        [
          "Imunisasi",
          `${persenImun}%`
        ]
      ]
    });

    autoTable(doc, {
      startY:
        doc.lastAutoTable
          .finalY + 8,
      head: [
        [
          "Top Wilayah",
          "Jumlah"
        ]
      ],
      body:
        wilayahData.map(
          (i) => [
            i.name,
            i.total
          ]
        )
    });

    doc.text(
      "Insight AI:",
      14,
      doc.lastAutoTable
        .finalY + 15
    );

    doc.setFontSize(10);

    const lines =
      doc.splitTextToSize(
        aiText ||
          "Belum tersedia",
        180
      );

    doc.text(
      lines,
      14,
      doc.lastAutoTable
        .finalY + 22
    );

    doc.save(
      "PKM-Nexus-Report.pdf"
    );
  }

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Report</h1>
        <span>
          Wilayah Cerdas Analytics
        </span>
      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon blue">
            <Users size={18} />
          </div>
          <small>Balita</small>
          <h2>{total}</h2>
        </div>

        <div className="box danger">
          <div className="card-icon red">
            <ShieldAlert size={18} />
          </div>
          <small>Risiko</small>
          <h2>{tinggi}</h2>
        </div>

        <div className="box">
          <div className="card-icon green">
            <UserCheck size={18} />
          </div>
          <small>Kader</small>
          <h2>{kaderAktif}</h2>
        </div>

        <div className="box">
          <div className="card-icon orange">
            <MapPin size={18} />
          </div>
          <small>Kegiatan</small>
          <h2>
            {totalKegiatan}
          </h2>
        </div>

      </div>

      <div className="form-card">
        <label>
          Distribusi Risiko
        </label>

        <div
          style={{
            width: "100%",
            height: 280
          }}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={
                  pieData
                }
                dataKey="value"
                innerRadius={
                  55
                }
                outerRadius={
                  95
                }
              >
                {pieData.map(
                  (
                    item,
                    index
                  ) => (
                    <Cell
                      key={index}
                      fill={
                        item.color
                      }
                    />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="form-card">
        <label>
          Top Wilayah
        </label>

        <div
          style={{
            width: "100%",
            height: 300
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={
                wilayahData
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11
                }}
              />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#2563eb"
                radius={[
                  10,
                  10,
                  0,
                  0
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="form-card">
        <label>
          Tren Berat
        </label>

        <div
          style={{
            width: "100%",
            height: 280
          }}
        >
          <ResponsiveContainer>
            <LineChart
              data={
                trenData
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="berat"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ai-box">

        <div className="ai-top">
          <Sparkles size={18} />
          <h3>
            Insight AI
          </h3>

          <button
            onClick={
              generateAI
            }
            style={{
              border: "none",
              background:
                "transparent",
              marginLeft:
                "auto"
            }}
          >
            <RefreshCw
              size={18}
            />
          </button>

        </div>

        <p>
          {loadingAi
            ? "AI sedang menganalisis..."
            : aiText}
        </p>

      </div>

      <div className="status-box">
        <button
          className="save-btn"
          onClick={exportPDF}
        >
          Export PDF
        </button>
      </div>

      <div className="status-box">
        PKM Nexus Ready
      </div>

    </div>
  );
}