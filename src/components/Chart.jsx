import HighChartsReact from "highcharts-react-official";
import HighCharts, { pad } from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import { useState, useRef } from "react";
import Papa from "papaparse";
import ChartRenderer from "./ChartRenderer";

// add the exporting and accessibility modules
if (typeof HighCharts === "object") {
  highchartsAccessibility(HighCharts);
  HC_exporting(HighCharts);
}

function Chart() {
  const [showChart, setShowChart] = useState(false);
  const [significantData, setSignificantData] = useState([]);
  const [notSignificantData, setNotSignificantData] = useState([]);
  const fileInputRef = useRef();

  // count number of data plots for each series
  const [changeCount, setChangeCount] = useState(0);
  const [noChangeCount, setNoChangeCount] = useState(0);

  // variable thresholding states
  const [padjThreshold, setPadjThreshold] = useState(0);
  const [lowerLog2FCThreshold, setLowerLog2FCThreshold] = useState(0);
  const [higherLog2FCThreshold, setHigherLog2FCThreshold] = useState(0);

  // State to store plotLine values
  const [plotLines, setPlotLines] = useState({
    padjThresholdLine: null,
    lowerLog2FCThresholdLine: null,
    higherLog2FCThresholdLine: null,
  });

  const handleDataParsing = (data) => {
    const significantDataTemp = [];
    const notSignificantDataTemp = [];
    let changeCountTemp = 0;
    let noChangeCountTemp = 0;
    // loop through each row and add
    // the data to the appropriate series
    data.forEach((row) => {
      if (
        -Math.log10(row.padj) > padjThreshold &&
        (row.log2FoldChange > higherLog2FCThreshold ||
          row.log2FoldChange < lowerLog2FCThreshold)
      ) {
        significantDataTemp.push({
          x: row.log2FoldChange,
          y: -Math.log10(row.padj),
          gene: Object.values(row)[0],
        });
        // increment the count for the series
        changeCountTemp++;
      } else if (!isNaN(row.padj)) {
        notSignificantDataTemp.push({
          x: row.log2FoldChange,
          y: -Math.log10(row.padj),
          gene: Object.values(row)[0],
        });
        noChangeCountTemp++;
      }
    });
    // set the state
    setSignificantData(significantDataTemp);
    setNotSignificantData(notSignificantDataTemp);
    setChangeCount(changeCountTemp);
    setNoChangeCount(noChangeCountTemp);
  };

  const updatePlotLines = () => {
    // Update plotLines based on threshold values
    const newPlotLines = {
      padjThresholdLine: {
        value: padjThreshold,
        color: "grey",
        dashStyle: "shortdash",
        width: 1,
      },
      lowerLog2FCThresholdLine: {
        value: lowerLog2FCThreshold,
        color: "grey",
        dashStyle: "shortdash",
        width: 1,
      },
      higherLog2FCThresholdLine: {
        value: higherLog2FCThreshold,
        color: "grey",
        dashStyle: "shortdash",
        width: 1,
      },
    };
    setPlotLines(newPlotLines);
  };

  // use the papa parse package to parse the csv file
  const handleSubmit = (event) => {
    event.preventDefault();
    Papa.parse(fileInputRef.current.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        handleDataParsing(results.data);
        updatePlotLines();
        setShowChart(true);
      },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        {/* add a file input to allow the user to upload a csv file */}
        <div className="file-input">
          <input
            type="file"
            name="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "block", margin: "20px auto", fontSize: "20px" }}
            data-testid="file-input"
            required
          />
        </div>
        <div
          className="threshold-sliders"
          style={{
            display: "flex",
            margin: "40px",
            fontSize: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div style={{ width: 400 }}>
            <label>-Log10(padj) Threshold:</label>
            <br />
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={padjThreshold}
              onChange={(e) => setPadjThreshold(e.target.value)}
              data-testid="padj-threshold"
            />
            <span>{padjThreshold}</span>
          </div>
          <div style={{ width: 400 }}>
            <label>Lower Log2FC Threshold:</label>
            <br />
            <input
              type="range"
              min={-4}
              max={0}
              step={0.1}
              value={lowerLog2FCThreshold}
              onChange={(e) => setLowerLog2FCThreshold(e.target.value)}
              data-testid="lower-log2FC-threshold"
            />
            <span>{lowerLog2FCThreshold}</span>
          </div>
          <div style={{ width: 400 }}>
            <label>Higher Log2FC Threshold:</label>
            <br />
            <input
              type="range"
              min={0}
              max={4}
              step={0.1}
              value={higherLog2FCThreshold}
              onChange={(e) => setHigherLog2FCThreshold(e.target.value)}
              data-testid="higher-log2FC-threshold"
            />
            <span>{higherLog2FCThreshold}</span>
          </div>
        </div>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
      {showChart && (
        <ChartRenderer
          significantData={significantData}
          notSignificantData={notSignificantData}
          plotLines={plotLines}
          changeCount={changeCount}
          noChangeCount={noChangeCount}
        />
      )}
    </div>
  );
}

export default Chart;
