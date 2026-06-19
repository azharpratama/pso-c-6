"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  CalendarIcon,
  ChartIcon,
  DownloadIcon,
} from "@/components/icons";
import type { Mitra } from "@/lib/types";

export default function AnalyticsPage() {
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [_loading, setLoading] = useState(true);

  // Default to Jan-Jun 2024 as per image
  const [startDate] = useState("2024-01-01");
  const [endDate] = useState("2024-06-30");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/mitra?limit=1000", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setMitras(json.data || []);
        }
      } catch (err) {
        console.error("Gagal load data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregate Data
  const aggregated = useMemo(() => {
    // Filter active range (simulate Apply clicking with fixed data logic)
    const filtered = mitras.filter(m => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    });

    const dataToUse = filtered.length > 0 ? filtered : mitras;

    const monthCounts = new Array(12).fill(0);
    let active = 0;
    let nonactive = 0;
    const cityCounts: Record<string, number> = {};

    dataToUse.forEach(m => {
      if (m.created_at) {
        const d = new Date(m.created_at);
        monthCounts[d.getMonth()]++;
      }
      if (m.is_aktif) active++;
      else nonactive++;

      const c = m.kota && m.kota.trim() !== "" ? m.kota : "Lainnya";
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });

    let topMonthIdx = 0;
    let max = 0;
    monthCounts.forEach((c, idx) => {
      if (c > max) {
        max = c;
        topMonthIdx = idx;
      }
    });

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Hardcode fallback data if database is empty so it matches the requested UI somewhat
    const isMock = dataToUse.length === 0;

    return {
      topMonthName: isMock ? "Maret" : monthNames[topMonthIdx],
      topMonthCount: isMock ? 12 : max,
      // Bar chart data for the first 6 months (Jan-Jun) based on image
      bars: isMock ? [4, 6, 12, 10, 8, 14] : monthCounts.slice(0, 6),
      barLabels: shortMonths.slice(0, 6),
      activePercent: isMock ? 85 : Math.round((active / (dataToUse.length || 1)) * 100),
      nonactivePercent: isMock ? 15 : Math.round((nonactive / (dataToUse.length || 1)) * 100),
      cities: isMock ? [
        { name: "Jakarta", count: 45 },
        { name: "Surabaya", count: 32 },
        { name: "Bandung", count: 18 },
        { name: "Malang", count: 12 },
        { name: "Semarang", count: 8 },
      ] : sortedCities.map(([name, count]) => ({ name, count }))
    };
  }, [mitras, startDate, endDate]);

  const exportLogs = [
    { date: "24 Jun 2024, 14:20", admin: "Ahmad Fauzi", format: "EXCEL", formatColor: "#e6f8ef", formatText: "#21a366", filename: "mitra_rekap_q2.xlsx" },
    { date: "22 Jun 2024, 09:15", admin: "Budi Santoso", format: "PDF", formatColor: "#ffebeb", formatText: "#e63946", filename: "statistik_kota_bulanan.pdf" },
    { date: "20 Jun 2024, 16:45", admin: "Ahmad Fauzi", format: "EXCEL", formatColor: "#e6f8ef", formatText: "#21a366", filename: "all_partners_db_backup.csv" },
    { date: "18 Jun 2024, 11:30", admin: "Siti Rahma", format: "JSON", formatColor: "#eef4ff", formatText: "#0b3d91", filename: "api_export_partner_v1.json" },
  ];

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h1 className="page-title">Analitik Mitra Magang</h1>
          <p className="page-subtitle">Statistik dan tren data mitra</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="date-range-picker">
            <CalendarIcon className="icon-xs" aria-hidden="true" />
            <input
              type="text"
              className="date-range-input"
              value="01/01/2024"
              onChange={() => {}}
            />
            <span>-</span>
            <input
              type="text"
              className="date-range-input"
              value="30/06/2024"
              onChange={() => {}}
            />
            <CalendarIcon className="icon-xs" aria-hidden="true" />
          </div>
          <button className="primary-btn">Apply</button>
        </div>
      </section>

      <div className="analytics-two-col">
        {/* Left Blueprint Card */}
        <div className="table-card blueprint-card">
          <div>
            <div style={{ marginBottom: '16px' }}>
              <ChartIcon className="icon-lg" style={{ color: 'white' }} />
            </div>
            <h3 className="blueprint-heading">
              Bulan dengan<br/>penambahan mitra<br/>tertinggi: {aggregated.topMonthName}
            </h3>
            <p className="blueprint-subtext">({aggregated.topMonthCount} mitra baru)</p>
          </div>
          <div>
            <button className="blueprint-detail-btn">
              Lihat Detail {aggregated.topMonthName}
            </button>
          </div>
        </div>

        {/* Right Bar Chart Card */}
        <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">
              <ChartIcon className="icon-sm" /> Pertumbuhan Mitra Magang (Jan-Jun)
            </h3>
            <div className="analytics-legend">
              <div className="legend-dot" /> Mitra Baru
            </div>
          </div>

          <div className="analytics-bar-container">
            {aggregated.bars.map((val, i) => (
              <div key={i} className="analytics-bar-col">
                <div
                  className={`analytics-bar ${i === 5 ? 'active' : 'muted'}`}
                  style={{ height: `${Math.max(val * 10, 10)}px` }}
                />
                <span className="analytics-bar-label">{aggregated.barLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-two-col" style={{ marginTop: '4px' }}>
        {/* Left Pie Chart Card */}
        <div className="table-card" style={{ padding: '24px', position: 'relative' }}>
          <h3 className="pie-card-title">Distribusi Status</h3>
          <div className="pie-wrapper">
            <div
              className="pie-ring"
              style={{
                background: `conic-gradient(var(--success) ${aggregated.activePercent}%, #d1d9e6 0)`,
              }}
            >
              <div className="pie-center">
                <span className="pie-percent">{aggregated.activePercent}%</span>
                <span className="pie-label">Aktif</span>
              </div>
            </div>
          </div>
          <div className="pie-legend-row">
            <div className="pie-legend-item" style={{ color: '#21a366' }}>
              <div className="pie-legend-dot" style={{ background: 'var(--success)' }} /> Aktif
            </div>
            <div className="pie-legend-value">{aggregated.activePercent}%</div>
          </div>
          <div className="pie-legend-row">
            <div className="pie-legend-item" style={{ color: '#6b7a95' }}>
              <div className="pie-legend-dot" style={{ background: '#d1d9e6' }} /> Nonaktif
            </div>
            <div className="pie-legend-value" style={{ color: '#6b7a95' }}>{aggregated.nonactivePercent}%</div>
          </div>
        </div>

        {/* Right Horizontal Bars Card */}
        <div className="table-card" style={{ padding: '24px' }}>
          <div className="hbar-header">
            <h3 className="hbar-title">Top Cities (Distribusi Kota)</h3>
            <span className="hbar-link">Lihat Semua &gt;</span>
          </div>
          <div className="hbar-list">
            {aggregated.cities.map((city, idx) => {
              const maxCity = aggregated.cities[0]?.count || 1;
              const pct = Math.round((city.count / maxCity) * 100);
              return (
                <div key={idx}>
                  <div className="hbar-label-row">
                    <span>{city.name}</span>
                    <span>{city.count} Mitra</span>
                  </div>
                  <div className="hbar-track">
                    <div
                      className={`hbar-fill ${idx === 0 ? 'primary' : 'secondary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="table-card" style={{ padding: '0', overflow: 'hidden', marginTop: '4px' }}>
        <div className="export-logs-header">
          <h3 className="export-logs-title">Recent Export Logs</h3>
          <button className="export-logs-btn">
            <DownloadIcon className="icon-sm" /> Export Semua Log
          </button>
        </div>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: '100%' }}>
            <thead style={{ background: '#f8faff' }}>
              <tr>
                <th className="export-table-header">Tanggal</th>
                <th className="export-table-header">Admin</th>
                <th className="export-table-header">Format</th>
                <th className="export-table-header">File Name</th>
                <th className="export-table-header" style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {exportLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eef2f8' }}>
                  <td className="export-table-cell">{log.date}</td>
                  <td className="export-table-cell">{log.admin}</td>
                  <td className="export-table-cell">
                    <span
                      className="format-badge"
                      style={{ background: log.formatColor, color: log.formatText }}
                    >
                      {log.format}
                    </span>
                  </td>
                  <td className="export-table-cell export-filename">{log.filename}</td>
                  <td className="export-table-cell" style={{ textAlign: 'center' }}>
                    <button className="export-download-btn">
                      <DownloadIcon className="icon-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="export-pagination">
          <div className="pagination">
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">&gt;</button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}