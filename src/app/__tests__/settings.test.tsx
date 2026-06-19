import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import SettingsPage from "../settings/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/settings",
}));

// Mock window functions
window.alert = jest.fn();
window.confirm = jest.fn(() => true);

describe("SettingsPage Component", () => {
  beforeEach(() => {
    localStorage.setItem("adminSession", "true");

    global.fetch = jest.fn((url: RequestInfo | URL, options?: RequestInit) => {
      const urlStr = url.toString();
      const method = options?.method || "GET";

      if (urlStr.includes("/api/admins") && method === "GET") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "1",
                  username: "testadmin",
                  email: "admin@test.com",
                },
              ],
            }),
        });
      }

      if (urlStr.includes("/api/admins") && (method === "POST" || method === "PUT")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "2" }),
        });
      }

      if (urlStr.includes("/api/admins/1") && method === "DELETE") {
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

  it("fetches and renders admin list", async () => {
    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("testadmin")).toBeInTheDocument();
      expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    });
  });

  it("opens add modal, submits form, and reloads data", async () => {
    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("testadmin")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: "+ Tambah Admin Baru" });
    fireEvent.click(addBtn);

    expect(screen.getByText("Tambah Admin Baru")).toBeInTheDocument();

    const userInput = screen.getByPlaceholderText("Masukkan username");
    const emailInput = screen.getByPlaceholderText("Masukkan email");
    const passInput = screen.getByPlaceholderText("Masukkan password");

    fireEvent.change(userInput, { target: { value: "newadmin" } });
    fireEvent.change(emailInput, { target: { value: "new@test.com" } });
    fireEvent.change(passInput, { target: { value: "secret123" } });

    const submitBtn = screen.getByRole("button", { name: "Tambah" });
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admins", expect.objectContaining({
      method: "POST"
    }));

    // Alert and modal close
    expect(window.alert).toHaveBeenCalledWith("✓ Admin berhasil ditambahkan");
    expect(screen.queryByText("Tambah Admin Baru")).not.toBeInTheDocument();
  });

  it("handles delete action", async () => {
    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("testadmin")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle("Hapus");
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("/api/admins/1", expect.objectContaining({
      method: "DELETE"
    }));
    expect(window.alert).toHaveBeenCalledWith("✓ Admin berhasil dihapus");
  });
});
