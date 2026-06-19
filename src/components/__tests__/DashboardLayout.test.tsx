import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardLayout from "../DashboardLayout";
import { useRouter, usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("DashboardLayout Component", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    // Default to authenticated
    localStorage.setItem("adminSession", "test-session-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects to home if unauthenticated", async () => {
    localStorage.clear();
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Initial render is null
    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("renders layout and children when authenticated", () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Secret Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("highlights the active navigation link based on pathname", () => {
    (usePathname as jest.Mock).mockReturnValue("/partners");

    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const partnersBtn = screen.getByText("Partners");
    const dashboardBtn = screen.getByText("Dashboard");

    expect(partnersBtn.closest("button")).toHaveClass("nav-item", "active");
    expect(dashboardBtn.closest("button")).toHaveClass("nav-item");
    expect(dashboardBtn.closest("button")).not.toHaveClass("active");
  });

  it("navigates when clicking a navigation link", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const settingsBtn = screen.getByText("Settings");
    fireEvent.click(settingsBtn);

    expect(mockPush).toHaveBeenCalledWith("/settings");
  });

  it("conditionally renders search bar based on showSearch prop", () => {
    const { rerender } = render(
      <DashboardLayout showSearch={false}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.queryByPlaceholderText("Cari...")).not.toBeInTheDocument();

    rerender(
      <DashboardLayout showSearch={true} searchPlaceholder="Search users">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByPlaceholderText("Search users")).toBeInTheDocument();
  });
});
