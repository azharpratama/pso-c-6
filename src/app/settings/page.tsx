"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GridIcon,
  UsersIcon,
  ChartIcon,
  SettingsIcon,
  BellIcon,
  UserCircleIcon,
} from "@/components/icons";

interface Admin {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins");
      const json = await res.json();

      if (!res.ok) {
        console.error("Error fetching admins:", json.error);
        alert("Gagal memuat data admin");
        setLoading(false);
        return;
      }

      setAdmins(json.data || []);
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmins();
  }, [router]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAddAdmin = () => {
    setEditingId(null);
    setFormData({ username: "", email: "", password: "" });
    setShowModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingId(admin.id);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "",
    });
    setShowModal(true);
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        console.error("Error deleting admin:", json.error);
        alert("Gagal menghapus admin");
        return;
      }

      alert("✓ Admin berhasil dihapus");
      fetchAdmins();
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menghapus admin");
    }
  };

  const handleSaveAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert("Silakan isi semua field");
      return;
    }

    try {
      const body = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      let res: Response;

      if (editingId) {
        res = await fetch(`/api/admins/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const json = await res.json();
        console.error("Error saving admin:", json.error);
        alert(editingId ? "Gagal memperbarui admin" : "Gagal menambah admin");
        return;
      }

      alert(editingId ? "✓ Admin berhasil diperbarui" : "✓ Admin berhasil ditambahkan");
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">ITS</div>
          <div>
            <div className="brand-title">Admin Panel</div>
            <div className="brand-subtitle">Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item"
            type="button"
            onClick={() => handleNavigation("/dashboard")}
          >
            <GridIcon className="icon-sm" aria-hidden="true" />
            Dashboard
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => handleNavigation("/partners")}
          >
            <UsersIcon className="icon-sm" aria-hidden="true" />
            Partners
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => handleNavigation("/analytics")}
          >
            <ChartIcon className="icon-sm" aria-hidden="true" />
            Analytics
          </button>
          <button
            className="nav-item active"
            type="button"
            onClick={() => handleNavigation("/settings")}
          >
            <SettingsIcon className="icon-sm" aria-hidden="true" />
            Settings
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        <div className="top-accent" />
        <header className="dashboard-topbar">
          <button
            className="topbar-icon"
            type="button"
            aria-label="Notifications"
          >
            <BellIcon className="icon-sm" aria-hidden="true" />
          </button>
          <button className="topbar-icon" type="button" aria-label="Profile">
            <UserCircleIcon className="icon-sm" aria-hidden="true" />
          </button>
        </header>

        <div className="dashboard-content">
          <section className="page-header">
            <div>
              <h1 className="page-title">Manajemen Admin</h1>
              <p className="page-subtitle">
                Kelola dan tambahkan administrator sistem.
              </p>
            </div>
            <button
              className="primary-btn"
              type="button"
              onClick={handleAddAdmin}
            >
              + Tambah Admin Baru
            </button>
          </section>

          {loading ? (
            <div className="loading-state">
              <p>Memuat data admin...</p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>
                          Belum ada admin. <button
                            type="button"
                            onClick={handleAddAdmin}
                            style={{
                              color: "var(--primary)",
                              textDecoration: "underline",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              fontWeight: "600",
                              padding: 0,
                            }}
                          >
                            Tambah admin baru
                          </button>
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin, index) => (
                        <tr key={admin.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="admin-name-cell">
                              <span className="admin-badge">
                                {admin.username.substring(0, 2).toUpperCase()}
                              </span>
                              <span>{admin.username}</span>
                            </div>
                          </td>
                          <td>{admin.email}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="action-btn edit"
                                type="button"
                                onClick={() => handleEditAdmin(admin)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="action-btn delete"
                                type="button"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                title="Hapus"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {admins.length > 0 && (
                <div className="table-footer">
                  <span>Menampilkan 1 hingga {admins.length} dari {admins.length} entri</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {editingId ? "Edit Admin" : "Tambah Admin Baru"}
                </h2>
                <p className="modal-subtitle">
                  {editingId ? "Perbarui informasi admin" : "Tambahkan administrator sistem baru"}
                </p>
              </div>
              <button
                className="close-btn"
                type="button"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="field-group">
                <label className="form-label">USERNAME</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div className="field-group">
                <label className="form-label">EMAIL</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="field-group">
                <label className="form-label">PASSWORD</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={handleSaveAdmin}
                >
                  {editingId ? "Perbarui" : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #0b3d91;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 700;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .loading-state {
          text-align: center;
          padding: 48px 24px;
          color: var(--muted);
          font-size: 14px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 20;
        }

        .modal-card {
          width: min(560px, 92vw);
          background: var(--card);
          border-radius: 16px;
          padding: 20px 22px 22px;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .modal-subtitle {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #f0f4fa;
          color: #5f6f8a;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--muted);
          font-weight: 700;
        }

        .input-field {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: #f7f9fd;
          color: #4f5f7a;
          font-family: inherit;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary);
          background: #ffffff;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .ghost-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: #ffffff;
          color: #54637f;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .ghost-btn:hover {
          background: #f8faff;
        }
      `}</style>
    </div>
  );
}