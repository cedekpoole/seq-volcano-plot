// Importing libraries and modules
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import HighChartsBoost from "highcharts/modules/boost";
import { useState, useRef, useEffect } from "react";
import { Slider, H5, Button, FileInput } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import ChartRenderer from "./ChartRenderer";
import { parseCSVData } from "./helpers/CSVHandling";

// initialising Highcharts with additional modules
highchartsAccessibility(HighCharts);
HC_exporting(HighCharts);
HighChartsBoost(HighCharts);

function Chart() {
  // States for managing chart data and visibility
  const [showChart, setShowChart] = useState(false);
  const [upRegulatedGenes, setUpRegulatedGenes] = useState([]);
  const [downRegulatedGenes, setDownRegulatedGenes] = useState([]);
  const [notSignificantData, setNotSignificantData] = useState([]);
  const [parsedCsvData, setParsedCsvData] = useState([]);

  // States for managing thresholds and counts
  const [padjThreshold, setPadjThreshold] = useState(0);
  const [log2FCThreshold, setLog2FCThreshold] = useState(0);
  const [upRegGeneCount, setUpRegGeneCount] = useState(0);
  const [downRegGeneCount, setDownRegGeneCount] = useState(0);
  const [noChangeCount, setNoChangeCount] = useState(0);
  const [plotLines, setPlotLines] = useState({
    padjThresholdLine: null,
    lowerLog2FCThresholdLine: null,
    higherLog2FCThresholdLine: null,
  });

  const fileInputRef = useRef();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [exportedFileContent, setExportedFileContent] = useState("");

  useEffect(() => {
    if (showChart) parseData(parsedCsvData);
  }, [padjThreshold, log2FCThreshold]);

  useEffect(() => {
    if (upRegulatedGenes.length > 0 || downRegulatedGenes.length > 0) {
      const upRegulatedGenesCSV =
        "Gene,log2FoldChange,padj\n" +
        upRegulatedGenes
          .map((g) => `${g.gene},${g.x},${Math.pow(10, -g.y)}`)
          .join("\n");

      const downRegulatedGenesCSV =
        "Gene,log2FoldChange,padj\n" +
        downRegulatedGenes
          .map((g) => `${g.gene},${g.x},${Math.pow(10, -g.y)}`)
          .join("\n");

      const exportedContent = `Up Regulated Genes:\n${upRegulatedGenesCSV}\n\nDown Regulated Genes:\n${downRegulatedGenesCSV}`;
      setExportedFileContent(exportedContent);
    }
  }, [upRegulatedGenes, downRegulatedGenes]);

  const parseData = (data) => {
    const upRegulatedGenesTemp = [];
    const downRegulatedGenesTemp = [];
    const notSignificantDataTemp = [];
    let upRegGeneCountTemp = 0;
    let downRegGeneCountTemp = 0;
    let noChangeCountTemp = 0;
    // loop through each row and add
    // the data to the appropriate series
    data.forEach((row) => {
      const isSignificant =
        row.padj < padjThreshold &&
        (row.log2FoldChange > log2FCThreshold ||
          row.log2FoldChange < -log2FCThreshold);
      const dataPoint = {
        x: row.log2FoldChange,
        y: -Math.log10(row.padj),
        gene: Object.values(row)[0],
      };
      if (isSignificant) {
        if (row.log2FoldChange > log2FCThreshold) {
          upRegulatedGenesTemp.push(dataPoint);
          upRegGeneCountTemp++;
        } else {
          downRegulatedGenesTemp.push(dataPoint);
          downRegGeneCountTemp++;
        }
      } else if (!isNaN(row.padj)) {
        notSignificantDataTemp.push(dataPoint);
        noChangeCountTemp++;
      }
    });
    setUpRegulatedGenes(upRegulatedGenesTemp);
    setDownRegulatedGenes(downRegulatedGenesTemp);
    setNotSignificantData(notSignificantDataTemp);
    setUpRegGeneCount(upRegGeneCountTemp);
    setDownRegGeneCount(downRegGeneCountTemp);
    setNoChangeCount(noChangeCountTemp);
    updatePlotLines();
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

  const handleSubmit = (event) => {
    event.preventDefault();
    parseData(parsedCsvData);
    setShowChart(true);
  };

  const handleFileChange = (e) => {
    setShowChart(false);
    const file = e.target.files[0];
    setSelectedFileName(file.name);
    parseCSVData(fileInputRef, setParsedCsvData);
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
            onInputChange={handleFileChange}
            data-testid="file-input"
          />
        </div>
        <div className="threshold-sliders">
          <div style={{ width: 500, margin: "0 30px" }}>
            <H5 style={{ marginBottom: 10 }}>padj Threshold</H5>
            <Slider
              min={0}
              max={0.08}
              stepSize={0.01}
              labelValues={[0, 0.01, 0.03, 0.05, 0.07, 0.08]}
              labelRenderer={(value) => {
                return value === 0.01 || value === 0.05 ? (
                  <strong>{value.toFixed(2)}</strong>
                ) : (
                  value.toFixed(2)
                );
              }}
              onChange={(value) => setPadjThreshold(value)}
              value={padjThreshold}
              data-testid="padj-threshold"
              className="custom-slider"
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
              className="custom-slider"
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
      {showChart && exportedFileContent && (
        <div>
          <ChartRenderer
            upRegulatedGenes={upRegulatedGenes}
            downRegulatedGenes={downRegulatedGenes}
            notSignificantData={notSignificantData}
            plotLines={plotLines}
            upRegGeneCount={upRegGeneCount}
            downRegGeneCount={downRegGeneCount}
            noChangeCount={noChangeCount}
          />
          <div>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                exportedFileContent
              )}`}
              download={`genes_log2FC(${log2FCThreshold.toFixed(
                1
              )})_padj(${padjThreshold.toFixed(2)}).csv`}
              id="download-link"
              style={{ display: "none" }}
            >
              Download
            </a>
            <Button
              text="Download Data"
              onClick={() => document.getElementById("download-link").click()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

console.warn = () => {};

export default Chart;
