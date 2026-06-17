"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  ChartIcon,
  DownloadIcon,
  EditIcon,
  FilterIcon,
  GridIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/components/icons";

type Mitra = {
  id: string;
  nama_instansi: string | null;
  alamat: string | null;
  kota: string | null;
  keterangan: string | null;
  is_aktif: boolean | null;
  created_at: string | null;
};

type MitraFormData = {
  nama_instansi: string;
  alamat: string;
  kota: string;
  keterangan: string;
  is_aktif: boolean;
};

export default function PartnersPage() {
  const router = useRouter();
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mitra | null>(null);
  const [formData, setFormData] = useState<MitraFormData>({
    nama_instansi: "",
    alamat: "",
    kota: "",
    keterangan: "",
    is_aktif: true,
  });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New state for export
  const [exporting, setExporting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      nama_instansi: "",
      alamat: "",
      kota: "",
      keterangan: "",
      is_aktif: true,
    });
    setEditing(null);
    setActionError("");
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [listResponse, statsResponse] = await Promise.all([
        fetch("/api/mitra?limit=5", { cache: "no-store" }),
        fetch("/api/mitra/stats", { cache: "no-store" }),
      ]);

      const listResult = await listResponse.json();

      if (!listResponse.ok) {
        setError(listResult?.error ?? "Tidak dapat memuat data mitra.");
      }

      setMitra(listResult?.data ?? []);
      setTotalCount(listResult?.count ?? listResult?.data?.length ?? 0);

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setActiveCount(statsResult?.active ?? 0);
        setNewCount(statsResult?.recent ?? 0);
      }
    } catch {
      setError("Tidak dapat terhubung ke database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [router, loadData]);

  const filteredMitra = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return mitra;
    }

    return mitra.filter((item) => {
      const values = [
        item.nama_instansi,
        item.alamat,
        item.kota,
        item.keterangan,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [mitra, searchTerm]);

  const visibleEnd = filteredMitra.length;
  const totalLabel = totalCount || filteredMitra.length;
  const displayTotal = searchTerm.trim() ? filteredMitra.length : totalLabel;

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item: Mitra) => {
    setEditing(item);
    setFormData({
      nama_instansi: item.nama_instansi ?? "",
      alamat: item.alamat ?? "",
      kota: item.kota ?? "",
      keterangan: item.keterangan ?? "",
      is_aktif: item.is_aktif ?? true,
    });
    setActionError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    if (!formData.nama_instansi.trim()) {
      setActionError("Nama instansi wajib diisi.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      const response = await fetch(
        editing ? `/api/mitra/${editing.id}` : "/api/mitra",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setActionError(result?.error ?? "Gagal menyimpan data.");
        return;
      }

      closeModal();
      await loadData();
    } catch {
      setActionError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Mitra) => {
    if (deletingId || saving) {
      return;
    }

    const name = item.nama_instansi ?? "mitra ini";
    const confirmed = window.confirm(`Hapus ${name}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError("");

    try {
      const response = await fetch(`/api/mitra/${item.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error ?? "Gagal menghapus mitra.");
        return;
      }

      await loadData();
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== EXPORT FUNCTION =====
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      // Fetch all mitra (no limit)
      const response = await fetch("/api/mitra?limit=9999", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        alert("Gagal mengambil data untuk ekspor.");
        return;
      }

      const data: Mitra[] = result.data;

      if (data.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // Convert to CSV
      const headers = [
        "No",
        "Nama Instansi",
        "Alamat",
        "Kota",
        "Keterangan",
        "Status",
      ];
      const rows = data.map((item, index) => [
        index + 1,
        item.nama_instansi ?? "",
        item.alamat ?? "",
        item.kota ?? "",
        item.keterangan ?? "",
        item.is_aktif ? "Aktif" : "Nonaktif",
      ]);

      // Build CSV string
      let csv = headers.join(",") + "\n";
      rows.forEach((row) => {
        // Escape fields with commas or quotes
        const escapedRow = row.map((field) => {
          if (
            typeof field === "string" &&
            (field.includes(",") || field.includes('"'))
          ) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });
        csv += escapedRow.join(",") + "\n";
      });

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mitra_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Terjadi kesalahan saat mengekspor data.");
      console.error(err);
    } finally {
      setExporting(false);
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
            onClick={() => router.push("/dashboard")}
          >
            <GridIcon className="icon-sm" aria-hidden="true" />
            Dashboard
          </button>

          <button className="nav-item active" type="button">
            <UsersIcon className="icon-sm" aria-hidden="true" />
            Partners
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => router.push("/analytics")}
          >
            <ChartIcon className="icon-sm" aria-hidden="true" />
            Analytics
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => router.push("/settings")}
          >
            <SettingsIcon className="icon-sm" aria-hidden="true" />
            Settings
          </button>
        </nav>

        <button className="sidebar-cta" type="button" onClick={openAddModal}>
          + Add New Partner
        </button>
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
              <h1 className="page-title">Daftar Mitra Magang</h1>
              <p className="page-subtitle">
                Kelola daftar instansi mitra magang untuk mahasiswa.
              </p>
            </div>
            <button
              className="primary-btn"
              type="button"
              onClick={openAddModal}
            >
              + Tambah Mitra
            </button>
          </section>

          <section className="table-card">
            <div className="table-toolbar">
              <div className="search-input">
                <SearchIcon className="icon-sm" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Cari mitra..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <button className="filter-btn" type="button">
                <FilterIcon className="icon-sm" aria-hidden="true" />
                Filter
              </button>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Instansi</th>
                    <th>Alamat</th>
                    <th>Kota</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>Memuat data...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6}>{error}</td>
                    </tr>
                  ) : filteredMitra.length === 0 ? (
                    <tr>
                      <td colSpan={6}>Data mitra belum tersedia.</td>
                    </tr>
                  ) : (
                    filteredMitra.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.nama_instansi ?? "-"}</td>
                        <td>{item.alamat ?? "-"}</td>
                        <td>{item.kota ?? "-"}</td>
                        <td>{item.keterangan ?? "-"}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn edit"
                              type="button"
                              aria-label="Edit"
                              onClick={() => openEditModal(item)}
                              disabled={saving || deletingId === item.id}
                            >
                              <EditIcon
                                className="icon-xs"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              className="action-btn delete"
                              type="button"
                              aria-label="Delete"
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                            >
                              <TrashIcon
                                className="icon-xs"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Menampilkan {visibleEnd ? 1 : 0} hingga {visibleEnd} dari{" "}
                {displayTotal} entri
              </span>
              <div className="pagination">
                <button className="page-btn" type="button" data-disabled="true">
                  {"<"}
                </button>
                <button className="page-btn active" type="button">
                  1
                </button>
                <button className="page-btn" type="button" data-disabled="true">
                  2
                </button>
                <button className="page-btn" type="button" data-disabled="true">
                  3
                </button>
                <button className="page-btn" type="button" data-disabled="true">
                  {">"}
                </button>
              </div>
            </div>
          </section>

          <section className="summary-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Mitra Aktif</div>
                <div className="stat-icon">
                  <UsersIcon className="icon-sm" aria-hidden="true" />
                </div>
              </div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-change">+12% dari bulan lalu</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Mitra Baru (Bulan Ini)</div>
                <div className="stat-icon">
                  <ChartIcon className="icon-sm" aria-hidden="true" />
                </div>
              </div>
              <div className="stat-value">{newCount}</div>
              <div className="stat-change">+3 dari bulan lalu</div>
            </div>
            <div className="export-card">
              <div className="export-title">Unduh Laporan</div>
              <div className="export-text">
                Export data mitra dalam format Excel atau PDF untuk pelaporan.
              </div>
              <button
                className="secondary-btn"
                type="button"
                onClick={handleExport}
                disabled={exporting}
              >
                <DownloadIcon className="icon-sm" aria-hidden="true" />
                {exporting ? "Mengekspor..." : "Export Data"}
              </button>
            </div>
          </section>

          {modalOpen ? (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-card">
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title">
                      {editing ? "Edit Mitra" : "Tambah Mitra"}
                    </h2>
                    <p className="modal-subtitle">
                      Lengkapi data instansi mitra magang.
                    </p>
                  </div>
                  <button
                    className="close-btn"
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    x
                  </button>
                </div>

                <form className="modal-form" onSubmit={handleSave}>
                  <div className="field-group">
                    <label className="form-label" htmlFor="nama_instansi">
                      Nama Instansi
                    </label>
                    <div className="input-field">
                      <input
                        id="nama_instansi"
                        type="text"
                        placeholder="Nama instansi"
                        value={formData.nama_instansi}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            nama_instansi: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="form-label" htmlFor="alamat">
                      Alamat
                    </label>
                    <div className="input-field">
                      <input
                        id="alamat"
                        type="text"
                        placeholder="Alamat instansi"
                        value={formData.alamat}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            alamat: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label className="form-label" htmlFor="kota">
                        Kota
                      </label>
                      <div className="input-field">
                        <input
                          id="kota"
                          type="text"
                          placeholder="Kota"
                          value={formData.kota}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              kota: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <label className="form-label" htmlFor="status">
                        Status
                      </label>
                      <div className="input-field">
                        <select
                          id="status"
                          value={formData.is_aktif ? "active" : "inactive"}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              is_aktif: event.target.value === "active",
                            }))
                          }
                        >
                          <option value="active">Aktif</option>
                          <option value="inactive">Nonaktif</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="form-label" htmlFor="keterangan">
                      Keterangan
                    </label>
                    <div className="input-field">
                      <textarea
                        id="keterangan"
                        placeholder="Keterangan singkat"
                        value={formData.keterangan}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            keterangan: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {actionError ? (
                    <p className="form-error">{actionError}</p>
                  ) : null}

                  <div className="modal-actions">
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      Batal
                    </button>
                    <button
                      className="primary-btn"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
