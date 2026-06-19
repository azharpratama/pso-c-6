import { render, screen, waitFor, act } from "@testing-library/react";
import DashboardPage from "../dashboard/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/dashboard",
}));

describe("DashboardPage Component", () => {
  beforeEach(() => {
    // Basic authenticated state
    localStorage.setItem("adminSession", "true");

    // Mock fetch
    global.fetch = jest.fn((url: RequestInfo | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes("/api/mitra/monthly-growth")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ month: "Jan", count: 5 }] }),
        });
      }
      if (urlStr.includes("/api/mitra/stats")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              active: 100,
              total: 120,
              recent: 10,
              activeGrowth: 5,
              newGrowth: 2,
            }),
        });
      }
      if (urlStr.includes("/api/mitra/cities")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ data: [{ city: "Surabaya", count: 50 }] }),
        });
      }
      if (urlStr.includes("/api/mitra/activities")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  icon: "add",
                  description: "Added a partner",
                  timestamp: "10 min ago",
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Not found" }),
      });
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("fetches and renders dashboard data", async () => {
    await act(async () => {
      render(<DashboardPage />);
    });

    // Wait for the data to populate
    await waitFor(() => {
      // Check Stats
      expect(screen.getByText("Total Mitra Aktif")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument(); // active stat
      expect(screen.getByText("120")).toBeInTheDocument(); // total partners stat

      // Check chart loading
      expect(screen.getByText("Jan")).toBeInTheDocument();

      // Check cities
      expect(screen.getByText("Surabaya")).toBeInTheDocument();
      expect(screen.getByText(/50 Mitra/)).toBeInTheDocument();

      // Check activities
      expect(screen.getByText(/Added a partner/)).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully", async () => {
    global.fetch = jest.fn(() => Promise.reject("Network error")) as jest.Mock;

    await act(async () => {
      render(<DashboardPage />);
    });

    // Despite error, layout should render and show default values or error placeholders
    await waitFor(() => {
      expect(screen.getByText("Total Mitra Aktif")).toBeInTheDocument();
      // default value for stats if fetch fails is 0
      const zeroes = screen.queryAllByText("0");
      expect(zeroes.length).toBeGreaterThan(0);
    });
  });
});
