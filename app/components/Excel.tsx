import Settings from "./Settings";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  CSSProperties,
} from "react";
import { FaCog } from 'react-icons/fa';

// Core interfaces for app data structures
interface SettingsData {
  hotkeys: {
    labelRotation: string;
    labelKeyOne: string;
    labelNameOne: string;
    labelEnabledOne: boolean;
    labelKeyTwo: string;
    labelNameTwo: string;
    labelEnabledTwo: boolean;
    labelKeyThree: string;
    labelNameThree: string;
    labelEnabledThree: boolean;
    labelKeyFour: string;
    labelNameFour: string;
    labelEnabledFour: boolean;
    labelKeyFive: string;
    labelNameFive: string;
    labelEnabledFive: boolean;
    labelKeySix: string;
    labelNameSix: string;
    labelEnabledSix: boolean;
    labelKeySeven: string;
    labelNameSeven: string;
    labelEnabledSeven: boolean;
  };
  paths: {
    imagePath: string;
    metadataPath: string;
  };
  layout: {
    imagesPerColumn: number;
    galleryTitle: string;
    selectedColorMainBackground: string;
    selectedColorHeaderBackground: string;
    selectedColorFooterBackground: string;
  };
  metadata: {
    columns: {
      name: string;
      enabled: boolean;
    }[];
  };
}

interface ImageItem {
  fullPath: string;
  fileName: string;
  metadata: {
    [key: string]: string;
  };
  label?: number;     // Wir behalten die Nummer für interne Verarbeitung
  labelName?: string; // Wir fügen den Namen hinzu
}

interface LabelInfo {
  key: string;
  name: string;
  enabled: boolean;
  color: string;
}

interface LabelMark {
  number: number;
  name: string;
}


export default function ImageGallery() {
  const [imagePaths, setImagePaths] = useState<ImageItem[]>([]);
  const [imageMarks, setImageMarks] = useState<{ [key: number]: LabelMark }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [computedImageSize, setComputedImageSize] = useState(200);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [csvData, setCsvData] = useState<{headers: string[], lines: string[]}>({ headers: [], lines: [] });
  const [hasLabelColumn, setHasLabelColumn] = useState(false);
  // Neue States für Fehlerbehandlung
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingSaves, setPendingSaves] = useState(0);
  const [lastSaveSuccess, setLastSaveSuccess] = useState(true);
  const errorTimerRef = useRef<number | null>(null);
  
  const [settings, setSettings] = useState<SettingsData>({
    hotkeys: {
      labelRotation: "Enter",
      labelKeyOne: "1",
      labelNameOne: "No vains",
      labelEnabledOne: true,
      labelKeyTwo: "2",
      labelNameTwo: "Stent",
      labelEnabledTwo: true,
      labelKeyThree: "3",
      labelNameThree: "Coil",
      labelEnabledThree: true,
      labelKeyFour: "4",
      labelNameFour: "Flow Diverters",
      labelEnabledFour: true,
      labelKeyFive: "5",
      labelNameFive: "Dental Artifacts",
      labelEnabledFive: true,
      labelKeySix: "6",
      labelNameSix: "Label name 6",
      labelEnabledSix: false,
      labelKeySeven: "7",
      labelNameSeven: "Label name 7",
      labelEnabledSeven: false,
    },
    paths: {
      imagePath: "/images/",
      metadataPath: "/mock_metadata.csv"
    },
    layout: {
      imagesPerColumn: 14,
      galleryTitle: "Image Gallery",
      selectedColorHeaderBackground: "bg-white",
      selectedColorMainBackground: "bg-white",
      selectedColorFooterBackground: "bg-white",
    },
    metadata: {
      columns: [
        { name: "filename", enabled: true },
        { name: "label", enabled: true },
        { name: "gender", enabled: true },
        { name: "age", enabled: true },
        { name: "description", enabled: true }
      ]
    }
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Load settings from settings.json
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/settings.json");
        if (!response.ok) {
          throw new Error(`Failed to load settings.json: ${response.status}`);
        }
        const settingsData = await response.json();
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading settings:", error);
        // We'll keep the default settings from useState
      }
    };
    
    loadSettings();
  }, []);
  
  // Get all enabled labels with their information
  const enabledLabels = useMemo(() => {
    const labels: LabelInfo[] = [];
    
    if (settings.hotkeys.labelEnabledOne) {
      labels.push({
        key: settings.hotkeys.labelKeyOne,
        name: settings.hotkeys.labelNameOne,
        enabled: settings.hotkeys.labelEnabledOne,
        color: "#EF4444" // red-500
      });
    }
    
    if (settings.hotkeys.labelEnabledTwo) {
      labels.push({
        key: settings.hotkeys.labelKeyTwo,
        name: settings.hotkeys.labelNameTwo,
        enabled: settings.hotkeys.labelEnabledTwo,
        color: "#FBBF24" // amber-400
      });
    }
    
    if (settings.hotkeys.labelEnabledThree) {
      labels.push({
        key: settings.hotkeys.labelKeyThree,
        name: settings.hotkeys.labelNameThree,
        enabled: settings.hotkeys.labelEnabledThree,
        color: "#32A832" // green
      });
    }
    
    if (settings.hotkeys.labelEnabledFour) {
      labels.push({
        key: settings.hotkeys.labelKeyFour,
        name: settings.hotkeys.labelNameFour,
        enabled: settings.hotkeys.labelEnabledFour,
        color: "#00CCCC" // cyan-ish
      });
    }
    
    if (settings.hotkeys.labelEnabledFive) {
      labels.push({
        key: settings.hotkeys.labelKeyFive,
        name: settings.hotkeys.labelNameFive,
        enabled: settings.hotkeys.labelEnabledFive,
        color: "#CC00CC" // magenta-ish
      });
    }
    
    if (settings.hotkeys.labelEnabledSix) {
      labels.push({
        key: settings.hotkeys.labelKeySix,
        name: settings.hotkeys.labelNameSix,
        enabled: settings.hotkeys.labelEnabledSix,
        color: "#3366FF" // blue
      });
    }
    
    if (settings.hotkeys.labelEnabledSeven) {
      labels.push({
        key: settings.hotkeys.labelKeySeven,
        name: settings.hotkeys.labelNameSeven,
        enabled: settings.hotkeys.labelEnabledSeven,
        color: "#FF6600" // orange
      });
    }
    return labels;
  }, [settings.hotkeys]);

  // Get the maximum available label value
  const maxLabelValue = useMemo(() => {
    return enabledLabels.length;
  }, [enabledLabels]);

  // Return a color based on the mark value
  const getTriangleColor = (mark: LabelMark | undefined): string => {
    if (!mark || mark.number <= 0 || mark.number > enabledLabels.length) {
      return "";
    }
    
    return enabledLabels[mark.number - 1].color;
  };

  const getLabelNameByNumber = (number: number): string => {
    if (number === 0) {
      return "No label";
    }
    
    if (number > 0 && number <= enabledLabels.length) {
      return enabledLabels[number - 1].name;
    }
    
    return "";
  };

  // Map a key to its label value (1-based index in enabledLabels array)
  const getKeyLabelValue = (key: string): number => {
    const index = enabledLabels.findIndex(label => label.key === key);
    return index >= 0 ? index + 1 : 0;
  };

  // Load CSV data and image metadata
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const metadataPath = settings.paths.metadataPath;
        console.log("Attempting to load CSV from:", metadataPath);
        
        let response = await fetch(metadataPath);
        
        // If the configured path fails, try the fallback path
        if (!response.ok) {
          console.warn(`Failed to load CSV from configured path: ${metadataPath}`);
          if (!response.ok) {
            throw new Error(`Failed to load CSV from fallback path: ${response.status}`);
          }
        }
        
        const csvText = await response.text();
    
        // Rest of your CSV processing code remains the same
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");
        const cleanedHeaderLine = lines[0].replace("\r", "").trim();
        const headers = cleanedHeaderLine.split(",").map(header => header.trim());
    
        // Debug: Log the headers to see what's available
        console.log("CSV Headers:", headers);
    
        // Use case-insensitive search for column names
        const thumbnailIndex = headers.findIndex(header => 
          header.toLowerCase() === "filename");
        const labelIndex = headers.findIndex(header => 
          header.toLowerCase() === "label");
    
        // Find indices of enabled metadata columns
        const metadataIndices: { [key: string]: number } = {};
        
        if (settings.metadata && settings.metadata.columns) {
          for (const column of settings.metadata.columns) {
            if (column.enabled && column.name.toLowerCase() !== "label") {
              metadataIndices[column.name] = headers.findIndex(header => 
                header.toLowerCase() === column.name.toLowerCase());
            }
          }
        }
    
        // Debug: Log which indexes were found
        console.log("Column indexes:", {
          thumbnailIndex,
          metadataIndices,
          labelIndex
        });
        
        setCsvData({ headers, lines });
        setHasLabelColumn(labelIndex !== -1);
    
        if (thumbnailIndex === -1) {
          console.error("filename column not found");
          return;
        }
    
        const imagePath = settings.paths.imagePath;
        
        // Erstelle ein temporäres neues imageMarks-Objekt, das wir später setzen werden
        const newImageMarks: { [key: number]: LabelMark } = {};
        
        const images = lines.slice(1).map((line, idx) => {
          const columns = line.replace("\r", "").split(",").map(col => col.trim());
          const fileName = columns[thumbnailIndex]?.trim();
          const encodedFileName = encodeURIComponent(fileName);
          
          // Create metadata object with enabled columns
          const metadata: { [key: string]: string } = {};
          
          // Add metadata from enabled columns
          Object.entries(metadataIndices).forEach(([columnName, columnIndex]) => {
            if (columnIndex !== -1) {
              metadata[columnName] = columns[columnIndex]?.trim() || "";
            }
          });
          
          const imageItem: ImageItem = {
            fileName,
            fullPath: `${imagePath}${encodedFileName}`,
            metadata
          };
          
          // Wenn die CSV einen Labelwert hat, versuchen wir ihn zu verwenden
          if (labelIndex !== -1) {
            const labelValue = columns[labelIndex]?.trim() || "";
            
            if (labelValue) {
              let labelNumber = 0;
              let labelName = labelValue;
              
              // Prüfen, ob das Label ein bekannter Name aus unseren enabledLabels ist
              const foundLabelIndex = enabledLabels.findIndex(
                label => label.name === labelValue
              );
              
              if (foundLabelIndex >= 0) {
                // Wenn wir das Label gefunden haben, verwenden wir seinen Index+1 als Nummer
                labelNumber = foundLabelIndex + 1;
              } else if (!isNaN(parseInt(labelValue))) {
                // Wenn es eine Zahl ist, dann versuchen wir, den Namen zu finden
                labelNumber = parseInt(labelValue);
                if (labelNumber > 0 && labelNumber <= enabledLabels.length) {
                  labelName = enabledLabels[labelNumber - 1].name;
                } else {
                  labelName = "No label";
                }
              }
              
              // Speichere sowohl Nummer als auch Namen im ImageItem
              imageItem.label = labelNumber;
              imageItem.labelName = labelName;
              
              // Speichere im imageMarks Objekt
              newImageMarks[idx] = {
                number: labelNumber,
                name: labelName
              };
            }
          }
          
          return imageItem;
        });
    
        setImagePaths(images);
        // Setze die imageMarks am Ende
        setImageMarks(newImageMarks);
        
      } catch (error) {
        console.error("Error loading CSV data:", error);
        showError("Error loading the CSV data. Please check the file and try again.");
      }
    };
  
    loadCSVData();
  }, [settings.paths.metadataPath, settings.paths.imagePath, settings.metadata]);

  // Calculate grid layout based on container size
  useEffect(() => {
    if (!gridRef.current) return;
  
    const gap = 4; // Gap in pixels between images
    const cols = settings.layout.imagesPerColumn;
  
    const updateGridLayout = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const gridHeight = gridRef.current.offsetHeight;
        const imageSize = (gridWidth - gap * (cols - 1)) / cols;
        setComputedImageSize(imageSize);
  
        const rows = Math.floor((gridHeight + gap) / (imageSize + gap)) || 1;
        setItemsPerPage(rows * cols);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateGridLayout();
    });
    resizeObserver.observe(gridRef.current);
    updateGridLayout();
  
    return () => {
      resizeObserver.disconnect();
    };
  }, [settings.layout.imagesPerColumn]);

  // Filter images based on selected filter option
  const filteredImages = useMemo(() => {
    return imagePaths
      .map((img, idx) => ({ img, idx }))
      .filter(({ idx }) => {
        if (filter === "all") return true;
        if (filter === "unmarked") {
          // Check for images with no entry OR images with "No label"
          return !imageMarks[idx] || imageMarks[idx].name === "No label";
        }
        const filterNum = Number(filter);
        return imageMarks[idx]?.number === filterNum;
      });
  }, [imagePaths, imageMarks, filter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setCurrentImageIndex(0);
  }, [filter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedImagesForPage = filteredImages.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage) || 1;

  // Neue Funktion für die Fehleranzeige
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    
    // Automatisches Ausblenden nach 5 Sekunden
    if (errorTimerRef.current) {
      window.clearTimeout(errorTimerRef.current);
    }
    
    errorTimerRef.current = window.setTimeout(() => {
      setShowErrorMessage(false);
    }, 5000);
  };

  // Auto-save imageMarks to CSV
  useEffect(() => {
    if (Object.keys(imageMarks).length > 0) {
      saveLabelsToCSV();
    }
  }, [imageMarks]);

  // Save labels back to CSV file
  const saveLabelsToCSV = async () => {
    try {
      if (imagePaths.length === 0 || csvData.lines.length <= 1) {
        return;
      }
  
      // Erhöhe den Zähler für ausstehende Speicherungen
      setPendingSaves(prev => prev + 1);
      
      let updatedCsvContent = '';
      
      // Process headers
      let headers = [...csvData.headers];
      if (!hasLabelColumn) {
        headers.push('label');
      }
      updatedCsvContent += headers.join(',') + '\n';
      
      // Process data rows
      const dataLines = csvData.lines.slice(1);
      dataLines.forEach((line, idx) => {
        const columns = line.replace("\r", "").split(',').map(col => col.trim());
        
        // Get the label name for this image
        const labelMark = imageMarks[idx];
        
        // Verwende den Namen des Labels anstatt der Nummer
        const labelNameToSave = labelMark ? labelMark.name : "No label";
        
        if (hasLabelColumn) {
          const labelIndex = csvData.headers.indexOf('label');
          if (labelIndex !== -1) {
            columns[labelIndex] = labelNameToSave;
          }
        } else {
          columns.push(labelNameToSave);
        }
        
        updatedCsvContent += columns.join(',') + '\n';
      });
      
      const response = await fetch('/api/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: settings.paths.metadataPath,
          content: updatedCsvContent
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save CSV file');
      }
      
      console.log('Labels saved to CSV successfully');
      setPendingSaves(prev => prev - 1);
      setLastSaveSuccess(true);
    } catch (error) {
      console.error('Error saving labels to CSV:', error);
      
      // Verringern der ausstehenden Speicherungen und Fehler anzeigen
      setPendingSaves(prev => prev - 1);
      setLastSaveSuccess(false);
      
      // Fehlermeldung anzeigen
      showError('Error saving the labels to the CSV file. Your changes may not have been saved.');
    }
  };

  // Effect, um auf Änderungen im Speicherstatus zu reagieren
  useEffect(() => {
    if (pendingSaves === 0 && !lastSaveSuccess) {
      showError('Error when saving the labels. The last changes were not saved in the CSV file.');
    }
  }, [pendingSaves, lastSaveSuccess]);

  // Cycle through valid label values (0 through the maximum enabled label)
  const cycleMarking = useCallback((globalIndex: number) => {
    setImageMarks((prev) => {
      // Hole die aktuelle Markierung oder setze sie auf 0 wenn nicht vorhanden
      const currentMark = prev[globalIndex]?.number ?? 0;
      
      // Berechne den neuen Wert im Zyklus
      const newMarkNumber = (currentMark + 1) % (maxLabelValue + 1);
      
      // Erstelle das neue Marks-Objekt
      const newMarks = { ...prev };
      
      if (newMarkNumber === 0) {
        // Wenn der neue Wert 0 ist (keine Markierung), entferne den Eintrag
        delete newMarks[globalIndex];
      } else {
        // Ansonsten, setze die neue Markierung mit Nummer und Namen
        newMarks[globalIndex] = {
          number: newMarkNumber,
          name: getLabelNameByNumber(newMarkNumber)
        };
      }
      
      return newMarks;
    });
  }, [maxLabelValue, enabledLabels]);

  // Set specific mark value for current image
  const updateMarkingForCurrentImage = useCallback(
    (newMark: number) => {
      // Only update if the mark is valid (0 or within range of enabled labels)
      if (newMark < 0 || (newMark > 0 && newMark > maxLabelValue)) {
        return;
      }
      
      const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
      if (currentItem) {
        const globalIndex = currentItem.idx;
        setImageMarks((prev) => {
          const newMarks = { ...prev };
          
          if (newMark === 0) {
            // Wenn kein Label, entferne den Eintrag
            delete newMarks[globalIndex];
          } else {
            // Ansonsten, speichere Nummer und Namen
            newMarks[globalIndex] = {
              number: newMark,
              name: getLabelNameByNumber(newMark)
            };
          }
          
          return newMarks;
        });
      }
    },
    [filteredImages, currentPage, currentImageIndex, itemsPerPage, maxLabelValue, enabledLabels]
  );
  

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      setCurrentImageIndex(0);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      setCurrentImageIndex(0);
    }
  }, [currentPage]);

  const goToPreviousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    } else if (currentImageIndex === 0 && currentPage > 1) {
      goToPreviousPage();
    }
  }, [currentImageIndex, currentPage, goToPreviousPage]);

  const goToNextImage = useCallback(() => {
    const globalIndex = (currentPage - 1) * itemsPerPage + currentImageIndex;
    if (currentImageIndex < itemsPerPage - 1 && globalIndex < filteredImages.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    } else if (currentImageIndex === itemsPerPage - 1) {
      goToNextPage();
    }
  }, [currentImageIndex, filteredImages.length, itemsPerPage, currentPage, goToNextPage]);

  const goUpImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => {
      const columnCount = settings.layout.imagesPerColumn;
      const upIndex = prevIndex - columnCount;
      return upIndex >= 0 ? upIndex : prevIndex;
    });
  }, [settings.layout?.imagesPerColumn]);
  
  const goDownImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => {
      const columnCount = settings.layout.imagesPerColumn;
      const downIndex = prevIndex + columnCount;
      return downIndex < selectedImagesForPage.length ? downIndex : prevIndex;
    });
  }, [selectedImagesForPage.length, settings.layout?.imagesPerColumn]);

  // Keyboard event handler for navigation and labeling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showSettings) return;
      
      const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
      
      if (event.key === "ArrowLeft") {
        if (event.ctrlKey || event.metaKey) { 
          goToPreviousPage();
        } else {
          goToPreviousImage();
        }
      } else if (event.key === "ArrowRight") {
        if (event.ctrlKey || event.metaKey) {  
          goToNextPage();
        } else {
          goToNextImage();
        }
      } else if (event.key === "ArrowUp") {
        goUpImage();
      } else if (event.key === "ArrowDown") {
        goDownImage();
      } else if (event.key === "0") { // Unlabel hotkey
        updateMarkingForCurrentImage(0);
      } else if (event.key === settings.hotkeys.labelRotation) {
        if (currentItem) {
          cycleMarking(currentItem.idx);
        }
      } else {
        // Check if the pressed key matches any of the enabled label keys
        const labelValue = getKeyLabelValue(event.key);
        if (labelValue > 0) {
          updateMarkingForCurrentImage(labelValue);
        }
      } 
      
      if (event.key === " ") {
        event.preventDefault();
        if (currentItem) {
          setZoomedImage((prevZoom) =>
            prevZoom === currentItem.img.fullPath ? null : currentItem.img.fullPath
          );
        }
      }
    },
    [
      showSettings,
      goToPreviousImage,
      goToNextImage,
      goUpImage,
      goDownImage,
      cycleMarking,
      currentPage,
      currentImageIndex,
      filteredImages,
      updateMarkingForCurrentImage,
      goToNextPage,
      goToPreviousPage,
      itemsPerPage,
      settings.hotkeys,
      getKeyLabelValue
    ]
  );

  // Add/remove keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Find the zoomed image's metadata if one is selected
  const zoomedImageItem = imagePaths.find((item) => item.fullPath === zoomedImage);

  // Toggle settings view
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Refresh settings after the settings component closes
  const handleSettingsClose = async () => {
    setShowSettings(false);
    
    // Reload settings
    try {
      const response = await fetch("/settings.json");
      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Show settings panel if settings view is active
  if (showSettings) {
    return <Settings onClose={handleSettingsClose} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Top Bar */}
      <div className={`sticky top-0 ${settings.layout.selectedColorHeaderBackground} z-10`}>
        <div className="flex flex-wrap items-center p-1.5 relative">
          {/* Labels container that will wrap to next line only when needed */}
          <div className="flex flex-wrap items-center gap-2 max-w-[40%]">
            <span className="px-3 py-1.5 rounded-md text-sm bg-slate-100 text-slate-700 font-medium border border-slate-200">
              0: Unclassified
            </span>
            {enabledLabels.map((label, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-md text-sm border font-medium flex items-center gap-1.5"
                style={{
                  backgroundColor: `${label.color}40`,
                  color: "black",
                  borderColor: `${label.color}60`
                }}
              >
                {label.key}: {label.name}
              </span>
            ))}
          </div>
         
          {/* Center title - remains centered on the first row */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center">
            <h1 className={`text-xl font-semibold text-slate-800`}>
              {settings.layout.galleryTitle || "Image Gallery"}
            </h1>
          </div>
         
          {/* Filter controls - adjusted to match other element heights */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-600 font-medium">Filter Results:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="all">All Images</option>
              <option value="unmarked">Unclassified</option>
              {/* Only include enabled labels in the filter dropdown */}
              {enabledLabels.map((label, index) => (
                <option key={index} value={(index + 1).toString()}>
                  {label.name}
                </option>
              ))}
            </select>
            <div className="px-3 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors border border-slate-200 flex items-center">
              <FaCog
                className="text-slate-700 cursor-pointer"
                onClick={toggleSettings}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Image Grid */}
      <div className={`flex-grow overflow-auto p-1.5 ${settings.layout.selectedColorMainBackground}`}>
      <div
        ref={gridRef}
        className="grid gap-1 justify-center"
        style={{
          gridTemplateColumns: `repeat(${settings.layout.imagesPerColumn}, ${computedImageSize}px)`,
          alignContent: "start",
          height: "100%",
        }}
      >
          {selectedImagesForPage.map(({ img, idx }, index) => {
            const mark = imageMarks[idx] ?? 0;
            const containerStyle: CSSProperties = {
              width: `${computedImageSize}px`,
              height: `${computedImageSize}`,
              border: currentImageIndex === index ? "2px solid blue" : "none",
            };

            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-md shadow-sm bg-gray-50"
                style={containerStyle}
              >
                {/* Mark indicator triangle */}
                {imageMarks[idx] && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 0,
                      height: 0,
                      borderTop: "20px solid " + getTriangleColor(imageMarks[idx]),
                      borderLeft: "20px solid transparent",
                    }}
                  />
                )}
                <img
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    cycleMarking(idx);
                  }}
                  src={img.fullPath}
                  alt={`Image ${idx + 1} - ${img.fileName}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar with Controls */}
      <div className={`grid grid-cols-3 items-center p-1.5 ${settings.layout.selectedColorFooterBackground} shadow-inner`}>
        <div className="flex space-x-2">
          <button
            onClick={exportSelection}
            className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Labels
          </button>
        </div>

        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-slate-100 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-slate-200 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="text-sm font-semibold text-slate-700 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-slate-100 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-slate-200 flex items-center gap-1"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div></div>
      </div>

      {/* Zoom Overlay with Metadata */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          {zoomedImageItem && (
            <div className="bg-white p-1.5 mb-4 rounded shadow-md text-black text-center">
              {/* Only show label if enabled in settings */}
              {settings.metadata.columns.some(col => col.name.toLowerCase() === "label" && col.enabled) && (
                <p>
                  <strong>Label:</strong>{" "}
                  {imageMarks[
                    imagePaths.findIndex((item) => item.fullPath === zoomedImage)
                  ]?.name || "No label"}
                </p>
              )}
              
              {/* Render only enabled metadata columns dynamically */}
              {Object.entries(zoomedImageItem.metadata).map(([columnName, value]) => {
                // Check if this column is enabled in settings
                const isEnabled = settings.metadata.columns.some(
                  col => col.name.toLowerCase() === columnName.toLowerCase() && col.enabled
                );
                
                return isEnabled ? (
                  <p key={columnName}>
                    <strong>{columnName}:</strong> {value}
                  </p>
                ) : null;
              })}
            </div>
          )}
          <img
            src={zoomedImage}
            alt="Zoomed"
            style={{ maxWidth: "67vw", maxHeight: "67vh" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Hier die Fehlerbenachrichtigung einfügen */}
      {showErrorMessage && (
        <div 
          className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center"
          style={{ maxWidth: "400px" }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2 flex-shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div>
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setShowErrorMessage(false)}
            className="ml-auto bg-red-700 hover:bg-red-800 rounded-full p-1"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

    // Export current image selection to CSV
    function exportSelection() {
      try {
        // Get the metadata path from settings
        const metadataPath = settings.paths.metadataPath;
        
        // Create a download link that points directly to the metadata file
        const link = document.createElement("a");
        link.setAttribute("href", metadataPath);
        
        // Extract filename from the path
        const fileName = metadataPath.split('/').pop() || "metadata.csv";
        link.setAttribute("download", fileName);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Metadata file export initiated');
      } catch (error) {
        console.error('Error exporting metadata file:', error);
      }
    }
}