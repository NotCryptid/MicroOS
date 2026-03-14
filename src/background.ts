// MARK: Background tasks

browserEvents.onMouseMove(function (x: number, y: number) {
    if (isVM && spriteutils.isDestroyed(Mouse_Cursor) == false) {
        Mouse_Cursor.x = x
        Mouse_Cursor.y = y
    }
})

forever(function () {
    // Don't set this pause to anything above 25 or you will get a seizure 
    pause(10)
    Start_Icon_Names()
    if (NanoSDK_App_Running) {
        executeNanoSDKLine()
    }
    processRadioQueue()
    if (spriteutils.isDestroyed(RightClickMenu) == false) {
        let menuHalfHeight = current_rclick_menu.length * 6;
        if (Mouse_Cursor.x > RightClickMenu.x - 25 && Mouse_Cursor.x < RightClickMenu.x + 25) {
            if (Mouse_Cursor.y > RightClickMenu.y - menuHalfHeight && Mouse_Cursor.y < RightClickMenu.y + menuHalfHeight) {
                let selectedIndex = Math.floor((Mouse_Cursor.y - (RightClickMenu.y - menuHalfHeight)) / 12);
                RightClickMenu.selectedIndex = selectedIndex;
            }
        }
    } else if (App_Open == "File Manager" || App_Open == "Settings" || App_Open == "Process Manager") {
        ListMenuGUI.selectedIndex = -1;
        for (let i = 0; i < ListMenuContents.length; i++) {
            let maxX = App_Open == "Process Manager" ? 160 : 152;
            if (Mouse_Cursor.y >= sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < maxX && i < 8) {
                if (ListMenuContents[i] && ListMenuContents[i].text !== "" && ListMenuContents[i].text !== " ") {
                    if (App_Open == "Process Manager" && i == 0) {} else {
                        ListMenuGUI.selectedIndex = i;
                    }
                }
                break;
            } 
        }
    } else if (App_Open == "NanoCode") {
        ListMenuGUI.selectedIndex = -1;
        for (let i = 0; i < ListMenuContents.length && i < 7; i++) {
            if (Mouse_Cursor.y >= sillySpacingForListGUI[i + 1] && Mouse_Cursor.y < sillySpacingForListGUI[i + 1] + 12 && Mouse_Cursor.x < 152) {
                if (ListMenuContents[i]) {
                    ListMenuGUI.selectedIndex = i;
                }
                break;
            }
        }
    } else if (NanoSDK_App_Running && nanoSDK_hover_highlight) {
        ListMenuGUI.selectedIndex = -1;
        let menuTop = menu_data[1] - Math.floor(menu_data[3] / 2);
        let menuLeft = menu_data[0] - Math.floor(menu_data[2] / 2);
        let menuRight = menu_data[0] + Math.floor(menu_data[2] / 2);
        if (Mouse_Cursor.x >= menuLeft && Mouse_Cursor.x < menuRight) {
            let row = Math.floor((Mouse_Cursor.y - menuTop) / 12);
            if (row >= 0 && row < menu_array.length) {
                if (menu_array[row] && menu_array[row].text !== "" && menu_array[row].text !== " ") {
                    ListMenuGUI.selectedIndex = row;
                }
            }
        }
    }
})

forever(function () {
    if (isVM){
        pause(1000)
        minute = browserEvents.getMinutes(browserEvents.currentTime()) + 100
        hour = browserEvents.getHours(browserEvents.currentTime())
        clock.setText(hour + ":" + minute.toString().substr(1, 2))
    } else {
        if (Settings.charAt(6) == "1") {
            pause(60000)
            minute++
            if (minute > 159) {
                minute = 100
                hour++
                if (hour > 23) {
                    hour = 0
                }
            }
            clock.setText(hour + ":" + minute.toString().substr(1,2))
        }
    }
})

function Start_Icon_Names() {
    let otherColor = 12
    let color24 = 1
    if (App_Open == "null" || App_Open == "NanoCode") {
        otherColor = 1
        color24 = 15
    }
    if (Mouse_Cursor.overlapsWith(xCell_Icon)) {
        xCell_Icon.sayText("xCell", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(Write_icon)) {
        Write_icon.sayText("Write", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(Web_Chat_Icon)) {
        Web_Chat_Icon.sayText("Web Chat", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(Settings_Icon)) {
        Settings_Icon.sayText("Settings", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(File_Manager_Icon)) {
        File_Manager_Icon.sayText("File Manager", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(NanoCode_Icon)) {
        NanoCode_Icon.sayText("NanoCode", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(Process_Icon)) {
        Process_Icon.sayText("Process Manager", 50, false, color24, otherColor)
    } else if (Mouse_Cursor.overlapsWith(Library_icon)) {
        Library_icon.sayText(".    Library", 50, false, color24, otherColor)
    }
}


// Background tasks end here
