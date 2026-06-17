"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  ChartIcon,
  DownloadIcon,
  GridIcon,
  SearchIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/components/icons";

type DashboardStats = {
  totalActive: number;
  totalPartners: number;
  newThisMonth: number;
  activeGrowth: number;
  newGrowth: number;
};

type Activity = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: "add" | "edit" | "delete" | "download";
};

type CityDistribution = {
  city: string;
  count: number;
};

type MonthlyGrowth = {
  month: string;
  count: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.replace("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboardData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMonthlyData();
  }, [router, loadDashboardData, fetchMonthlyData]);

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
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">ITS</div>
          <div>
            <div className="brand-title">Admin Panel</div>
            <div className="brand-subtitle">Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" type="button">
            <GridIcon className="icon-sm" aria-hidden="true" />
            Dashboard
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => router.push("/partners")}
          >
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

        <button className="sidebar-cta" type="button">
          + Add New Partner
        </button>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="top-accent" />
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <SearchIcon className="icon-sm" aria-hidden="true" />
            <input
              type="text"
              placeholder="Cari mitra, laporan, atau aktivitas..."
            />
          </div>
          <button
            className="topbar-icon"
            type="button"
            aria-label="Notifications"
          >
            <BellIcon className="icon-sm" aria-hidden="true" />
            <span className="notification-dot" />
          </button>
          <button className="topbar-icon" type="button" aria-label="Profile">
            <UserCircleIcon className="icon-sm" aria-hidden="true" />
          </button>
        </header>

        <div className="dashboard-content">
          {/* Welcome Banner */}
          <section className="welcome-banner">
            <div>
              <h1 className="welcome-title">Selamat datang, Admin!</h1>
              <p className="welcome-date">{currentDate}</p>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="summary-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Mitra Aktif</div>
                <div className="stat-icon">
                  <UsersIcon className="icon-sm" aria-hidden="true" />
                </div>
              </div>
              <div className="stat-value">{stats.totalActive}</div>
              <div className="stat-change positive">
                +{stats.activeGrowth}% dari bulan lalu
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Mitra Baru (Bulan Ini)</div>
                <div className="stat-icon">
                  <ChartIcon className="icon-sm" aria-hidden="true" />
                </div>
              </div>
              <div className="stat-value">{stats.newThisMonth}</div>
              <div className="stat-change positive">
                +{stats.newGrowth} dari bulan lalu
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Mitra Keseluruhan</div>
                <div className="stat-icon">
                  <UsersIcon className="icon-sm" aria-hidden="true" />
                </div>
              </div>
              <div className="stat-value">{stats.totalPartners}</div>
              <div className="stat-change">termasuk mitra non-aktif</div>
            </div>
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
        </div>
      </div>
    </div>
  );
}
