// MARK: VM Mouse Button Loop
// VM Stuff (COMMENT OUT WHEN BUILDING FOR HARDWARE, THIS USES SO MUCH CPU CYCLES OMG)
forever(function () {
    if (browserEvents.MouseLeft.isPressed()) {
        MouseClick(1)
        while (browserEvents.MouseLeft.isPressed()) {
            pause(10)
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
    if (isVM) {} else {MouseClick(1)}
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
    } else if (isDestroyed(RightClickMenu) == false) {
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
        if (button == 1) {
            return
        }
    }
    
    if (App_Open !== "App Library") {
        if (isDestroyed(Mouse_Cursor)) {
            // ugh, why is this needed for the code to work, you can't even destroy the mouse cursor
            kernel_panic(202)
        } else if (Mouse_Cursor.overlapsWith(xCell_Icon) && button == 1) {
            Open_xCell("")
        } else if (Mouse_Cursor.overlapsWith(Write_icon) && button == 1) {
            Open_Write("")
        } else if (Mouse_Cursor.overlapsWith(Web_Chat_Icon) && button == 1) {
            Open_Web()
        } else if (Mouse_Cursor.overlapsWith(Settings_Icon) && button == 1) {
            Open_Settings()
        } else if (Mouse_Cursor.overlapsWith(File_Manager_Icon) && button == 1) {
            Open_FileManager("Home", null)
        } else if (Mouse_Cursor.overlapsWith(NanoCode_Icon) && button == 1) {
            Open_NanoCode(null)
        } else if (Mouse_Cursor.overlapsWith(Process_Icon) && button == 1) {
            Open_ProcessManager()
        } else if (Mouse_Cursor.overlapsWith(Library_icon) && button == 1) {
            Open_Library()
        } else if (button == 1 && !(isDestroyed(scrollBar)) && (Mouse_Cursor.overlapsWith(ArrowDown) || Mouse_Cursor.overlapsWith(ArrowUp))) {
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
            if (App_Open == "NanoCode") {
                reloadListGUI(76, 64, 151, 84, true);
                updateScrollBar(visibleRows, true);
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
        } else if (App_Open == "File Manager" || App_Open == "Settings") {
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
        } else if (App_Open == "NanoCode" || App_Open == "Write" ) {
            for (let i = 0; i < 8; i++) {
                if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
                    if (i == 0) {
                        const x = Mouse_Cursor.x
                        if (x > 152) { } else if (x > 98) {
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
                            User_Files.push(miniMenu.createMenuItem(newName + ".nsa"))
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
                                User_Files.push(miniMenu.createMenuItem(newName + "." + appID))
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
                    } else if (button == 1 && ListMenuContents[i - 1] != null) {
                        const changed_selection = game.askForString(ListMenuContents[i - 1].text, 36)
                        if (changed_selection == null) {
                            ListMenuContents[i - 1] = miniMenu.createMenuItem("")
                        } else {
                            ListMenuContents[i - 1] = miniMenu.createMenuItem(changed_selection)
                        }
                        if (ListMenuContents[ListMenuContents.length - 1].text !== " ") {
                            ListMenuContents.push(miniMenu.createMenuItem(" "))
                        }
                        if (App_Open == "NanoCode") {
                            reloadListGUI(76, 63, 151, 84, true);
                            updateScrollBar(7, true);
                        } else { 
                            reloadListGUI(76, 63, 151, 84, darkMode);
                            updateScrollBar(7, darkMode);
                        }
                        break;
                    }
                }
            }
        } else if (App_Open == "Web Chat") {
            if (Mouse_Cursor.overlapsWith(WebChatSend) && button == 1 && WEBmessage != "" && WEBmessage != "Type here...") {
                KeyboardVisible = true
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
                pushWebChatEntry({
                    senderId: microUtilities.serialNumber(), senderName: Username + " (You)",
                    verified: microUtilities.isMicrobit(), text: WEBmessage,
                    attachmentId: "", attachmentName: sentAttachmentName,
                    attachmentData: attachmentData, attachmentReady: attachmentData != null
                })
                webChatProtocol.sendMessage(WEBmessage, sentAttachmentName, attachmentData)
                if (!isDestroyed(WebChatRemoveAttachment)) {
                    WebChatRemoveAttachment.destroy()
                }
                attachement = null
                WEBmessage = "Type here..."
                Temp = "Type here..."
                KeyboardVisible = false
            } else if (!isDestroyed(WebChatRemoveAttachment) && Mouse_Cursor.overlapsWith(WebChatRemoveAttachment) && button == 1) {
                WebChatRemoveAttachment.destroy()
                attachement = null
            } else if (Mouse_Cursor.x > 0 && Mouse_Cursor.x < 148 && Mouse_Cursor.y < 92) {
                for (let i = 0; i < 7; i++) {
                    if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12) {
                        const row = webChatRowAt(i)
                        if (row) {
                            if (button == 2 && row.part == "name" && row.entry.verified) {
                                rclickWebChatEntry = row.entry
                                current_rclick_menu = [
                                    miniMenu.createMenuItem("Serial"),
                                    miniMenu.createMenuItem(row.entry.senderId),
                                    miniMenu.createMenuItem("Save")
                                ]
                                openRightClickMenu()
                            } else if (button == 1 && row.part == "attachment" && row.entry.attachmentReady) {
                                importWebChatAttachment(row.entry)
                            }
                        }
                        break
                    }
                }
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
    }
}