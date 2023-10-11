import Papa from "papaparse";
import { saveAs } from "file-saver";

export const parseCSVData = (file, setCSVData) => {
    Papa.parse(file.current.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => setCSVData(results.data),
    });
  };

  export const download = (filename, text) => {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
  };

  export const convertToCsv = (data) => {
    const csvRows = [];
    const headers = ["gene", "log2FoldChange", "padj"];
    csvRows.push(headers.join(","));

    for (const row of data) {
      csvRows.push([row.gene, row.x, -Math.pow(10, -row.y)].join(","));
    }

    return csvRows.join("\n");
  };