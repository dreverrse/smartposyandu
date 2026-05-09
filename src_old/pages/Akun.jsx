import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  User,
  Shield,
  LogOut,
  Bell,
  Database,
  ChevronRight,
  Users,
  CalendarDays,
  Activity
} from "lucide-react";

export default function Akun() {
  const navigate =
    useNavigate();

  const nama =
    "Admin";

  const role =
    "Administrator";

  const versi =
    "PKM Nexus v1.0";

  const [dbOnline, setDbOnline] =
    useState(true);

  const [totalKader, setTotalKader] =
    useState(0);

  const [
    totalKegiatan,
    setTotalKegiatan
  ] = useState(0);

  useEffect(() => {
    function cekStatus() {
      setDbOnline(
        navigator.onLine
      );
    }

    cekStatus();

    window.addEventListener(
      "online",
      cekStatus
    );

    window.addEventListener(
      "offline",
      cekStatus
    );

    const unsub1 =
      onSnapshot(
        collection(
          db,
          "kader"
        ),
        (snap) => {
          setTotalKader(
            snap.size
          );
        }
      );

    const unsub2 =
      onSnapshot(
        collection(
          db,
          "kegiatan"
        ),
        (snap) => {
          setTotalKegiatan(
            snap.size
          );
        }
      );

    return () => {
      window.removeEventListener(
        "online",
        cekStatus
      );

      window.removeEventListener(
        "offline",
        cekStatus
      );

      unsub1();
      unsub2();
    };
  }, []);

  const jam =
    new Date().getHours();

  let sapa =
    "Selamat Malam";

  if (
    jam >= 5 &&
    jam < 11
  ) {
    sapa =
      "Selamat Pagi";
  } else if (
    jam >= 11 &&
    jam < 15
  ) {
    sapa =
      "Selamat Siang";
  } else if (
    jam >= 15 &&
    jam < 18
  ) {
    sapa =
      "Selamat Sore";
  }

  async function logout() {
    try {
      await signOut(auth);

      navigate(
        "/login",
        {
          replace: true
        }
      );
    } catch {
      alert(
        "Logout gagal"
      );
    }
  }

  return (
    <div className="page">

      <div className="akun-head">
        <p>
          {sapa} 👋
        </p>

        <h1>Akun</h1>

        <span>
          Profil dan pengaturan aplikasi
        </span>
      </div>

      <div className="form-card profile-card">

        <div className="profile-avatar">
          <User size={34} />
        </div>

        <div className="profile-info">
          <h3>
            {nama}
          </h3>

          <p>
            Kelola data balita realtime
          </p>

          <div className="role-badge">
            {role}
          </div>
        </div>

      </div>

      <div className="grid-2">

        <div className="box">
          <div className="card-icon green">
            <Shield size={20} />
          </div>

          <small>Status Sistem</small>
          <h2>Aman</h2>
        </div>

        <div className="box">
          <div className="card-icon orange">
            <Database size={20} />
          </div>

          <small>Database</small>

          <h2
            className={
              dbOnline
                ? "status-online"
                : "status-offline"
            }
          >
            <span className="dot-status"></span>

            {dbOnline
              ? "Online"
              : "Offline"}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon blue">
            <Users size={20} />
          </div>

          <small>Kader</small>
          <h2>
            {totalKader}
          </h2>
        </div>

        <div className="box">
          <div className="card-icon red">
            <CalendarDays size={20} />
          </div>

          <small>Kegiatan</small>
          <h2>
            {totalKegiatan}
          </h2>
        </div>

      </div>

      <div className="form-card settings-card">

        <div
          className="setting-row"
          onClick={() =>
            navigate("/kader")
          }
        >
          <div className="setting-left">
            <Users size={18} />
            <span>
              Data Kader
            </span>
          </div>

          <div className="setting-right">
            <ChevronRight size={18} />
          </div>
        </div>

        <div
          className="setting-row"
          onClick={() =>
            navigate("/kegiatan")
          }
        >
          <div className="setting-left">
            <CalendarDays size={18} />
            <span>
              Kegiatan
            </span>
          </div>

          <div className="setting-right">
            <ChevronRight size={18} />
          </div>
        </div>

        <div
          className="setting-row"
          onClick={() =>
            navigate("/report")
          }
        >
          <div className="setting-left">
            <Activity size={18} />
            <span>
              Report
            </span>
          </div>

          <div className="setting-right">
            <ChevronRight size={18} />
          </div>
        </div>

        <div
          className="setting-row"
          onClick={() =>
            navigate("/notifikasi")
          }
        >
          <div className="setting-left">
            <Bell size={18} />
            <span>
              Notifikasi
            </span>
          </div>

          <div className="setting-right">
            <ChevronRight size={18} />
          </div>
        </div>

        <div
          className="setting-row"
          onClick={() =>
            navigate("/privasi")
          }
        >
          <div className="setting-left">
            <Shield size={18} />
            <span>
              Privasi
            </span>
          </div>

          <div className="setting-right">
            <ChevronRight size={18} />
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-left">
            <Database size={18} />
            <span>
              {versi}
            </span>
          </div>

          <div className="status-mini">
            Stable
          </div>
        </div>

      </div>

      <button
        className="logout-btn status-box"
        onClick={logout}
      >
        <LogOut
          size={22}
          strokeWidth={2.4}
        />

        <span>
          Logout
        </span>
      </button>

    </div>
  );
}