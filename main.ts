// MARK: Kernel
// do not touch this for the love of god
namespace SpriteKind {
    export const Desktop_UI = SpriteKind.create()
    export const Mouse = SpriteKind.create()
    export const App_UI = SpriteKind.create()
}

// VM Stuff
let isVM = false
if (browserEvents.currentTime() == -1){} else {
    isVM = true
}

// this definitely does something
let Taskbar: Sprite = null
let menu_selection : number = null
let ListMenuGUI: miniMenu.MenuSprite = null
let NanoCode_Icon: Sprite = null
let File_Manager_Icon: Sprite = null
let Process_Icon: Sprite = null
let Settings_Icon: Sprite = null
let Web_Chat_Icon: Sprite = null
let WEBmessage = ""
let KeyboardVisible = false
let Write_icon: Sprite = null
let Library_icon: Sprite = null
let RadioValueQueue: [string, number][] = []
let xCell_Icon: Sprite = null
let outline: Sprite = null
let Mouse_Cursor: Sprite = null
let RoomCode = "123456789"
let App_Title: TextSprite = null
let WebChatSend: Sprite = null
let Temp = ""
let Close_App: Sprite = null
let CharacterMap = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!:;\"()~ ".split("");
let ArrowUp: Sprite = null
let ArrowDown: Sprite = null
let App_Open = "null"
let clipboard = ""
let List_Scroll = 0
let rclick_override = 0
let current_rclick_menu: miniMenu.MenuItem[] = null
let ListMenuGUIHidden: miniMenu.MenuItem[] = []
let RightClickMenu: miniMenu.MenuSprite = null
let Username = ""
let Settings = blockSettings.readString("settings")
let text: TextSprite = null
let ListMenuContents: miniMenu.MenuItem[] = []
let User_Files: miniMenu.MenuItem[] = []
let User_Apps: miniMenu.MenuItem[] = []
let System_Files: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Home"),miniMenu.createMenuItem("MicroOS.sys"),miniMenu.createMenuItem("assets.ts"),miniMenu.createMenuItem("File.moa"),miniMenu.createMenuItem("Write.moa"),miniMenu.createMenuItem("xCell.moa"),miniMenu.createMenuItem("Settings.moa"),miniMenu.createMenuItem("WebChat.moa"),miniMenu.createMenuItem("NanoCode.moa")]
let Current_Settings: miniMenu.MenuItem[] = []
let WebChatMessages: miniMenu.MenuItem[] = [miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem("System (Verified)"),miniMenu.createMenuItem("Welcome to Web Chat!"),miniMenu.createMenuItem("Type here...")]
let SubMenu = ""
const sillySpacingForListGUI = [10, 23, 36, 49, 62, 75, 88, 101, 114];
pause(300)
let text2 = textsprite.create("> Void Kernel Micro", 0, 1)
text2.setPosition(61, 6)
let text3 = textsprite.create("> PXT Build 2.0.59", 0, 1)
text3.setPosition(58, 16)
pause(200)
text = textsprite.create("> Loading MicroOS v0.0.5", 0, 1)
text.setPosition(76, 26)

// MARK: OS Boot Sequence
if (Settings == null || controller.B.isPressed() && controller.up.isPressed()) {
    Settings = "1000100"
    radio.setGroup(113)
    blockSettings.writeString("settings", Settings)
    blockSettings.writeString("Username", "User")
    blockSettings.writeString("RoomCode", RoomCode)
} else {
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
    Username = blockSettings.readString("Username")
    RoomCode = blockSettings.readString("RoomCode")
}
let Active_Processes: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Name       | System Load"), miniMenu.createMenuItem("Kyrios     | High"), miniMenu.createMenuItem("Aegis      | Low"), miniMenu.createMenuItem("Horizon    | Medium"), miniMenu.createMenuItem("process.moa| Low")]
Current_Settings = [
    miniMenu.createMenuItem(["Keyboard - Jacdac", "Keyboard - OnScreen", "Keyboard - Jacdac"][parseInt(Settings.charAt(1), 10) + 1]),
    miniMenu.createMenuItem(["Mouse - D-Pad", "Mouse - Jacdac","Mouse - D-Pad"][parseInt(Settings.charAt(2), 10) + 1]),
    miniMenu.createMenuItem(["Connectivity - Off", "Connectivity - Radio", "Connectivity - Jacdac", "Connectivity - Off"][parseInt(Settings.charAt(3), 10) + 1]),
    miniMenu.createMenuItem("Radio Channel - " + (parseInt(Settings.charAt(4))) + ""),
    miniMenu.createMenuItem(["Wallpaper - Strings", "Wallpaper - Sunrise", "Wallpaper - Stripes", "Wallpaper - Squiggles", "Wallpaper - Strings"][parseInt(Settings.charAt(5), 10)]),
    miniMenu.createMenuItem("Name - " + blockSettings.readString("Username")),
    miniMenu.createMenuItem(["Show Clock - True", "Show Clock - False", "Show Clock - True"][parseInt(Settings.charAt(6), 10)]),
    miniMenu.createMenuItem("Room Code - " + RoomCode)
]
let fileNamesString = blockSettings.readString("file_names");
let User_Files_Temp: string[] = fileNamesString ? JSON.parse(fileNamesString) : [];
if (User_Files_Temp.length == 0 || controller.B.isPressed() && controller.up.isPressed()) {
    if (User_Files_Temp.length !== 0) {

    }
    User_Files_Temp = ["Home"];
    blockSettings.writeString("file_names", JSON.stringify(User_Files_Temp));
}
for (let i = 0; i < User_Files_Temp.length; i++) {
    User_Files.push(miniMenu.createMenuItem(User_Files_Temp[i]));
}
pause(randint(1000, 2000))
// Post startup tasks
sprites.destroy(text)
sprites.destroy(text2)
let Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Sunrise`, assets.image`Wallpaper - Stripes`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
scene.setBackgroundImage(Wallpaper)

let hour = 12
let minute = 100
if (isVM){
    minute = browserEvents.getMinutes(browserEvents.currentTime()) + 100
    hour = browserEvents.getHours(browserEvents.currentTime())
}
let clock = textsprite.create(hour.toString() + ":" + minute.toString().substr(1,2), 0, 1)
clock.setKind(SpriteKind.Desktop_UI)
clock.setPosition(140, 111)
clock.z = 2400
if (Settings.charAt(6) == "0") {
    clock.setText(hour.toString() + ":" + minute.toString().substr(1,2))
}

// Right click menus

const rclick_menu_files = [miniMenu.createMenuItem("Open"), miniMenu.createMenuItem("Rename"), miniMenu.createMenuItem("Copy"), miniMenu.createMenuItem("Details"), miniMenu.createMenuItem("Delete")]
const rclick_menu_files_empty = [miniMenu.createMenuItem("New File"), miniMenu.createMenuItem("Paste")]
const rclick_menu_nsp = [miniMenu.createMenuItem("Edit"), miniMenu.createMenuItem("Compile"), miniMenu.createMenuItem("Rename"), miniMenu.createMenuItem("Copy"), miniMenu.createMenuItem("Details"), miniMenu.createMenuItem("Delete")]
const rclick_menu_webchat_message = [miniMenu.createMenuItem("Reply"), miniMenu.createMenuItem("Mention"), miniMenu.createMenuItem("Block")]

// OS Boot Sequence ends here

// MARK: More Kernel
Define_Sprites()

function Define_Sprites () {
    // remember to add new sprites here or the whole os will shit itself
    App_Open = "null"
    Taskbar = sprites.create(assets.image`Taskbar`, SpriteKind.Desktop_UI)
    Taskbar.setPosition(80, 60)
    Library_icon = sprites.create(assets.image`Library_icon`, SpriteKind.Desktop_UI)
    Library_icon.setPosition(9, 111)
    xCell_Icon = sprites.create(assets.image`xCell`, SpriteKind.Desktop_UI)
    xCell_Icon.setPosition(22, 111)
    Write_icon = sprites.create(assets.image`Write`, SpriteKind.Desktop_UI)
    Write_icon.setPosition(32, 111)
    NanoCode_Icon = sprites.create(assets.image`NanoCode`, SpriteKind.Desktop_UI)
    NanoCode_Icon.setPosition(42, 111)
    Web_Chat_Icon = sprites.create(assets.image`Web Chat`, SpriteKind.Desktop_UI)
    Web_Chat_Icon.setPosition(52, 111)
    Settings_Icon = sprites.create(assets.image`Settings`, SpriteKind.Desktop_UI)
    Settings_Icon.setPosition(62, 111)
    File_Manager_Icon = sprites.create(assets.image`File Manager`, SpriteKind.Desktop_UI)
    File_Manager_Icon.setPosition(72, 111)
    Process_Icon = sprites.create(assets.image`Process Manager`, SpriteKind.Desktop_UI)
    Process_Icon.setPosition(82, 111)
    Mouse_Cursor = sprites.create(assets.image`Cursor`, SpriteKind.Mouse)
    Mouse_Cursor.setPosition(80, 60)
    Mouse_Cursor.setStayInScreen(true)
    if (isVM){} else {
        controller.moveSprite(Mouse_Cursor, 50, 50)
    }
    Mouse_Cursor.z = 453453453453
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    App_Title = textsprite.create("Write", 0, 1)
    ListMenuGUI = miniMenu.createMenuFromArray([miniMenu.createMenuItem("")])
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroy(Close_App)
}

function softerror(code: number) {
    if (App_Open !== "death") {
        game.splash("Error " + code)
    }
}
function error(code: number) {
    if (App_Open !== "death") {
        close_apps()
        game.splash("Error " + code)
    }
}
function kernel_panic(code: number) {
    if (App_Open !== "death") {
        close_apps()
        App_Open = "death"   
        scene.setBackgroundImage(assets.image`Kernel Panic`)
        sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
        sprites.destroyAllSpritesOfKind(SpriteKind.Text)
        sprites.destroyAllSpritesOfKind(SpriteKind.Mouse)
        sprites.destroyAllSpritesOfKind(SpriteKind.Desktop_UI)
        let text2 = textsprite.create("MicroOS has ran into a", 0, 1)
        text2.setPosition(72, 32)
        let text3 = textsprite.create("fatal error.", 0, 1)
        text3.setPosition(41, 41)
        let text4 = textsprite.create("Error Code " + code, 0, 1)
        text4.setPosition(47, 94)
        text = textsprite.create("Press Menu to reboot", 0, 1)
        text.setPosition(79, 111)
    }
}

// Okay kernel ends here

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
            if (Mouse_Cursor.x > RightClickMenu.x - 25 && Mouse_Cursor.x < RightClickMenu.x + 25) {
                if (Mouse_Cursor.y > RightClickMenu.y - 30 && Mouse_Cursor.y < RightClickMenu.y + 30) {
                    let selectedIndex = Math.floor((Mouse_Cursor.y - (RightClickMenu.y - 30)) / 12);
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
            Open_NanoCode(null)
        } else if (Mouse_Cursor.overlapsWith(Process_Icon) && button == 1) {
            Open_ProcessManager()
        } else if (Mouse_Cursor.overlapsWith(Library_icon) && button == 1) {
            Open_Library()
        } else if (button == 1 && App_Open == "File Manager" && Mouse_Cursor.x > 151) {
            if (Mouse_Cursor.overlapsWith(ArrowDown)) {
                if (List_Scroll <= ListMenuContents.length - 7 && ListMenuContents.length > 0) {
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
                    }
                }
            }
        } else if (App_Open == "File Manager" || App_Open == "Settings") {
            let menu_selection = 0;
            for (let i = 0; i < 8; i++) {
                if (Mouse_Cursor.y > sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152) {
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
        } else if (App_Open == "NanoCode") {
            if (SubMenu == "Main") {
                if (Mouse_Cursor.x > 50 && Mouse_Cursor.x < 158) {
                    if (Mouse_Cursor.y < 100) {
                        // nothin happens fucker
                    } else if (Mouse_Cursor.y < 87) {
                        // this would be compile
                    } else if (Mouse_Cursor.y < 74) {
                        // this would be edit
                    } else if (Mouse_Cursor.y < 61) {
                        // this would be new
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
                radio.sendValue(
                    encrypt("WebChat", parseInt(RoomCode)),
                    EncodeToNumber(encrypt(Username + "~" + RoomCode + "~" + null + WEBmessage, Number(RoomCode)))
                )
            } else if (Mouse_Cursor.x > 0 && Mouse_Cursor.x < 148 && Mouse_Cursor.y > 92 && Mouse_Cursor.y < 105 && button == 1) {
                KeyboardVisible = true
                WEBmessage = game.askForString("Type your message here", 36)
                KeyboardVisible = false
                Temp = WEBmessage
            }
        }
    }
}

// Button presses end here

// MARK: Radio

radio.onReceivedValue(function (name: string, value: number) {
    RadioValueQueue.push([name, value])
    // name is the encrypted message
    // value contains metadata which goes Username~RoomCode~SerialNumber~Message
})

function processRadioQueue() {
    if (App_Open == "Web Chat" && KeyboardVisible == false) {
        for (let i = 0; i < RadioValueQueue.length; i++) {
            let message = RadioValueQueue.shift()
            let decryptemetadata = decrypt(DecodeFromNumber(message[1]).toString(), Number(RoomCode))
                if (decrypt(message[0], parseInt(RoomCode)) == "WebChat") {
                    const metadata = decryptemetadata.split("~")
                if (metadata[1] == RoomCode) {
                    let verified = ""
                    if (metadata[2] == null) { } else {
                        // nobody other than system is verified yet cuz i've yet to crack accessing the serial number
                        verified = "(Verified)"
                    }
                    WebChatMessages[7] = miniMenu.createMenuItem(metadata[0] + " " + verified)
                    WebChatMessages.push(miniMenu.createMenuItem(metadata[3]))
                    WebChatMessages.push(miniMenu.createMenuItem(Temp))
                    while (WebChatMessages.length > 8) {
                        WebChatMessages.shift();
                    } 
                }
            }
        }
        ListMenuGUI.destroy()
        WebChatMessages[7] = miniMenu.createMenuItem(Temp)
        ListMenuGUI = miniMenu.createMenuFromArray(WebChatMessages)
        ListMenuGUI.setDimensions(160, 97)
        ListMenuGUI.setButtonEventsEnabled(false)
        ListMenuGUI.setPosition(80, 58)
        ListMenuGUI.selectedIndex = 7
        ListMenuGUI.z = -30
    }
}

// Radio ends here

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
    processRadioQueue()
    if (spriteutils.isDestroyed(RightClickMenu) == false) {
        if (Mouse_Cursor.x > RightClickMenu.x - 25 && Mouse_Cursor.x < RightClickMenu.x + 25) {
            if (Mouse_Cursor.y > RightClickMenu.y - 30 && Mouse_Cursor.y < RightClickMenu.y + 30) {
                let optionHeight = 60 / current_rclick_menu.length;
                let selectedIndex = Math.floor((Mouse_Cursor.y - (RightClickMenu.y - 30)) / optionHeight);
                RightClickMenu.selectedIndex = selectedIndex;
            }
        }
    } else if (App_Open == "File Manager" || App_Open == "Settings") {
        for (let i = 0; i < ListMenuContents.length; i++) {
            if (Mouse_Cursor.y > sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12 && Mouse_Cursor.x < 152 && i < 8) {
                ListMenuGUI.selectedIndex = i;
                break;
            } 
        }
    }
})

forever(function () {
    if (isVM){
        pause(60000)
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

// MARK: Apps
// Running every app at a kernel level is such a good idea ikr
function Open_Library() {
    close_apps()
    App_Open = "App Library"
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(149, 12)
    Close_App.z = 23
    Taskbar = sprites.create(assets.image`Library Background`, SpriteKind.App_UI)
    Taskbar.setPosition(80, 60)
}

function Open_Web() {
    close_apps()
    App_Open = "Web Chat"
    Temp = "Type here..."
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    WebChatSend = sprites.create(assets.image`WebSend`, SpriteKind.App_UI)
    WebChatSend.setPosition(154, 99)
    App_Title = textsprite.create("Web Chat", 0, 1)
    App_Title.setPosition(25, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(WebChatMessages)
    ListMenuGUI.setDimensions(160, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(80, 58)
    ListMenuGUI.selectedIndex = 7
    ListMenuGUI.z = -30
}


function Open_xCell(load_file: string) {
    close_apps()
    App_Open = "xCell"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("xCell", 0, 1)
    App_Title.setPosition(15, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
}

function Open_Write(load_file: string) {
    close_apps()
    App_Open = "Write"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Write", 0, 1)
    App_Title.setPosition(16, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
    if (load_file === "") {
        // create empty file or whatever
        let write_document = "";
    } else {
        // load document type shit
        let write_document = load_file;
    }
}
function Open_Settings() {
    close_apps()
    App_Open = "Settings"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = [miniMenu.createMenuItem("Connectivity"),miniMenu.createMenuItem("Input"),miniMenu.createMenuItem("Customization"),miniMenu.createMenuItem("System"),miniMenu.createMenuItem("App Settings")]
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 1)
    App_Title.setPosition(24, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    createArrows()
}

function Open_NanoCode(project: string = "") {
    close_apps()
    App_Open = "NanoCode"
    SubMenu = "Main"
    scene.setBackgroundImage(assets.image`NanoCode Menu`)
    scene.setBackgroundColor(15)
    ListMenuContents = [miniMenu.createMenuItem("New"),miniMenu.createMenuItem("Edit"),miniMenu.createMenuItem("Compile"),miniMenu.createMenuItem("")]
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(106, 40)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(104, 82)
    ListMenuGUI.z = -30
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("NanoCode", 0, 1)
    App_Title.setPosition(24, 4)
}
function Open_FileManager(submenu: string = "Home", file: string = null) {
    close_apps()
    App_Open = "File Manager"
    SubMenu = submenu
    List_Scroll = 0
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("File Manager", 0, 1)
    App_Title.setPosition(36, 4)
    if (SubMenu == "User") {
        ListMenuContents = User_Files
    } else {
        ListMenuContents = [miniMenu.createMenuItem("System"), miniMenu.createMenuItem("User Files")]
    }
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    createArrows()
}
function Open_ProcessManager() {
    close_apps()
    App_Open = "Process Manager"
    SubMenu = "Home"
    List_Scroll = 0
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Process Manager", 0, 1)
    App_Title.setPosition(45, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(Active_Processes)
    ListMenuGUI.setDimensions(160, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(80, 58)
    ListMenuGUI.z = -30
}
function Open_NanoSDK_App (app_binary: string) {
    const compiled_app = app_binary.split("~")
    close_apps()
    App_Open = compiled_app[0]
    SubMenu = compiled_app[2]
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create(compiled_app[0], 0, 1)
    App_Title.setPosition(16, 4)
}

// Apps end here

// MARK: App functions
function close_apps () {
    // works good enough so no touching
    while (List_Scroll > 0) {
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
        }
    }
    App_Open = "null"
    SubMenu = "null"
    Temp = ""
    Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Sunrise`, assets.image`Wallpaper - Stripes`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
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


    if (app == "File Manager") {
        if (action == "rclick") {
            rclick_override = selectedOption
            if (ListMenuContents[selectedOption - 1] == null || ListMenuContents[selectedOption - 1].text == "Home") {
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
                    Open_Write("")
                } else if (selectedOption == 6) {
                    Open_xCell("")
                } else if (selectedOption == 7) {
                    Open_Settings()
                } else if (selectedOption == 8) {
                    Open_Web()
                } else if (selectedOption == 9) {
                    Open_NanoCode(null)
                }
            } else {
                softerror(107)
            } 
            
        } else if (submenu == "User") {
            // i don't even know whats going on here anymore
            const FileAtSelection = JSON.stringify(User_Files[selectedOption]).substr(JSON.stringify(User_Files[selectedOption]).indexOf('"') + 1,JSON.stringify(User_Files[selectedOption]).indexOf('"', JSON.stringify(User_Files[selectedOption]).indexOf('"') + 1));
            if (FileAtSelection == "Home" && (action == "click" || action == "rclick0")) {
                SubMenu = "Home"
                Open_FileManager("Home")
            } else if (FileAtSelection == null || FileAtSelection == "Home") {
                if (action == "rclick") {
                    current_rclick_menu = rclick_menu_files_empty
                    return
                } else if (action === "rclick0") {
                    // work you dumbass
                    const newName = game.askForString("New file name", 15)
                    while (newName == null) {
                    }
                    const fileType = game.askForString("File type (wrt, xcl, nsp)", 3)
                    while (fileType == null) {
                    }
                    blockSettings.writeString("file_" + fileType + newName, "~")
                    User_Files.push(miniMenu.createMenuItem(newName + "." + fileType))
                    blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                    Open_FileManager("User")
                } else if (action === "rclick1") {
                    if (clipboard == "") {

                    } else {
                        const FileOpened = clipboard.split(".")
                        blockSettings.writeString("file_" + FileOpened[1] + "Copy of " + FileOpened[0], blockSettings.readString(clipboard))
                        User_Files.push(miniMenu.createMenuItem("Copy of " + clipboard))
                        blockSettings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
                        clipboard = null
                        Open_FileManager("User")
                    }
                }    
            } else {
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
                            Open_NanoCode(blockSettings.readString("file_nsp" + FileOpened[0]))
                        }
                           
                    } else if (action == "rclick1") {
                        const newName = game.askForString("Rename file", 15)
                        if (blockSettings.readString("file_" + FileOpened[1] + newName) == null) {
                            blockSettings.writeString("file_" + FileOpened[1] + newName, blockSettings.readString("file_" + FileOpened[1] + FileOpened[0]))
                            blockSettings.writeString("file_" + FileOpened[1] + FileOpened[0], null)
                        }
                    } else if (action == "rclick2") {
                        clipboard = "file_" + FileOpened[1] + FileOpened[0]
                    } else if (action == "rclick3") {
                        Open_FileManager("Details", FileAtSelection)
                    } else if (action == "rclick4") {
                        blockSettings.writeString("file_" + FileOpened[1] + FileOpened[0], null)
                        // User_Files.removeAt(selectedOption - 1)
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
                if (selectedOption == 1) {
                    SubMenu = "System"
                    ListMenuContents = System_Files
                    ListMenuGUI = miniMenu.createMenuFromArray(System_Files)
                } else if (selectedOption == 2) {
                    SubMenu = "User"
                    ListMenuContents = User_Files
                    ListMenuGUI = miniMenu.createMenuFromArray(User_Files)
            } 
            } else {
                softerror(107)
            } 
            ListMenuGUI.setButtonEventsEnabled(false)
            ListMenuGUI.setDimensions(151, 97)
            ListMenuGUI.setPosition(76, 58)
            ListMenuGUI.z = -30
        }
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
                    Current_Settings[4]
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
                    miniMenu.createMenuItem("MicroOS v0.0.5"),
                    // miniMenu.createMenuItem("NanoSDK 2025.1")
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
                User_Files = [miniMenu.createMenuItem("home")]
            } else if (selectedOption == 3) {
                Settings = "100010"
                game.reset()
            } else if (selectedOption == 4) {
                User_Files = [miniMenu.createMenuItem("home")]
                Settings = "100010"
                blockSettings.writeString("Settings", Settings)
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
                    // debug mode
                    // allow radio access
                    // allow file system access
                ]
                SubMenu = "NanoSDK App Settings"
            }
        } else if (submenu == "WebChat Settings") {
            if (selectedOption == 1) {
                ListMenuContents = AppSettings
                SubMenu = "App Settings"
            } else if (selectedOption == 2) {
                RoomCode = game.askForNumber("Enter new room code", 9).toString()
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
        ListMenuGUI.close()
        ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
        ListMenuGUI.setButtonEventsEnabled(false)
        ListMenuGUI.setDimensions(151, 97)
        ListMenuGUI.setPosition(76, 58)
        ListMenuGUI.z = -30
    }
}

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
        dingus52 = 3
        dingus51 = ["Wallpaper - Strings", "Wallpaper - Sunrise", "Wallpaper - Stripes", "Wallpaper - Squiggles", "Wallpaper - Strings"][dingus53]
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
    }
    if (dingus53 > dingus52) {
        dingus53 = 0
    }
    Settings = Settings.slice(0, selection) + dingus53.toString() + Settings.slice(selection + 1)
    Current_Settings[selection - 1] = miniMenu.createMenuItem(dingus51)
    blockSettings.writeString("settings", Settings)
    ListMenuGUI.close()
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
}

function createArrows() {
    ArrowUp = sprites.create(assets.image`ArrowUp`, SpriteKind.App_UI)
    ArrowUp.setPosition(156, 14)
    ArrowDown = sprites.create(assets.image`ArrowDown`, SpriteKind.App_UI)
    ArrowDown.setPosition(156, 101)
}
// App functions end here

// MARK: Encryption/Encoding

function decrypt(string: string, key: number) {
    let output = '';
    for (let i = 0; i < string.length; i++) {
        output += String.fromCharCode(string.charCodeAt(i) ^ key);
    }
    return output;
}

function encrypt(string: string, key: number): string {
    let output = '';
    for (let i = 0; i < string.length; i++) {
        output += String.fromCharCode(string.charCodeAt(i) ^ key);
    }
    return output;
}

function EncodeToNumber(string: string): number {
    const letters = string.split('')
    let result = ''
    for (let i = 0; i < letters.length; i++) {
        result = result + (CharacterMap.indexOf(letters[i]) + 100).toString().slice(1)
    }
    return Number(result)
}

function DecodeFromNumber(number: number): string {
    const numbers = number.toString().split('')
    for (let i = 0; i < numbers.length; i++) { 
        numbers[i] = numbers[i] + numbers[i + 1]
        numbers.splice(i + 1, 1);
    }
    let result = ''
    for (let i = 0; i < numbers.length; i++) {
        result = result + CharacterMap[parseInt(numbers[i])]
    }
    return result
}
// Encryption/Encoding ends here