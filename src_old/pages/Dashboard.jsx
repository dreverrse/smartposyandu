import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wifi,
  Weight,
  Ruler,
  RefreshCw,
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Target
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [kader, setKader] = useState([]);
  const [kegiatan, setKegiatan] =
    useState([]);

  const [aiText, setAiText] =
    useState("");

  const [loadingAi, setLoadingAi] =
    useState(false);

  const [modelUsed, setModelUsed] =
    useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "balita"),
      (snapshot) => {
        const hasil =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data()
            })
          );

        setData(hasil);
      }
    );

    const unsubKader =
      onSnapshot(
        collection(
          db,
          "kader"
        ),
        (snapshot) => {
          const hasil =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data()
              })
            );

          setKader(hasil);
        }
      );

    const unsubKegiatan =
      onSnapshot(
        collection(
          db,
          "kegiatan"
        ),
        (snapshot) => {
          const hasil =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data()
              })
            );

          setKegiatan(
            hasil
          );
        }
      );

    return () => {
      unsub();
      unsubKader();
      unsubKegiatan();
    };
  }, []);

  const total = data.length;

  const tinggi = data.filter(
    (i) => i.risiko === "Tinggi"
  ).length;

  const sedang = data.filter(
    (i) => i.risiko === "Sedang"
  ).length;

  const aman =
    total - tinggi - sedang;

  const rataBerat =
    total > 0
      ? (
          data.reduce(
            (a, b) =>
              a +
              Number(
                b.berat || 0
              ),
            0
          ) / total
        ).toFixed(1)
      : 0;

  const rataTinggi =
    total > 0
      ? (
          data.reduce(
            (a, b) =>
              a +
              Number(
                b.tinggi || 0
              ),
            0
          ) / total
        ).toFixed(1)
      : 0;

  const pieData = [
    {
      name: "Tinggi",
      value: tinggi
    },
    {
      name: "Sedang",
      value: sedang
    },
    {
      name: "Aman",
      value: aman
    }
  ];

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#22c55e"
  ];

  const wilayahMap = {};

  data.forEach((item) => {
    const nama =
      item.wilayah ||
      "Lainnya";

    wilayahMap[nama] =
      (wilayahMap[nama] || 0) + 1;
  });

  const wilayahData =
    Object.keys(wilayahMap)
      .map((key) => ({
        wilayah: key,
        total:
          wilayahMap[key]
      }))
      .sort(
        (a, b) =>
          b.total - a.total
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
        berat: 0,
        tinggi: 0
      };
    }

    trenMap[key].total += 1;

    trenMap[key].berat +=
      Number(
        item.berat || 0
      );

    trenMap[key].tinggi +=
      Number(
        item.tinggi || 0
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
      ),
      tinggi: Number(
        (
          item.tinggi /
          item.total
        ).toFixed(1)
      )
    }));

  const kaderAktif =
    kader.filter(
      (i) =>
        i.status ===
        "Aktif"
    ).length;

  const totalKegiatan =
    kegiatan.length;

  const kegiatanSelesai =
    kegiatan.filter(
      (i) =>
        i.status ===
        "Selesai"
    ).length;

  const targetTotal =
    kegiatan.reduce(
      (a, b) =>
        a +
        Number(
          b.target || 0
        ),
      0
    );

  const hadirTotal =
    kegiatan.reduce(
      (a, b) =>
        a +
        Number(
          b.hadir || 0
        ),
      0
    );

  const capaian =
    targetTotal > 0
      ? Math.round(
          (hadirTotal /
            targetTotal) *
            100
        )
      : 0;

  function insight() {
    if (tinggi > 0) {
      return `${tinggi} balita berisiko tinggi dan membutuhkan penanganan segera.`;
    }

    if (sedang > 0) {
      return `${sedang} balita perlu pemantauan rutin berkala.`;
    }

    return "Seluruh balita berada pada kondisi sehat dan stabil.";
  }

  async function generateAI() {
    try {
      setLoadingAi(true);

      const topWilayah =
        wilayahData[0]
          ?.wilayah ||
        "Tidak ada";

      const prompt = `
Buat insight dashboard balita maksimal 2 kalimat.

Total balita ${total}
Risiko tinggi ${tinggi}
Risiko sedang ${sedang}
Rata berat ${rataBerat}
Rata tinggi ${rataTinggi}
Wilayah utama ${topWilayah}
Kader aktif ${kaderAktif}
Total kegiatan ${totalKegiatan}

Gunakan bahasa Indonesia singkat dan profesional.
`;

      const models = [
        "anthropic/claude-3-haiku",
        "google/gemini-flash-1.5",
        "meta-llama/llama-3.1-8b-instruct",
        "mistralai/mistral-small"
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
                body: JSON.stringify(
                  {
                    model,
                    messages:
                      [
                        {
                          role:
                            "user",
                          content:
                            prompt
                        }
                      ]
                  }
                )
              }
            );

          const json =
            await res.json();

          const text =
            json.choices?.[0]
              ?.message
              ?.content;

          if (text) {
            setAiText(
              text
            );

            setModelUsed(
              model
            );

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
    if (total > 0) {
      generateAI();
    }
  }, [data, kader, kegiatan]);

  const today =
    new Date().toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

  return (
    <div className="page">

      <div className="akun-head">
        <h1>Dashboard</h1>

        <span>
          Ultra Premium Analytics
        </span>

        <p
          className="mini-info"
          style={{
            marginTop: "6px"
          }}
        >
          {today}
        </p>
      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon blue">
            <Users size={20} />
          </div>
          <small>Total Balita</small>
          <h2>{total}</h2>
        </div>

        <div className="box danger">
          <div className="card-icon red">
            <ShieldAlert size={20} />
          </div>
          <small>Perhatian</small>
          <h2>
            {tinggi +
              sedang}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon green">
            <Weight size={20} />
          </div>
          <small>Rata Berat</small>
          <h2>
            {rataBerat} kg
          </h2>
        </div>

        <div className="box">
          <div className="card-icon orange">
            <Ruler size={20} />
          </div>
          <small>Rata Tinggi</small>
          <h2>
            {rataTinggi} cm
          </h2>
        </div>

      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon blue">
            <UserCheck size={20} />
          </div>
          <small>Kader Aktif</small>
          <h2>
            {kaderAktif}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon green">
            <CalendarDays size={20} />
          </div>
          <small>Kegiatan</small>
          <h2>
            {totalKegiatan}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon orange">
            <CheckCircle2 size={20} />
          </div>
          <small>Selesai</small>
          <h2>
            {kegiatanSelesai}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon red">
            <Target size={20} />
          </div>
          <small>Capaian</small>
          <h2>
            {capaian}%
          </h2>
        </div>

      </div>

      <div className="form-card">

        <div className="ai-top">
          <ShieldCheck size={18} />
          <h3>Grafik Risiko</h3>
        </div>

        <ResponsiveContainer
          width="100%"
          height={260}
        >
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={90}
              label
            >
              {pieData.map(
                (
                  item,
                  index
                ) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[index]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

      </div>

      <div className="form-card">

        <div className="ai-top">
          <Users size={18} />
          <h3>
            Sebaran Wilayah
          </h3>
        </div>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart
            data={
              wilayahData
            }
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={
                false
              }
            />

            <XAxis
              dataKey="wilayah"
              tick={{
                fontSize: 11
              }}
            />

            <YAxis
              allowDecimals={
                false
              }
            />

            <Tooltip />

            <Bar
              dataKey="total"
              radius={[
                10,
                10,
                0,
                0
              ]}
            >
              {wilayahData.map(
                (
                  item,
                  index
                ) => (
                  <Cell
                    key={
                      index
                    }
                    fill={
                      index ===
                      0
                        ? "#2563eb"
                        : "#60a5fa"
                    }
                  />
                )
              )}
            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

      <div className="form-card">

        <div className="ai-top">
          <Weight size={18} />
          <h3>
            Tren Pertumbuhan
          </h3>
        </div>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart
            data={
              trenData
            }
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="bulan"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="berat"
              stroke="#22c55e"
              strokeWidth={3}
              dot
            />

            <Line
              type="monotone"
              dataKey="tinggi"
              stroke="#f59e0b"
              strokeWidth={3}
              dot
            />

          </LineChart>
        </ResponsiveContainer>

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
            : aiText ||
              insight()}
        </p>

      </div>

      <div className="status-box">
        <Wifi size={18} />
        Firebase Connected
      </div>

    </div>
  );
}