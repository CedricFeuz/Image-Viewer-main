# 1. My Next.js Project

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

This project is a web application built with Next.js

## 1.1. 📋 Table of contents

- [1. My Next.js Project](#1-my-nextJS-project)
  - [1.1. 📋 Table of contents](#11--table-of-contents)
  - [1.2. ✨ Features](#12--features)
  - [1.3. 🛠 Prerequisites](#13--prerequisites)
  - [1.4. 🚀 Installation](#14--installation)
- [2. 🧩 Usage Guide](#2--usage-guide)
  - [2.1. 📂 Preparing Your Data](#21--preparing-your-data)
  - [2.2. 🚀 Starting the Application](#22--starting-the-application)
  - [2.3. ⚙️ Configuring the Application](#23--configuring-the-application)
  - [2.4. 📝 Annotating Images](#24--annotating-images)
  - [2.5. 🔄 Label Processing](#25--label-processing)
  - [2.6. 🌈 Color Coding](#26--color-coding)
  - [2.7. ⌨️ Keyboard Shortcuts Summary](#27--keyboard-shortcuts-summary)
  
## 1.2. ✨ Features

- Application web Next.js

## 1.3. 🛠 Prerequisites

- Node.js (version 14.0 or higher)
- Yarn

## 1.4. 🚀 Installation

1. Clone the repository :
   ```bash
   git clone https://github.zhaw.ch/feuzced1/Image-Labeler-and-Viewer.git

2. Navigate to the project directory :

```bash
cd votre-projet
```

3. Install dependencies
   
```bash
yarn install
```

## 2. 🧩 Usage Guide

This section explains how to prepare your data and use the Image Labeler and Viewer application.

### 2.1. 📂 Preparing Your Data

Before starting the application, prepare your images and metadata:

1.  **Create an Images Folder:**
    *   Create a folder named `images` within the `/public` directory of your project.  Example: `/public/images/`

2.  **Place Images:**
    *   Copy your images into the `/public/images/` folder.
    *   Supported image formats: JPG, PNG, and GIF.

3.  **Create a Metadata CSV:**
    *   Create a CSV file (e.g., `metadata.csv`) containing metadata about your images.
    *   Place this file in the `/public` directory. Example: `/public/metadata.csv`

4.  **CSV File Format:**
    *   The CSV file *must* have a `filename` column containing the exact filename of each image (including the extension).
    *   Include additional columns for any other metadata you want to display or use for labeling.
    *   An optional `label` column can be used to pre-populate initial labels.

    **Example CSV Structure:**

    ```csv
    filename,gender,age,description,label
    image1.jpg,male,45,CT scan of brain,No vains
    image2.jpg,female,62,MRI with contrast,Stent
    ```

### 2.2. 🚀 Starting the Application

To launch the application:

1.  **Build the Project:**
    ```bash
    yarn build
    ```

2.  **Start the Server:**
    ```bash
    yarn start
    ```

3.  **Open in Browser:**
    *   Navigate to `http://localhost:3000` in your web browser.

### 2.3. ⚙️ Configuring the Application

Initial configuration is required upon first launching the application:

1.  **Access Settings:**
    *   Click the gear icon (⚙️) located in the top-right corner of the screen.

2.  **Configure Paths:**
    *   **Image Path:** Enter the path to your images folder, starting and ending with a slash (e.g., `/images/`).
    *   **Metadata Path:** Enter the path to your CSV file, starting with a slash and ending with `.csv` (e.g., `/metadata.csv`).

3.  **Adjust Layout Settings:**
    *   **Images per Column:** Choose the number of images displayed per column (between 2 and 20).
    *   **Gallery Title:** Set a title for your image gallery.
    *   **Background Colors:** Customize the background colors for the header, main image section, and footer.

4.  **Configure Metadata Display:**
    *   In the "Zoom-Function Information" section, enable or disable the display of specific CSV columns when an image is zoomed using the provided toggle switches.

5.  **Configure Annotation Hotkeys:**
    *   **Label Rotation Key:** Define the key used to cycle through label options (default is "Enter").
    *   **Label Shortcut Configuration:** Configure up to 7 custom labels:
        *   **Key:** The keyboard shortcut (number key 1-7) to apply the label.
        *   **Name:** A descriptive name for the label.
        *   **Enabled/Disabled:**  Use the toggle switch to activate or deactivate the label.
    *   **⚠️ Important:** Choose label names carefully! Changing label names *after* annotation has started can lead to duplicate entries in your CSV file.

6.  **Save Settings:**
    *   Click the "Save" button at the bottom right of the settings page to save your configuration.

### 2.4. 📝 Annotating Images

After configuration, you can begin annotating your images:

*   **Navigation:**
    *   Use the **arrow keys** to move between images in the grid.
    *   The currently selected image is highlighted with a blue border.
    *   Use **Ctrl+Left/Right Arrow** to navigate between pages.

*   **Applying Labels:**
    *   Press a configured **hotkey (1-7)** to apply a specific label.
    *   Press **"Enter"** (or your configured rotation key) to cycle through available labels.
    *   Press **"0"** to remove a label from an image.

*   **Zooming:**
    *   Press the **Space bar** or click on an image to zoom in.
    *   The zoom view displays the image and any enabled metadata columns.
    *   Click anywhere outside the zoomed image to exit zoom mode.

*   **Filtering:**
    *   Use the dropdown menu in the top-right corner to filter images based on their labels.
    *   Options include "All Images", "Unclassified", and any enabled custom labels.

*   **Exporting Labels:**
    *   Click the "Export Labels" button in the bottom left corner to download the updated CSV file containing your annotations.

### 2.5. 🔄 Label Processing

*   Labels are automatically saved to your CSV file as you annotate.
*   Each labeled image is marked with a colored triangle in the top-right corner, corresponding to its assigned label.
*   The application preserves the annotation state between sessions.

### 2.6. 🌈 Color Coding

Each label is associated with a distinct color for easy visual identification:

*   Label 1: Red
*   Label 2: Amber
*   Label 3: Green
*   Label 4: Cyan
*   Label 5: Magenta
*   Label 6: Blue
*   Label 7: Orange

### 2.7. ⌨️ Keyboard Shortcuts Summary

| Key              | Function                     |
| ---------------- | ---------------------------- |
| Arrow Keys       | Navigate between images      |
| Ctrl+Left/Right  | Previous/Next page           |
| Space            | Zoom current image          |
| 0                | Remove label                 |
| Enter            | Cycle through labels         |
| 1-7              | Apply specific label (if configured) |


