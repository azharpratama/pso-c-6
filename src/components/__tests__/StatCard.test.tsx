import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

describe("StatCard Component", () => {
  it("renders title, value, and icon", () => {
    render(
      <StatCard
        title="Total Users"
        value="1,234"
        icon={<svg data-testid="test-icon" />}
      />
    );

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders change text with appropriate class when provided", () => {
    render(
      <StatCard
        title="Revenue"
        value="$5,000"
        icon={<svg />}
        change="+12%"
        changeType="positive"
      />
    );

    const changeEl = screen.getByText("+12%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl).toHaveClass("stat-change", "positive");
  });

  it("defaults changeType to neutral when omitted", () => {
    render(
      <StatCard
        title="Active"
        value="100"
        icon={<svg />}
        change="0%"
      />
    );

    const changeEl = screen.getByText("0%");
    expect(changeEl).toHaveClass("stat-change", "neutral");
  });
});
