import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import trash from "trash";

// Helper to run shell commands as promises
const runCommand = (command) => {
    return new Promise((resolve) => {
        exec(command, { shell: "powershell.exe" }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message });
            } else {
                resolve({ success: true, output: stdout });
            }
        });
    });
};

// Helper to launch graphical apps properly to front without taskbar hiding
const openUIApp = (targetStr) => {
    return new Promise((resolve) => {
        try {
            let command;
            if (targetStr.startsWith("http://") || targetStr.startsWith("https://") || targetStr.startsWith("shell") || targetStr.startsWith("ms-") || targetStr.includes(":") || targetStr.includes("\\") || targetStr.includes("/")) {
                command = `cmd /c start "" "${targetStr}"`;
            } else {
                command = `cmd /c start "" "${targetStr}"`;
            }
            exec(command, (error) => {
                if (error && targetStr === "whatsapp:") {
                    // Fallback to WhatsApp Web if desktop app isn't installed
                    exec(`cmd /c start "" "https://web.whatsapp.com"`, () => {});
                } else if (error) {
                    exec(`powershell -Command "Start-Process '${targetStr}'"`, () => {});
                }
            });
            resolve({ success: true });
        } catch (e) {
            resolve({ success: false });
        }
    });
};

// Helper to resolve common natural language locations to absolute paths
const resolveLocation = (location) => {
    const home = os.homedir();
    if (!location) {
        const oneDrive = path.join(home, "OneDrive", "Desktop");
        return fs.existsSync(oneDrive) ? oneDrive : path.join(home, "Desktop");
    }
    const locLower = location.toLowerCase().trim();
    
    // Check for drive letters like "c drive", "drive c", "volume d", "d:", "c:\"
    const driveMatch = locLower.match(/([a-z])\s*drive|drive\s*([a-z])|volume\s*([a-z])|^([a-z]):/i);
    if (driveMatch) {
        const letter = driveMatch[1] || driveMatch[2] || driveMatch[3] || driveMatch[4];
        return `${letter.toUpperCase()}:\\`;
    }

    // Handle "This PC" / "My Computer" / "My PC"
    if (locLower.includes("this pc") || locLower.includes("my pc") || locLower.includes("computer")) {
        const sysDrive = process.env.SystemDrive ? `${process.env.SystemDrive}\\` : "C:\\";
        return fs.existsSync(sysDrive) ? sysDrive : "C:\\";
    }
    
    // Handle OneDrive intercepted folders natively
    const getVerifiedPath = (folderName) => {
        const oneDrive = path.join(home, "OneDrive", folderName);
        if (fs.existsSync(oneDrive)) return oneDrive;
        const standard = path.join(home, folderName);
        if (fs.existsSync(standard)) return standard;
        return oneDrive;
    };

    if (locLower.includes("desktop")) return getVerifiedPath("Desktop");
    if (locLower.includes("document")) return getVerifiedPath("Documents");
    if (locLower.includes("download")) return getVerifiedPath("Downloads");
    if (locLower.includes("picture")) return getVerifiedPath("Pictures");
    if (locLower.includes("video")) return getVerifiedPath("Videos");
    if (locLower.includes("music")) return getVerifiedPath("Music");
    
    // Fallback: If it looks like C:\ or similar, keep it. Else treat as relative to home
    if (path.isAbsolute(location)) return location;
    return path.join(home, location);
};

export const openApp = async (appName) => {
    if (!appName) return "No app name specified.";
    const appLower = appName.toLowerCase().trim();

    const appMap = {
        "vscode": "code",
        "vs code": "code",
        "visual studio code": "code",
        "notepad": "notepad",
        "this pc": "shell:::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
        "my pc": "shell:::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
        "computer": "shell:::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
        "recycle bin": "shell:RecycleBinFolder",
        "settings": "ms-settings:",
        "control panel": "control",
        "chrome": "chrome",
        "browser": "chrome",
        "cmd": "cmd",
        "terminal": "wt",
        "calculator": "calc",
        "word": "winword",
        "excel": "excel",
        "powerpoint": "powerpnt",
        "microsoft store": "ms-windows-store:",
        "store": "ms-windows-store:",
        "camera": "microsoft.windows.camera:",
        "photos": "ms-photos:",
        "clock": "ms-clock:",
        "whatsapp": "whatsapp:",
        "whatsapp web": "https://web.whatsapp.com",
        "youtube": "https://www.youtube.com",
        "edge": "msedge",
        "microsoft edge": "msedge"
    };

    const target = appMap[appLower] || appName;
    await openUIApp(target);
    return `Opened ${appName}.`;
};

export const closeApp = async (appName) => {
    if (!appName) return "No app name specified.";
    const appLower = appName.toLowerCase().trim();

    const processMap = {
        "vscode": "code",
        "vs code": "code",
        "visual studio code": "code",
        "notepad": "notepad",
        "chrome": "chrome",
        "browser": "chrome",
        "cmd": "cmd",
        "terminal": "WindowsTerminal",
        "calculator": "CalculatorApp",
        "word": "WINWORD",
        "excel": "EXCEL",
        "powerpoint": "POWERPNT",
        "whatsapp": "WhatsApp",
        "edge": "msedge",
        "microsoft edge": "msedge",
        "settings": "SystemSettings",
        "photos": "PhotosApp"
    };

    let target = processMap[appLower] || appLower;
    
    return new Promise((resolve) => {
        exec(`powershell -WindowStyle Hidden -Command "Stop-Process -Name '${target}' -Force -ErrorAction SilentlyContinue"`, () => {});
        exec(`taskkill /IM "${target}.exe" /F`, () => {});
        resolve(`Closed ${appName}.`);
    });
};

export const createFolder = async (location, name) => {
    name = name || "";
    const rootPath = resolveLocation(location);
    if (!fs.existsSync(rootPath)) return `The location ${location} does not exist.`;
    
    const targetPath = path.join(rootPath, name);
    if (fs.existsSync(targetPath)) return `A folder named ${name} already exists on ${location}.`;
    
    try {
        fs.mkdirSync(targetPath, { recursive: true });
        return `Created folder ${name} on ${location}.`;
    } catch (err) {
        return `Failed to create folder ${name}: ${err.message}`;
    }
};

export const createFile = async (location, name) => {
    name = name || "";
    const rootPath = resolveLocation(location);
    if (!fs.existsSync(rootPath)) return `The location ${location} does not exist.`;
    
    // Add extension if naturally missing but obvious
    let fileName = name;
    if (!fileName.includes(".")) fileName += ".txt"; // Default to text file

    const targetPath = path.join(rootPath, fileName);
    if (fs.existsSync(targetPath)) return `A file named ${fileName} already exists on ${location}.`;
    
    try {
        fs.writeFileSync(targetPath, "");
        return `Created file ${fileName} on ${location}.`;
    } catch (err) {
        return `Failed to create file ${fileName}: ${err.message}`;
    }
};

export const deleteItem = async (location, name) => {
    name = name || "";
    const rootPath = resolveLocation(location);
    if (!fs.existsSync(rootPath)) return `The location ${location} does not exist.`;
    
    let targetPath = path.join(rootPath, name);
    if (!fs.existsSync(targetPath) && !name.includes(".")) {
        if (fs.existsSync(`${targetPath}.txt`)) {
            targetPath = `${targetPath}.txt`;
        } else {
            return `The item ${name} does not exist on ${location}.`;
        }
    } else if (!fs.existsSync(targetPath)) {
        return `The item ${name} does not exist on ${location}.`;
    }
    
    try {
        const stat = fs.statSync(targetPath);
        await trash(targetPath);
        if (stat.isDirectory()) {
            return `Moved folder ${name} from ${location} to the Recycle Bin.`;
        } else {
            return `Moved file ${name} from ${location} to the Recycle Bin.`;
        }
    } catch (error) {
        return `Failed to delete ${name}. Make sure it is not in use.`;
    }
};

export const renameItem = async (location, oldName, newName) => {
    oldName = oldName || "";
    newName = newName || "";
    const rootPath = resolveLocation(location);
    if (!fs.existsSync(rootPath)) return `The location ${location} does not exist.`;
    
    let oldPath = path.join(rootPath, oldName);
    
    if (!fs.existsSync(oldPath) && !oldName.includes(".")) {
        if (fs.existsSync(`${oldPath}.txt`)) oldPath = `${oldPath}.txt`;
    }

    if (!fs.existsSync(oldPath)) {
        return `The item ${oldName} does not exist on ${location}.`;
    }
    
    const isDir = fs.statSync(oldPath).isDirectory();
    let finalNewName = newName;
    if (!isDir && !newName.includes(".") && oldPath.includes(".")) {
        finalNewName += path.extname(oldPath);
    }

    const newPath = path.join(rootPath, finalNewName);
    try {
        fs.renameSync(oldPath, newPath);
        return `Renamed ${oldName} to ${finalNewName}.`;
    } catch (err) {
        return `Failed to rename ${oldName}: ${err.message}`;
    }
};

export const playMedia = async (movieName) => {
    const searchDirs = [
        path.join(os.homedir(), "Downloads"),
        path.join(os.homedir(), "Videos"),
        path.join(os.homedir(), "OneDrive", "Desktop"),
        path.join(os.homedir(), "Desktop")
    ];

    for (let dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;
        try {
            const files = fs.readdirSync(dir, { recursive: true });
            for (let file of files) {
                if (file.toLowerCase().includes(movieName.toLowerCase()) && file.match(/\.(mp4|mkv|avi|mov)$/i)) {
                    const fullPath = path.join(dir, file);
                    await runCommand(`start vlc "${fullPath}"`);
                    return `Playing ${movieName} in VLC.`;
                }
            }
        } catch (e) {}
    }
    
    return `I could not find a movie named ${movieName} to play.`;
};

export const openFolder = async (location, name) => {
    name = name || "";
    const locLower = (location || "").toLowerCase().trim();
    const nameLower = (name || "").toLowerCase().trim();
    
    if ((nameLower === "recycle bin" || locLower === "recycle bin" || locLower.includes("recycle")) && !name) {
        return await openApp("recycle bin");
    }
    if ((nameLower === "this pc" || locLower === "this pc" || locLower === "my pc") && !name) {
        return await openApp("this pc");
    }

    let targetPath = resolveLocation(location);
    
    if (name) {
        const potentialDrive = resolveLocation(name);
        if (potentialDrive.match(/^[A-Z]:\\$/)) {
            targetPath = potentialDrive;
        } else {
            targetPath = path.join(targetPath, name);
        }
    }
    
    if (!fs.existsSync(targetPath)) return `The folder ${name || location} does not exist.`;
    
    await openUIApp(targetPath);
    return `Opened folder ${name || location}.`;
};

export const openFile = async (location, name) => {
    name = name || "";
    const locLower = (location || "").toLowerCase().trim();
    const nameLower = (name || "").toLowerCase().trim();

    if ((nameLower === "recycle bin" || locLower === "recycle bin" || locLower.includes("recycle")) && !name) {
        return await openApp("recycle bin");
    }
    if ((nameLower === "this pc" || locLower === "this pc" || locLower === "my pc") && !name) {
        return await openApp("this pc");
    }

    const rootPath = resolveLocation(location);
    let targetPath = path.join(rootPath, name);
    
    if (!fs.existsSync(targetPath) && !name.includes(".")) {
        if (fs.existsSync(`${targetPath}.txt`)) targetPath = `${targetPath}.txt`;
    }

    if (!fs.existsSync(targetPath)) return `The file ${name} does not exist on ${location}.`;
    
    await openUIApp(targetPath);
    return `Opened file ${name}.`;
};
