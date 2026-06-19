import { render, screen, waitFor, act } from "@testing-library/react";
import AnalyticsPage from "../analytics/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/analytics",
}));

describe("AnalyticsPage Component", () => {
  beforeEach(() => {
    localStorage.setItem("adminSession", "true");

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: 1,
                nama_instansi: "PT Test",
                kota: "Surabaya",
                is_aktif: true,
                created_at: "2024-03-15T10:00:00Z",
              },
              {
                id: 2,
                nama_instansi: "CV Inactive",
                kota: "Jakarta",
                is_aktif: false,
                created_at: "2024-04-10T10:00:00Z",
              },
            ],
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("fetches and renders analytics data properly", async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      // Check for aggregated values based on our mocked response
      // Active = 1, Inactive = 1 => 50% each
      const fiftyPercents = screen.queryAllByText("50%");
      expect(fiftyPercents.length).toBeGreaterThan(0);

      // Check cities
      expect(screen.getAllByText("Surabaya").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Jakarta").length).toBeGreaterThan(0);

      // Check top month (mocked data has 1 in Mar, 1 in Apr, tie breaks to first or highest)
      expect(screen.getAllByText(/Maret|April/).length).toBeGreaterThan(0);
    });
  });

  it("handles fetch failure by showing fallback/mock data", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn(() => Promise.reject("Fetch error")) as jest.Mock;

    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      // It uses fallback data when empty (85% active, 15% inactive)
      expect(screen.getAllByText("85%").length).toBeGreaterThan(0);
      expect(screen.getAllByText("15%").length).toBeGreaterThan(0);
      
      // Fallback cities
      expect(screen.getByText("Bandung")).toBeInTheDocument();
      expect(screen.getByText("Malang")).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });
});
