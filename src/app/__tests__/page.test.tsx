import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import Home from "../page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("Login Page (Home)", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it("renders username/email and password fields", () => {
    render(<Home />);
    // Use placeholders instead of labels
    expect(
      screen.getByPlaceholderText("Enter your credentials"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
  });

  it("disables submit button when fields are empty", () => {
    render(<Home />);
    const submitButton = screen.getByRole("button", {
      name: /login to dashboard/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when both fields have text", () => {
    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter your credentials"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });
    const submitButton = screen.getByRole("button", {
      name: /login to dashboard/i,
    });
    expect(submitButton).not.toBeDisabled();
  });

  it("shows error message on failed login (401)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Kredensial tidak valid." }),
    });

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter your credentials"), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "wrong" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /login to dashboard/i }),
    );

    const errorMessage = await screen.findByText(/Kredensial tidak valid./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("stores session and redirects to /dashboard on successful login", async () => {
    const fakeAdmin = { id: 1, username: "admin", email: "admin@example.com" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ admin: fakeAdmin }),
    });

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter your credentials"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "correct" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /login to dashboard/i }),
    );

    await waitFor(() => {
      expect(localStorage.getItem("adminSession")).toBeTruthy();
      const stored = JSON.parse(localStorage.getItem("adminSession")!);
      expect(stored.username).toBe("admin");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows generic error if fetch throws network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter your credentials"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "test" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /login to dashboard/i }),
    );

    const errorMessage = await screen.findByText(
      /Tidak dapat terhubung ke server/i,
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
