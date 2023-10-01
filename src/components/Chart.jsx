import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import { useState, useRef } from "react";
import Papa from "papaparse";
import ChartRenderer from "./ChartRenderer";
import { RangeSlider, Slider, H5, Button, FileInput } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

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
  const [log2FCThreshold, setLog2FCThreshold] = useState(0);

  // State to store the name of the selected file
  const [selectedFileName, setSelectedFileName] = useState("");

  // State to store plotLine values
  const [plotLines, setPlotLines] = useState({
    padjThresholdLine: null,
    lowerLog2FCThresholdLine: null,
    higherLog2FCThresholdLine: null,
  });

  // function to parse the data from the csv file
  const handleDataParsing = (data) => {
    const significantDataTemp = [];
    const notSignificantDataTemp = [];
    let changeCountTemp = 0;
    let noChangeCountTemp = 0;
    // loop through each row and add
    // the data to the appropriate series
    data.forEach((row) => {
      if (
        row.padj < padjThreshold &&
        (row.log2FoldChange > log2FCThreshold ||
          row.log2FoldChange < -log2FCThreshold)
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
    // update plotLines based on threshold values
    const newPlotLines = {
      padjThresholdLine: {
        value: -Math.log10(padjThreshold),
        color: "grey",
        dashStyle: "shortdash",
        width: 1,
      },
      lowerLog2FCThresholdLine: {
        value: -log2FCThreshold,
        color: "grey",
        dashStyle: "shortdash",
        width: 1,
      },
      higherLog2FCThresholdLine: {
        value: log2FCThreshold,
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
        <div className="file-input" style={{ marginTop: 20 }}>
          <FileInput
            text={selectedFileName || "Choose a CSV file..."}
            inputProps={{
              accept: ".csv",
              ref: fileInputRef,
              required: true,
            }}
            onInputChange={(e) => {
              const file = e.target.files[0];
              setSelectedFileName(file.name);
            }}
            data-testid="file-input"
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
          <div style={{ width: 500, margin: "0 30px" }}>
            <H5 style={{ marginBottom: 10 }}>padj Threshold</H5>
            <Slider
              min={0}
              max={0.08}
              stepSize={0.01}
              labelValues={[0, 0.01, 0.03, 0.05, 0.07, 0.08]}
              labelRenderer={(value) => {
                return (
                  (value === 0.01 || value === 0.05) ? <strong>{value.toFixed(2)}</strong> : value.toFixed(2)
                )
              }}
              onChange={(value) => setPadjThreshold(value)}
              value={padjThreshold}
              data-testid="padj-threshold"
            ></Slider>
          </div>

          <div style={{ width: 500, margin: "0 30px" }}>
            <H5 style={{ marginBottom: 10 }}>Log2FC Threshold</H5>
            <Slider
              min={0}
              max={4}
              stepSize={0.1}
              labelStepSize={0.5}
              onChange={(value) => setLog2FCThreshold(value)}
              value={log2FCThreshold}
              data-testid="log2fc-threshold"
            ></Slider>
          </div>
        </div>
        <Button
          type="submit"
          text="Load Data"
          large
          data-testid="submit-button"
        />
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
