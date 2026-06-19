"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { ChartIcon, UsersIcon } from "@/components/icons";
import type {
  DashboardStats,
  Activity,
  CityDistribution,
  MonthlyGrowth,
} from "@/lib/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalActive: 0,
    totalPartners: 0,
    newThisMonth: 0,
    activeGrowth: 0,
    newGrowth: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cityData, setCityData] = useState<CityDistribution[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyGrowth[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"last6" | "thisYear">(
    "last6",
  );
  const [loadingChart, setLoadingChart] = useState(false);

  // Date is computed once
  const [currentDate] = useState(() => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("id-ID", dateOptions);
  });

  // Fetch monthly growth data based on selected period
  const fetchMonthlyData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const response = await fetch(
        `/api/mitra/monthly-growth?period=${selectedPeriod}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (response.ok) {
        setMonthlyData(result?.data ?? []);
      } else {
        console.error("Failed to fetch monthly data:", result.error);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingChart(false);
    }
  }, [selectedPeriod]);

  // Fetch all other dashboard data (stats, cities, activities)
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch stats
      const statsResponse = await fetch("/api/mitra/stats", {
        cache: "no-store",
      });
      const statsResult = await statsResponse.json();

      if (statsResponse.ok) {
        setStats({
          totalActive: statsResult?.active ?? 0,
          totalPartners: statsResult?.total ?? 0,
          newThisMonth: statsResult?.recent ?? 0,
          activeGrowth: statsResult?.activeGrowth ?? 12,
          newGrowth: statsResult?.newGrowth ?? 3,
        });
      }

      // Fetch city distribution
      const cityResponse = await fetch("/api/mitra/cities", {
        cache: "no-store",
      });
      const cityResult = await cityResponse.json();
      if (cityResponse.ok) {
        setCityData(cityResult?.data ?? []);
      }

      // Fetch recent activities
      const activityResponse = await fetch("/api/mitra/activities", {
        cache: "no-store",
      });
      const activityResult = await activityResponse.json();
      if (activityResponse.ok) {
        setActivities(activityResult?.data ?? []);
      }
    } catch {
      setError("Tidak dapat memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboardData();
    void fetchMonthlyData();
  }, [loadDashboardData, fetchMonthlyData]);

  // Refetch monthly data when period changes (but skip initial mount)
  useEffect(() => {
    if (monthlyData.length > 0 || !loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchMonthlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const getIconForActivity = (icon: Activity["icon"]) => {
    switch (icon) {
      case "add":
        return "➕";
      case "edit":
        return "✏️";
      case "delete":
        return "🗑️";
      case "download":
        return "⬇️";
      default:
        return "📌";
    }
  };

  const getMaxCount = () => {
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map((item) => item.count));
  };

  const getPeriodLabel = () => {
    const now = new Date();
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    if (selectedPeriod === "last6") {
      const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return `${monthNames[startMonth.getMonth()]} ${startMonth.getFullYear()} - ${monthNames[endMonth.getMonth()]} ${endMonth.getFullYear()}`;
    } else {
      return `Januari ${now.getFullYear()} - ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
  };

  return (
    <DashboardLayout
      showSearch
      searchPlaceholder="Cari mitra, laporan, atau aktivitas..."
      sidebarCta={
        <button className="sidebar-cta" type="button">
          + Add New Partner
        </button>
      }
    >
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <h1 className="welcome-title">Selamat datang, Admin!</h1>
          <p className="welcome-date">{currentDate}</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="summary-grid">
        <StatCard
          title="Total Mitra Aktif"
          value={stats.totalActive}
          icon={<UsersIcon className="icon-sm" aria-hidden="true" />}
          change={`+${stats.activeGrowth}% dari bulan lalu`}
          changeType="positive"
        />
        <StatCard
          title="Mitra Baru (Bulan Ini)"
          value={stats.newThisMonth}
          icon={<ChartIcon className="icon-sm" aria-hidden="true" />}
          change={`+${stats.newGrowth} dari bulan lalu`}
          changeType="positive"
        />
        <StatCard
          title="Total Mitra Keseluruhan"
          value={stats.totalPartners}
          icon={<UsersIcon className="icon-sm" aria-hidden="true" />}
          change="termasuk mitra non-aktif"
        />
      </section>

      {/* Charts & Cities Grid */}
      <section className="charts-grid">
        {/* Monthly Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Grafik Pertumbuhan Mitra</h3>
            <select
              className="chart-select"
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value as "last6" | "thisYear")
              }
            >
              <option value="last6">6 Bulan Terakhir</option>
              <option value="thisYear">Tahun Ini</option>
            </select>
          </div>
          <div className="chart-container">
            {loadingChart ? (
              <div className="chart-placeholder">Memuat data...</div>
            ) : monthlyData.length === 0 ? (
              <div className="chart-placeholder">Belum ada data mitra</div>
            ) : (
              monthlyData.map((item, index) => {
                const max = getMaxCount();
                const height = max > 0 ? (item.count / max) * 100 : 0;
                const isHighest = item.count === max && max > 0;
                return (
                  <div key={index} className="chart-bar-group">
                    <div
                      className={`chart-bar ${isHighest ? "highest" : ""}`}
                      style={{ height: `${height}%` }}
                      title={`${item.month}: ${item.count} mitra`}
                    />
                    <span className="chart-label">{item.month}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="chart-footer">
            <span className="chart-period">{getPeriodLabel()}</span>
          </div>
        </div>

        {/* City Distribution */}
        <div className="city-card">
          <h3 className="chart-title">Distribusi Kota</h3>
          <div className="city-list">
            {loading ? (
              <div>Memuat data...</div>
            ) : cityData.length === 0 ? (
              <div>Belum ada data kota</div>
            ) : (
              cityData.map((item, index) => {
                const max = Math.max(...cityData.map((c) => c.count));
                const width = max > 0 ? (item.count / max) * 100 : 0;
                return (
                  <div key={index} className="city-item">
                    <div className="city-row">
                      <span className="city-name">{item.city}</span>
                      <span className="city-count">{item.count} Mitra</span>
                    </div>
                    <div className="city-bar-bg">
                      <div
                        className="city-bar"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button className="city-view-all">Lihat semua kota →</button>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="activity-card">
        <div className="activity-header">
          <h3 className="chart-title">Aktivitas Terbaru</h3>
          <button className="activity-more" type="button">
            ⋮
          </button>
        </div>
        <div className="activity-list">
          {loading ? (
            <div className="activity-item">Memuat aktivitas...</div>
          ) : activities.length === 0 ? (
            <div className="activity-item">Belum ada aktivitas.</div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">
                  {getIconForActivity(item.icon)}
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <span className="activity-user">Admin</span>{" "}
                    {item.description}
                  </p>
                  <p className="activity-time">{item.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="activity-footer">
          <button className="activity-load-more" type="button">
            Muat Aktivitas Lainnya
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          © 2023 Institut Teknologi Sepuluh Nopember - Internship Management
          System
        </p>
        <div className="footer-links">
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Ketentuan Layanan</a>
          <a href="#">Bantuan</a>
        </div>
      </footer>
    </DashboardLayout>
  );
}
