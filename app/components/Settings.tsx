import React, { useState, useRef, useEffect } from "react";

// Main interface for Settings data structure
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

// Main Settings component
export default function Settings({ onClose }: { onClose: () => void }) {
  // State variables for hotkeys
  const [rotationKey, setRotationKey] = useState<string>("Enter");
  const [keyLabelOne, setKeyLabelOne] = useState<string>("1");
  const [nameLabelOne, setNameLabelOne] = useState<string>("No vains");
  const [keyLabelTwo, setKeyLabelTwo] = useState<string>("2");
  const [nameLabelTwo, setNameLabelTwo] = useState<string>("Stent");
  const [keyLabelThree, setKeyLabelThree] = useState<string>("3");
  const [nameLabelThree, setNameLabelThree] = useState<string>("Coil");
  const [keyLabelFour, setKeyLabelFour] = useState<string>("4");
  const [nameLabelFour, setNameLabelFour] = useState<string>("Flow Diverters");
  const [keyLabelFive, setKeyLabelFive] = useState<string>("5");
  const [nameLabelFive, setNameLabelFive] = useState<string>("Dental Artifacts");
  const [isEnabledOne, setIsEnabledOne] = useState(false);
  const [isEnabledTwo, setIsEnabledTwo] = useState(false);
  const [isEnabledThree, setIsEnabledThree] = useState(false);
  const [isEnabledFour, setIsEnabledFour] = useState(false);
  const [isEnabledFive, setIsEnabledFive] = useState(false);
  const [keyLabelSix, setKeyLabelSix] = useState<string>("6");
  const [nameLabelSix, setNameLabelSix] = useState<string>("Label name 6");
  const [isEnabledSix, setIsEnabledSix] = useState(false);
  const [keyLabelSeven, setKeyLabelSeven] = useState<string>("7");
  const [nameLabelSeven, setNameLabelSeven] = useState<string>("Label name 7");
  const [isEnabledSeven, setIsEnabledSeven] = useState(false);
  
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
  
  // Refs for capturing keyboard input
  const rotationKeyInputRef = useRef<HTMLInputElement>(null);
  const keyLabelOneInputRef = useRef<HTMLInputElement>(null);
  const nameLabelOneInputRef = useRef<HTMLInputElement>(null);
  const keyLabelTwoInputRef = useRef<HTMLInputElement>(null);
  const nameLabelTwoInputRef = useRef<HTMLInputElement>(null);
  const keyLabelThreeInputRef = useRef<HTMLInputElement>(null);
  const nameLabelThreeInputRef = useRef<HTMLInputElement>(null);
  const keyLabelFourInputRef = useRef<HTMLInputElement>(null);
  const nameLabelFourInputRef = useRef<HTMLInputElement>(null);
  const keyLabelFiveInputRef = useRef<HTMLInputElement>(null);
  const keyLabelSixInputRef = useRef<HTMLInputElement>(null);
  const nameLabelSixInputRef = useRef<HTMLInputElement>(null);
  const keyLabelSevenInputRef = useRef<HTMLInputElement>(null);
  const nameLabelSevenInputRef = useRef<HTMLInputElement>(null);
  
  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/settings.json");
        const parsedSettings: SettingsData = await response.json();
        
        // Load hotkeys settings
        setRotationKey(parsedSettings.hotkeys?.labelRotation || "Enter");
        setKeyLabelOne(parsedSettings.hotkeys?.labelKeyOne || "1");
        setNameLabelOne(parsedSettings.hotkeys?.labelNameOne || "No vains");
        setIsEnabledOne(parsedSettings.hotkeys?.labelEnabledOne || false);
        setKeyLabelTwo(parsedSettings.hotkeys?.labelKeyTwo || "2");
        setNameLabelTwo(parsedSettings.hotkeys?.labelNameTwo || "Stent");
        setIsEnabledTwo(parsedSettings.hotkeys?.labelEnabledTwo || false);
        setKeyLabelThree(parsedSettings.hotkeys?.labelKeyThree || "3");
        setNameLabelThree(parsedSettings.hotkeys?.labelNameThree || "Coil");
        setIsEnabledThree(parsedSettings.hotkeys?.labelEnabledThree || false);
        setKeyLabelFour(parsedSettings.hotkeys?.labelKeyFour || "4");
        setNameLabelFour(parsedSettings.hotkeys?.labelNameFour || "Flow Diverters");
        setIsEnabledFour(parsedSettings.hotkeys?.labelEnabledFour || false);
        setKeyLabelFive(parsedSettings.hotkeys?.labelKeyFive || "5");
        setNameLabelFive(parsedSettings.hotkeys?.labelNameFive || "Dental Artifacts");
        setIsEnabledFive(parsedSettings.hotkeys?.labelEnabledFive || false);
        setKeyLabelSix(parsedSettings.hotkeys?.labelKeySix || "6");
        setNameLabelSix(parsedSettings.hotkeys?.labelNameSix || "Label name 6");
        setIsEnabledSix(parsedSettings.hotkeys?.labelEnabledSix || false);
        setKeyLabelSeven(parsedSettings.hotkeys?.labelKeySeven || "7");
        setNameLabelSeven(parsedSettings.hotkeys?.labelNameSeven || "Label name 7");
        setIsEnabledSeven(parsedSettings.hotkeys?.labelEnabledSeven || false);
        
        // Load paths settings
        setInputImage(parsedSettings.paths?.imagePath || "/images/");
        setMetaData(parsedSettings.paths?.metadataPath || "/mock_metadata.csv");
        
        // Load layout settings
        setImagesPerColumn(parsedSettings.layout?.imagesPerColumn || 14);
        setGalleryTitle(parsedSettings.layout?.galleryTitle || "Image Gallery");
        setSelectedColorMainBackground(parsedSettings.layout?.selectedColorMainBackground || "bg-white")
        setSelectedColorHeaderBackground(parsedSettings.layout?.selectedColorHeaderBackground || "bg-white")
        setSelectedColorFooterBackground(parsedSettings.layout?.selectedColorFooterBackground || "bg-white")
        
        // Load metadata columns
        if (parsedSettings.metadata && parsedSettings.metadata.columns) {
          setMetadataColumns(parsedSettings.metadata.columns);
        } else {
          // Fallback if no columns are defined
          setMetadataColumns([]);
        }

        // Read CSV file if path exists
        if (parsedSettings.paths?.metadataPath) {
          loadCsvHeaders(parsedSettings.paths.metadataPath);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Default values will be used from useState initializers
      }
    };
    
    loadSettings();
  }, []);

  // Handlers for keyboard input capture
  const handleRotationKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setRotationKey(e.key);
  };

  const handleKeyLabelOneDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelOne(e.key);
  };

  const handleNameLabelOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelOne(e.target.value);
  };
  
  const handleKeyLabelTwoDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelTwo(e.key);
  };

  const handleNameLabelTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelTwo(e.target.value);
  };
  
  const handleKeyLabelThreeDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelThree(e.key);
  };

  const handleNameLabelThreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelThree(e.target.value);
  };
  
  const handleKeyLabelFourDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelFour(e.key);
  };

  const handleNameLabelFourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelFour(e.target.value);
  };
  
  const handleKeyLabelFiveDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelFive(e.key);
  };

  const handleNameLabelFiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelFive(e.target.value);
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
      // Extract first line and split into columns
      const headers = csvText.split('\n')[0].split(',')
        .map(header => header.trim())
        .filter(header => header); // Remove empty headers
      
      // Update state with found headers
      setMetadataColumns(prevColumns => {
        // Keep existing settings, add missing ones
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

  // Toggle switches for hotkeys
  const toggleSwitchOne = () => {
    setIsEnabledOne(!isEnabledOne);
  };
  
  const toggleSwitchTwo = () => {
    setIsEnabledTwo(!isEnabledTwo);
  };
  
  const toggleSwitchThree = () => {
    setIsEnabledThree(!isEnabledThree);
  };
  
  const toggleSwitchFour = () => {
    setIsEnabledFour(!isEnabledFour);
  };
  
  const toggleSwitchFive = () => {
    setIsEnabledFive(!isEnabledFive);
  };

  // Handlers for the additional labels
  const handleKeyLabelSixDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelSix(e.key);
  };

  const handleNameLabelSixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelSix(e.target.value);
  };

  const toggleSwitchSix = () => {
    setIsEnabledSix(!isEnabledSix);
  };

  const handleKeyLabelSevenDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setKeyLabelSeven(e.key);
  };

  const handleNameLabelSevenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameLabelSeven(e.target.value);
  };

  const toggleSwitchSeven = () => {
    setIsEnabledSeven(!isEnabledSeven);
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
    // Slate colors
    "slate-50": "bg-slate-50",
    "slate-100": "bg-slate-100",
    "slate-200": "bg-slate-200",
    "slate-300": "bg-slate-300",
    "slate-400": "bg-slate-400",
    "slate-500": "bg-slate-500",
    "slate-600": "bg-slate-600",
    "slate-700": "bg-slate-700",
    "slate-800": "bg-slate-800",
    "slate-900": "bg-slate-900",
    "slate-950": "bg-slate-950",
    
    // Gray colors
    "gray-50": "bg-gray-50",
    "gray-100": "bg-gray-100",
    "gray-200": "bg-gray-200",
    "gray-300": "bg-gray-300",
    "gray-400": "bg-gray-400",
    "gray-500": "bg-gray-500",
    "gray-600": "bg-gray-600",
    "gray-700": "bg-gray-700",
    "gray-800": "bg-gray-800",
    "gray-900": "bg-gray-900",
    "gray-950": "bg-gray-950",
    
    // Red colors
    "red-50": "bg-red-50",
    "red-100": "bg-red-100",
    "red-200": "bg-red-200",
    "red-300": "bg-red-300",
    "red-400": "bg-red-400",
    "red-500": "bg-red-500",
    "red-600": "bg-red-600",
    "red-700": "bg-red-700",
    "red-800": "bg-red-800",
    "red-900": "bg-red-900",
    "red-950": "bg-red-950",
    
    // Blue colors
    "blue-50": "bg-blue-50",
    "blue-100": "bg-blue-100",
    "blue-200": "bg-blue-200",
    "blue-300": "bg-blue-300",
    "blue-400": "bg-blue-400",
    "blue-500": "bg-blue-500",
    "blue-600": "bg-blue-600",
    "blue-700": "bg-blue-700",
    "blue-800": "bg-blue-800",
    "blue-900": "bg-blue-900",
    "blue-950": "bg-blue-950",
  
    // Zinc colors
    "zinc-50": "bg-zinc-50",
    "zinc-100": "bg-zinc-100",
    "zinc-200": "bg-zinc-200",
    "zinc-300": "bg-zinc-300",
    "zinc-400": "bg-zinc-400",
    "zinc-500": "bg-zinc-500",
    "zinc-600": "bg-zinc-600",
    "zinc-700": "bg-zinc-700",
    "zinc-800": "bg-zinc-800",
    "zinc-900": "bg-zinc-900",
    "zinc-950": "bg-zinc-950",

    // Neutral colors
    "neutral-50": "bg-neutral-50",
    "neutral-100": "bg-neutral-100",
    "neutral-200": "bg-neutral-200",
    "neutral-300": "bg-neutral-300",
    "neutral-400": "bg-neutral-400",
    "neutral-500": "bg-neutral-500",
    "neutral-600": "bg-neutral-600",
    "neutral-700": "bg-neutral-700",
    "neutral-800": "bg-neutral-800",
    "neutral-900": "bg-neutral-900",
    "neutral-950": "bg-neutral-950",

    // Stone colors
    "stone-50": "bg-stone-50",
    "stone-100": "bg-stone-100",
    "stone-200": "bg-stone-200",
    "stone-300": "bg-stone-300",
    "stone-400": "bg-stone-400",
    "stone-500": "bg-stone-500",
    "stone-600": "bg-stone-600",
    "stone-700": "bg-stone-700",
    "stone-800": "bg-stone-800",
    "stone-900": "bg-stone-900",
    "stone-950": "bg-stone-950",

    // Orange colors
    "orange-50": "bg-orange-50",
    "orange-100": "bg-orange-100",
    "orange-200": "bg-orange-200",
    "orange-300": "bg-orange-300",
    "orange-400": "bg-orange-400",
    "orange-500": "bg-orange-500",
    "orange-600": "bg-orange-600",
    "orange-700": "bg-orange-700",
    "orange-800": "bg-orange-800",
    "orange-900": "bg-orange-900",
    "orange-950": "bg-orange-950",

    // Amber colors
    "amber-50": "bg-amber-50",
    "amber-100": "bg-amber-100",
    "amber-200": "bg-amber-200",
    "amber-300": "bg-amber-300",
    "amber-400": "bg-amber-400",
    "amber-500": "bg-amber-500",
    "amber-600": "bg-amber-600",
    "amber-700": "bg-amber-700",
    "amber-800": "bg-amber-800",
    "amber-900": "bg-amber-900",
    "amber-950": "bg-amber-950",

    // Yellow colors
    "yellow-50": "bg-yellow-50",
    "yellow-100": "bg-yellow-100",
    "yellow-200": "bg-yellow-200",
    "yellow-300": "bg-yellow-300",
    "yellow-400": "bg-yellow-400",
    "yellow-500": "bg-yellow-500",
    "yellow-600": "bg-yellow-600",
    "yellow-700": "bg-yellow-700",
    "yellow-800": "bg-yellow-800",
    "yellow-900": "bg-yellow-900",
    "yellow-950": "bg-yellow-950",

    // Lime colors
    "lime-50": "bg-lime-50",
    "lime-100": "bg-lime-100",
    "lime-200": "bg-lime-200",
    "lime-300": "bg-lime-300",
    "lime-400": "bg-lime-400",
    "lime-500": "bg-lime-500",
    "lime-600": "bg-lime-600",
    "lime-700": "bg-lime-700",
    "lime-800": "bg-lime-800",
    "lime-900": "bg-lime-900",
    "lime-950": "bg-lime-950",

    // Green colors
    "green-50": "bg-green-50",
    "green-100": "bg-green-100",
    "green-200": "bg-green-200",
    "green-300": "bg-green-300",
    "green-400": "bg-green-400",
    "green-500": "bg-green-500",
    "green-600": "bg-green-600",
    "green-700": "bg-green-700",
    "green-800": "bg-green-800",
    "green-900": "bg-green-900",
    "green-950": "bg-green-950",

    // Emerald colors
    "emerald-50": "bg-emerald-50",
    "emerald-100": "bg-emerald-100",
    "emerald-200": "bg-emerald-200",
    "emerald-300": "bg-emerald-300",
    "emerald-400": "bg-emerald-400",
    "emerald-500": "bg-emerald-500",
    "emerald-600": "bg-emerald-600",
    "emerald-700": "bg-emerald-700",
    "emerald-800": "bg-emerald-800",
    "emerald-900": "bg-emerald-900",
    "emerald-950": "bg-emerald-950",

    // Teal colors
    "teal-50": "bg-teal-50",
    "teal-100": "bg-teal-100",
    "teal-200": "bg-teal-200",
    "teal-300": "bg-teal-300",
    "teal-400": "bg-teal-400",
    "teal-500": "bg-teal-500",
    "teal-600": "bg-teal-600",
    "teal-700": "bg-teal-700",
    "teal-800": "bg-teal-800",
    "teal-900": "bg-teal-900",
    "teal-950": "bg-teal-950",

    // Cyan colors
    "cyan-50": "bg-cyan-50",
    "cyan-100": "bg-cyan-100",
    "cyan-200": "bg-cyan-200",
    "cyan-300": "bg-cyan-300",
    "cyan-400": "bg-cyan-400",
    "cyan-500": "bg-cyan-500",
    "cyan-600": "bg-cyan-600",
    "cyan-700": "bg-cyan-700",
    "cyan-800": "bg-cyan-800",
    "cyan-900": "bg-cyan-900",
    "cyan-950": "bg-cyan-950",

    // Sky colors
    "sky-50": "bg-sky-50",
    "sky-100": "bg-sky-100",
    "sky-200": "bg-sky-200",
    "sky-300": "bg-sky-300",
    "sky-400": "bg-sky-400",
    "sky-500": "bg-sky-500",
    "sky-600": "bg-sky-600",
    "sky-700": "bg-sky-700",
    "sky-800": "bg-sky-800",
    "sky-900": "bg-sky-900",
    "sky-950": "bg-sky-950",

    // Indigo colors
    "indigo-50": "bg-indigo-50",
    "indigo-100": "bg-indigo-100",
    "indigo-200": "bg-indigo-200",
    "indigo-300": "bg-indigo-300",
    "indigo-400": "bg-indigo-400",
    "indigo-500": "bg-indigo-500",
    "indigo-600": "bg-indigo-600",
    "indigo-700": "bg-indigo-700",
    "indigo-800": "bg-indigo-800",
    "indigo-900": "bg-indigo-900",
    "indigo-950": "bg-indigo-950",

    // Violet colors
    "violet-50": "bg-violet-50",
    "violet-100": "bg-violet-100",
    "violet-200": "bg-violet-200",
    "violet-300": "bg-violet-300",
    "violet-400": "bg-violet-400",
    "violet-500": "bg-violet-500",
    "violet-600": "bg-violet-600",
    "violet-700": "bg-violet-700",
    "violet-800": "bg-violet-800",
    "violet-900": "bg-violet-900",
    "violet-950": "bg-violet-950",

    // Purple colors
    "purple-50": "bg-purple-50",
    "purple-100": "bg-purple-100",
    "purple-200": "bg-purple-200",
    "purple-300": "bg-purple-300",
    "purple-400": "bg-purple-400",
    "purple-500": "bg-purple-500",
    "purple-600": "bg-purple-600",
    "purple-700": "bg-purple-700",
    "purple-800": "bg-purple-800",
    "purple-900": "bg-purple-900",
    "purple-950": "bg-purple-950",

    // Fuchsia colors
    "fuchsia-50": "bg-fuchsia-50",
    "fuchsia-100": "bg-fuchsia-100",
    "fuchsia-200": "bg-fuchsia-200",
    "fuchsia-300": "bg-fuchsia-300",
    "fuchsia-400": "bg-fuchsia-400",
    "fuchsia-500": "bg-fuchsia-500",
    "fuchsia-600": "bg-fuchsia-600",
    "fuchsia-700": "bg-fuchsia-700",
    "fuchsia-800": "bg-fuchsia-800",
    "fuchsia-900": "bg-fuchsia-900",
    "fuchsia-950": "bg-fuchsia-950",

    // Pink colors
    "pink-50": "bg-pink-50",
    "pink-100": "bg-pink-100",
    "pink-200": "bg-pink-200",
    "pink-300": "bg-pink-300",
    "pink-400": "bg-pink-400",
    "pink-500": "bg-pink-500",
    "pink-600": "bg-pink-600",
    "pink-700": "bg-pink-700",
    "pink-800": "bg-pink-800",
    "pink-900": "bg-pink-900",
    "pink-950": "bg-pink-950",

    // Rose colors
    "rose-50": "bg-rose-50",
    "rose-100": "bg-rose-100",
    "rose-200": "bg-rose-200",
    "rose-300": "bg-rose-300",
    "rose-400": "bg-rose-400",
    "rose-500": "bg-rose-500",
    "rose-600": "bg-rose-600",
    "rose-700": "bg-rose-700",
    "rose-800": "bg-rose-800",
    "rose-900": "bg-rose-900",
    "rose-950": "bg-rose-950",

    // Black colors (all the same)
    "black-50": "bg-black",
    "black-100": "bg-black",
    "black-200": "bg-black",
    "black-300": "bg-black",
    "black-400": "bg-black",
    "black-500": "bg-black",
    "black-600": "bg-black",
    "black-700": "bg-black",
    "black-800": "bg-black",
    "black-900": "bg-black",
    "black-950": "bg-black",

    // White colors (all the same)
    "white-50": "bg-white",
    "white-100": "bg-white",
    "white-200": "bg-white",
    "white-300": "bg-white",
    "white-400": "bg-white",
    "white-500": "bg-white",
    "white-600": "bg-white",
    "white-700": "bg-white",
    "white-800": "bg-white",
    "white-900": "bg-white",
    "white-950": "bg-white",
  };

  // Define available shades for color selection
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  // Functions to handle color selection for different sections
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
    if (!keyLabelOne) newErrors.emptyFields.push("Key Label 1");
    if (!nameLabelOne) newErrors.emptyFields.push("Name Label 1");
    if (!keyLabelTwo) newErrors.emptyFields.push("Key Label 2");
    if (!nameLabelTwo) newErrors.emptyFields.push("Name Label 2");
    if (!keyLabelThree) newErrors.emptyFields.push("Key Label 3");
    if (!nameLabelThree) newErrors.emptyFields.push("Name Label 3");
    if (!keyLabelFour) newErrors.emptyFields.push("Key Label 4");
    if (!nameLabelFour) newErrors.emptyFields.push("Name Label 4");
    if (!keyLabelFive) newErrors.emptyFields.push("Key Label 5");
    if (!nameLabelFive) newErrors.emptyFields.push("Name Label 5");
    if (!keyLabelSix) newErrors.emptyFields.push("Key Label 6");
    if (!nameLabelSix) newErrors.emptyFields.push("Name Label 6");
    if (!keyLabelSeven) newErrors.emptyFields.push("Key Label 7");
    if (!nameLabelSeven) newErrors.emptyFields.push("Name Label 7");
    if (!inputImage) newErrors.emptyFields.push("Image Path");
    if (!metaData) newErrors.emptyFields.push("Metadata Path");
    if (!galleryTitle) newErrors.emptyFields.push("Gallery Title");

    
    // Check character limits for text fields
    if (nameLabelOne.length > 20) newErrors.tooLongFields.push("Name Label 1");
    if (nameLabelTwo.length > 20) newErrors.tooLongFields.push("Name Label 2");
    if (nameLabelThree.length > 20) newErrors.tooLongFields.push("Name Label 3");
    if (nameLabelFour.length > 20) newErrors.tooLongFields.push("Name Label 4");
    if (nameLabelFive.length > 20) newErrors.tooLongFields.push("Name Label 5");
    if (nameLabelSix.length > 20) newErrors.tooLongFields.push("Name Label 6");
    if (nameLabelSeven.length > 20) newErrors.tooLongFields.push("Name Label 7");
    if (inputImage.length > 50) newErrors.tooLongFields.push("Image Path");
    if (metaData.length > 50) newErrors.tooLongFields.push("Metadata Path");
    if (galleryTitle.length > 30) newErrors.tooLongFields.push("Gallery Title");
    
    // Validate image path format (must start with / and end with /)
    if (!inputImage.startsWith('/') || !inputImage.endsWith('/')) {
      newErrors.invalidImagePath = true;
    }
    
    // Validate metadata path format (must start with / and end with .csv)
    if (!metaData.startsWith('/') || !metaData.endsWith('.csv')) {
      newErrors.invalidMetadataPath = true;
    }
    
    setErrors(newErrors);
    
    // Return true if no errors, false otherwise
    return (
      newErrors.emptyFields.length === 0 && 
      newErrors.tooLongFields.length === 0 && 
      !newErrors.invalidImagePath && 
      !newErrors.invalidMetadataPath
    );
  };

  // Generate user-friendly error message from validation errors
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

  // Save all settings to the server
  const saveSettings = async () => {
    // First validate settings before attempting to save
    if (!validateSettings()) {
      setSaveStatus(getErrorMessage());
      return;
    }
    
    // Prepare settings data object for API call
    const settingsData: SettingsData = {
      hotkeys: {
        labelRotation: rotationKey,
        labelKeyOne: keyLabelOne,
        labelNameOne: nameLabelOne,
        labelEnabledOne: isEnabledOne,
        labelKeyTwo: keyLabelTwo,
        labelNameTwo: nameLabelTwo,
        labelEnabledTwo: isEnabledTwo,
        labelKeyThree: keyLabelThree,
        labelNameThree: nameLabelThree,
        labelEnabledThree: isEnabledThree,
        labelKeyFour: keyLabelFour,
        labelNameFour: nameLabelFour,
        labelEnabledFour: isEnabledFour,
        labelKeyFive: keyLabelFive,
        labelNameFive: nameLabelFive,
        labelEnabledFive: isEnabledFive,
        labelKeySix: keyLabelSix,
        labelNameSix: nameLabelSix,
        labelEnabledSix: isEnabledSix,
        labelKeySeven: keyLabelSeven,
        labelNameSeven: nameLabelSeven,
        labelEnabledSeven: isEnabledSeven,
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
      // Send settings to server
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
      
      // Show success message
      setSaveStatus("Settings saved successfully!");
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings. Please try again.");
    }
  };

  // Component to display and manage metadata columns
  const MetadataColumnsSection = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
        Zoom-Function Information
      </h2>
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {metadataColumns.length === 0 ? (
          // Show message when no columns are found
          <div className="text-center py-4 text-slate-500">
            No columns found in CSV file. Please check the metadata path.
          </div>
        ) : (
          // Display each column with toggle for enabling/disabling
          metadataColumns.map((column, index) => (
            <div key={index} className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-3">
                <span className="text-sm font-semibold text-slate-600">Column {index + 1}:</span>
              </div>
              <div className="col-span-5">
                <div className="border rounded p-1 bg-gray-50 w-full border-slate-300">
                  {/* Column name is display-only, not editable */}
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
      {/* Header with title and return button */}
      <div className="flex items-center p-1.5 text-black shadow-md">
        <div className="flex items-center justify-between w-full">
          {/* Empty div to balance layout - creates space matching the return button */}
          <div className="px-3 py-1.5 invisible">
            <button className="px-3 py-1.5 rounded-md">Return</button> {/* Dummy button for spacing */}
          </div>
    
          <h1 className="text-xl font-semibold text-center flex-grow">Settings</h1>
    
          {/* Return button to close settings */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-600 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            Return
          </button>
        </div>
      </div>

      {/* Main content area with two-column layout */}
      <div className="flex-grow flex flex-row overflow-auto">
        {/* Left column for hotkeys and metadata */}
        <div className="w-1/2 p-4 border-r border-gray-300 flex flex-col h-full">
          <div className="bg-white p-0 rounded-lg shadow-sm mb-3">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
              Annotation Hotkeys
            </h2>

            {/* Rotation key setting */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium mb-2 text-slate-700">Label Rotation Key</label>
                <div
                  className={`border rounded p-1 bg-gray-50 cursor-text w-1/8 flex items-center shadow-sm ${
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
            <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {/* Label One configuration - blueprint for all labels */}
              <div className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-slate-600">Label 1</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-slate-600 mr-2">Key:</span>
                  <div
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !keyLabelOne ? 'border-red-500' : 'border-slate-300'
                    }`}
                    onClick={() => keyLabelOneInputRef.current?.focus()}
                  >
                    <input
                      ref={keyLabelOneInputRef}
                      type="text"
                      className="w-full outline-none text-center font-mono"
                      value={keyLabelOne}
                      onKeyDown={handleKeyLabelOneDown}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className="text-sm text-slate-600">Name:</span>
                </div>
                <div className="col-span-5">
                  <div
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !nameLabelOne ? 'border-red-500' : nameLabelOne.length > 20 ? 'border-yellow-500' : 'border-slate-300'
                    }`}
                  >
                    <input
                      ref={nameLabelOneInputRef}
                      type="text"
                      className="w-full outline-none px-2"
                      value={nameLabelOne}
                      onChange={handleNameLabelOneChange}
                    />
                  </div>
                </div>
                {/* Toggle switch for enabling/disabling the label */}
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={toggleSwitchOne}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                      isEnabledOne ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Toggle Label</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabledOne ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
    
              {/* Labels Two through Seven follow the same pattern as Label One */}
              {/* Label Two */}
              <div className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-slate-600">Label 2</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-slate-600 mr-2">Key:</span>
                  <div
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !keyLabelTwo ? 'border-red-500' : 'border-slate-300'
                    }`}
                    onClick={() => keyLabelTwoInputRef.current?.focus()}
                  >
                    <input
                      ref={keyLabelTwoInputRef}
                      type="text"
                      className="w-full outline-none text-center font-mono"
                      value={keyLabelTwo}
                      onKeyDown={handleKeyLabelTwoDown}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className="text-sm text-slate-600">Name:</span>
                </div>
                <div className="col-span-5">
                  <div
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${
                      !nameLabelTwo ? 'border-red-500' : nameLabelTwo.length > 20 ? 'border-yellow-500' : 'border-slate-300'
                    }`}
                  >
                    <input
                      ref={nameLabelTwoInputRef}
                      type="text"
                      className="w-full outline-none px-2"
                      value={nameLabelTwo}
                      onChange={handleNameLabelTwoChange}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={toggleSwitchTwo}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                      isEnabledTwo ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Toggle Label</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabledTwo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Label Three */} 
              <div className="grid grid-cols-12 items-center gap-2"> 
                <div className="col-span-2"> 
                  <span className="text-sm font-semibold text-slate-600">Label 3</span> 
                </div> 
                <div className="col-span-2 flex items-center"> 
                  <span className="text-sm text-slate-600 mr-2">Key:</span> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${!keyLabelThree ? 'border-red-500' : 'border-slate-300'}`} 
                    onClick={() => keyLabelThreeInputRef.current?.focus()} 
                  > 
                    <input 
                      ref={keyLabelThreeInputRef} 
                      type="text" 
                      className="w-full outline-none text-center font-mono" 
                      value={keyLabelThree} 
                      onKeyDown={handleKeyLabelThreeDown} 
                      readOnly 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-1 flex justify-end"> 
                  <span className="text-sm text-slate-600">Name:</span> 
                </div> 
                <div className="col-span-5"> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${ 
                      !nameLabelThree ? 'border-red-500' :  
                      nameLabelThree.length > 20 ? 'border-yellow-500' : 'border-slate-300' 
                    }`} 
                  > 
                    <input 
                      ref={nameLabelThreeInputRef} 
                      type="text" 
                      className="w-full outline-none px-2" 
                      value={nameLabelThree} 
                      onChange={handleNameLabelThreeChange} 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-2 flex justify-end"> 
                  <button  
                    type="button"  
                    onClick={toggleSwitchThree} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${ 
                      isEnabledThree ? 'bg-blue-600' : 'bg-gray-200' 
                    }`} 
                  > 
                    <span className="sr-only">Toggle Label</span> 
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                        isEnabledThree ? 'translate-x-6' : 'translate-x-1' 
                      }`} 
                    /> 
                  </button> 
                </div> 
              </div>

              {/* Label Four */} 
              <div className="grid grid-cols-12 items-center gap-2"> 
                <div className="col-span-2"> 
                  <span className="text-sm font-semibold text-slate-600">Label 4</span> 
                </div> 
                <div className="col-span-2 flex items-center"> 
                  <span className="text-sm text-slate-600 mr-2">Key:</span> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${!keyLabelFour ? 'border-red-500' : 'border-slate-300'}`} 
                    onClick={() => keyLabelFourInputRef.current?.focus()} 
                  > 
                    <input 
                      ref={keyLabelFourInputRef} 
                      type="text" 
                      className="w-full outline-none text-center font-mono" 
                      value={keyLabelFour} 
                      onKeyDown={handleKeyLabelFourDown} 
                      readOnly 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-1 flex justify-end"> 
                  <span className="text-sm text-slate-600">Name:</span> 
                </div> 
                <div className="col-span-5"> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${ 
                      !nameLabelFour ? 'border-red-500' :  
                      nameLabelFour.length > 20 ? 'border-yellow-500' : 'border-slate-300' 
                    }`} 
                  > 
                    <input 
                      ref={nameLabelFourInputRef} 
                      type="text" 
                      className="w-full outline-none px-2" 
                      value={nameLabelFour} 
                      onChange={handleNameLabelFourChange} 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-2 flex justify-end"> 
                  <button  
                    type="button"  
                    onClick={toggleSwitchFour} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${ 
                      isEnabledFour ? 'bg-blue-600' : 'bg-gray-200' 
                    }`} 
                  > 
                    <span className="sr-only">Toggle Label</span> 
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                        isEnabledFour ? 'translate-x-6' : 'translate-x-1' 
                      }`} 
                    /> 
                  </button> 
                </div> 
              </div>
               
              {/* Label Five */} 
              <div className="grid grid-cols-12 items-center gap-2"> 
                <div className="col-span-2"> 
                  <span className="text-sm font-semibold text-slate-600">Label 5</span> 
                </div> 
                <div className="col-span-2 flex items-center"> 
                  <span className="text-sm text-slate-600 mr-2">Key:</span> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${!keyLabelFive ? 'border-red-500' : 'border-slate-300'}`} 
                    onClick={() => keyLabelFiveInputRef.current?.focus()} 
                  > 
                    <input 
                      ref={keyLabelFiveInputRef} 
                      type="text" 
                      className="w-full outline-none text-center font-mono" 
                      value={keyLabelFive} 
                      onKeyDown={handleKeyLabelFiveDown} 
                      readOnly 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-1 flex justify-end"> 
                  <span className="text-sm text-slate-600">Name:</span> 
                </div> 
                <div className="col-span-5"> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${ 
                      !nameLabelFive ? 'border-red-500' :  
                      nameLabelFive.length > 20 ? 'border-yellow-500' : 'border-slate-300' 
                    }`} 
                  > 
                    <input 
                      type="text" 
                      className="w-full outline-none px-2" 
                      value={nameLabelFive} 
                      onChange={handleNameLabelFiveChange} 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-2 flex justify-end"> 
                  <button  
                    type="button"  
                    onClick={toggleSwitchFive} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${ 
                      isEnabledFive ? 'bg-blue-600' : 'bg-gray-200' 
                    }`} 
                  > 
                    <span className="sr-only">Toggle Label</span> 
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                        isEnabledFive ? 'translate-x-6' : 'translate-x-1' 
                      }`} 
                    /> 
                  </button> 
                </div> 
              </div> 

              {/* Label Six */} 
              <div className="grid grid-cols-12 items-center gap-2"> 
                <div className="col-span-2"> 
                  <span className="text-sm font-semibold text-slate-600">Label 6</span> 
                </div> 
                <div className="col-span-2 flex items-center"> 
                  <span className="text-sm text-slate-600 mr-2">Key:</span> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${!keyLabelSix ? 'border-red-500' : 'border-slate-300'}`} 
                    onClick={() => keyLabelSixInputRef.current?.focus()} 
                  > 
                    <input 
                      ref={keyLabelSixInputRef}       
                      type="text" 
                      className="w-full outline-none text-center font-mono" 
                      value={keyLabelSix} 
                      onKeyDown={handleKeyLabelSixDown} 
                      readOnly 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-1 flex justify-end"> 
                  <span className="text-sm text-slate-600">Name:</span> 
                </div> 
                <div className="col-span-5"> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${ 
                      !nameLabelSix ? 'border-red-500' :  
                      nameLabelSix.length > 20 ? 'border-yellow-500' : 'border-slate-300' 
                    }`} 
                  > 
                    <input 
                      ref={nameLabelSixInputRef} 
                      type="text" 
                      className="w-full outline-none px-2" 
                      value={nameLabelSix} 
                      onChange={handleNameLabelSixChange} 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-2 flex justify-end"> 
                  <button  
                    type="button"  
                    onClick={toggleSwitchSix} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${ 
                      isEnabledSix ? 'bg-blue-600' : 'bg-gray-200' 
                    }`} 
                  > 
                    <span className="sr-only">Toggle Label</span> 
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                        isEnabledSix ? 'translate-x-6' : 'translate-x-1' 
                      }`} 
                    /> 
                  </button> 
                </div> 
              </div> 

              {/* Label Seven */} 
              <div className="grid grid-cols-12 items-center gap-2"> 
                <div className="col-span-2"> 
                  <span className="text-sm font-semibold text-slate-600">Label 7</span> 
                </div> 
                <div className="col-span-2 flex items-center"> 
                  <span className="text-sm text-slate-600 mr-2">Key:</span> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${!keyLabelSeven ? 'border-red-500' : 'border-slate-300'}`} 
                    onClick={() => keyLabelSevenInputRef.current?.focus()} 
                  > 
                    <input 
                      ref={keyLabelSevenInputRef} 
                      type="text" 
                      className="w-full outline-none text-center font-mono" 
                      value={keyLabelSeven} 
                      onKeyDown={handleKeyLabelSevenDown} 
                      readOnly 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-1 flex justify-end"> 
                  <span className="text-sm text-slate-600">Name:</span> 
                </div> 
                <div className="col-span-5"> 
                  <div  
                    className={`border rounded p-1 bg-gray-50 cursor-text w-full flex items-center ${ 
                      !nameLabelSeven ? 'border-red-500' :  
                      nameLabelSeven.length > 20 ? 'border-yellow-500' : 'border-slate-300' 
                    }`} 
                  > 
                    <input 
                      ref={nameLabelSevenInputRef} 
                      type="text" 
                      className="w-full outline-none px-2" 
                      value={nameLabelSeven} 
                      onChange={handleNameLabelSevenChange} 
                    /> 
                  </div> 
                </div> 
                <div className="col-span-2 flex justify-end"> 
                  <button  
                    type="button"  
                    onClick={toggleSwitchSeven} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${ 
                      isEnabledSeven ? 'bg-blue-600' : 'bg-gray-200' 
                    }`} 
                  > 
                    <span className="sr-only">Toggle Label</span> 
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                        isEnabledSeven ? 'translate-x-6' : 'translate-x-1' 
                      }`} 
                    /> 
                  </button> 
                </div> 
              </div> 
            </div> 
          </div>
           
          {/* Metadata Columns Section - imported component */}
          <MetadataColumnsSection />  
        </div>
          
        {/* Right column for paths and layout settings */}
        <div className="w-1/2 p-4 flex flex-col h-full">
            {/* Paths Section - manages file paths */}
            <div className="bg-white p-0 rounded-lg shadow-sm mb-3">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
                Paths
              </h2>
              <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                {/* Image Path Input with validation styling */}
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
                   
                {/* Metadata Path Input with validation styling */}
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

            {/* Layout Section - controls UI appearance */}
            <div className="bg-white p-0 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-300 text-slate-800">
                Layout
              </h2>
              <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                {/* Images per Column Slider & Number Input */}
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

                {/* Gallery Title Input */}
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

                {/* Header Background Color Selector */}
                <div className="grid grid-cols-10 items-center gap-2">
                  <div className="col-span-3">
                    <span className="text-sm font-semibold text-slate-600">Header-Section Backgroundcolor:</span>
                  </div>
                  <div className="col-span-7">
                    <div className="relative">
                      <div
                        className={`border rounded p-1 cursor-pointer w-full flex items-center justify-between ${
                          !selectedColorHeaderBackground ? 'border-red-500' : 'border-slate-300'
                        }`}
                        onClick={() => setIsOpenHeader(!isOpenHeader)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded ${selectedColorHeaderBackground}`}></div>
                          <span>{selectedColorHeaderBackground.replace('bg-', '')}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {isOpenHeader && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                          <div className="max-h-60 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 gap-2">
                              {colorFamilies.map((colorFamily) => (
                                <div key={colorFamily.name} className="mb-3">
                                  <div className="text-sm font-medium text-slate-700 mb-1">{colorFamily.label}</div>
                                  <div className="grid grid-cols-11 gap-1">
                                    {shades.map((shadeValue) => {
                                      const colorKey = `${colorFamily.name}-${shadeValue}`;
                                      const colorClass = colorMap[colorKey] || "bg-white"; // Fallback if not found
                                      
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
                                            selectedColorHeaderBackground === colorClass ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                                          }`}
                                          onClick={() => handleColorSelectHeader(colorClass)}
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
                {/* Main Background Color Selector - similar structure to Header color picker */}
                <div className="grid grid-cols-10 items-center gap-2">
                  <div className="col-span-3">
                    <span className="text-sm font-semibold text-slate-600">Image-Section Backgroundcolor:</span>
                  </div>
                  <div className="col-span-7">
                    <div className="relative">
                      {/* Clickable color selector that shows/hides the color picker dropdown */}
                      <div
                        className={`border rounded p-1 cursor-pointer w-full flex items-center justify-between ${
                          !selectedColorMainBackground ? 'border-red-500' : 'border-slate-300'
                        }`}
                        onClick={() => setIsOpenMain(!isOpenMain)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded ${selectedColorMainBackground}`}></div>
                          <span>{selectedColorMainBackground.replace('bg-', '')}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Color picker dropdown - shown only when isOpenMain is true */}
                      {isOpenMain && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                          <div className="max-h-60 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 gap-2">
                              {colorFamilies.map((colorFamily) => (
                                <div key={colorFamily.name} className="mb-3">
                                  <div className="text-sm font-medium text-slate-700 mb-1">{colorFamily.label}</div>
                                  <div className="grid grid-cols-11 gap-1">
                                    {shades.map((shadeValue) => {
                                      const colorKey = `${colorFamily.name}-${shadeValue}`;
                                      const colorClass = colorMap[colorKey] || "bg-white"; // Fallback if not found
                                      
                                      // Determine text color for contrast
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
                                            selectedColorMainBackground === colorClass ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                                          }`}
                                          onClick={() => handleColorSelectMain(colorClass)}
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

                {/* Footer Background Color Selector - similar to previous color pickers */}
                <div className="grid grid-cols-10 items-center gap-2">
                  <div className="col-span-3">
                    <span className="text-sm font-semibold text-slate-600">Footer-Section Backgroundcolor:</span>
                  </div>
                  <div className="col-span-7">
                    <div className="relative">
                      <div
                        className={`border rounded p-1 cursor-pointer w-full flex items-center justify-between ${
                          !selectedColorFooterBackground ? 'border-red-500' : 'border-slate-300'
                        }`}
                        onClick={() => setIsOpenFooter(!isOpenFooter)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded ${selectedColorFooterBackground}`}></div>
                          <span>{selectedColorFooterBackground.replace('bg-', '')}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Footer color picker dropdown */}
                      {isOpenFooter && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                          <div className="max-h-60 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 gap-2">
                              {colorFamilies.map((colorFamily) => (
                                <div key={colorFamily.name} className="mb-3">
                                  <div className="text-sm font-medium text-slate-700 mb-1">{colorFamily.label}</div>
                                  <div className="grid grid-cols-11 gap-1">
                                    {shades.map((shadeValue) => {
                                      const colorKey = `${colorFamily.name}-${shadeValue}`;
                                      const colorClass = colorMap[colorKey] || "bg-white"; // Fallback if not found
                                      
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
                                            selectedColorFooterBackground === colorClass ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                                          }`}
                                          onClick={() => handleColorSelectFooter(colorClass)}
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer bar with save status message and save button */}
        <div className="border-t p-1.5 flex justify-end items-center bg-gray-50 shadow-inner">
          {/* Conditional rendering of status message with color-coded styling */}
          {saveStatus && (
            <span className={`mr-6 text-sm font-medium ${saveStatus.includes("Error") || 
                                saveStatus.includes("Empty") || 
                                saveStatus.includes("too many") || 
                                saveStatus.includes("path must") ? 
                                "text-red-500" : "text-green-500"}`}>
              {saveStatus}
            </span>
          )}
          {/* Save button that triggers validation and save process */}
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