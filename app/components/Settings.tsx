import React, { useState, useRef, useEffect } from "react";

// Main interface for Settings data structure
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
    selectedColorFooterBackground: string;
    selectedColorHeaderBackground: string;
  };
  metadata: {
    columns: Array<{
      name: string;
      enabled: boolean;
    }>;
  };
}

// Interface for validation errors
interface ValidationErrors {
  emptyFields: string[];
  tooLongFields: string[];
  invalidImagePath: boolean;
  invalidMetadataPath: boolean;
}

interface Label {
  acronym: string;
  name: string;
  enabled: boolean;
}

const TOTAL_LABELS = 50;

// Main Settings component
export default function Settings({ onClose }: { onClose: () => void }) {
  const [rotationKey, setRotationKey] = useState<string>("Enter");
  
  // Initialize 50 labels with default values
  const [labels, setLabels] = useState<Label[]>(() => 
    Array.from({ length: TOTAL_LABELS }, (_, i) => ({
      acronym: `L${i + 1}`,
      name: `Label ${i + 1}`,
      enabled: i < 5 // First 5 enabled by default
    }))
  );
  
  // State variables for paths
  const [inputImage, setInputImage] = useState<string>("/images/");
  const [metaData, setMetaData] = useState<string>("/mock_metadata.csv");
  
  // State variables for layout settings
  const [imagesPerColumn, setImagesPerColumn] = useState<number>(14);
  const [galleryTitle, setGalleryTitle] = useState<string>("Image Gallery");
  const [selectedColorMainBackground, setSelectedColorMainBackground] = useState('bg-white');
  const [selectedColorHeaderBackground, setSelectedColorHeaderBackground] = useState('bg-white');
  const [selectedColorFooterBackground, setSelectedColorFooterBackground] = useState('bg-white');
  const [isOpenHeader, setIsOpenHeader] = useState(false);
  const [isOpenMain, setIsOpenMain] = useState(false);
  const [isOpenFooter, setIsOpenFooter] = useState(false);
  
  // State for metadata columns
  const [metadataColumns, setMetadataColumns] = useState<Array<{name: string; enabled: boolean}>>([]);
  
  // State for feedback and validation
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({
    emptyFields: [],
    tooLongFields: [],
    invalidImagePath: false,
    invalidMetadataPath: false
  });
  
  // Refs for rotation key
  const rotationKeyInputRef = useRef<HTMLInputElement>(null);
  
  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/settings.json");
        const parsedSettings: SettingsData = await response.json();
        
        // Load rotation key
        setRotationKey(parsedSettings.hotkeys?.labelRotation || "Enter");
        
        // Load labels array
        if (parsedSettings.hotkeys?.labels && Array.isArray(parsedSettings.hotkeys.labels)) {
          const loadedLabels = parsedSettings.hotkeys.labels;
          // Ensure we have exactly 50 labels, filling in defaults if needed
          const completeLabels = Array.from({ length: TOTAL_LABELS }, (_, i) => {
            if (i < loadedLabels.length) {
              return loadedLabels[i];
            }
            return {
              acronym: `L${i + 1}`,
              name: `Label ${i + 1}`,
              enabled: false
            };
          });
          setLabels(completeLabels);
        }
        
        // Load paths settings
        setInputImage(parsedSettings.paths?.imagePath || "/images/");
        setMetaData(parsedSettings.paths?.metadataPath || "/mock_metadata.csv");
        
        // Load layout settings
        setImagesPerColumn(parsedSettings.layout?.imagesPerColumn || 14);
        setGalleryTitle(parsedSettings.layout?.galleryTitle || "Image Gallery");
        setSelectedColorMainBackground(parsedSettings.layout?.selectedColorMainBackground || "bg-white");
        setSelectedColorHeaderBackground(parsedSettings.layout?.selectedColorHeaderBackground || "bg-white");
        setSelectedColorFooterBackground(parsedSettings.layout?.selectedColorFooterBackground || "bg-white");
        
        // Load metadata columns
        if (parsedSettings.metadata && parsedSettings.metadata.columns) {
          setMetadataColumns(parsedSettings.metadata.columns);
        } else {
          setMetadataColumns([]);
        }

        // Read CSV file if path exists
        if (parsedSettings.paths?.metadataPath) {
          loadCsvHeaders(parsedSettings.paths.metadataPath);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  // Handler for rotation key
  const handleRotationKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setRotationKey(e.key);
  };

  // Update a specific label field
  const updateLabel = (index: number, field: keyof Label, value: string | boolean) => {
    setLabels(prevLabels => {
      const newLabels = [...prevLabels];
      newLabels[index] = {
        ...newLabels[index],
        [field]: value
      };
      return newLabels;
    });
  };

  // Toggle label enabled status
  const toggleLabelEnabled = (index: number) => {
    updateLabel(index, 'enabled', !labels[index].enabled);
  };

  // Path change handlers
  const handlePathInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputImage(e.target.value);
  };
  
  const handlePathMetaDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaData(e.target.value);
  };
  
  // Handler for images per column with validation (2-20)
  const handleImagesPerColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 20) {
      setImagesPerColumn(value);
    }
  };

  const handleGalleryTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGalleryTitle(e.target.value);
  };

  // Function to load CSV headers from metadata file
  const loadCsvHeaders = async (metadataPath: string) => {
    try {
      const response = await fetch(metadataPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const headers = csvText.split('\n')[0].split(',')
        .map(header => header.trim())
        .filter(header => header);
      
      setMetadataColumns(prevColumns => {
        const updatedColumns = headers.map(header => {
          const existingColumn = prevColumns.find(col => col.name === header);
          return existingColumn || { name: header, enabled: false };
        });
        
        return updatedColumns;
      });
    } catch (error) {
      console.error("Error loading CSV headers:", error);
    }
  };

  // Toggle metadata column visibility
  const toggleColumnEnabled = (index: number) => {
    setMetadataColumns(prevColumns => {
      const newColumns = [...prevColumns];
      if (newColumns[index]) {
        newColumns[index] = {
          ...newColumns[index],
          enabled: !newColumns[index].enabled
        };
      }
      return newColumns;
    });
  };

  // Color options for UI customization
  const colorFamilies = [
    { name: 'slate', label: 'Slate' },
    { name: 'gray', label: 'Gray' },
    { name: 'zinc', label: 'Zinc' },
    { name: 'neutral', label: 'Neutral' },
    { name: 'stone', label: 'Stone' },
    { name: 'red', label: 'Red' },
    { name: 'orange', label: 'Orange' },
    { name: 'amber', label: 'Amber' },
    { name: 'yellow', label: 'Yellow' },
    { name: 'lime', label: 'Lime' },
    { name: 'green', label: 'Green' },
    { name: 'emerald', label: 'Emerald' },
    { name: 'teal', label: 'Teal' },
    { name: 'cyan', label: 'Cyan' },
    { name: 'sky', label: 'Sky' },
    { name: 'blue', label: 'Blue' },
    { name: 'indigo', label: 'Indigo' },
    { name: 'violet', label: 'Violet' },
    { name: 'purple', label: 'Purple' },
    { name: 'fuchsia', label: 'Fuchsia' },
    { name: 'pink', label: 'Pink' },
    { name: 'rose', label: 'Rose' },
    { name: 'white', label: 'White'},
    { name: 'black', label: 'Black'}
  ];
  
  // Map color strings to Tailwind CSS classes
  const colorMap: Record<string, string> = {
    "slate-50": "bg-slate-50", "slate-100": "bg-slate-100", "slate-200": "bg-slate-200",
    "slate-300": "bg-slate-300", "slate-400": "bg-slate-400", "slate-500": "bg-slate-500",
    "slate-600": "bg-slate-600", "slate-700": "bg-slate-700", "slate-800": "bg-slate-800",
    "slate-900": "bg-slate-900", "slate-950": "bg-slate-950",
    "gray-50": "bg-gray-50", "gray-100": "bg-gray-100", "gray-200": "bg-gray-200",
    "gray-300": "bg-gray-300", "gray-400": "bg-gray-400", "gray-500": "bg-gray-500",
    "gray-600": "bg-gray-600", "gray-700": "bg-gray-700", "gray-800": "bg-gray-800",
    "gray-900": "bg-gray-900", "gray-950": "bg-gray-950",
    "red-50": "bg-red-50", "red-100": "bg-red-100", "red-200": "bg-red-200",
    "red-300": "bg-red-300", "red-400": "bg-red-400", "red-500": "bg-red-500",
    "red-600": "bg-red-600", "red-700": "bg-red-700", "red-800": "bg-red-800",
    "red-900": "bg-red-900", "red-950": "bg-red-950",
    "blue-50": "bg-blue-50", "blue-100": "bg-blue-100", "blue-200": "bg-blue-200",
    "blue-300": "bg-blue-300", "blue-400": "bg-blue-400", "blue-500": "bg-blue-500",
    "blue-600": "bg-blue-600", "blue-700": "bg-blue-700", "blue-800": "bg-blue-800",
    "blue-900": "bg-blue-900", "blue-950": "bg-blue-950",
    "zinc-50": "bg-zinc-50", "zinc-100": "bg-zinc-100", "zinc-200": "bg-zinc-200",
    "zinc-300": "bg-zinc-300", "zinc-400": "bg-zinc-400", "zinc-500": "bg-zinc-500",
    "zinc-600": "bg-zinc-600", "zinc-700": "bg-zinc-700", "zinc-800": "bg-zinc-800",
    "zinc-900": "bg-zinc-900", "zinc-950": "bg-zinc-950",
    "neutral-50": "bg-neutral-50", "neutral-100": "bg-neutral-100", "neutral-200": "bg-neutral-200",
    "neutral-300": "bg-neutral-300", "neutral-400": "bg-neutral-400", "neutral-500": "bg-neutral-500",
    "neutral-600": "bg-neutral-600", "neutral-700": "bg-neutral-700", "neutral-800": "bg-neutral-800",
    "neutral-900": "bg-neutral-900", "neutral-950": "bg-neutral-950",
    "stone-50": "bg-stone-50", "stone-100": "bg-stone-100", "stone-200": "bg-stone-200",
    "stone-300": "bg-stone-300", "stone-400": "bg-stone-400", "stone-500": "bg-stone-500",
    "stone-600": "bg-stone-600", "stone-700": "bg-stone-700", "stone-800": "bg-stone-800",
    "stone-900": "bg-stone-900", "stone-950": "bg-stone-950",
    "orange-50": "bg-orange-50", "orange-100": "bg-orange-100", "orange-200": "bg-orange-200",
    "orange-300": "bg-orange-300", "orange-400": "bg-orange-400", "orange-500": "bg-orange-500",
    "orange-600": "bg-orange-600", "orange-700": "bg-orange-700", "orange-800": "bg-orange-800",
    "orange-900": "bg-orange-900", "orange-950": "bg-orange-950",
    "amber-50": "bg-amber-50", "amber-100": "bg-amber-100", "amber-200": "bg-amber-200",
    "amber-300": "bg-amber-300", "amber-400": "bg-amber-400", "amber-500": "bg-amber-500",
    "amber-600": "bg-amber-600", "amber-700": "bg-amber-700", "amber-800": "bg-amber-800",
    "amber-900": "bg-amber-900", "amber-950": "bg-amber-950",
    "yellow-50": "bg-yellow-50", "yellow-100": "bg-yellow-100", "yellow-200": "bg-yellow-200",
    "yellow-300": "bg-yellow-300", "yellow-400": "bg-yellow-400", "yellow-500": "bg-yellow-500",
    "yellow-600": "bg-yellow-600", "yellow-700": "bg-yellow-700", "yellow-800": "bg-yellow-800",
    "yellow-900": "bg-yellow-900", "yellow-950": "bg-yellow-950",
    "lime-50": "bg-lime-50", "lime-100": "bg-lime-100", "lime-200": "bg-lime-200",
    "lime-300": "bg-lime-300", "lime-400": "bg-lime-400", "lime-500": "bg-lime-500",
    "lime-600": "bg-lime-600", "lime-700": "bg-lime-700", "lime-800": "bg-lime-800",
    "lime-900": "bg-lime-900", "lime-950": "bg-lime-950",
    "green-50": "bg-green-50", "green-100": "bg-green-100", "green-200": "bg-green-200",
    "green-300": "bg-green-300", "green-400": "bg-green-400", "green-500": "bg-green-500",
    "green-600": "bg-green-600", "green-700": "bg-green-700", "green-800": "bg-green-800",
    "green-900": "bg-green-900", "green-950": "bg-green-950",
    "emerald-50": "bg-emerald-50", "emerald-100": "bg-emerald-100", "emerald-200": "bg-emerald-200",
    "emerald-300": "bg-emerald-300", "emerald-400": "bg-emerald-400", "emerald-500": "bg-emerald-500",
    "emerald-600": "bg-emerald-600", "emerald-700": "bg-emerald-700", "emerald-800": "bg-emerald-800",
    "emerald-900": "bg-emerald-900", "emerald-950": "bg-emerald-950",
    "teal-50": "bg-teal-50", "teal-100": "bg-teal-100", "teal-200": "bg-teal-200",
    "teal-300": "bg-teal-300", "teal-400": "bg-teal-400", "teal-500": "bg-teal-500",
    "teal-600": "bg-teal-600", "teal-700": "bg-teal-700", "teal-800": "bg-teal-800",
    "teal-900": "bg-teal-900", "teal-950": "bg-teal-950",
    "cyan-50": "bg-cyan-50", "cyan-100": "bg-cyan-100", "cyan-200": "bg-cyan-200",
    "cyan-300": "bg-cyan-300", "cyan-400": "bg-cyan-400", "cyan-500": "bg-cyan-500",
    "cyan-600": "bg-cyan-600", "cyan-700": "bg-cyan-700", "cyan-800": "bg-cyan-800",
    "cyan-900": "bg-cyan-900", "cyan-950": "bg-cyan-950",
    "sky-50": "bg-sky-50", "sky-100": "bg-sky-100", "sky-200": "bg-sky-200",
    "sky-300": "bg-sky-300", "sky-400": "bg-sky-400", "sky-500": "bg-sky-500",
    "sky-600": "bg-sky-600", "sky-700": "bg-sky-700", "sky-800": "bg-sky-800",
    "sky-900": "bg-sky-900", "sky-950": "bg-sky-950",
    "indigo-50": "bg-indigo-50", "indigo-100": "bg-indigo-100", "indigo-200": "bg-indigo-200",
    "indigo-300": "bg-indigo-300", "indigo-400": "bg-indigo-400", "indigo-500": "bg-indigo-500",
    "indigo-600": "bg-indigo-600", "indigo-700": "bg-indigo-700", "indigo-800": "bg-indigo-800",
    "indigo-900": "bg-indigo-900", "indigo-950": "bg-indigo-950",
    "violet-50": "bg-violet-50", "violet-100": "bg-violet-100", "violet-200": "bg-violet-200",
    "violet-300": "bg-violet-300", "violet-400": "bg-violet-400", "violet-500": "bg-violet-500",
    "violet-600": "bg-violet-600", "violet-700": "bg-violet-700", "violet-800": "bg-violet-800",
    "violet-900": "bg-violet-900", "violet-950": "bg-violet-950",
    "purple-50": "bg-purple-50", "purple-100": "bg-purple-100", "purple-200": "bg-purple-200",
    "purple-300": "bg-purple-300", "purple-400": "bg-purple-400", "purple-500": "bg-purple-500",
    "purple-600": "bg-purple-600", "purple-700": "bg-purple-700", "purple-800": "bg-purple-800",
    "purple-900": "bg-purple-900", "purple-950": "bg-purple-950",
    "fuchsia-50": "bg-fuchsia-50", "fuchsia-100": "bg-fuchsia-100", "fuchsia-200": "bg-fuchsia-200",
    "fuchsia-300": "bg-fuchsia-300", "fuchsia-400": "bg-fuchsia-400", "fuchsia-500": "bg-fuchsia-500",
    "fuchsia-600": "bg-fuchsia-600", "fuchsia-700": "bg-fuchsia-700", "fuchsia-800": "bg-fuchsia-800",
    "fuchsia-900": "bg-fuchsia-900", "fuchsia-950": "bg-fuchsia-950",
    "pink-50": "bg-pink-50", "pink-100": "bg-pink-100", "pink-200": "bg-pink-200",
    "pink-300": "bg-pink-300", "pink-400": "bg-pink-400", "pink-500": "bg-pink-500",
    "pink-600": "bg-pink-600", "pink-700": "bg-pink-700", "pink-800": "bg-pink-800",
    "pink-900": "bg-pink-900", "pink-950": "bg-pink-950",
    "rose-50": "bg-rose-50", "rose-100": "bg-rose-100", "rose-200": "bg-rose-200",
    "rose-300": "bg-rose-300", "rose-400": "bg-rose-400", "rose-500": "bg-rose-500",
    "rose-600": "bg-rose-600", "rose-700": "bg-rose-700", "rose-800": "bg-rose-800",
    "rose-900": "bg-rose-900", "rose-950": "bg-rose-950",
    "black-50": "bg-black", "black-100": "bg-black", "black-200": "bg-black",
    "black-300": "bg-black", "black-400": "bg-black", "black-500": "bg-black",
    "black-600": "bg-black", "black-700": "bg-black", "black-800": "bg-black",
    "black-900": "bg-black", "black-950": "bg-black",
    "white-50": "bg-white", "white-100": "bg-white", "white-200": "bg-white",
    "white-300": "bg-white", "white-400": "bg-white", "white-500": "bg-white",
    "white-600": "bg-white", "white-700": "bg-white", "white-800": "bg-white",
    "white-900": "bg-white", "white-950": "bg-white",
  };

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  const handleColorSelectMain = (selectedValue: string) => {
    setSelectedColorMainBackground(selectedValue);
    setIsOpenMain(false);
  };

  const handleColorSelectHeader = (selectedValue: string) => {
    setSelectedColorHeaderBackground(selectedValue);
    setIsOpenHeader(false);
  };

  const handleColorSelectFooter = (selectedValue: string) => {
    setSelectedColorFooterBackground(selectedValue);
    setIsOpenFooter(false);
  };

  // Comprehensive validation of all settings before saving
  const validateSettings = (): boolean => {
    const newErrors: ValidationErrors = {
      emptyFields: [],
      tooLongFields: [],
      invalidImagePath: false,
      invalidMetadataPath: false
    };
    
    // Check for empty required fields
    if (!rotationKey) newErrors.emptyFields.push("Rotation Key");
    
    // Validate labels
    labels.forEach((label, index) => {
      if (!label.acronym) newErrors.emptyFields.push(`Acronym Label ${index + 1}`);
      if (!label.name) newErrors.emptyFields.push(`Name Label ${index + 1}`);
      if (label.name.length > 20) newErrors.tooLongFields.push(`Name Label ${index + 1}`);
    });
    
    if (!inputImage) newErrors.emptyFields.push("Image Path");
    if (!metaData) newErrors.emptyFields.push("Metadata Path");
    if (!galleryTitle) newErrors.emptyFields.push("Gallery Title");
    
    if (inputImage.length > 50) newErrors.tooLongFields.push("Image Path");
    if (metaData.length > 50) newErrors.tooLongFields.push("Metadata Path");
    if (galleryTitle.length > 30) newErrors.tooLongFields.push("Gallery Title");
    
    if (!inputImage.startsWith('/') || !inputImage.endsWith('/')) {
      newErrors.invalidImagePath = true;
    }
    
    if (!metaData.startsWith('/') || !metaData.endsWith('.csv')) {
      newErrors.invalidMetadataPath = true;
    }
    
    setErrors(newErrors);
    
    return (
      newErrors.emptyFields.length === 0 && 
      newErrors.tooLongFields.length === 0 && 
      !newErrors.invalidImagePath && 
      !newErrors.invalidMetadataPath
    );
  };

  const getErrorMessage = (): string => {
    const errorMessages: string[] = [];
    
    if (errors.emptyFields.length > 0) {
      errorMessages.push(`Empty fields: ${errors.emptyFields.join(', ')}`);
    }
    
    if (errors.tooLongFields.length > 0) {
      errorMessages.push(`Fields with too many characters: ${errors.tooLongFields.join(', ')}`);
    }
    
    if (errors.invalidImagePath) {
      errorMessages.push('Image path must start with / and end with /');
    }
    
    if (errors.invalidMetadataPath) {
      errorMessages.push('Metadata path must start with / and end with .csv');
    }
    
    return errorMessages.join('. ');
  };

  const saveSettings = async () => {
    if (!validateSettings()) {
      setSaveStatus(getErrorMessage());
      return;
    }
    
    const settingsData: SettingsData = {
      hotkeys: {
        labelRotation: rotationKey,
        labels: labels
      },
      paths: {
        imagePath: inputImage,
        metadataPath: metaData
      },
      layout: {
        imagesPerColumn: imagesPerColumn,
        galleryTitle: galleryTitle,
        selectedColorMainBackground: selectedColorMainBackground,
        selectedColorHeaderBackground: selectedColorHeaderBackground,
        selectedColorFooterBackground: selectedColorFooterBackground,
      },
      metadata: {
        columns: metadataColumns
      }
    };
    
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setSaveStatus("Settings saved successfully!");
      
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings. Please try again.");
    }
  };

  const MetadataColumnsSection = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
        Zoom-Function Information
      </h2>
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {metadataColumns.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            No columns found in CSV file. Please check the metadata path.
          </div>
        ) : (
          metadataColumns.map((column, index) => (
            <div key={index} className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-3">
                <span className="text-sm font-semibold text-slate-600">Column {index + 1}:</span>
              </div>
              <div className="col-span-5">
                <div className="border rounded p-1 bg-gray-50 w-full border-slate-300">
                  <div className="w-full px-2 py-1 text-slate-700">{column.name}</div>
                </div>
              </div>
              <div className="col-span-2 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => toggleColumnEnabled(index)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                    column.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">Toggle Column {index + 1}</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      column.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-1.5 text-black shadow-md">
        <div className="flex items-center justify-between w-full">
          <div className="px-3 py-1.5 invisible">
            <button className="px-3 py-1.5 rounded-md">Return</button>
          </div>
    
          <h1 className="text-xl font-semibold text-center flex-grow">Settings</h1>
    
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-600 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            Return
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex flex-row overflow-auto">
        {/* Left column */}
        <div className="w-1/2 p-4 border-r border-gray-300 flex flex-col h-full overflow-y-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
              Annotation Hotkeys
            </h2>

            {/* Rotation key */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium mb-2 text-slate-700">Label Rotation Key</label>
                <div
                  className={`border rounded p-1 bg-gray-50 cursor-text w-32 flex items-center shadow-sm ${
                    !rotationKey ? 'border-red-500' : 'border-slate-300'
                  }`}
                  onClick={() => rotationKeyInputRef.current?.focus()}
                >
                  <input
                    ref={rotationKeyInputRef}
                    type="text"
                    className="w-full outline-none text-center"
                    value={rotationKey}
                    onKeyDown={handleRotationKeyDown}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-2 text-slate-700">Label Shortcut Configuration</h3>
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {/* Dynamically render all 50 labels */}
              {labels.map((label, index) => (
                <div key={index} className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-2">
                    <span className="text-sm font-semibold text-slate-600">Label {index + 1}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div
                      className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                        !label.acronym ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <input
                        type="text"
                        className="w-full outline-none text-center font-mono text-sm"
                        value={label.acronym}
                        onChange={(e) => updateLabel(index, 'acronym', e.target.value)}
                        placeholder={`L${index + 1}`}
                      />
                    </div>
                  </div>
                  <div className="col-span-6">
                    <div
                      className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                        !label.name ? 'border-red-500' : 
                        label.name.length > 20 ? 'border-yellow-500' : 'border-slate-300'
                      }`}
                    >
                      <input
                        type="text"
                        className="w-full outline-none px-2 text-sm"
                        value={label.name}
                        onChange={(e) => updateLabel(index, 'name', e.target.value)}
                        placeholder={`Label ${index + 1}`}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleLabelEnabled(index)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                        label.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Toggle Label {index + 1}</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          label.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
           
          <MetadataColumnsSection />  
        </div>
          
        {/* Right column */}
        <div className="w-1/2 p-4 flex flex-col h-full overflow-y-auto">
          {/* Paths Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
              Paths
            </h2>
            <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-10 items-center gap-2">
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-slate-600">Image Path:</span>
                </div>
                <div className="col-span-7">
                  <div 
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !inputImage ? 'border-red-500' : 
                      inputImage.length > 50 ? 'border-yellow-500' : 
                      (!inputImage.startsWith('/') || !inputImage.endsWith('/')) ? 'border-orange-500' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="text"
                      className="w-full outline-none px-2"
                      value={inputImage}
                      onChange={handlePathInputImageChange}
                      placeholder="/path/to/images/"
                    />
                  </div>
                </div>
              </div>
                 
              <div className="grid grid-cols-10 items-center gap-2">
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-slate-600">Metadata Path:</span>
                </div>
                <div className="col-span-7">
                  <div 
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !metaData ? 'border-red-500' : 
                      metaData.length > 50 ? 'border-yellow-500' : 
                      (!metaData.startsWith('/') || !metaData.endsWith('.csv')) ? 'border-orange-500' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="text"
                      className="w-full outline-none px-2"
                      value={metaData}
                      onChange={handlePathMetaDataChange}
                      placeholder="/path/to/metadata.csv"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
              Layout
            </h2>
            <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-10 items-center gap-2">
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-slate-600">Images per Column:</span>
                </div>
                <div className="col-span-6">
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={imagesPerColumn}
                    onChange={handleImagesPerColumnChange}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <div className="border rounded p-1 bg-gray-50 cursor-text w-full flex items-center border-slate-300">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full outline-none text-center"
                      value={imagesPerColumn}
                      onChange={handleImagesPerColumnChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-10 items-center gap-2">
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-slate-600">Gallery Title:</span>
                </div>
                <div className="col-span-7">
                  <div 
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !galleryTitle ? 'border-red-500' : 
                      galleryTitle.length > 30 ? 'border-yellow-500' : 'border-slate-300'
                    }`}
                  >
                    <input
                      type="text"
                      className="w-full outline-none px-2"
                      value={galleryTitle}
                      onChange={handleGalleryTitleChange}
                      placeholder="Enter gallery title"
                    />
                  </div>
                </div>
              </div>

              {/* Color pickers - keeping the same structure as before */}
              {[
                { label: 'Header-Section Background', value: selectedColorHeaderBackground, isOpen: isOpenHeader, setIsOpen: setIsOpenHeader, handleSelect: handleColorSelectHeader },
                { label: 'Image-Section Background', value: selectedColorMainBackground, isOpen: isOpenMain, setIsOpen: setIsOpenMain, handleSelect: handleColorSelectMain },
                { label: 'Footer-Section Background', value: selectedColorFooterBackground, isOpen: isOpenFooter, setIsOpen: setIsOpenFooter, handleSelect: handleColorSelectFooter }
              ].map((colorConfig, idx) => (
                <div key={idx} className="grid grid-cols-10 items-center gap-2">
                  <div className="col-span-3">
                    <span className="text-sm font-semibold text-slate-600">{colorConfig.label}:</span>
                  </div>
                  <div className="col-span-7">
                    <div className="relative">
                      <div
                        className={`border rounded p-1 cursor-pointer w-full flex items-center justify-between ${
                          !colorConfig.value ? 'border-red-500' : 'border-slate-300'
                        }`}
                        onClick={() => colorConfig.setIsOpen(!colorConfig.isOpen)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded ${colorConfig.value}`}></div>
                          <span>{colorConfig.value.replace('bg-', '')}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {colorConfig.isOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                          <div className="max-h-60 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 gap-2">
                              {colorFamilies.map((colorFamily) => (
                                <div key={colorFamily.name} className="mb-3">
                                  <div className="text-sm font-medium text-slate-700 mb-1">{colorFamily.label}</div>
                                  <div className="grid grid-cols-11 gap-1">
                                    {shades.map((shadeValue) => {
                                      const colorKey = `${colorFamily.name}-${shadeValue}`;
                                      const colorClass = colorMap[colorKey] || "bg-white";
                                      
                                      let textColorClass = "text-black";
                
                                      if (colorFamily.name === "black"){
                                        textColorClass = "text-white";
                                      } else if (colorFamily.name === "white"){
                                        textColorClass = "text-black";
                                      } else {
                                        textColorClass = shadeValue >= 500 ? "text-white" : "text-black";
                                      }
                                      return (
                                        <div
                                          key={colorKey}
                                          className={`w-full h-6 rounded cursor-pointer flex items-center justify-center ${colorClass} hover:ring-2 hover:ring-offset-1 ${
                                            colorConfig.value === colorClass ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                                          }`}
                                          onClick={() => colorConfig.handleSelect(colorClass)}
                                          title={colorClass}
                                        >
                                          <span className={`text-xs ${textColorClass}`}>
                                            {shadeValue}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        
      {/* Footer */}
      <div className="border-t p-1.5 flex justify-end items-center bg-gray-50 shadow-inner">
        {saveStatus && (
          <span className={`mr-6 text-sm font-medium ${saveStatus.includes("Error") || 
                              saveStatus.includes("Empty") || 
                              saveStatus.includes("too many") || 
                              saveStatus.includes("path must") ? 
                              "text-red-500" : "text-green-500"}`}>
            {saveStatus}
          </span>
        )}
        <button
          onClick={saveSettings}
          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-all duration-200 shadow-sm flex items-center gap-2"
        >
          Save
        </button>
      </div>
    </div>
  );
}
