import { useState } from "react";
import {
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPass, setShowPass] =
    useState(false);

  const [modal, setModal] =
    useState(false);

  async function masuk(e) {
    e.preventDefault();

    if (!email || !password) {
      setModal(true);
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/", {
        replace: true
      });

    } catch {
      setModal(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page login-page">

      <div className="login-wrap">

        <div className="login-brand">

          <div className="login-logo">
            <Shield size={34} />
          </div>

          <p>PKM Nexus</p>

          <h1>
            Selamat Datang
          </h1>

          <span>
            Login untuk masuk ke dashboard
          </span>

        </div>

        <form
          className="form-card login-card"
          onSubmit={masuk}
        >

          <label>Email</label>

          <div className="input-icon">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />
          </div>

          <label>Password</label>

          <div className="input-icon">
            <Lock size={18} />

            <input
              type={
                showPass
                  ? "text"
                  : "password"
              }
              placeholder="Masukkan password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowPass(
                  !showPass
                )
              }
            >
              {showPass ? (
                <EyeOff
                  size={18}
                />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <button
            className="save-btn login-btn"
            disabled={loading}
          >
            {loading
              ? "Masuk..."
              : "Login"}
          </button>

        </form>

        <div className="login-copy">
          PKM Nexus v1.0
        </div>

      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>
              Login Gagal
            </h3>

            <p>
              Periksa email dan
              password Anda.
            </p>

            <div className="modal-action">
              <button
                className="save-btn"
                onClick={() =>
                  setModal(false)
                }
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