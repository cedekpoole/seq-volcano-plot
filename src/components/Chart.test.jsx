import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chart from './Chart';

describe('Chart component', () => {
    it("renders the file input", () => {
        render(<Chart />);
        const input = screen.getByTestId("file-input");
        expect(input).toBeInTheDocument();
    })
    it("renders the chart when file is uploaded", () => {
        render(<Chart />);
        const input = screen.getByTestId("file-input");
        fireEvent.change(input, {
            target: {
                files: [new File([""], "test.csv", { type: "text/csv" })],
            },
        });
        waitFor(() => {
            const chart = screen.getByTestId("chart");
            expect(chart).toBeInTheDocument();
        })
    })
})