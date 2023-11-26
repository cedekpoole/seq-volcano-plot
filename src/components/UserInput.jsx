// Importing libraries and modules
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import HighChartsBoost from "highcharts/modules/boost";
import { useState, useRef, useEffect } from "react";
import { Slider, Button, FileInput, MenuItem, Tag } from "@blueprintjs/core";
import { Suggest, Select } from "@blueprintjs/select";
import "@blueprintjs/core/lib/css/blueprint.css";
import ChartRenderer from "./ChartRenderer";
import { parseCSVData, download, convertToCsv } from "./helpers/CSVHandling";

// initialising Highcharts with additional modules
highchartsAccessibility(HighCharts);
HC_exporting(HighCharts);
HighChartsBoost(HighCharts);

function UserInput() {
  // States for managing chart data and visibility
  const [showChart, setShowChart] = useState(false);
  const [upRegulatedGenes, setUpRegulatedGenes] = useState([]);
  const [downRegulatedGenes, setDownRegulatedGenes] = useState([]);
  const [notSignificantData, setNotSignificantData] = useState([]);
  const [parsedCsvData, setParsedCsvData] = useState([]);
  // States for managing thresholds and counts
  const [padjThreshold, setPadjThreshold] = useState(0.05);
  const [log2FCThreshold, setLog2FCThreshold] = useState(1);
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
  const [upRegulatedCsvData, setUpRegulatedCsvData] = useState("");
  const [downRegulatedCsvData, setDownRegulatedCsvData] = useState("");

  const [userInputGenes, setUserInputGenes] = useState("");
  const [genesList, setGenesList] = useState([]);
  const [suggestedGenes, setSuggestedGenes] = useState([]);

  useEffect(() => {
    const allGenes = [
      ...new Set(
        [...upRegulatedGenes, ...downRegulatedGenes].map((g) => g.gene)
      ),
    ];
    setSuggestedGenes(allGenes);
  }, [upRegulatedGenes, downRegulatedGenes]);

  useEffect(() => {
    if (showChart) parseData(parsedCsvData);
  }, [padjThreshold, log2FCThreshold, showChart]);

  useEffect(() => {
    if (upRegulatedGenes.length > 0) {
      setUpRegulatedCsvData(convertToCsv(upRegulatedGenes));
    }
    if (downRegulatedGenes.length > 0) {
      setDownRegulatedCsvData(convertToCsv(downRegulatedGenes));
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

  const handleFileChange = (e) => {
    setShowChart(false);
    setSelectedFileName("");
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      parseCSVData(fileInputRef, (csvData) => {
        setParsedCsvData(csvData);
        parseData(csvData);
        setShowChart(true);
      });
    }
  };

  const renderDownloadOptions = (item, { handleClick }) => (
    <MenuItem
      key={item.text}
      text={item.text}
      onClick={() => {
        handleClick();
        item.action();
      }}
    />
  );

  const addGenesToList = () => {
    const newGenes = userInputGenes.split(",").map((g) => g.trim());

    const validGenes = newGenes.filter(
      (gene) =>
        upRegulatedGenes.some((point) => point.gene === gene) ||
        downRegulatedGenes.some((point) => point.gene === gene) ||
        notSignificantData.some((point) => point.gene === gene)
    );

    if (validGenes.length > 0) {
      setGenesList((prev) => [...new Set([...prev, ...validGenes])]);
      setUserInputGenes(""); // Clear the user input after adding genes to the list
    } else {
      return;
    }
  };

  const removeGeneFromList = (gene) => {
    setGenesList((prev) => prev.filter((g) => g !== gene));
  };

  const filterGenes = (query, gene) => {
    return gene.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const handleGeneChange = (gene) => {
    // Set the selected gene directly to the genesList state
    setGenesList((prev) => [...new Set([...prev, gene])]);
  };

  return (
    <div>
      <form className="vol-flex vol-flex-col md:vol-flex-row vol-justify-between">
        <div className="md:vol-w-1/2 vol-p-4 vol-mt-10">
          {/* add a file input to allow the user to upload a csv file */}
          <div className="vol-grid lg:vol-grid-cols-12 vol-grid-cols-1 vol-gap-4 vol-items-center vol-mb-5 vol-lg:ml-20">
            {/* Upload Section */}
            <label htmlFor="dataFile" className="lg:vol-text-right vol-col-span-4">
              Upload your data file
            </label>
            <div className="lg:vol-col-span-6 vol-col-span-1 vol-flex vol-items-center">
              <FileInput
                text={selectedFileName || "Choose a CSV file..."}
                inputProps={{
                  id: "dataFile",
                  accept: ".csv",
                  ref: fileInputRef,
                  required: true,
                }}
                onInputChange={handleFileChange}
                data-testid="file-input"
                className="vol-flex-grow vol-min-w-0 file-input"
              />
            </div>
            <div className="lg:vol-col-span-2 vol-col-span-1 vol-flex vol-justify-start lg:vol-items-center">
              {showChart && (
                <Select
                  items={[
                    {
                      text: "Download Up-Regulated Genes",
                      action: () =>
                        download(
                          `upReg_log2FC${log2FCThreshold}_padj${padjThreshold}.csv`,
                          upRegulatedCsvData
                        ),
                    },
                    {
                      text: "Download Down-Regulated Genes",
                      action: () =>
                        download(
                          `downReg_log2FC${log2FCThreshold}_padj${padjThreshold}.csv`,
                          downRegulatedCsvData
                        ),
                    },
                  ]}
                  itemRenderer={renderDownloadOptions}
                  filterable={false}
                  onItemSelect={() => {}}
                >
                  <Button
                    icon="download"
                    rightIcon="caret-down"
                    className="vol-text-xs vol-rounded"
                  />
                </Select>
              )}

            </div>

            {/* Gene Label Section */}
            <label
              htmlFor="geneInput"
              className="lg:vol-text-right vol-col-span-4"
            >
              Gene Label Selection
            </label>
            <div className="lg:vol-col-span-6 vol-col-span-1">
              <Suggest
                items={suggestedGenes}
                itemRenderer={(gene, { handleClick, modifiers }) => (
                  <MenuItem key={gene} onClick={handleClick} text={gene} />
                )}
                itemPredicate={filterGenes}
                noResults={<MenuItem disabled={true} text="No results." />}
                onItemSelect={(gene) => {
                  handleGeneChange(gene);
                  addGenesToList();
                }}
                inputValueRenderer={(gene) => gene}
                inputProps={{
                  placeholder: "Enter Gene Name",
                  id: "geneInput",
                  rightElement: (
                    <Button
                      icon="plus"
                      minimal={true}
                      onClick={addGenesToList}
                    />
                  ),
                  className: "vol-flex-grow",
                }}
                popoverProps={{ minimal: true }}
              />
            </div>
            <div className="lg:vol-col-span-2 vol-col-span-1 vol-flex vol-justify-start vol-items-center">
              {genesList.length > 0 && (
              <Button
                onClick={() => setGenesList([])}
                icon="trash"
                className="vol-text-xs vol-rounded"
              />
              )}
            </div>
          </div>
          <div className="vol-my-2.5 md:vol-ml-24 md:vol-mr-4 vol-min-h-[80px] vol-border-t vol-pt-3">
            {genesList.map((gene) => (
              <Tag
                key={gene}
                onRemove={() => removeGeneFromList(gene)}
                className="vol-m-1 vol-text-sm vol-bg-primary-100"
              >
                {gene}
              </Tag>
            ))}
          </div>
        </div>
        <div className="lg:vol-w-[40%] sm:vol-w-2/3 md:vol-w-1/2 vol-w-full vol-p-4 vol-mx-auto vol-mt-10">
          <div className="vol-w-full vol-mb-4 vol-px-3">
            <p className="vol-mb-2.5">padj Threshold</p>
            <Slider
              min={0.01}
              max={0.09}
              stepSize={0.01}
              labelValues={[
                0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09,
              ]}
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

          <div className="vol-w-full vol-px-3">
            <p className="vol-mb-2.5">Log2FC Threshold</p>
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
      </form>
      {showChart && (
        <div>
          <ChartRenderer
            upRegulatedGenes={upRegulatedGenes}
            downRegulatedGenes={downRegulatedGenes}
            notSignificantData={notSignificantData}
            plotLines={plotLines}
            upRegGeneCount={upRegGeneCount}
            downRegGeneCount={downRegGeneCount}
            noChangeCount={noChangeCount}
            padjThreshold={padjThreshold}
            log2FCThreshold={log2FCThreshold}
            userInputGenes={userInputGenes}
            genesList={genesList}
            setGenesList={setGenesList}
          />
        </div>
      )}
    </div>
  );
}

console.warn = () => {};

export default UserInput;
