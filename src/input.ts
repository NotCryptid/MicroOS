// MARK: Button Presses

// VM Stuff (COMMENT OUT WHEN BUILDING FOR HARDWARE, THIS SHIT USES SO MUCH CPU CYCLES OML)
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



controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isVM) {} else {MouseClick(1)}
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {  
    if (isVM) {} else {MouseClick(2)}
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (App_Open == "death") {
        game.reset()
    } else if (App_Open == "null") {
        Open_Library()
    } else {
        close_apps()
    } 
})

function MouseClick(button: number) {
    if (Mouse_Cursor.overlapsWith(Close_App) && button == 1) {
        close_apps()
        return
    } else if (spriteutils.isDestroyed(RightClickMenu) == false) {
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
        if (spriteutils.isDestroyed(Mouse_Cursor)) {
            // motherfucker why is this needed for the code to work you can't even kill the mouse cursor
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
            // Open_NanoSDK_App("test~default~test~12~105§test~301~302§80§58~303§160§97~304§test1§test2§test3§test4~202§inf~201§b§b§t~106§test~201§e~202§e")
            Open_NanoCode(null)
        } else if (Mouse_Cursor.overlapsWith(Process_Icon) && button == 1) {
            Open_ProcessManager()
        } else if (Mouse_Cursor.overlapsWith(Library_icon) && button == 1) {
            Open_Library()
        } else if (button == 1 && (App_Open == "File Manager" || App_Open == "NanoCode") && Mouse_Cursor.x > 151) {
            if (Mouse_Cursor.overlapsWith(ArrowDown)) {
                if (ListMenuContents.length > 7 && ListMenuContents.length > 0) {
                    let item = ListMenuContents.shift();
                    if (item !== undefined) {
                        ListMenuGUIHidden.push(item);
                        List_Scroll++;
                        ListMenuGUI.destroy();
                        ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents);
                        ListMenuGUI.setDimensions(151, 97);
                        ListMenuGUI.setButtonEventsEnabled(false);
                        ListMenuGUI.setPosition(76, 58);
                        ListMenuGUI.z = -30;
                        updateScrollBar();
                    }
                }
            } else if (Mouse_Cursor.overlapsWith(ArrowUp)) {
                if (List_Scroll > 0 && ListMenuGUIHidden.length > 0) {
                    let item = ListMenuGUIHidden.pop();
                    if (item !== undefined) {
                        ListMenuContents.unshift(item);
                        List_Scroll--;
                        ListMenuGUI.destroy();
                        ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents);
                        ListMenuGUI.setDimensions(151, 97);
                        ListMenuGUI.setButtonEventsEnabled(false);
                        ListMenuGUI.setPosition(76, 58);
                        ListMenuGUI.z = -30;
                        updateScrollBar();
                    }
                }
            }
        } else if (App_Open == "File Manager" || App_Open == "Settings") {
            let menu_selection = 0;
            for (let i = 0; i < 8; i++) {
                if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
                    menu_selection = i + 1;
                    if (button == 1 && ListMenuContents[menu_selection + List_Scroll - 1] != null) {
                        listSelection(App_Open, menu_selection, SubMenu, "click", 0)
                        break;
                    } else if (button == 2 && App_Open == "File Manager") {
                        ListMenuGUI.selectedIndex = menu_selection - 1
                        listSelection(App_Open, menu_selection, SubMenu, "rclick", 0);
                        RightClickMenu = miniMenu.createMenuFromArray(current_rclick_menu);
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
                        outline = sprites.create(assets.image`Dot`, SpriteKind.App_UI)
                        RightClickMenu.z = 350346
                        outline.z = 350345
                        outline.setPosition(RightClickMenu.x, RightClickMenu.y)
                        scaling.scaleToPixels(outline, 52, ScaleDirection.Horizontally, ScaleAnchor.Middle)
                        scaling.scaleToPixels(outline, current_rclick_menu.length * 12 + 2, ScaleDirection.Vertically, ScaleAnchor.Middle)
                    }
                }
            }
        } else if (App_Open == "NanoCode" ) {
            let menu_selection = 1;
            for (let i = 1; i < 8; i++) {
                if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
                    if (button == 1 && ListMenuContents[i + List_Scroll - 1] != null) {
                        const changed_selection = game.askForString(ListMenuContents[i + List_Scroll - 1].text, 36)
                        ListMenuContents[i + List_Scroll - 1] = miniMenu.createMenuItem(changed_selection)
                        ListMenuGUI.destroy();
                        ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents);
                        ListMenuGUI.setDimensions(151, 84)
                        ListMenuGUI.setButtonEventsEnabled(false)
                        ListMenuGUI.setPosition(76, 64)
                        ListMenuGUI.z = -30;
                        ListMenuGUI.setMenuStyleProperty(miniMenu.MenuStyleProperty.BackgroundColor, 15)
                        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Default, miniMenu.StyleProperty.Foreground, 1)
                        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Default, miniMenu.StyleProperty.Background, 15)
                        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Foreground, 15)
                        ListMenuGUI.setStyleProperty(miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Background, 1)
                        if (ListMenuContents[i + List_Scroll - 1].text == null) { 
                            ListMenuContents[i + List_Scroll - 1] = miniMenu.createMenuItem("")
                        }
                        break;
                    }
                }
            }
        } else if (App_Open == "Web Chat") {
            
            if (Mouse_Cursor.overlapsWith(WebChatSend) && button == 1 && WEBmessage != "" && WEBmessage != "Type here...") {
                KeyboardVisible = true
                WebChatMessages[7] = miniMenu.createMenuItem(Username + " (You)")
                WebChatMessages.push(miniMenu.createMenuItem(WEBmessage))
                Temp = "Type here..."
                WebChatMessages.push(miniMenu.createMenuItem(Temp))
                while (WebChatMessages.length > 8) {
                    WebChatMessages.shift();
                } 
                KeyboardVisible = false
                sendWebChatMessage(Username, WEBmessage)
            } else if (Mouse_Cursor.x > 0 && Mouse_Cursor.x < 148 && Mouse_Cursor.y > 92 && Mouse_Cursor.y < 105 && button == 1) {
                KeyboardVisible = true
                WEBmessage = game.askForString("Type your message here", 36)
                KeyboardVisible = false
                Temp = WEBmessage
                WebChatMessages[7] = miniMenu.createMenuItem(Temp)
                ListMenuGUI.destroy()
                ListMenuGUI = miniMenu.createMenuFromArray(WebChatMessages)
                ListMenuGUI.setDimensions(160, 97)
                ListMenuGUI.setButtonEventsEnabled(false)
                ListMenuGUI.setPosition(80, 58)
                ListMenuGUI.selectedIndex = 7
                ListMenuGUI.z = -30
            }
        }
    }
}

// Button presses end here
