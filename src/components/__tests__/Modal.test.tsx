import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../Modal";

describe("Modal Component", () => {
  it("renders the title and children", () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("renders subtitle if provided", () => {
    render(
      <Modal title="Test Modal" subtitle="A subtitle" onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("A subtitle")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <Modal title="Test Modal" onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
