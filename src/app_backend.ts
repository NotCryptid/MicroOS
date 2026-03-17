// MARK: Close Apps
function close_apps () {
    ListMenuGUIHidden = []
    List_Scroll = 0
    App_Open = "null"
    SubMenu = "null"
    Temp = ""
    NanoSDK_App_Running = false
    nanoSDK_hover_highlight = false
    open_nanocode_file = null
    Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
    scene.setBackgroundImage(Wallpaper)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroyAllSpritesOfKind(SpriteKind.App_UI)
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
}

function listSelection(app: string, selection: number, submenu: string, action: string, override: number) {
    let selectedOption = 0
    if (override == 0) {
        selectedOption = selection + List_Scroll
    } else {
        selectedOption = override
    }

    const SystemSettings = [
        miniMenu.createMenuItem("Back"),
        miniMenu.createMenuItem("Data Management"),
        miniMenu.createMenuItem("System Information"),
        miniMenu.createMenuItem("Time Settings")
    ]
    const AppSettings = [
        miniMenu.createMenuItem("Back"),
        miniMenu.createMenuItem("WebChat"),
        miniMenu.createMenuItem("NanoCode"),
        miniMenu.createMenuItem("NanoSDK Apps")
    ]

    // MARK: File Manager
    if (app == "File Manager") {
        if (action == "rclick") {
            rclick_override = selectedOption
            if (ListMenuContents[selection - 1] == null || ListMenuContents[selection - 1].text == "Home") {
                current_rclick_menu = rclick_menu_files_empty
            } else {
                current_rclick_menu = rclick_menu_files
            }
            return
        } else if (submenu == "System") {
            if (action == "click" || action == "rclick0") {
                if (selectedOption == 1) {
                    SubMenu = "Home"
                    Open_FileManager("Home")
                } else if (selectedOption == 2) {
                    game.reset()
                } else if (selectedOption == 3) {
                    error(105)
                } else if (selectedOption == 4) {
                    Open_FileManager("Home")
                } else if (selectedOption == 5) {
                    softerror(302)
                } else if (selectedOption == 6) {
                    Open_Write("")
                } else if (selectedOption == 7) {
                    Open_xCell("")
                } else if (selectedOption == 8) {
                    Open_Settings()
                } else if (selectedOption == 9) {
                    Open_Web()
                } else if (selectedOption == 10) {
                    Open_NanoCode(null)
                }
            } else {
                softerror(107)
            } 
            
        } else if (submenu == "Details") { 
            if (action == "click" && selectedOption == 8) {
                // good enough for now, might add details menu for system files later
                SubMenu = "User"
                Open_FileManager("User")
            }
        } else if (submenu == "User") {
            // i don't even know whats going on here anymore
            // fileIndex is into ListMenuContents (the visible window, already shifted by scroll)
            // globalFileIndex is into User_Files (the full backing array)
            const fileIndex = selection - 1;
            const globalFileIndex = ListMenuGUIHidden.length + selection - 1;
            const menuItem = fileIndex >= 0 && fileIndex < ListMenuContents.length 
                ? ListMenuContents[fileIndex] 
                : null;
            const FileAtSelection = menuItem ? menuItem.text : null;
            if (FileAtSelection == "Home" || FileAtSelection == null) {
                if (FileAtSelection == "Home" && action == "click") {
                    SubMenu = "Home"
                    Open_FileManager("Home")
                } else if (action === "rclick0") {
                    const newName = game.askForString("New file name", 15)
                    const fileType = game.askForString("File type (wrt, xcl, nsp)", 3)
                    if (fileType == null || fileType == "" || fileType.length < 3) {
                        softerror(111)
                        return
                    }
                    if (!isValidFileName(newName, fileType)) { return }
                    blockSettings.writeString("file_" + fileType + newName, "~")
                    User_Files.push(miniMenu.createMenuItem(newName + "." + fileType))
                    blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                    Open_FileManager("User")
                } else if (action === "rclick1") {
                    if (clipboard == "" || clipboard == null) {

                    } else {
                        const FileOpened = clipboard.split("_")
                        FileOpened[2] = FileOpened[1].substr(0, 3)
                        FileOpened[1] = FileOpened[1].substr(3)
                        blockSettings.writeString("file_" + FileOpened[2] + "Copy of " + FileOpened[1], blockSettings.readString(clipboard))
                        User_Files.push(miniMenu.createMenuItem("Copy of " + FileOpened[1] + "." + FileOpened[2]))
                        blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                        clipboard = null
                        Open_FileManager("User")
                    }
                }    
            } else if (FileAtSelection !== null) {
                if (action !== "rclick") {
                    const FileOpened = FileAtSelection.split(".")
                    if (action == "click" || action == "rclick0") {
                        if (FileOpened[1] == "wrt") {
                            Open_Write(blockSettings.readString("file_wrt" + FileOpened[0]))
                        } else if (FileOpened[1] == "xcl") {
                            Open_xCell(blockSettings.readString("file_xcell" + FileOpened[0]))
                        } else if (FileOpened[1] == "app") {
                            Open_NanoSDK_App(blockSettings.readString("file_app" + FileOpened[0]))
                        } else if (FileOpened[1] == "nsp") {
                            Open_NanoCode(blockSettings.readString("file_nsp" + FileOpened[0]), FileOpened[0])
                        } else if (FileOpened[1] == "nsa") {
                            Open_NanoSDK_App(blockSettings.readString("file_nsa" + FileOpened[0]))
                        } else{
                            softerror(109)
                        }
                           
                    } else if (action == "rclick1") {
                        const newName = game.askForString("Rename file", 15)
                        if (!isValidFileName(newName, FileOpened[1])) { return }
                        if (blockSettings.readString("file_" + FileOpened[1] + newName) == null) {
                            blockSettings.writeString("file_" + FileOpened[1] + newName, blockSettings.readString("file_" + FileOpened[1] + FileOpened[0]))
                            blockSettings.writeString("file_" + FileOpened[1] + FileOpened[0], "")
                            User_Files[globalFileIndex] = miniMenu.createMenuItem(newName + "." + FileOpened[1])
                            blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                            Open_FileManager("User")
                        } else {
                            softerror(110)
                        }
                    } else if (action == "rclick2") {
                        clipboard = "file_" + FileOpened[1] + FileOpened[0]
                    } else if (action == "rclick3") {
                        Open_FileManager("Details", FileAtSelection)
                    } else if (action == "rclick4") {
                        blockSettings.writeString("file_" + FileOpened[1] + FileOpened[0], "")
                        User_Files.splice(globalFileIndex, 1)
                        blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                        Open_FileManager("User")
                    }

                } else {
                    current_rclick_menu = rclick_menu_files
                    return
                }
            }
        } else if (submenu == "Home") {
            if (action == "click" || action == "rclick0") {
                ListMenuGUI.close()
                ListMenuGUIHidden = []
                List_Scroll = 0
                if (selectedOption == 1) {
                    SubMenu = "System"
                    ListMenuContents = System_Files.slice()
                    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
                } else if (selectedOption == 2) {
                    SubMenu = "User"
                    ListMenuContents = User_Files.slice()
                    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
            } 
            } else {
                softerror(107)
            } 
            reloadListGUI(76, 58, 151, 97, false)
            updateScrollBar(8)
        }
    // MARK: Settings
    } else if (app == "Settings") {
        if (submenu == "Home") {
            if (selectedOption == 1) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[3],
                    Current_Settings[2],
                    Current_Settings[5]
                ]
                SubMenu = "Connectivity"
            } else if (selectedOption == 2) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[0],
                    Current_Settings[1]
                ]
                SubMenu = "Input"
            } else if (selectedOption == 3) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[4],
                    Current_Settings[8],
                    Current_Settings[9]
                ]
                SubMenu = "Customization"
            } else if (selectedOption == 4) {
                ListMenuContents = SystemSettings
                SubMenu = "System"
            } else if (selectedOption == 5) {
                ListMenuContents = AppSettings
                SubMenu = "App Settings"
            }
        } else if (submenu == "Connectivity") {
            if (selectedOption == 1) {
                close_apps()
                SubMenu = "Home"
                Open_Settings()
            } else if (selectedOption == 2) {
                changeSettings(4)
                ListMenuContents[1] = Current_Settings[3]
            } else if (selectedOption == 3) {
                changeSettings(3)
                ListMenuContents[2] = Current_Settings[2]
            } else if (selectedOption == 4) {
                Username = game.askForString("Enter new username", 7)
                if (Username == null || Username == "" || Username == " " || Username == "System") {
                    softerror(204)
                    return
                }
                blockSettings.writeString("Username", Username)
                Current_Settings[5] = miniMenu.createMenuItem("Name - " + Username)
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[3],
                    Current_Settings[2],
                    Current_Settings[5]
                ]
            }
        } else if (submenu == "Input") {
            if (selectedOption == 1) {
                SubMenu = "Home"
                Open_Settings()
            } else if (selectedOption == 2) {
                changeSettings(1)
                ListMenuContents[1] = Current_Settings[0]
            } else if (selectedOption == 3) {
                changeSettings(2)
                ListMenuContents[2] = Current_Settings[1]
            } else if (selectedOption == 4) {
                
            } else if (selectedOption == 5) {
                
            }
        } else if (submenu == "Customization") {
            if (selectedOption == 1) {
                SubMenu = "Home"
                Open_Settings()
            } else if (selectedOption == 2) {
                changeSettings(5)
                ListMenuContents[1] = Current_Settings[4]
            } else if (selectedOption == 3) {

            } else if (selectedOption == 4) {
                
            } else if (selectedOption == 5) {
                
            }
        } else if (submenu == "System") {
            if (selectedOption == 1) {
                SubMenu = "Home"
                Open_Settings()
            } else if (selectedOption == 2) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("Delete all user files"),
                    miniMenu.createMenuItem("Set settings to default"),
                    miniMenu.createMenuItem("Wipe Device")
                ]
                SubMenu = "Data Management"
            } else if (selectedOption == 3) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("MicroOS v0.1.0"),
                    miniMenu.createMenuItem("NanoSDK 2026.1")
                    // miniMenu.createMenuItem("Storage - "+ microUtilities.storageCapacity(StorageUnit.Kilobytes) +"KB"),
                    // miniMenu.createMenuItem("Storage Free - "+ microUtilities.storageCapacity(StorageUnit.Kilobytes) - microUtilities.storageUsage(StorageUnit.Kilobytes) +"KB"),
                    // miniMenu.createMenuItem("RAM Avaiable - " + microUtilities.ramCapacity() + "KB"),
                    // miniMenu.createMenuItem("Clock Speed - "+ microUtilities.cpuSpeed() +"MHz")
                ]
                SubMenu = "System Information"
            } else if (selectedOption == 4) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[6],
                    miniMenu.createMenuItem("Hour - " + hour),
                    miniMenu.createMenuItem("Minute - " + minute.toString().substr(1, 2)),
                ]
                SubMenu = "Time Settings"
            }
        } else if (submenu == "Data Management") {
            if (selectedOption == 1) {
                ListMenuContents = SystemSettings
                SubMenu = "System"
            } else if (selectedOption == 2) {
                for (let i = 0; i < User_Files.length; i++) {
                    if (User_Files[i].text !== "Home") {
                        const fileParts = User_Files[i].text.split(".")
                        if (fileParts.length === 2) {
                            blockSettings.writeString("file_" + fileParts[1] + fileParts[0], "")
                        }
                    }
                }
                User_Files = [miniMenu.createMenuItem("Home")]
                blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
            } else if (selectedOption == 3) {
                Settings = "1000100"
                blockSettings.writeString("settings", Settings)
                game.reset()
            } else if (selectedOption == 4) {
                for (let i = 0; i < User_Files.length; i++) {
                    if (User_Files[i].text !== "Home") {
                        const fileParts = User_Files[i].text.split(".")
                        if (fileParts.length === 2) {
                            blockSettings.writeString("file_" + fileParts[1] + fileParts[0], "")
                        }
                    }
                }
                User_Files = [miniMenu.createMenuItem("Home")]
                blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                Settings = "1000100"
                blockSettings.writeString("settings", Settings)
                blockSettings.writeString("Username", "User")
                blockSettings.writeString("RoomCode", "12345678")
                game.reset()
            }
        } else if (submenu == "System Information") {
            if (selectedOption == 1) {
                ListMenuContents = SystemSettings
                SubMenu = "System"
            } else if (selectedOption == 2) {
                // fuck you, nothing happens
                // dipshit
                // nobody likes you
            }
        } else if (submenu == "Time Settings") {
            if (selectedOption == 1) {
                ListMenuContents = SystemSettings
                SubMenu = "System"
            } else if (selectedOption == 2) {
                changeSettings(6)
                ListMenuContents[1] = Current_Settings[5]
            } else if (selectedOption == 3) {
                hour++
                if (hour > 23) {
                    hour = 0
                }
                ListMenuContents[2] = miniMenu.createMenuItem("Hour - " + hour)
                clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
            } else if (selectedOption == 4) {
                minute++
                if (minute > 159) {
                    minute = 100
                }
                ListMenuContents[3] = miniMenu.createMenuItem("Minute - " + minute.toString().substr(1, 2))
                clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
            }
        } else if (submenu == "App Settings") {
            if (selectedOption == 1) {
                SubMenu = "Home"
                Open_Settings()
            } else if (selectedOption == 2) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[7], // room code
                    miniMenu.createMenuItem("Delete Chats")
                ]
                SubMenu = "WebChat Settings"
            } else if (selectedOption == 3) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    // make something here later
                ]
                SubMenu = "NanoCode Settings"
            } else if (selectedOption == 4) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    // edit files (Never, Ask, Allow)
                    // edit system settings (Never, Ask, Allow)
                    // delete files (Never, Ask, Allow)
                    // use radio (Never, Ask, Allow)
                ]
                SubMenu = "NanoSDK App Settings"
            }
        } else if (submenu == "WebChat Settings") {
            if (selectedOption == 1) {
                ListMenuContents = AppSettings
                SubMenu = "App Settings"
            } else if (selectedOption == 2) {
                RoomCode = game.askForNumber("Enter new room code", 8).toString()
                changeSettings(7)
            } else if (selectedOption == 3) {
                WebChatMessages = []
            }
        } else if (submenu == "NanoCode Settings") {
            if (selectedOption == 1) {
                ListMenuContents = AppSettings
                SubMenu = "App Settings"
            } else if (selectedOption == 2) {
                // fuck you, nothing happens
                // dipshit
                // nobody likes you
            }
        } else if (submenu == "NanoSDK App Settings") {
            if (selectedOption == 1) {
                ListMenuContents = AppSettings
                SubMenu = "App Settings"
            } else if (selectedOption == 2) {
                // fuck you, nothing happens
                // dipshit
                // nobody likes you
            }
        }
        reloadListGUI(76, 58, 151, 97, false)
    }
}

// Mark: Write Settings
function changeSettings(selection: number) {
    let dingus53 = parseInt(Settings.charAt(selection), 10) + 1;
    let dingus52 = 0
    let dingus51 = "spoingy"
    if (selection == 1) {
        dingus52 = 1
        dingus51 = ["Keyboard - OnScreen", "Keyboard - Jacdac", "Keyboard - OnScreen"][dingus53]
    } else if (selection == 2) {
        dingus52 = 1
        dingus51 = ["Mouse - D-Pad", "Mouse - Jacdac", "Mouse - D-Pad"][dingus53]
    } else if (selection == 3) {
        dingus52 = 2
        dingus51 = ["Connectivity - Radio", "Connectivity - Jacdac", "Connectivity - Off", "Connectivity - Radio"][dingus53]
    } else if (selection == 4) {
        dingus52 = 9
        if (dingus53 > dingus52) {
            dingus53 = 1
        }
        dingus51 = "Radio Channel - " + (dingus53).toString()
    } else if (selection == 5) {
        dingus52 = 1
        dingus51 = ["Wallpaper - Strings", "Wallpaper - Squiggles", "Wallpaper - Strings"][dingus53]
    } else if (selection == 6) {
        dingus52 = 1
        dingus51 = ["Show Clock - True", "Show Clock - False", "Show Clock - True"][dingus53]
        if (dingus53 !== 1) {
            clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
        } else {
            clock.setText("")
        }
    } else if (selection == 7) {
        dingus51 = "Room Code - " + RoomCode
        blockSettings.writeString("RoomCode", RoomCode)
    } else if (selection == 8) {
        dingus52 = 4
        dingus51 = ["Theme - Default", "Theme - Blush", "Theme - Ocean", "Theme - Orange", "Theme - Default"][dingus53]
    } else if (selection == 9) {
        dingus52 = 2
        dingus51 = ["Dark Mode - Off", "Dark Mode - On", "Dark Mode - Off"][dingus53]
        if (dingus53 == 1) { 
            darkMode = true
        } else {
            darkMode = false
        }
    }
    if (dingus53 > dingus52) {
        dingus53 = 0
    }
    Settings = Settings.slice(0, selection) + dingus53.toString() + Settings.slice(selection + 1)
    Current_Settings[selection - 1] = miniMenu.createMenuItem(dingus51)
    blockSettings.writeString("settings", Settings)
    reloadListGUI(76, 58, 151, 97, false)
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
}

// MARK: Valid File Name Check
function isValidFileName(name: string, ext: string): boolean {
    if (name == null || name == "" || name == "Home") {
        softerror(110)
        return false
    }
    if (name.indexOf("~") >= 0 || name.indexOf("\u00a7") >= 0) {
        softerror(110)
        return false
    }
    if (ext.indexOf("~") >= 0 || ext.indexOf("\u00a7") >= 0) {
        softerror(111)
        return false
    }
    const fullName = name + "." + ext
    for (let i = 0; i < User_Files.length; i++) {
        if (User_Files[i].text == fullName) {
            softerror(112)
            return false
        }
    }
    return true
}

// MARK: Reload ListGUI
function reloadListGUI(x: number, y: number, width: number, height: number, dark_mode: boolean) {
    ListMenuGUI.destroy()
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(width, height)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(x, y)
    ListMenuGUI.z = -30
    if (dark_mode) {
        ListMenuGUI.setMenuStyleProperty(miniMenu.MenuStyleProperty.BackgroundColor, 15)
        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Default, miniMenu.StyleProperty.Foreground, 1)
        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Default, miniMenu.StyleProperty.Background, 15)
        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Foreground, 15)
        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Background, 1)
    }
}

// MARK: Create Arrows
function createArrows() {
    ArrowUp = sprites.create(assets.image`ArrowUp`, SpriteKind.App_UI)
    ArrowUp.setPosition(156, 14)
    ArrowDown = sprites.create(assets.image`ArrowDown`, SpriteKind.App_UI)
    ArrowDown.setPosition(156, 101)
}

// MARK: Update ScrollBar
function updateScrollBar(maxVisible: number = 8, dark: boolean = false) {
    if ((App_Open !== "File Manager" && App_Open !== "NanoCode") || spriteutils.isDestroyed(scrollBar)) {
        return;
    }

    let totalItems = ListMenuContents.length + ListMenuGUIHidden.length + 1;

    if (dark) {
        let darkimg = assets.image`scrollBar2`
        darkimg.setPixel(0, 2, 15)
        darkimg.setPixel(6, 2, 15)
        scrollBarRond.setImage(darkimg)
    }

    const trackTop = 19;
    const trackBottom = 95;
    const trackHeight = trackBottom - trackTop;

    if (totalItems <= maxVisible) {
        scaling.scaleToPixels(scrollBar, 78, ScaleDirection.Vertically, ScaleAnchor.Middle);
        scrollBar.y = 57;
        scrollBarRond.y = 95;
    } else {
        let scrollBarHeight = Math.max(5, Math.floor((maxVisible / totalItems) * 78));
        if (scrollBarHeight % 2 == 0) { scrollBarHeight-- }
        let halfH = (scrollBarHeight - 1) / 2;

        scaling.scaleToPixels(scrollBar, scrollBarHeight, ScaleDirection.Vertically, ScaleAnchor.Middle);

        let maxScroll = totalItems - maxVisible;
        let scrollProgress = maxScroll > 0 ? List_Scroll / maxScroll : 0;
        let travelDistance = trackHeight - scrollBarHeight;

        let centreY = trackTop + halfH + Math.round(scrollProgress * travelDistance);
        centreY = Math.max(trackTop + halfH, centreY);
        centreY = Math.min(trackBottom - halfH, centreY);
        scrollBar.y = centreY;
        scrollBarRond.y = Math.min(centreY + halfH + 1, 96);
    }
}