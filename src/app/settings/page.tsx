"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { EditIcon, TrashIcon } from "@/components/icons";
import type { Admin } from "@/lib/types";

export default function SettingsPage() {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmins();
  }, []);

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
    <DashboardLayout>
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
                      Belum ada admin.{" "}
                      <button
                        type="button"
                        onClick={handleAddAdmin}
                        className="link-button"
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
                            <EditIcon className="icon-xs" aria-hidden="true" />
                          </button>
                          <button
                            className="action-btn delete"
                            type="button"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            title="Hapus"
                          >
                            <TrashIcon className="icon-xs" aria-hidden="true" />
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

      {showModal && (
        <Modal
          title={editingId ? "Edit Admin" : "Tambah Admin Baru"}
          subtitle={editingId ? "Perbarui informasi admin" : "Tambahkan administrator sistem baru"}
          onClose={() => setShowModal(false)}
        >
          <div className="modal-form">
            <div className="field-group">
              <label className="form-label">USERNAME</label>
              <input
                type="text"
                className="input-field-solo"
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
                className="input-field-solo"
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
                className="input-field-solo"
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
        </Modal>
      )}
    </DashboardLayout>
  );
}