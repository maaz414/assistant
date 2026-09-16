# 🤖 Virtual Assistant (AI + Native Windows OS Controller)

An advanced, voice-driven **Virtual Assistant** that combines the natural intelligence of Groq LLaMA models with deep native **Windows Operating System automation**, Multimodal AI Vision, AI Image Generation, and Desktop Widgets.

---

## 🚀 Quick Setup & Running Locally

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:8000`*

### 2. Frontend Web Interface
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

### 3. Desktop Overlay Mode (Optional via Electron)
```bash
cd frontend
npm run electron:dev
```

---

## 📖 Official User Manual & Command Guide

Your assistant accepts **Voice Commands** (via microphone) as well as **Text and Image inputs**. It speaks responses back naturally (in English, Hindi, or Roman Urdu/Hinglish) and can directly perform native operations on your computer.

---

## ⚡ Quick Start: How to Interact

| Method | How to Use |
| :--- | :--- |
| **Voice Command** | Speak your assistant’s name (e.g., *"Jarvis"* or your chosen name) followed by your command. |
| **Text Chat** | Type any query into the bottom input bar and press **Enter** or click **Send**. |
| **Image Analysis** | Click the **Paperclip 📎** icon, upload a screenshot or image, and ask your question. |

---

## 💻 1. Windows Operating System & App Control

Your assistant can open, close, and manipulate applications on your computer.

### 🚀 Opening Applications
| Command (Voice / Text) | Action Performed |
| :--- | :--- |
| **"Open Chrome"** / **"Open browser"** | Launches Google Chrome |
| **"Open YouTube"** | Opens YouTube homepage directly |
| **"Open WhatsApp"** / **"Open WhatsApp Web"** | Launches native Windows WhatsApp or WhatsApp Web |
| **"Open VS Code"** / **"Open Visual Studio Code"** | Launches Visual Studio Code |
| **"Open Notepad"** | Launches Notepad editor |
| **"Open Calculator"** | Launches Windows Calculator |
| **"Open Command Prompt"** / **"Open Terminal"** | Launches CMD or Windows Terminal |
| **"Open Settings"** | Opens Windows Settings |
| **"Open Control Panel"** | Opens Windows Control Panel |
| **"Open This PC"** / **"Open File Explorer"** | Opens "This PC" file explorer window |
| **"Open Recycle Bin"** | Opens the Windows Recycle Bin |
| **"Open Microsoft Store"** | Launches the Windows Store |
| **"Open Camera"** / **"Open Photos"** / **"Open Clock"** | Opens camera, photos viewer, or clock |
| **"Open Word"** / **"Open Excel"** / **"Open PowerPoint"** | Opens Microsoft Office applications |
| **"Open Edge"** | Opens Microsoft Edge browser |

### ❌ Closing Applications
* **"Close Chrome"**
* **"Close VS Code"**
* **"Close Notepad"**
* **"Close Calculator"**
* **"Close WhatsApp"**
* **"Close Word"** / **"Close Excel"**

---

## 📁 2. File & Folder Automation (Desktop, Drives & This PC)

Manage local storage and files seamlessly using natural English or Hinglish.

| Action | Example Command | Description |
| :--- | :--- | :--- |
| **Create Folder on Desktop** | *"Create a folder named Projects on Desktop"*<br>*"Desktop pe Test naam ka folder banao"* | Creates the directory instantly on Desktop. |
| **Create Folder on This PC** | *"Create folder name maaz on this pc"*<br>*"This PC pe maaz naam ka folder banao"* | Creates the folder directly on the primary root drive (`C:\maaz`). |
| **Create Folder in Specific Drive** | *"Create folder work in D drive"* | Creates the folder in specified drive (`D:\work`). |
| **Create File** | *"Create a file named notes on Desktop"* | Creates a new text file (`.txt`). |
| **Open Folder** | *"Open Desktop"*<br>*"Open Downloads"* / *"Open Documents"*<br>*"Open folder maaz on this pc"* | Opens the folder directly in Windows Explorer. |
| **Open File** | *"Open file notes on Desktop"* | Opens the file in its default program. |
| **Rename Item** | *"Rename folder Projects to Work on Desktop"* | Renames folders or files without deleting data. |
| **Safe Deletion** | *"Delete folder Test on Desktop"* | **Safe Delete:** Moves items to the **Windows Recycle Bin** instead of permanently erasing them. |
| **Play Movie/Media** | *"Play movie Iron Man"* | Searches **Downloads**, **Videos**, and **Desktop** for video files (`.mp4`, `.mkv`, etc.) and launches them in **VLC**. |

---

## 🎨 3. Multimodal AI & Image Capabilities

### 🖼️ Vision & Image Analysis
* Click the **📎 (Paperclip)** button to upload any screenshot, diagram, document, or photo.
* **Ask:** *"What is written in this image?"*, *"Explain this diagram"*, *"Fix the bug in this code screenshot"*.
* Powered by multimodal vision models to understand pixels and generate answers.

### ✨ AI Image Generation
* **Command:** *"Generate an image of a futuristic cyberpunk city in 4k"*
* **Result:** Generates a high-resolution 1024x1024 AI image directly in the chat with **Full-Screen Preview** and **One-Click Download**.

### ✂️ Background Removal
* Upload any portrait or photo and say: **"Remove background"** or **"Is image ka background hatao"**.
* Automatically isolates the subject and returns a clean, transparent PNG.

---

## 🌐 4. Web Browsing & Online Searches

| Feature | Example Command | Result |
| :--- | :--- | :--- |
| **Google Search** | *"Search Google for React 19 features"* | Opens Google search results in a new tab. |
| **YouTube Search** | *"Search YouTube for Node.js tutorials"*<br>*"Play Lo-Fi chill beats on YouTube"* | Opens YouTube search results for that topic. |
| **YouTube Open** | *"Open YouTube"* | Opens `https://www.youtube.com` homepage directly. |
| **Weather** | *"What's the weather today?"* | Opens live weather forecast. |
| **Social Apps** | *"Open Instagram"*, *"Open Facebook"* | Opens respective web platforms. |

---

## 🧠 5. Knowledge, Conversational AI & Personal Companion

* **Contextual Memory:** Retains the last **8 conversation turns**. Follow up naturally (*"Tell me more about that"*, *"Delete that folder now"*).
* **Bilingual Support:** Natural fluency in English, Hindi, and Roman Urdu/Hinglish (*"Tum kya kar sakte ho?"*, *"Mera ek folder bana do"*).
* **Rich Markdown Support:** Renders code blocks, tables, lists, and formatting cleanly in the UI.
* **Date & Time:**
  * *"What is the time?"*
  * *"What is today's date?"*
  * *"Which day is today?"*

---

## 🎛️ 6. Customization & UI Features

* **Voice Tone Customization:** Select from a variety of voices (Female Soft/Zira, Male Gentle/David, Male Firm/Mark, Indian English & Hindi voices).
* **Dynamic Color Themes:** Cycle through **16+ curated gradient themes** (Midnight Blue, Abyss, Onyx, Deep Violet, Toxic Green, etc.).
* **Persona & Avatar:** Customize your assistant's **Name** and **Avatar Image** at any time.
* **Desktop Mini-Widget Mode (Electron):** Minimize the assistant into a compact, draggable floating desktop bubble that stays on top of your windows.
* **Chat History:** View past conversation logs or clear them at any time.

---

## 🛠️ Architecture Overview

- **Frontend**: React 19, Tailwind CSS v4, Vite, React Router, HTML5 Speech Recognition & Synthesis, React Markdown.
- **Desktop**: Electron integration with draggable frameless overlay widget.
- **Backend**: Node.js, Express 5, MongoDB with Mongoose.
- **AI Engine**: Groq Cloud running high-speed LLaMA models (`gpt-oss-20b`, `gpt-oss-120b`, `qwen3.8-27b`) with JSON structured output.
- **OS Automation**: Node.js `child_process` executing native Windows shell and PowerShell commands safely.
- **Media & Images**: Pollinations AI image generation, `@imgly/background-removal-node`, Cloudinary storage, and VLC automation.
