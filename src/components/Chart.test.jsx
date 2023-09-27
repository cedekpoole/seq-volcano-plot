import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chart from "./Chart";

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
    expect(sliders.length).toBe(3);
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
      fireEvent.change(slider1, { target: { value: 0.5 } });
      fireEvent.change(slider2, { target: { value: [-1, 2] } });
    });

    // Simulate pressing the submit button
    const submitButton = screen.getByTestId("submit-button"); // Use a suitable data-testid attribute
    fireEvent.click(submitButton);

    waitFor(() => {
      const chart = screen.getByTestId("chart");
      expect(chart).toBeInTheDocument();
    });
  });
});
