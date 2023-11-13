import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chart from "./UserInput";

describe("Chart component", () => {
  it("should not render the chart initially", () => {
    render(<Chart />);
    const chart = screen.queryByTestId("chart");
    expect(chart).toBeNull();
  });
  it("renders the file input", () => {
    render(<Chart />);
    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
  });
  it("renders the sliders", () => {
    render(<Chart />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBe(2);
  });
  it("should render the chart after uploading a CSV file, setting range sliders, and pressing submit", () => {
    render(<Chart />);
    // Simulate uploading a CSV file
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, {
      target: {
        files: [new File([""], "test.csv", { type: "text/csv" })],
      },
    });

    // Simulate setting range sliders
    waitFor(() => {
      const slider1 = screen.getByTestId("padj-threshold");
      const slider2 = screen.getByTestId("log2FC-threshold");
      fireEvent.change(slider1, { target: { value: 0.03 } });
      fireEvent.change(slider2, { target: { value: 1 } });
    });

    waitFor(() => {
      const chart = screen.getByTestId("chart");
      expect(chart).toBeInTheDocument();
    });
  });
});
