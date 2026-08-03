// MARK: VM Mouse Button Loop
// VM Stuff (COMMENT OUT WHEN BUILDING FOR HARDWARE, THIS USES SO MUCH CPU CYCLES OMG)
forever(function () {
    if (browserEvents.MouseLeft.isPressed()) {
        if (isOverScrollBarThumb()) {
            beginScrollBarDrag()
            while (browserEvents.MouseLeft.isPressed()) {
                updateScrollBarDrag()
                pause(10)
            }
            endScrollBarDrag()
        } else {
            MouseClick(1)
            while (browserEvents.MouseLeft.isPressed()) {
                pause(10)
            }
        }
    }
    if (browserEvents.MouseRight.isPressed()) {
        MouseClick(2)
        while (browserEvents.MouseRight.isPressed()) {
            pause(10)
        }
    }
})

// MARK: A Button
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isVM) { return }
    if (isOverScrollBarThumb()) {
        beginScrollBarDrag()
        while (controller.A.isPressed()) {
            updateScrollBarDrag()
            pause(10)
        }
        endScrollBarDrag()
    } else {
        MouseClick(1)
    }
})

// MARK: B Button
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isVM) {} else {MouseClick(2)}
})

// MARK: Menu Button
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (App_Open == "death") {
        game.reset()
    } else if (App_Open == "null") {
        Open_Library()
    } else {
        close_apps()
    }
})

// MARK: Mouse Click
function MouseClick(button: number) {
    if (Mouse_Cursor.overlapsWith(Close_App) && button == 1) {
        close_apps()
        return
    }
    if (handleRightClickMenuClick(button)) {
        return
    }

    if (App_Open == "App Library") {
        if (button == 1) {
            handleLibraryClick()
        }
        return
    }

    if (isDestroyed(Mouse_Cursor)) {
        // ugh, why is this needed for the code to work, you can't even destroy the mouse cursor
        kernel_panic(202)
        return
    }
    if (button == 1 && handleTaskbarIconClick()) {
        return
    }
    if (button == 1 && handleScrollArrowClick()) {
        return
    }

    switch (App_Open) {
        case "File Manager":
        case "Settings":
            handleFileManagerSettingsClick(button)
            break
        case "NanoCode":
        case "Write":
            handleNanoCodeWriteClick(button)
            break
        case "xCell":
            handleXCellClick(button)
            break
        case "Web Chat":
            handleWebChatClick(button)
            break
    }
}

// MARK: Right Click Menu
// Returns true if the click was consumed by (or dismissed) the right-click menu.
function handleRightClickMenuClick(button: number): boolean {
    if (isDestroyed(RightClickMenu)) {
        return false
    }
    if (button == 1) {
        let menuHalfHeight = current_rclick_menu.length * 6;
        if (Mouse_Cursor.x > RightClickMenu.x - 25 && Mouse_Cursor.x < RightClickMenu.x + 25) {
            if (Mouse_Cursor.y > RightClickMenu.y - menuHalfHeight && Mouse_Cursor.y < RightClickMenu.y + menuHalfHeight) {
                let selectedIndex = Math.floor((Mouse_Cursor.y - (RightClickMenu.y - menuHalfHeight)) / 12);
                listSelection(App_Open, menu_selection, SubMenu, "rclick" + selectedIndex, rclick_override);
            }
        }
    }
    RightClickMenu.destroy();
    outline.destroy();
    return button == 1
}

// MARK: Taskbar Icon Click
// Returns true (and opens the app) if the mouse is over a taskbar icon.
function handleTaskbarIconClick(): boolean {
    if (Mouse_Cursor.overlapsWith(xCell_Icon)) {
        Open_xCell("")
    } else if (Mouse_Cursor.overlapsWith(Write_icon)) {
        Open_Write("")
    } else if (Mouse_Cursor.overlapsWith(Web_Chat_Icon)) {
        Open_Web()
    } else if (Mouse_Cursor.overlapsWith(Settings_Icon)) {
        Open_Settings()
    } else if (Mouse_Cursor.overlapsWith(File_Manager_Icon)) {
        Open_FileManager("Home", null)
    } else if (Mouse_Cursor.overlapsWith(NanoCode_Icon)) {
        Open_NanoCode(null)
    } else if (Mouse_Cursor.overlapsWith(Process_Icon)) {
        Open_ProcessManager()
    } else if (Mouse_Cursor.overlapsWith(Library_icon)) {
        Open_Library()
    } else {
        return false
    }
    return true
}

// MARK: List Scroll Arrow Click
function handleScrollArrowClick(): boolean {
    if (isDestroyed(scrollBar) || !(Mouse_Cursor.overlapsWith(ArrowDown) || Mouse_Cursor.overlapsWith(ArrowUp))) {
        return false
    }
    if (Mouse_Cursor.overlapsWith(ArrowDown)) {
        if (ListMenuContents.length > visibleRows) {
            let item = ListMenuContents.shift();
            if (item !== undefined) {
                ListMenuGUIHidden.push(item);
                List_Scroll++;
            }
        }
    } else if (Mouse_Cursor.overlapsWith(ArrowUp)) {
        if (List_Scroll > 0 && ListMenuGUIHidden.length > 0) {
            let item = ListMenuGUIHidden.pop();
            if (item !== undefined) {
                ListMenuContents.unshift(item);
                List_Scroll--;
            }
        }
    }
    refreshScrollableListGUI()
    return true
}

// MARK: Refresh Scrollable List GUI
// Shared by the arrow-click and scrollbar-drag scroll paths.
function refreshScrollableListGUI() {
    if (App_Open == "NanoCode") {
        reloadListGUI(76, 64, 151, 84, true);
        updateScrollBar(visibleRows, true);
    } else if (App_Open == "Write") {
        reloadListGUI(76, 63, 151, 84, darkMode);
        updateScrollBar(visibleRows, darkMode);
    } else if (App_Open == "Web Chat") {
        reloadListGUI(80, 58, 160, 97, darkMode);
        updateScrollBar(visibleRows, darkMode, 82);
        if (ListMenuContents.length == visibleRows) {
            ListMenuGUI.selectedIndex = ListMenuContents.length - 1;
        }
    } else {
        reloadListGUI(76, 58, 151, 97, darkMode);
        updateScrollBar(visibleRows, darkMode);
    }
}

// MARK: ScrollBar Track Bottom For Current App
// Keep in sync with the trackBottom values used in refreshScrollableListGUI.
function scrollBarTrackBottomForCurrentApp(): number {
    return App_Open == "Web Chat" ? 82 : 95
}

// MARK: ScrollBar Drag Start
// Returns true if the mouse is over the scrollbar thumb and there's a
// scrollable list app open.
function isOverScrollBarThumb(): boolean {
    return !isDestroyed(scrollBar) && !isDestroyed(Mouse_Cursor) && Mouse_Cursor.overlapsWith(scrollBar)
}

function beginScrollBarDrag() {
    scrollBarDragging = true
    scrollBarDragStartY = Mouse_Cursor.y
    scrollBarDragStartScroll = List_Scroll
}

function endScrollBarDrag() {
    scrollBarDragging = false
}

// MARK: ScrollBar Drag Update
// Moves items between ListMenuContents / ListMenuGUIHidden to track the
// mouse's vertical offset from where the drag started, mirroring how
// updateScrollBar maps List_Scroll to a thumb position.
function updateScrollBarDrag() {
    if (isDestroyed(scrollBar)) {
        return
    }
    const totalItems = ListMenuContents.length + ListMenuGUIHidden.length
    const maxScroll = totalItems - visibleRows
    if (maxScroll <= 0) {
        return
    }

    const trackTop = 19
    const trackBottom = scrollBarTrackBottomForCurrentApp()
    const trackHeight = trackBottom - trackTop
    let scrollBarHeight = totalItems <= visibleRows
        ? trackHeight
        : Math.max(5, Math.floor((visibleRows / totalItems) * trackHeight))
    if (totalItems > visibleRows && scrollBarHeight % 2 == 0) { scrollBarHeight-- }
    const travelDistance = trackHeight - scrollBarHeight
    if (travelDistance <= 0) {
        return
    }

    const deltaY = Mouse_Cursor.y - scrollBarDragStartY
    const deltaScroll = Math.round(deltaY * maxScroll / travelDistance)
    const target = Math.max(0, Math.min(maxScroll, scrollBarDragStartScroll + deltaScroll))
    if (target == List_Scroll) {
        return
    }

    while (List_Scroll < target && ListMenuContents.length > visibleRows) {
        let item = ListMenuContents.shift()
        if (item === undefined) { break }
        ListMenuGUIHidden.push(item)
        List_Scroll++
    }
    while (List_Scroll > target && ListMenuGUIHidden.length > 0) {
        let item = ListMenuGUIHidden.pop()
        if (item === undefined) { break }
        ListMenuContents.unshift(item)
        List_Scroll--
    }

    refreshScrollableListGUI()
}

// MARK: File Manager / Settings Click
function handleFileManagerSettingsClick(button: number) {
    menu_selection = 0;
    for (let i = 0; i < 8; i++) {
        if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
            menu_selection = i + 1;
            if (button == 1 && ListMenuContents[menu_selection - 1] != null) {
                listSelection(App_Open, menu_selection, SubMenu, "click", 0)
                break;
            } else if (button == 2 && App_Open == "File Manager") {
                ListMenuGUI.selectedIndex = menu_selection - 1
                listSelection(App_Open, menu_selection, SubMenu, "rclick", 0);
                openRightClickMenu()
            }
        }
    }
}

// MARK: NanoCode / Write Click
function handleNanoCodeWriteClick(button: number) {
    for (let i = 0; i < 8; i++) {
        if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
            if (i == 0) {
                handleNanoCodeWriteToolbarClick()
            } else if (button == 1 && ListMenuContents[i - 1] != null) {
                const changed_selection = game.askForString(ListMenuContents[i - 1].text, 36)
                if (changed_selection == null) {
                    ListMenuContents[i - 1] = microUtilities.createMenuItem("")
                } else {
                    ListMenuContents[i - 1] = microUtilities.createMenuItem(changed_selection)
                }
                if (ListMenuContents[ListMenuContents.length - 1].text !== " ") {
                    ListMenuContents.push(microUtilities.createMenuItem(" "))
                }
                refreshNanoCodeWriteListGUI()
                break;
            } else if (button == 2 && (App_Open == "Write" || App_Open == "NanoCode") && ListMenuContents[i - 1] != null) {
                writeRclickRow = i - 1
                current_rclick_menu = [microUtilities.createMenuItem("Copy"), microUtilities.createMenuItem("Paste"), microUtilities.createMenuItem("Clear")]
                openRightClickMenu()
                break;
            }
        }
    }
}

// MARK: Refresh NanoCode / Write List GUI
// Shared by line-edit and copy/paste/clear row actions.
function refreshNanoCodeWriteListGUI() {
    if (App_Open == "NanoCode") {
        reloadListGUI(76, 63, 151, 84, true);
        updateScrollBar(7, true);
    } else {
        reloadListGUI(76, 63, 151, 84, darkMode);
        updateScrollBar(7, darkMode);
    }
}

// MARK: NanoCode / Write Toolbar Row Click (compile / save)
function handleNanoCodeWriteToolbarClick() {
    const x = Mouse_Cursor.x
    if (x > 152) {
        return
    } else if (x > 98) {
        if (App_Open == "Write") { return }
        // compile app
        const newName = game.askForString("App file name", 15)
        if (!isValidFileName(newName, "nsa")) { return }
        const allLines = ListMenuGUIHidden.concat(ListMenuContents)
        const serialized: string = allLines
            .map(item => item.text)
            .filter(t => t !== " ")
            .join("~")
        const compiled = compile_nanosdk_code(serialized)
        const nsaKey = fileKey("nsa", newName)
        if (!hasStorageSpaceFor(nsaKey, compiled)) {
            softerror(113)
            return
        }
        settings.writeString(nsaKey, compiled)
        User_Files.push(microUtilities.createMenuItem(newName + ".nsa"))
        settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
    } else if (x > 4) {
        // save file
        let appID = "nsp"
        let saveIndentifier = "Project"
        if (App_Open == "Write") {
            appID = "wrt"
            saveIndentifier = "Document"
        }

        const allLines = ListMenuGUIHidden.concat(ListMenuContents)
        const serialized: string = allLines
            .map(item => item.text)
            .filter(t => t !== " ")
            .join("~")
        if (open_document == null || x > 38) {
            const newName = game.askForString(saveIndentifier + " name", 15)
            if (!isValidFileName(newName, appID)) { return }
            const newKey = fileKey(appID, newName)
            if (!hasStorageSpaceFor(newKey, serialized)) {
                softerror(113)
                return
            }
            open_document = newName
            settings.writeString(newKey, serialized)
            User_Files.push(microUtilities.createMenuItem(newName + "." + appID))
            settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
        } else {
            const existingKey = fileKey(appID, open_document + "")
            if (!hasStorageSpaceFor(existingKey, serialized)) {
                softerror(113)
                return
            }
            settings.writeString(existingKey, serialized)
        }
    }
}

// MARK: xCell Click
function handleXCellClick(button: number) {
    if (button == 1 && Mouse_Cursor.overlapsWith(xcellArrowUp)) {
        xcellScrollUp()
    } else if (button == 1 && Mouse_Cursor.overlapsWith(xcellArrowDown)) {
        xcellScrollDown()
    } else if (button == 1 && Mouse_Cursor.overlapsWith(xcellArrowLeft)) {
        xcellScrollLeft()
    } else if (button == 1 && Mouse_Cursor.overlapsWith(xcellArrowRight)) {
        xcellScrollRight()
    } else {
        for (let i = 0; i < 8; i++) {
            if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 160) {
                if (i == 0) {
                    handleXCellToolbarClick()
                } else if (i == 1) {
                    // header row -- column letters, not editable by click, but rclick opens a column menu
                    const col = xcellColumnAt(Mouse_Cursor.x)
                    if (button == 2 && col >= 0) {
                        xcellRclickTarget = "col"
                        xcellRclickCol = col
                        current_rclick_menu = [microUtilities.createMenuItem("Copy"), microUtilities.createMenuItem("Paste"), microUtilities.createMenuItem("Clear")]
                        openRightClickMenu()
                    }
                } else {
                    handleXCellCellClick(button, xcellScroll + (i - 2))
                }
                break
            }
        }
    }
}

// MARK: xCell Toolbar Row Click (save)
function handleXCellToolbarClick() {
    const x = Mouse_Cursor.x
    if (x > 152) {
        return
    } else if (x > 4) {
        const serialized = xcellSerialize()
        if (open_document == null || x > 38) {
            const newName = game.askForString("Sheet name", 15)
            if (!isValidFileName(newName, "xcl")) { return }
            const newKey = fileKey("xcl", newName)
            if (!hasStorageSpaceFor(newKey, serialized)) {
                softerror(113)
                return
            }
            open_document = newName
            settings.writeString(newKey, serialized)
            User_Files.push(microUtilities.createMenuItem(newName + ".xcl"))
            settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
        } else {
            const existingKey = fileKey("xcl", open_document + "")
            if (!hasStorageSpaceFor(existingKey, serialized)) {
                softerror(113)
                return
            }
            settings.writeString(existingKey, serialized)
        }
    }
}

// MARK: xCell Grid Cell Click
function handleXCellCellClick(button: number, row: number) {
    if (row < 0 || row >= XCELL_TOTAL_ROWS) {
        return
    }
    const col = xcellColumnAt(Mouse_Cursor.x)
    if (button == 1 && col >= 0) {
        const current = xcellGrid[row][col]
        const label = xcellCellRef(row, col) + (current != "" ? (": " + current) : "")
        const input = game.askForString(label, 20)
        xcellSetCell(row, col, input == null ? "" : input)
    } else if (button == 2 && col >= 0) {
        xcellRclickTarget = "cell"
        xcellRclickRow = row
        xcellRclickCol = col
        const current = xcellGrid[row][col]
        current_rclick_menu = [
            microUtilities.createMenuItem(current == "" ? "(empty)" : current),
            microUtilities.createMenuItem("Copy"),
            microUtilities.createMenuItem("Copy Output"),
            microUtilities.createMenuItem("Paste"),
            microUtilities.createMenuItem("Clear")
        ]
        openRightClickMenu()
    } else if (button == 2 && col < 0) {
        xcellRclickTarget = "row"
        xcellRclickRow = row
        current_rclick_menu = [microUtilities.createMenuItem("Copy"), microUtilities.createMenuItem("Paste"), microUtilities.createMenuItem("Clear")]
        openRightClickMenu()
    }
}

// MARK: Web Chat Click
function handleWebChatClick(button: number) {
    if (Mouse_Cursor.overlapsWith(WebChatSend) && button == 1 && WEBmessage != "" && WEBmessage != "Type here...") {
        sendWebChatMessage()
    } else if (!isDestroyed(WebChatRemoveAttachment) && Mouse_Cursor.overlapsWith(WebChatRemoveAttachment) && button == 1) {
        WebChatRemoveAttachment.destroy()
        attachement = null
    } else if (Mouse_Cursor.x > 0 && Mouse_Cursor.x < 148 && Mouse_Cursor.y < 92) {
        handleWebChatRowClick(button)
    } else if (Mouse_Cursor.x > 0 && Mouse_Cursor.x < 136 && Mouse_Cursor.y > 92 && Mouse_Cursor.y < 105 && button == 1) {
        KeyboardVisible = true
        WEBmessage = game.askForString("Type your message here", 36)
        KeyboardVisible = false
        if (WEBmessage == null || WEBmessage == "") {
            WEBmessage = "Type here..."
        }
        Temp = WEBmessage
        refreshWebChatList()
    }
}

// MARK: Web Chat Send
function sendWebChatMessage() {
    KeyboardVisible = true
    const sentText = WEBmessage
    let attachmentData: Buffer = null
    if (attachement != null) {
        const parts = attachement.split(".")
        if (parts.length == 2) {
            const content = settings.readString(fileKey(parts[1], parts[0]))
            if (content != null) {
                attachmentData = Buffer.fromUTF8(content)
            }
        }
    }
    const sentAttachmentName = attachement != null ? attachement : ""
    if (!isDestroyed(WebChatRemoveAttachment)) {
        WebChatRemoveAttachment.destroy()
    }
    attachement = null
    // Reset before pushWebChatEntry, which redraws the list
    // immediately (reading Temp for the placeholder row) --
    // resetting after would redraw with the just-sent text
    // still showing as the placeholder.
    WEBmessage = "Type here..."
    Temp = "Type here..."
    pushWebChatEntry({
        senderId: microUtilities.serialNumber(), senderName: Username + " (You)",
        verified: microUtilities.isMicrobit(), text: sentText,
        attachmentId: "", attachmentName: sentAttachmentName,
        attachmentData: attachmentData, attachmentReady: attachmentData != null
    })
    webChatProtocol.sendMessage(sentText, sentAttachmentName, attachmentData)
    KeyboardVisible = false
}

// MARK: Web Chat Row Click
function handleWebChatRowClick(button: number) {
    for (let i = 0; i < 7; i++) {
        if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12) {
            const row = webChatRowAt(i)
            if (row) {
                if (button == 2 && row.part == "name" && row.entry.verified) {
                    rclickWebChatEntry = row.entry
                    current_rclick_menu = [
                        microUtilities.createMenuItem("Serial"),
                        microUtilities.createMenuItem(row.entry.senderId),
                        microUtilities.createMenuItem("Save")
                    ]
                    openRightClickMenu()
                } else if (button == 1 && row.part == "attachment" && row.entry.attachmentReady) {
                    importWebChatAttachment(row.entry)
                }
            }
            break
        }
    }
}

// MARK: App Library Click
function handleLibraryClick() {
    if (handleTaskbarIconClick()) {
        return
    }
    for (let i = 0; i < Library_Icons.length; i++) {
        if (!isDestroyed(Library_Icons[i]) && Mouse_Cursor.overlapsWith(Library_Icons[i])) {
            const appBinary = settings.readString(fileKey("nsa", Library_Icon_Files[i]))
            if (appBinary != null) {
                Open_NanoSDK_App(appBinary)
            }
            break
        }
    }
}
