import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth
} from "./firebase";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Balita from "./pages/Balita";
import Input from "./pages/Input";
import Report from "./pages/Report";
import Akun from "./pages/Akun";
import Login from "./pages/Login";
import DetailBalita from "./pages/DetailBalita";
import EditBalita from "./pages/EditBalita";
import Notifikasi from "./pages/Notifikasi";
import Privasi from "./pages/Privasi";
import Kader from "./pages/Kader";
import Kegiatan from "./pages/Kegiatan";

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        (hasil) => {
          setUser(hasil);
          setLoading(false);
        }
      );

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="page">
        Loading...
      </div>
    );
  }

  function PrivateRoute({
    children
  }) {
    return user
      ? children
      : (
        <Navigate
          to="/login"
          replace
        />
      );
  }

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={
            user
              ? (
                <Navigate
                  to="/"
                  replace
                />
              )
              : (
                <Login />
              )
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >

          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="balita"
            element={<Balita />}
          />

          <Route
            path="input"
            element={<Input />}
          />

          <Route
            path="report"
            element={<Report />}
          />

          <Route
            path="akun"
            element={<Akun />}
          />

          <Route
            path="balita/:id"
            element={<DetailBalita />}
          />

          <Route
            path="edit/:id"
            element={<EditBalita />}
          />

          <Route
            path="notifikasi"
            element={<Notifikasi />}
          />

          <Route
            path="privasi"
            element={<Privasi />}
          />

          <Route
            path="kader"
            element={<Kader />}
          />

          <Route
            path="kegiatan"
            element={<Kegiatan />}
          />

        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? "/"
                  : "/login"
              }
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}