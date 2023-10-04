import Papa from "papaparse";

export const parseCSVData = (file, setCSVData) => {
    Papa.parse(file.current.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => setCSVData(results.data),
    });
  };