import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import PartnersPage from "../partners/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/partners",
}));

// Mock window.confirm
window.confirm = jest.fn(() => true);

describe("PartnersPage Component", () => {
  beforeEach(() => {
    localStorage.setItem("adminSession", "true");

    global.fetch = jest.fn((url: RequestInfo | URL, options?: RequestInit) => {
      const urlStr = url.toString();
      const method = options?.method || "GET";

      if (urlStr.includes("/api/mitra/stats")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ active: 10, total: 15, recent: 2 }),
        });
      }

      if (urlStr.includes("/api/mitra") && method === "GET") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              data: [
                {
                  id: "1",
                  nama_instansi: "PT Pertamina",
                  kota: "Jakarta",
                  alamat: "Jl. Merdeka",
                  keterangan: "BUMN",
                  is_aktif: true,
                },
              ],
            }),
        });
      }

      if (urlStr.includes("/api/mitra") && (method === "POST" || method === "PUT")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "2" }),
        });
      }

      if (urlStr.includes("/api/mitra/1") && method === "DELETE") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
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

  it("fetches and renders partners list", async () => {
    await act(async () => {
      render(<PartnersPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("PT Pertamina")).toBeInTheDocument();
      expect(screen.getByText("Jakarta")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument(); // active count
    });
  });

  it("filters partners based on search input", async () => {
    await act(async () => {
      render(<PartnersPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("PT Pertamina")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Cari mitra...");
    
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Unknown Company" } });
    });

    await waitFor(() => {
      expect(screen.queryByText("PT Pertamina")).not.toBeInTheDocument();
      expect(screen.getByText("Data mitra belum tersedia.")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.change(searchInput, { target: { value: "pertamina" } });
    });

    await waitFor(() => {
      expect(screen.getByText("PT Pertamina")).toBeInTheDocument();
    });
  });

  it("opens add modal, submits form, and reloads data", async () => {
    await act(async () => {
      render(<PartnersPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("PT Pertamina")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: "+ Tambah Mitra" });
    fireEvent.click(addBtn);

    expect(screen.getByText("Tambah Mitra")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Nama Instansi");
    fireEvent.change(nameInput, { target: { value: "New Partner" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan" });
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/mitra", expect.objectContaining({
      method: "POST"
    }));

    // Modal should close
    expect(screen.queryByText("Tambah Mitra")).not.toBeInTheDocument();
  });

  it("handles delete action", async () => {
    await act(async () => {
      render(<PartnersPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("PT Pertamina")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("/api/mitra/1", expect.objectContaining({
      method: "DELETE"
    }));
  });
});
