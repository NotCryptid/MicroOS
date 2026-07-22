// MARK: Close Apps
function close_apps () {
    ListMenuGUIHidden = []
    List_Scroll = 0
    App_Open = "null"
    SubMenu = "null"
    Temp = ""
    NanoSDK_App_Running = false
    nanoSDK_hover_highlight = false
    open_document = null
    Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
    scene.setBackgroundImage(Wallpaper)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroyAllSpritesOfKind(SpriteKind.App_UI)
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
}

function getSystemSettingsMenu() {
    return [
        miniMenu.createMenuItem("Back"),
        miniMenu.createMenuItem("Data Management"),
        miniMenu.createMenuItem("System Information"),
        miniMenu.createMenuItem("Time Settings")
    ]
}

function getAppSettingsMenu() {
    return [
        miniMenu.createMenuItem("Back"),
        miniMenu.createMenuItem("WebChat"),
        miniMenu.createMenuItem("NanoCode"),
        miniMenu.createMenuItem("NanoSDK Apps")
    ]
}

function listSelection(app: string, selection: number, submenu: string, action: string, override: number) {
    const selectedOption = override == 0 ? selection + List_Scroll : override

    switch (app) {
        // MARK: File Manager
        case "File Manager": {
            if (action == "rclick") {
                rclick_override = selectedOption
                if (ListMenuContents[selection - 1] == null || ListMenuContents[selection - 1].text == "Home") {
                    current_rclick_menu = rclick_menu_files_empty
                } else {
                    current_rclick_menu = rclick_menu_files
                }
                return
            }

            switch (submenu) {
                case "System": {
                    if (action == "click" || action == "rclick0") {
                        switch (selectedOption) {
                            case 1:
                                SubMenu = "Home"
                                Open_FileManager("Home")
                                break
                            case 2:
                                game.reset()
                                break
                            case 3:
                                error(105)
                                break
                            case 4:
                                Open_FileManager("Home")
                                break
                            case 5:
                                softerror(302)
                                break
                            case 6:
                                Open_Write()
                                break
                            case 7:
                                Open_xCell()
                                break
                            case 8:
                                Open_Settings()
                                break
                            case 9:
                                Open_Web()
                                break
                            case 10:
                                Open_NanoCode()
                                break
                        }
                    } else {
                        softerror(107)
                    }
                    break
                }
                case "Details": {
                    if (action == "click" && selectedOption == 8) {
                        // good enough for now, might add details menu for system files later
                        SubMenu = "User"
                        Open_FileManager("User")
                    }
                    break
                }
                case "User": {
                    // i don't even know whats going on here anymore
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
                            if (fileType == null || fileType == "" || fileType.length !== 3) {
                                softerror(111)
                                return
                            }
                            if (!isValidFileName(newName, fileType)) { return }
                            const newKey = fileKey(fileType, newName)
                            const newContent = "~"
                            if (!hasStorageSpaceFor(newKey, newContent)) {
                                softerror(113)
                                return
                            }
                            settings.writeString(newKey, newContent)
                            User_Files.push(miniMenu.createMenuItem(newName + "." + fileType))
                            settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                            Open_FileManager("User")
                        } else if (action === "rclick1") {
                            if (clipboardName != "" && clipboardExt != "") {
                                const sourceContent = settings.readString(fileKey(clipboardExt, clipboardName))
                                if (sourceContent == null) {
                                    softerror(110)
                                    return
                                }
                                const copyName = "Copy of " + clipboardName
                                if (!isValidFileName(copyName, clipboardExt)) { return }
                                const destKey = fileKey(clipboardExt, copyName)
                                if (!hasStorageSpaceFor(destKey, sourceContent)) {
                                    softerror(113)
                                    return
                                }
                                settings.writeString(destKey, sourceContent)
                                User_Files.push(miniMenu.createMenuItem(copyName + "." + clipboardExt))
                                settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                                clipboardName = ""
                                clipboardExt = ""
                                Open_FileManager("User")
                            }
                        }
                    } else if (action !== "rclick") {
                        const FileOpened = FileAtSelection.split(".")
                        switch (action) {
                            case "click":
                            case "rclick0":
                                switch (FileOpened[1]) {
                                    case "wrt":
                                        Open_Write(settings.readString(fileKey("wrt", FileOpened[0])), FileOpened[0])
                                        break
                                    case "xcl":
                                        Open_xCell(settings.readString(fileKey("xcl", FileOpened[0])))
                                        break
                                    case "app":
                                        Open_NanoSDK_App(settings.readString(fileKey("app", FileOpened[0])))
                                        break
                                    case "nsp":
                                        Open_NanoCode(settings.readString(fileKey("nsp", FileOpened[0])), FileOpened[0])
                                        break
                                    case "nsa":
                                        Open_NanoSDK_App(settings.readString(fileKey("nsa", FileOpened[0])))
                                        break
                                    default:
                                        softerror(109)
                                        break
                                }
                                break
                            case "rclick1": {
                                const newName = game.askForString("Rename file", 15)
                                if (!isValidFileName(newName, FileOpened[1])) { return }
                                const oldKey = fileKey(FileOpened[1], FileOpened[0])
                                const newKey = fileKey(FileOpened[1], newName)
                                if (settings.readString(newKey) == null) {
                                    const content = settings.readString(oldKey)
                                    if (!hasStorageSpaceFor(newKey, content)) {
                                        softerror(113)
                                        return
                                    }
                                    settings.writeString(newKey, content)
                                    settings.remove(oldKey)
                                    User_Files[globalFileIndex] = miniMenu.createMenuItem(newName + "." + FileOpened[1])
                                    settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                                    Open_FileManager("User")
                                } else {
                                    softerror(110)
                                }
                                break
                            }
                            case "rclick2":
                                clipboardExt = FileOpened[1]
                                clipboardName = FileOpened[0]
                                break
                            case "rclick3":
                                Open_Web(FileAtSelection)
                                break
                            case "rclick4":
                                Open_FileManager("Details", FileAtSelection)
                                break
                            case "rclick5":
                                settings.remove(fileKey(FileOpened[1], FileOpened[0]))
                                User_Files.splice(globalFileIndex, 1)
                                settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                                Open_FileManager("User")
                                break
                        }
                    } else {
                        current_rclick_menu = rclick_menu_files
                        return
                    }
                    break
                }
                case "Home": {
                    if (action == "click" || action == "rclick0") {
                        ListMenuGUI.close()
                        ListMenuGUIHidden = []
                        List_Scroll = 0
                        switch (selectedOption) {
                            case 1:
                                SubMenu = "System"
                                ListMenuContents = System_Files.slice()
                                ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
                                break
                            case 2:
                                SubMenu = "User"
                                ListMenuContents = User_Files.slice()
                                ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
                                break
                        }
                    } else {
                        softerror(107)
                    }
                    reloadListGUI(76, 58, 151, 97, darkMode)
                    updateScrollBar(8, darkMode)
                    break
                }
            }
            break
        }
        // MARK: Settings
        case "Settings": {
            const previousSubMenu = SubMenu
            switch (submenu) {
                // MARK: Settings Home
                case "Home":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[3], // radio channel
                                Current_Settings[2], // connection method
                                Current_Settings[5] // username
                            ]
                            if (microUtilities.isMicrobit()) {
                                ListMenuContents.push(miniMenu.createMenuItem("Serial - " + microUtilities.serialNumber()))
                            }
                            SubMenu = "Connectivity"
                            break
                        case 2:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[0], // keyboard
                                Current_Settings[1] // mouse
                            ]
                            SubMenu = "Input"
                            break
                        case 3:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[4], // wallpaper
                                Current_Settings[8], // dark mode
                                Current_Settings[9] // theme
                            ]
                            SubMenu = "Customization"
                            break
                        case 4:
                            ListMenuContents = getSystemSettingsMenu()
                            SubMenu = "System"
                            break
                        case 5:
                            ListMenuContents = getAppSettingsMenu()
                            SubMenu = "App Settings"
                            break
                    }
                    break
                // MARK: Settings Connectivity
                case "Connectivity":
                    switch (selectedOption) {
                        case 1:
                            close_apps()
                            SubMenu = "Home"
                            Open_Settings()
                            break
                        case 2:
                            changeSettings(4)
                            ListMenuContents[1] = Current_Settings[3]
                            break
                        case 3:
                            changeSettings(3)
                            ListMenuContents[2] = Current_Settings[2]
                            break
                        case 4:
                            Username = game.askForString("Enter new username", 7)
                            if (Username == null || Username == "" || Username == " " || Username == "System") {
                                softerror(204)
                                return
                            }
                            settings.writeString("Username", Username)
                            webChatProtocol.setUsername(Username)
                            Current_Settings[5] = miniMenu.createMenuItem("Name - " + Username)
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[3],
                                Current_Settings[2],
                                Current_Settings[5]
                            ]
                            break
                    }
                    break
                // MARK: Settings Input
                case "Input":
                    switch (selectedOption) {
                        case 1:
                            SubMenu = "Home"
                            Open_Settings()
                            break
                        case 2:
                            changeSettings(1)
                            ListMenuContents[1] = Current_Settings[0]
                            break
                        case 3:
                            changeSettings(2)
                            ListMenuContents[2] = Current_Settings[1]
                            break
                    }
                    break
                // MARK: Settings Customization
                case "Customization":
                    switch (selectedOption) {
                        case 1:
                            SubMenu = "Home"
                            Open_Settings()
                            break
                        case 2:
                            changeSettings(5)
                            ListMenuContents[1] = Current_Settings[4]
                            break
                        case 3:
                            changeSettings(8)
                            ListMenuContents[2] = Current_Settings[8]
                            break
                        case 4:
                            changeSettings(9)
                            ListMenuContents[3] = Current_Settings[9]
                            break
                    }
                    break
                // MARK: Settings System
                case "System":
                    switch (selectedOption) {
                        case 1:
                            SubMenu = "Home"
                            Open_Settings()
                            break
                        case 2:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                miniMenu.createMenuItem("Delete all user files"),
                                miniMenu.createMenuItem("Set settings to default"),
                                miniMenu.createMenuItem("Wipe Device")
                            ]
                            SubMenu = "Data Management"
                            break
                        case 3:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                miniMenu.createMenuItem("MicroOS v0.4.0"),
                                miniMenu.createMenuItem("NanoSDK 2026.2"),
                                miniMenu.createMenuItem("Storage - " + microUtilities.storageCapacity(StorageUnit.Kilobytes) + "KB"),
                                miniMenu.createMenuItem("Storage Free - " + Math.floor((microUtilities.storageCapacity(StorageUnit.Kilobytes) - microUtilities.storageUsage(StorageUnit.Kilobytes))) + "KB"),
                                miniMenu.createMenuItem("RAM Capacity - " + microUtilities.ramCapacity(StorageUnit.Kilobytes) + "KB"),
                                miniMenu.createMenuItem("RAM Usage - " + Math.floor(microUtilities.ramUsage(StorageUnit.Kilobytes)) + "KB"),
                                miniMenu.createMenuItem("Clock Speed - " + microUtilities.cpuSpeed() + "MHz")
                            ]
                            SubMenu = "System Information"
                            break
                        case 4:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[6], // show clock
                                miniMenu.createMenuItem("Hour - " + hour),
                                miniMenu.createMenuItem("Minute - " + minute.toString().substr(1, 2)),
                            ]
                            SubMenu = "Time Settings"
                            break
                    }
                    break
                // MARK: Settings Data Management
                case "Data Management":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getSystemSettingsMenu()
                            SubMenu = "System"
                            break
                        case 2:
                            deleteAllUserFiles()
                            break
                        case 3:
                            Settings = "100010000"
                            settings.writeString("settings", Settings)
                            game.reset()
                            break
                        case 4:
                            deleteAllUserFiles()
                            Settings = "100010000"
                            settings.writeString("settings", Settings)
                            settings.writeString("Username", "User")
                            settings.writeString("RoomCode", "12345678")
                            game.reset()
                            break
                    }
                    break
                // MARK: Settings System Information
                case "System Information":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getSystemSettingsMenu()
                            SubMenu = "System"
                            break
                        case 2:
                            break
                    }
                    break
                // MARK: Settings Time
                case "Time Settings":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getSystemSettingsMenu()
                            SubMenu = "System"
                            break
                        case 2:
                            changeSettings(6)
                            ListMenuContents[1] = Current_Settings[6]
                            break
                        case 3:
                            hour++
                            if (hour > 23) {
                                hour = 0
                            }
                            ListMenuContents[2] = miniMenu.createMenuItem("Hour - " + hour)
                            clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
                            break
                        case 4:
                            minute++
                            if (minute > 159) {
                                minute = 100
                            }
                            ListMenuContents[3] = miniMenu.createMenuItem("Minute - " + minute.toString().substr(1, 2))
                            clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
                            break
                    }
                    break
                // MARK: Settings App
                case "App Settings":
                    switch (selectedOption) {
                        case 1:
                            SubMenu = "Home"
                            Open_Settings()
                            break
                        case 2:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                Current_Settings[7], // room code
                                miniMenu.createMenuItem("Delete Chats")
                            ]
                            if (microUtilities.isMicrobit()) {
                                ListMenuContents.push(Current_Settings[10]) // indicator
                            }
                            SubMenu = "WebChat Settings"
                            break
                        case 3:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                // make something here later
                            ]
                            SubMenu = "NanoCode Settings"
                            break
                        case 4:
                            ListMenuContents = [
                                miniMenu.createMenuItem("Back"),
                                // edit files (Never, Ask, Allow)
                                // edit system settings (Never, Ask, Allow)
                                // delete files (Never, Ask, Allow)
                                // use radio (Never, Ask, Allow)
                            ]
                            SubMenu = "NanoSDK App Settings"
                            break
                    }
                    break
                // MARK: Settings WebChat
                case "WebChat Settings":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getAppSettingsMenu()
                            SubMenu = "App Settings"
                            break
                        case 2:
                            RoomCode = game.askForNumber("Enter new room code", 8).toString()
                            changeSettings(7)
                            ListMenuContents[1] = Current_Settings[7]
                            break
                        case 3:
                            WebChatHistory = [
                                { senderId: "000000000", senderName: "System", verified: true, text: "Welcome to Web Chat!", attachmentId: "", attachmentName: "", attachmentData: null, attachmentReady: false }
                            ]
                            break
                        case 4:
                            if (microUtilities.isMicrobit()) {
                                changeSettings(10)
                                ListMenuContents[4] = Current_Settings[10]
                            }
                            break
                    }
                    break
                // MARK: Settings NanoCode
                case "NanoCode Settings":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getAppSettingsMenu()
                            SubMenu = "App Settings"
                            break
                        case 2:
                            break
                    }
                    break
                // MARK: Settings NanoSDK App
                case "NanoSDK App Settings":
                    switch (selectedOption) {
                        case 1:
                            ListMenuContents = getAppSettingsMenu()
                            SubMenu = "App Settings"
                            break
                        case 2:
                            break
                    }
                    break
            }
            if (SubMenu !== previousSubMenu) {
                ListMenuGUIHidden = []
                List_Scroll = 0
            }
            reloadListGUI(76, 58, 151, 97, darkMode)
            updateScrollBar(8, darkMode)
            break
        }
        // MARK: Web Chat
        case "Web Chat": {
            if (action == "rclick2" && rclickWebChatEntry != null) {
                let wcUserIndex = 0
                while (_fileNameTaken("wc_user_" + wcUserIndex + ".wrt")) {
                    wcUserIndex++
                }
                const newName = "wc_user_" + wcUserIndex
                if (!isValidFileName(newName, "wrt")) return
                const content = ["Name: " + rclickWebChatEntry.senderName, "Serial: " + rclickWebChatEntry.senderId].join("~")
                const key = fileKey("wrt", newName)
                if (!hasStorageSpaceFor(key, content)) {
                    softerror(113)
                    return
                }
                settings.writeString(key, content)
                User_Files.push(miniMenu.createMenuItem(newName + ".wrt"))
                settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
            }
            break
        }
    }
}

// MARK: Delete All User Files
function deleteAllUserFiles() {
    for (let i = 0; i < User_Files.length; i++) {
        if (User_Files[i].text !== "Home") {
            const fileParts = User_Files[i].text.split(".")
            if (fileParts.length === 2) {
                settings.remove(fileKey(fileParts[1], fileParts[0]))
            }
        }
    }
    User_Files = [miniMenu.createMenuItem("Home")]
    settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
}

// MARK: Write Settings
function changeSettings(selection: number) {
    let settingDigitIndex = selection
    switch (selection) {
        case 7:
            settingDigitIndex = -1
            break
        case 8:
            settingDigitIndex = 7
            break
        case 9:
            settingDigitIndex = 8
            break
        case 10:
            settingDigitIndex = 9
            break
    }
    let dingus53 = 0
    if (settingDigitIndex >= 0) {
        let currentDigit = parseInt(Settings.charAt(settingDigitIndex), 10)
        if (isNaN(currentDigit)) {
            currentDigit = 0
        }
        dingus53 = currentDigit + 1
    }
    let dingus52 = 0
    let dingus51 = "spoingy"
    let currentSettingsIndex = selection - 1
    switch (selection) {
        case 1:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Keyboard - OnScreen", "Keyboard - Jacdac", "Keyboard - OnScreen"][dingus53]
            break
        case 2:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Mouse - D-Pad", "Mouse - Jacdac", "Mouse - D-Pad"][dingus53]
            break
        case 3:
            dingus52 = 2
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Connectivity - Radio", "Connectivity - Jacdac", "Connectivity - Off", "Connectivity - Radio"][dingus53]
            break
        case 4:
            dingus52 = 9
            if (dingus53 > dingus52) {
                dingus53 = 1
            }
            dingus51 = "Radio Channel - " + (dingus53).toString()
            break
        case 5:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Wallpaper - Strings", "Wallpaper - Squiggles", "Wallpaper - Strings"][dingus53]
            break
        case 6:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Show Clock - True", "Show Clock - False", "Show Clock - True"][dingus53]
            currentSettingsIndex = 6
            if (dingus53 !== 1) {
                clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
            } else {
                clock.setText("")
            }
            break
        case 7:
            dingus53 = 0
            dingus51 = "Room Code - " + RoomCode
            currentSettingsIndex = 7
            settings.writeString("RoomCode", RoomCode)
            webChatProtocol.setRoomCode(RoomCode)
            break
        case 8:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Dark Mode - Off", "Dark Mode - On", "Dark Mode - Off"][dingus53]
            currentSettingsIndex = 8
            darkMode = dingus53 == 1
            break
        case 9:
            dingus52 = 3
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Theme - Default", "Theme - Blush", "Theme - Ocean", "Theme - Orange", "Theme - Default"][dingus53]
            currentSettingsIndex = 9
            theme = themes[dingus53]
            generateTaskbar(theme[0], theme[1])
            break
        case 10:
            dingus52 = 1
            if (dingus53 > dingus52) {
                dingus53 = 0
            }
            dingus51 = ["Indicator - On", "Indicator - Off", "Indicator - On"][dingus53]
            if (dingus53 == 1) {
                microUtilities.setPixel(0,0,false)
            }
            currentSettingsIndex = 10
            break
    }
    createAppBar(0, theme[2])
    if (settingDigitIndex >= 0) {
        Settings = Settings.slice(0, settingDigitIndex) + dingus53.toString() + Settings.slice(settingDigitIndex + 1)
    }
    Current_Settings[currentSettingsIndex] = miniMenu.createMenuItem(dingus51)
    settings.writeString("settings", Settings)
    reloadListGUI(76, 58, 151, 97, darkMode)
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
}

// MARK: Valid File Name Check
function isValidFileName(name: string, ext: string): boolean {
    if (name == null || name == "" || name == "Home") {
        softerror(110)
        return false
    }
    if (name.indexOf("~") >= 0 || name.indexOf("\u00a7") >= 0 || name.indexOf(".") >= 0) {
        softerror(110)
        return false
    }
    if (ext.indexOf("~") >= 0 || ext.indexOf("\u00a7") >= 0 || ext.indexOf(".") >= 0) {
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

// MARK: File Storage Key
function fileKey(ext: string, name: string): string {
    return "file_" + ext + "~" + name
}

// MARK: File Storage Size
function utf8ByteLength(str: string): number {
    let bytes = 0
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        if (code < 0x80) {
            bytes += 1
        } else if (code < 0x800) {
            bytes += 2
        } else if (code >= 0xd800 && code <= 0xdbff) {
            bytes += 4
            i++
        } else {
            bytes += 3
        }
    }
    return bytes
}

function raffsEntrySize(key: string, content: string): number {
    const szNeeded = utf8ByteLength(content) + utf8ByteLength(key) + 1
    const raffsRound = ((szNeeded + 7) >> 3) << 3
    return 8 + raffsRound
}

function fileEntrySize(key: string): number {
    const content = settings.readString(key)
    if (content == null) {
        return 0
    }
    return raffsEntrySize(key, content)
}

// MARK: Storage Space Check
function hasStorageSpaceFor(key: string, content: string): boolean {
    const needed = raffsEntrySize(key, content)
    const free = microUtilities.storageCapacity(StorageUnit.Bytes) - microUtilities.storageUsage(StorageUnit.Bytes)
    return needed <= free
}

// MARK: Open Right Click Menu
// Builds the floating RightClickMenu sprite (+ its outline) from
// current_rclick_menu, positioned near the mouse cursor. Caller must set
// current_rclick_menu first.
function openRightClickMenu() {
    RightClickMenu = miniMenu.createMenuFromArray(current_rclick_menu)
    RightClickMenu.setButtonEventsEnabled(false)
    let RightClickMenuX = Mouse_Cursor.x + 23
    if (Mouse_Cursor.x > 107) {
        RightClickMenuX = 130
    }
    if (Mouse_Cursor.y < 60) {
        RightClickMenu.setPosition(RightClickMenuX, Mouse_Cursor.y + current_rclick_menu.length * 6)
    } else {
        RightClickMenu.setPosition(RightClickMenuX, Mouse_Cursor.y - current_rclick_menu.length * 6)
    }
    RightClickMenu.setDimensions(50, current_rclick_menu.length * 12)
    outline = sprites.create(image.create(1, 1), SpriteKind.App_UI)
    outline.image.setPixel(0, 0, 15)
    RightClickMenu.z = 350346
    outline.z = 350345
    outline.setPosition(RightClickMenu.x, RightClickMenu.y)
    scaling.scaleToPixels(outline, 52, ScaleDirection.Horizontally, ScaleAnchor.Middle)
    scaling.scaleToPixels(outline, current_rclick_menu.length * 12 + 2, ScaleDirection.Vertically, ScaleAnchor.Middle)
}

// MARK: Reload ListGUI
function reloadListGUI(x: number, y: number, width: number, height: number, dark_mode: boolean = false) {
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
    updateListMenuHover()
}

// MARK: Create Arrows
// bottomY lets callers pull the down arrow up off its default spot (eg. Web
// Chat, where the default position sits under the send button).
function createArrows(bottomY: number = 101) {
    ArrowUp = sprites.create(assets.image`ArrowUp`, SpriteKind.App_UI)
    ArrowUp.setPosition(156, 14)
    ArrowDown = sprites.create(assets.image`ArrowDown`, SpriteKind.App_UI)
    ArrowDown.setPosition(156, bottomY)
}

// MARK: Update ScrollBar
// trackBottom lets callers shrink the scrollbar's travel range (eg. Web
// Chat, to keep it clear of the send button) -- keep it in sync with the
// bottomY passed to createArrows.
function updateScrollBar(maxVisible: number = 8, dark: boolean = false, trackBottom: number = 95) {
    if (spriteutils.isDestroyed(scrollBar)) {
        return;
    }

    visibleRows = maxVisible

    // Real item count -- no padding. Padding this used to make the bar
    // read as "always slightly short of full", even with nothing left to
    // scroll to (eg. Web Chat sitting at exactly maxVisible items).
    let totalItems = ListMenuContents.length + ListMenuGUIHidden.length;

    if (dark) {
        let darkimg = assets.image`scrollBar2`
        darkimg.setPixel(0, 2, 15)
        darkimg.setPixel(6, 2, 15)
        scrollBarRond.setImage(darkimg)
    }

    const trackTop = 19;
    const trackHeight = trackBottom - trackTop;

    // Same formula for the full-track and partial-thumb cases -- having
    // the full case skip the odd-height rounding used to give it a
    // different (1px larger) gap above the top arrow than a partial thumb.
    let scrollBarHeight = totalItems <= maxVisible
        ? trackHeight
        : Math.max(5, Math.floor((maxVisible / totalItems) * trackHeight));
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
    scrollBarRond.y = Math.min(centreY + halfH + 1, trackBottom + 1);
}
