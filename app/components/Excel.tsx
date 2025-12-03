import Settings from "./Settings";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  CSSProperties,
} from "react";
import { FaCog, FaPlay, FaPause } from 'react-icons/fa';

// Core interfaces for app data structures
interface SettingsData {
  hotkeys: {
    labelRotation: string;
    labels: Array<{
      acronym: string;
      name: string;
      enabled: boolean;
    }>;
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
  label?: number;
  labelName?: string;
  comment?: string;
}

interface LabelInfo {
  acronym: string;
  name: string;
  enabled: boolean;
  color: string;
}

interface LabelMark {
  number: number;
  name: string;
  acronym: string;
}

// History state for undo/redo
interface HistoryState {
  imageMarks: { [key: number]: LabelMark };
  imageComments: { [key: number]: string };
  description: string; // For debugging/display purposes
}

// Generate colors for 50 labels
const generateLabelColors = (count: number): string[] => {
  const colors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
    "#14B8A6", "#F43F5E", "#A855F7", "#0EA5E9", "#22C55E",
    "#EAB308", "#DC2626", "#9333EA", "#0284C7", "#16A34A",
    "#CA8A04", "#B91C1C", "#7C3AED", "#0369A1", "#15803D",
    "#A16207", "#991B1B", "#6D28D9", "#075985", "#166534",
    "#854D0E", "#7F1D1D", "#5B21B6", "#0C4A6E", "#14532D",
    "#713F12", "#450A0A", "#4C1D95", "#082F49", "#052E16",
    "#78350F", "#FCA5A5", "#FCD34D", "#6EE7B7", "#93C5FD",
    "#C4B5FD", "#F9A8D4", "#67E8F9", "#BEF264", "#FDBA74"
  ];
  return colors.slice(0, count);
};

// Maximum history size to prevent memory issues
const MAX_HISTORY_SIZE = 50;

// Helper function to check if a file is a GIF
const isGifFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.gif');
};

export default function ImageGallery() {
  const [imagePaths, setImagePaths] = useState<ImageItem[]>([]);
  const [imageMarks, setImageMarks] = useState<{ [key: number]: LabelMark }>({});
  const [imageComments, setImageComments] = useState<{ [key: number]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [computedImageSize, setComputedImageSize] = useState(200);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [csvData, setCsvData] = useState<{headers: string[], lines: string[]}>({ headers: [], lines: [] });
  const [hasLabelColumn, setHasLabelColumn] = useState(false);
  const [hasCommentColumn, setHasCommentColumn] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingSaves, setPendingSaves] = useState(0);
  const [lastSaveSuccess, setLastSaveSuccess] = useState(true);
  const errorTimerRef = useRef<number | null>(null);
  
  // Undo/Redo history stacks
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  
  // New states for acronym typing
  const [typingBuffer, setTypingBuffer] = useState<string>("");
  const typingTimerRef = useRef<number | null>(null);
  
  // New state for label selection dropdown
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  
  // New state for comment dialog
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // GIF pause states
  const [pausedGifs, setPausedGifs] = useState<Set<number>>(new Set());
  const [pausedFrames, setPausedFrames] = useState<{ [key: number]: string }>({});
  const imageRefs = useRef<{ [key: number]: HTMLImageElement | null }>({});
  
  const [settings, setSettings] = useState<SettingsData>({
    hotkeys: {
      labelRotation: "Enter",
      labels: Array.from({ length: 50 }, (_, i) => ({
        acronym: `L${i + 1}`,
        name: `Label ${i + 1}`,
        enabled: i < 5
      }))
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
        { name: "description", enabled: true },
        { name: "comment", enabled: true }
      ]
    }
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Capture current frame of a GIF using canvas
  const captureGifFrame = useCallback((imgElement: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth || imgElement.width;
    canvas.height = imgElement.naturalHeight || imgElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/png');
  }, []);

  // Toggle GIF pause state
  const toggleGifPause = useCallback((idx: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent triggering label cycle
    }
    
    const imgElement = imageRefs.current[idx];
    
    if (pausedGifs.has(idx)) {
      // Unpause - remove from paused set
      setPausedGifs(prev => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    } else {
      // Pause - capture current frame
      if (imgElement) {
        const frame = captureGifFrame(imgElement);
        setPausedFrames(prev => ({ ...prev, [idx]: frame }));
      }
      setPausedGifs(prev => new Set(prev).add(idx));
    }
  }, [pausedGifs, captureGifFrame]);

  // Save current state to undo stack before making changes
  const saveToHistory = useCallback((description: string) => {
    const currentState: HistoryState = {
      imageMarks: { ...imageMarks },
      imageComments: { ...imageComments },
      description
    };
    
    setUndoStack(prev => {
      const newStack = [...prev, currentState];
      // Limit stack size
      if (newStack.length > MAX_HISTORY_SIZE) {
        return newStack.slice(-MAX_HISTORY_SIZE);
      }
      return newStack;
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [imageMarks, imageComments]);

  // Undo function
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    // Save current state to redo stack
    const currentState: HistoryState = {
      imageMarks: { ...imageMarks },
      imageComments: { ...imageComments },
      description: "Current state"
    };
    setRedoStack(prev => [...prev, currentState]);
    
    // Get last state from undo stack
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    // Apply previous state
    setImageMarks(previousState.imageMarks);
    setImageComments(previousState.imageComments);
    
    console.log(`Undo: ${previousState.description}`);
  }, [undoStack, imageMarks, imageComments]);

  // Redo function
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    // Save current state to undo stack
    const currentState: HistoryState = {
      imageMarks: { ...imageMarks },
      imageComments: { ...imageComments },
      description: "Current state"
    };
    setUndoStack(prev => [...prev, currentState]);
    
    // Get last state from redo stack
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    // Apply next state
    setImageMarks(nextState.imageMarks);
    setImageComments(nextState.imageComments);
    
    console.log(`Redo: ${nextState.description}`);
  }, [redoStack, imageMarks, imageComments]);

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
      }
    };
    
    loadSettings();
  }, []);
  
  // Get all enabled labels with their information
  const enabledLabels = useMemo(() => {
    if (!settings.hotkeys.labels || !Array.isArray(settings.hotkeys.labels)) {
      return [];
    }
    
    const colors = generateLabelColors(settings.hotkeys.labels.length);
    
    return settings.hotkeys.labels
      .map((label, index) => ({
        acronym: label.acronym,
        name: label.name,
        enabled: label.enabled,
        color: colors[index]
      }))
      .filter(label => label.enabled);
  }, [settings.hotkeys.labels]);

  // Get the maximum available label value
  const maxLabelValue = useMemo(() => {
    return enabledLabels.length;
  }, [enabledLabels]);

  const getLabelNameByNumber = useCallback((number: number): string => {
    if (number === 0) {
      return "No label";
    }
    
    if (number > 0 && number <= enabledLabels.length) {
      return enabledLabels[number - 1].name;
    }
    
    return "";
  }, [enabledLabels]);

  const getLabelAcronymByNumber = useCallback((number: number): string => {
    if (number === 0) {
      return "";
    }
    
    if (number > 0 && number <= enabledLabels.length) {
      return enabledLabels[number - 1].acronym;
    }
    
    return "";
  }, [enabledLabels]);

  // Find label by acronym (supports partial matching)
  const findLabelByAcronym = useCallback((acronym: string): number => {
    if (!acronym) return 0;
    
    const upperAcronym = acronym.toUpperCase();
    
    // First try exact match
    const exactMatch = enabledLabels.findIndex(
      label => label.acronym.toUpperCase() === upperAcronym
    );
    if (exactMatch >= 0) return exactMatch + 1;
    
    // Then try prefix match
    const prefixMatch = enabledLabels.findIndex(
      label => label.acronym.toUpperCase().startsWith(upperAcronym)
    );
    if (prefixMatch >= 0) return prefixMatch + 1;
    
    return 0;
  }, [enabledLabels]);

  // Load CSV data and image metadata
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const metadataPath = settings.paths.metadataPath;
        console.log("Attempting to load CSV from:", metadataPath);
        
        let response = await fetch(metadataPath);
        
        if (!response.ok) {
          console.warn(`Failed to load CSV from configured path: ${metadataPath}`);
          if (!response.ok) {
            throw new Error(`Failed to load CSV from fallback path: ${response.status}`);
          }
        }
        
        const csvText = await response.text();
    
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");
        const cleanedHeaderLine = lines[0].replace("\r", "").trim();
        const headers = cleanedHeaderLine.split(",").map(header => header.trim());
    
        console.log("CSV Headers:", headers);
    
        const thumbnailIndex = headers.findIndex(header => 
          header.toLowerCase() === "filename");
        const labelIndex = headers.findIndex(header => 
          header.toLowerCase() === "label");
        const commentIndex = headers.findIndex(header => 
          header.toLowerCase() === "comment");
    
        const metadataIndices: { [key: string]: number } = {};
        
        if (settings.metadata && settings.metadata.columns) {
          for (const column of settings.metadata.columns) {
            if (column.enabled && column.name.toLowerCase() !== "label" && column.name.toLowerCase() !== "comment") {
              metadataIndices[column.name] = headers.findIndex(header => 
                header.toLowerCase() === column.name.toLowerCase());
            }
          }
        }
    
        console.log("Column indexes:", {
          thumbnailIndex,
          metadataIndices,
          labelIndex,
          commentIndex
        });
        
        setCsvData({ headers, lines });
        setHasLabelColumn(labelIndex !== -1);
        setHasCommentColumn(commentIndex !== -1);
    
        if (thumbnailIndex === -1) {
          console.error("filename column not found");
          return;
        }
    
        const imagePath = settings.paths.imagePath;
        const newImageMarks: { [key: number]: LabelMark } = {};
        const newImageComments: { [key: number]: string } = {};
        
        const images = lines.slice(1).map((line, idx) => {
          const columns = line.replace("\r", "").split(",").map(col => col.trim());
          const fileName = columns[thumbnailIndex]?.trim();
          const encodedFileName = encodeURIComponent(fileName);
          
          const metadata: { [key: string]: string } = {};
          
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
          
          // Load label
          if (labelIndex !== -1) {
            const labelValue = columns[labelIndex]?.trim() || "";
            
            if (labelValue) {
              let labelNumber = 0;
              let labelName = labelValue;
              let labelAcronym = "";
              
              const foundLabelIndex = enabledLabels.findIndex(
                label => label.name === labelValue || label.acronym.toUpperCase() === labelValue.toUpperCase()
              );
              
              if (foundLabelIndex >= 0) {
                labelNumber = foundLabelIndex + 1;
                labelName = enabledLabels[foundLabelIndex].name;
                labelAcronym = enabledLabels[foundLabelIndex].acronym;
              } else if (!isNaN(parseInt(labelValue))) {
                labelNumber = parseInt(labelValue);
                if (labelNumber > 0 && labelNumber <= enabledLabels.length) {
                  labelName = enabledLabels[labelNumber - 1].name;
                  labelAcronym = enabledLabels[labelNumber - 1].acronym;
                } else {
                  labelName = "No label";
                  labelAcronym = "";
                }
              }
              
              imageItem.label = labelNumber;
              imageItem.labelName = labelName;
              
              newImageMarks[idx] = {
                number: labelNumber,
                name: labelName,
                acronym: labelAcronym
              };
            }
          }
          
          // Load comment
          if (commentIndex !== -1) {
            const commentValue = columns[commentIndex]?.trim() || "";
            if (commentValue) {
              imageItem.comment = commentValue;
              newImageComments[idx] = commentValue;
            }
          }
          
          return imageItem;
        });
    
        setImagePaths(images);
        setImageMarks(newImageMarks);
        setImageComments(newImageComments);
        
        // Clear history when loading new data
        setUndoStack([]);
        setRedoStack([]);
        
        // Clear GIF pause states when loading new data
        setPausedGifs(new Set());
        setPausedFrames({});
        
      } catch (error) {
        console.error("Error loading CSV data:", error);
        showError("Error loading the CSV data. Please check the file and try again.");
      }
    };
  
    loadCSVData();
  }, [settings.paths.metadataPath, settings.paths.imagePath, settings.metadata, enabledLabels]);

  // Calculate grid layout based on container size
  useEffect(() => {
    if (!gridRef.current) return;
  
    const gap = 4;
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

  // Count GIFs on current page
  const gifsOnPage = useMemo(() => {
    return selectedImagesForPage.filter(({ img }) => isGifFile(img.fileName)).length;
  }, [selectedImagesForPage]);

  const pausedGifsOnPage = useMemo(() => {
    return selectedImagesForPage.filter(({ img, idx }) => 
      isGifFile(img.fileName) && pausedGifs.has(idx)
    ).length;
  }, [selectedImagesForPage, pausedGifs]);

  // Pause all GIFs on current page
  const pauseAllGifs = useCallback(() => {
    const gifIndices = selectedImagesForPage
      .filter(({ img }) => isGifFile(img.fileName))
      .map(({ idx }) => idx);
    
    const newPausedFrames: { [key: number]: string } = { ...pausedFrames };
    
    gifIndices.forEach(idx => {
      const imgElement = imageRefs.current[idx];
      if (imgElement && !pausedGifs.has(idx)) {
        newPausedFrames[idx] = captureGifFrame(imgElement);
      }
    });
    
    setPausedFrames(newPausedFrames);
    setPausedGifs(new Set([...Array.from(pausedGifs), ...gifIndices]));
  }, [selectedImagesForPage, pausedGifs, pausedFrames, captureGifFrame]);

  // Resume all GIFs on current page
  const resumeAllGifs = useCallback(() => {
    const gifIndices = selectedImagesForPage
      .filter(({ img }) => isGifFile(img.fileName))
      .map(({ idx }) => idx);
    
    setPausedGifs(prev => {
      const newSet = new Set(prev);
      gifIndices.forEach(idx => newSet.delete(idx));
      return newSet;
    });
  }, [selectedImagesForPage]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    
    if (errorTimerRef.current) {
      window.clearTimeout(errorTimerRef.current);
    }
    
    errorTimerRef.current = window.setTimeout(() => {
      setShowErrorMessage(false);
    }, 5000);
  };

  // Auto-save imageMarks and comments to CSV
  useEffect(() => {
    if (Object.keys(imageMarks).length > 0 || Object.keys(imageComments).length > 0) {
      saveLabelsToCSV();
    }
  }, [imageMarks, imageComments]);

  // Save labels and comments back to CSV file
  const saveLabelsToCSV = async () => {
    try {
      if (imagePaths.length === 0 || csvData.lines.length <= 1) {
        return;
      }
  
      setPendingSaves(prev => prev + 1);
      
      let updatedCsvContent = '';
      
      // Build headers - track positions for new columns
      let headers = [...csvData.headers];
      let labelColumnIndex = csvData.headers.findIndex(h => h.toLowerCase() === 'label');
      let commentColumnIndex = csvData.headers.findIndex(h => h.toLowerCase() === 'comment');
      
      // Add label column if it doesn't exist
      if (labelColumnIndex === -1) {
        labelColumnIndex = headers.length;
        headers.push('label');
      }
      
      // Add comment column if it doesn't exist
      if (commentColumnIndex === -1) {
        commentColumnIndex = headers.length;
        headers.push('comment');
      }
      
      updatedCsvContent += headers.join(',') + '\n';
      
      const dataLines = csvData.lines.slice(1);
      dataLines.forEach((line, idx) => {
        const columns = line.replace("\r", "").split(',').map(col => col.trim());
        
        // Ensure columns array has enough elements for all headers
        while (columns.length < headers.length) {
          columns.push('');
        }
        
        // Handle label - set at the correct index
        const labelMark = imageMarks[idx];
        const labelNameToSave = labelMark ? labelMark.name : "No label";
        columns[labelColumnIndex] = labelNameToSave;
        
        // Handle comment - set at the correct index
        const comment = imageComments[idx] || "";
        columns[commentColumnIndex] = comment;
        
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
      
      console.log('Labels and comments saved to CSV successfully');
      setPendingSaves(prev => prev - 1);
      setLastSaveSuccess(true);
    } catch (error) {
      console.error('Error saving labels to CSV:', error);
      
      setPendingSaves(prev => prev - 1);
      setLastSaveSuccess(false);
      
      showError('Error saving the labels to the CSV file. Your changes may not have been saved.');
    }
  };

  useEffect(() => {
    if (pendingSaves === 0 && !lastSaveSuccess) {
      showError('Error when saving the labels. The last changes were not saved in the CSV file.');
    }
  }, [pendingSaves, lastSaveSuccess]);

  // Cycle through valid label values (with history)
  const cycleMarking = useCallback((globalIndex: number) => {
    const currentMark = imageMarks[globalIndex]?.number ?? 0;
    const newMarkNumber = (currentMark + 1) % (maxLabelValue + 1);
    const imageName = imagePaths[globalIndex]?.fileName || `Image ${globalIndex}`;
    
    // Save to history before making changes
    saveToHistory(`Label changed on ${imageName}`);
    
    setImageMarks((prev) => {
      const newMarks = { ...prev };
      
      if (newMarkNumber === 0) {
        delete newMarks[globalIndex];
      } else {
        newMarks[globalIndex] = {
          number: newMarkNumber,
          name: getLabelNameByNumber(newMarkNumber),
          acronym: getLabelAcronymByNumber(newMarkNumber)
        };
      }
      
      return newMarks;
    });
  }, [maxLabelValue, imageMarks, imagePaths, saveToHistory, getLabelNameByNumber, getLabelAcronymByNumber]);

  // Set specific mark value for current image (with history)
  const updateMarkingForCurrentImage = useCallback(
    (newMark: number) => {
      if (newMark < 0 || (newMark > 0 && newMark > maxLabelValue)) {
        return;
      }
      
      const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
      if (currentItem) {
        const globalIndex = currentItem.idx;
        const imageName = imagePaths[globalIndex]?.fileName || `Image ${globalIndex}`;
        
        // Save to history before making changes
        saveToHistory(`Label set on ${imageName}`);
        
        setImageMarks((prev) => {
          const newMarks = { ...prev };
          
          if (newMark === 0) {
            delete newMarks[globalIndex];
          } else {
            newMarks[globalIndex] = {
              number: newMark,
              name: getLabelNameByNumber(newMark),
              acronym: getLabelAcronymByNumber(newMark)
            };
          }
          
          return newMarks;
        });
      }
    },
    [filteredImages, currentPage, currentImageIndex, itemsPerPage, maxLabelValue, imagePaths, saveToHistory, getLabelNameByNumber, getLabelAcronymByNumber]
  );

  // Set marking by acronym for current image
  const setMarkingByAcronym = useCallback(
    (acronym: string) => {
      const labelNumber = findLabelByAcronym(acronym);
      if (labelNumber > 0) {
        updateMarkingForCurrentImage(labelNumber);
      }
    },
    [findLabelByAcronym, updateMarkingForCurrentImage]
  );

  // Open comment dialog for current image
  const openCommentDialog = useCallback(() => {
    const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
    if (currentItem) {
      const existingComment = imageComments[currentItem.idx] || "";
      setCurrentComment(existingComment);
      setShowCommentDialog(true);
    }
  }, [filteredImages, currentPage, currentImageIndex, itemsPerPage, imageComments]);

  // Save comment for current image (with history)
  const saveComment = useCallback(() => {
    const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
    if (currentItem) {
      const globalIndex = currentItem.idx;
      const imageName = imagePaths[globalIndex]?.fileName || `Image ${globalIndex}`;
      
      // Save to history before making changes
      saveToHistory(`Comment changed on ${imageName}`);
      
      setImageComments((prev) => {
        const newComments = { ...prev };
        if (currentComment.trim()) {
          newComments[globalIndex] = currentComment.trim();
        } else {
          delete newComments[globalIndex];
        }
        return newComments;
      });
    }
    setShowCommentDialog(false);
    setCurrentComment("");
  }, [filteredImages, currentPage, currentImageIndex, itemsPerPage, currentComment, imagePaths, saveToHistory]);

  // Focus comment input when dialog opens
  useEffect(() => {
    if (showCommentDialog && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [showCommentDialog]);

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

  const getCurrentSelectedFile = useCallback(() => {
    const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];
    return currentItem ? currentItem.img : null;
  }, [filteredImages, currentPage, currentImageIndex, itemsPerPage]);

  // Reset typing buffer after delay
  useEffect(() => {
    if (typingBuffer) {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      
      typingTimerRef.current = window.setTimeout(() => {
        setTypingBuffer("");
      }, 1000);
    }
    
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [typingBuffer]);

  // Keyboard event handler for navigation and labeling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle keys when comment dialog is open (except Escape)
      if (showCommentDialog) {
        if (event.key === "Escape") {
          setShowCommentDialog(false);
          setCurrentComment("");
        }
        return;
      }
      
      if (showSettings || showLabelDropdown) return;

      const currentItem = filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex];

      // Ctrl+Z for Undo
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
        return;
      }
      
      // Ctrl+Y for Redo
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      
      // Ctrl+Shift+Z for Redo (alternative)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        redo();
        return;
      }

      // P key to toggle pause for current GIF
      if (event.key.toLowerCase() === 'p' && !event.ctrlKey && !event.metaKey) {
        if (currentItem && isGifFile(currentItem.img.fileName)) {
          event.preventDefault();
          toggleGifPause(currentItem.idx);
        }
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        if (currentItem) {
          const fileName = currentItem.img.fileName;
          navigator.clipboard.writeText(fileName)
            .then(() => {
              console.log(`Filename copied to clipboard: ${fileName}`);
            })
            .catch(err => {
              console.error('Failed to copy filename: ', err);
              showError('Failed to copy filename to clipboard.');
            });
        }
      } else if (event.key === "ArrowLeft") {
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
      } else if (event.key === "0") {
        updateMarkingForCurrentImage(0);
        setTypingBuffer("");
      } else if (event.key === settings.hotkeys.labelRotation) {
        if (currentItem) {
          cycleMarking(currentItem.idx);
        }
        setTypingBuffer("");
      } else if (event.key === " ") {
        event.preventDefault();
        if (currentItem) {
          setZoomedImage((prevZoom) =>
            prevZoom === currentItem.img.fullPath ? null : currentItem.img.fullPath
          );
        }
        setTypingBuffer("");
      } else if (event.key === ".") {
        // Open label dropdown with .
        event.preventDefault();
        setShowLabelDropdown(prev => !prev);
        setTypingBuffer("");
      } else if (event.key === ",") {
        // Open comment dialog with ,
        event.preventDefault();
        openCommentDialog();
        setTypingBuffer("");
      } else if (/^[a-zA-Z]$/.test(event.key) && event.key.toLowerCase() !== 'p') {
        const newBuffer = typingBuffer + event.key.toUpperCase();
        setTypingBuffer(newBuffer);
        
        const matchingLabel = findLabelByAcronym(newBuffer);
        if (matchingLabel > 0) {
          updateMarkingForCurrentImage(matchingLabel);
        }
      }
    },
    [
      showSettings,
      showLabelDropdown,
      showCommentDialog,
      filteredImages,
      currentPage,
      itemsPerPage,
      currentImageIndex,
      goToPreviousImage,
      goToNextImage,
      goUpImage,
      goDownImage,
      cycleMarking,
      updateMarkingForCurrentImage,
      goToNextPage,
      goToPreviousPage,
      settings.hotkeys,
      typingBuffer,
      findLabelByAcronym,
      showError,
      openCommentDialog,
      undo,
      redo,
      toggleGifPause
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const zoomedImageItem = imagePaths.find((item) => item.fullPath === zoomedImage);
  const zoomedImageIndex = imagePaths.findIndex((item) => item.fullPath === zoomedImage);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleSettingsClose = async () => {
    setShowSettings(false);
    
    try {
      const response = await fetch("/settings.json");
      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  if (showSettings) {
    return <Settings onClose={handleSettingsClose} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Simplified Top Bar - removed label display */}
      <div className={`sticky top-0 ${settings.layout.selectedColorHeaderBackground} z-10`}>
        <div className="flex items-center justify-between p-1.5">
          {/* Title */}
          <h1 className={`text-xl font-semibold text-slate-800`}>
            {settings.layout.galleryTitle || "Image Gallery"}
          </h1>
         
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo indicators */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo {undoStack.length > 0 && `(${undoStack.length})`}
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo {redoStack.length > 0 && `(${redoStack.length})`}
              </button>
            </div>
            
            {/* GIF controls - only show if there are GIFs on the page */}
            {gifsOnPage > 0 && (
              <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
                <button
                  onClick={pauseAllGifs}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors border border-orange-200 flex items-center gap-1"
                  title="Pause all GIFs"
                >
                  <FaPause className="w-3 h-3" />
                  Pause All
                </button>
                <button
                  onClick={resumeAllGifs}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors border border-green-200 flex items-center gap-1"
                  title="Play all GIFs"
                >
                  <FaPlay className="w-3 h-3" />
                  Play All
                </button>
                <span className="text-xs text-slate-500 ml-1">
                  {pausedGifsOnPage}/{gifsOnPage} paused
                </span>
              </div>
            )}
            
            <span className="text-slate-600 font-medium text-sm">
              {enabledLabels.length} labels enabled
            </span>
            <span className="text-slate-600 font-medium">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="all">All Images</option>
              <option value="unmarked">Unclassified</option>
              {enabledLabels.map((label, index) => (
                <option key={index} value={(index + 1).toString()}>
                  {label.acronym}: {label.name}
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
            const mark = imageMarks[idx];
            const comment = imageComments[idx];
            const isGif = isGifFile(img.fileName);
            const isPaused = pausedGifs.has(idx);
            const containerStyle: CSSProperties = {
              width: `${computedImageSize}px`,
              height: `${computedImageSize}`,
              border: currentImageIndex === index ? "3px solid blue" : "none",
            };

            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-md shadow-sm bg-gray-50 group"
                style={containerStyle}
              >
                {mark && mark.acronym && (
                  <div
                    className="absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold shadow-md"
                    style={{
                      backgroundColor: enabledLabels[mark.number - 1]?.color || "#999",
                      color: "white",
                      zIndex: 10
                    }}
                  >
                    {mark.acronym}
                  </div>
                )}
                {comment && (
                  <div
                    className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs bg-yellow-400 text-yellow-900 shadow-md"
                    style={{ zIndex: 10 }}
                    title={comment}
                  >
                    💬
                  </div>
                )}
                
                {/* GIF indicator and pause button */}
                {isGif && (
                  <>
                    {/* GIF badge */}
                    <div
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold bg-purple-600 text-white shadow-md"
                      style={{ zIndex: 10 }}
                    >
                      GIF
                    </div>
                    
                    {/* Pause/Play button - visible on hover or when paused */}
                    <button
                      onClick={(e) => toggleGifPause(idx, e)}
                      className={`absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                        isPaused 
                          ? 'bg-green-500 hover:bg-green-600 opacity-100' 
                          : 'bg-orange-500 hover:bg-orange-600 opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ zIndex: 15 }}
                      title={isPaused ? "Play GIF (P)" : "Pause GIF (P)"}
                    >
                      {isPaused ? (
                        <FaPlay className="w-3 h-3 text-white ml-0.5" />
                      ) : (
                        <FaPause className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </>
                )}
                
                <img
                  ref={(el) => { imageRefs.current[idx] = el; }}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    cycleMarking(idx);
                  }}
                  src={isPaused && pausedFrames[idx] ? pausedFrames[idx] : img.fullPath}
                  alt={`Image ${idx + 1} - ${img.fileName}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
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
          
          <button
            onClick={() => setShowLabelDropdown(!showLabelDropdown)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Select Label (.)
          </button>
          
          <button
            onClick={openCommentDialog}
            className="px-3 py-1.5 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Comment (,)
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
        
        <div className="flex justify-end">
          {typingBuffer && (
            <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium border border-yellow-300">
              Typing: {typingBuffer}
            </div>
          )}
        </div>
      </div>

      {/* Label Selection Dropdown */}
      {showLabelDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLabelDropdown(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Select Label</h3>
            <div className="space-y-2 overflow-y-auto flex-grow">
              <button
                onClick={() => {
                  updateMarkingForCurrentImage(0);
                  setShowLabelDropdown(false);
                }}
                className="w-full px-4 py-3 text-left rounded-md bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
              >
                <div className="font-medium">Unclassified</div>
                <div className="text-sm text-slate-600">Remove label</div>
              </button>
              
              {enabledLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateMarkingForCurrentImage(index + 1);
                    setShowLabelDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left rounded-md hover:bg-slate-50 transition-colors border-2"
                  style={{
                    backgroundColor: `${label.color}20`,
                    borderColor: `${label.color}60`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{label.name}</div>
                      <div className="text-sm text-slate-600">Acronym: {label.acronym}</div>
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-white font-bold text-sm"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.acronym}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLabelDropdown(false)}
              className="mt-4 w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
            >
              Cancel (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowCommentDialog(false);
            setCurrentComment("");
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {imageComments[filteredImages[(currentPage - 1) * itemsPerPage + currentImageIndex]?.idx] 
                ? "Edit Comment" 
                : "Add Comment"}
            </h3>
            <textarea
              ref={commentInputRef}
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Enter your comment here..."
              className="w-full h-32 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  saveComment();
                }
              }}
            />
            <div className="text-xs text-slate-500 mt-1 mb-3">
              Press Ctrl+Enter to save
            </div>
            <div className="flex space-x-2">
              <button
                onClick={saveComment}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
              >
                Save Comment
              </button>
              <button
                onClick={() => {
                  setShowCommentDialog(false);
                  setCurrentComment("");
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel (ESC)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Overlay */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          {zoomedImageItem && (
            <div className="bg-white p-1.5 mb-4 rounded shadow-md text-black text-center">
              {settings.metadata.columns.some(col => col.name.toLowerCase() === "label" && col.enabled) && (
                <p>
                  <strong>Label:</strong>{" "}
                  {imageMarks[zoomedImageIndex]?.name || "No label"}
                </p>
              )}
              
              {/* Show comment in zoom view */}
              {imageComments[zoomedImageIndex] && (
                <p>
                  <strong>Comment:</strong>{" "}
                  {imageComments[zoomedImageIndex]}
                </p>
              )}
              
              {Object.entries(zoomedImageItem.metadata).map(([columnName, value]) => {
                const isEnabled = settings.metadata.columns.some(
                  col => col.name.toLowerCase() === columnName.toLowerCase() && col.enabled
                );
                
                return isEnabled ? (
                  <p key={columnName}>
                    <strong>{columnName}:</strong> {value}
                  </p>
                ) : null;
              })}
              
              {/* GIF controls in zoom view */}
              {isGifFile(zoomedImageItem.fileName) && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGifPause(zoomedImageIndex);
                    }}
                    className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                      pausedGifs.has(zoomedImageIndex)
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {pausedGifs.has(zoomedImageIndex) ? (
                      <span className="flex items-center gap-2">
                        <FaPlay className="w-4 h-4" /> Play GIF
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FaPause className="w-4 h-4" /> Pause GIF
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          <img
            src={
              pausedGifs.has(zoomedImageIndex) && pausedFrames[zoomedImageIndex]
                ? pausedFrames[zoomedImageIndex]
                : zoomedImage
            }
            alt="Zoomed"
            style={{ maxWidth: "67vw", maxHeight: "67vh" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Error Message */}
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

  function exportSelection() {
    try {
      const metadataPath = settings.paths.metadataPath;
      const link = document.createElement("a");
      link.setAttribute("href", metadataPath);
      const fileName = metadataPath.split('/').pop() || "metadata.csv";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Metadata file export initiated');
    } catch (error) {
      console.error('Error exporting metadata file:', error);
    }
  }
}
