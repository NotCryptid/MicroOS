// MARK: Kernel
// do not touch this for the love of god
namespace SpriteKind {
    export const Desktop_UI = SpriteKind.create()
    export const Mouse = SpriteKind.create()
    export const App_UI = SpriteKind.create()
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
let Write_icon: Sprite = null
let Library_icon: Sprite = null
let xCell_Icon: Sprite = null
let Mouse_Cursor: Sprite = null
let App_Title: TextSprite = null
let Close_App: Sprite = null
let App_Open = "null"
let List_Scroll = 0
let Settings = blockSettings.readString("settings")
let text: TextSprite = null
let ListMenuContents: miniMenu.MenuItem[] = []
let User_Files: miniMenu.MenuItem[] = []
let User_Apps: miniMenu.MenuItem[] = []
let System_Files: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Home"),miniMenu.createMenuItem("MicroOS.uf2"),miniMenu.createMenuItem("wallpapers.asset"),miniMenu.createMenuItem("File.moa"),miniMenu.createMenuItem("Write.moa"),miniMenu.createMenuItem("xCell.moa"),miniMenu.createMenuItem("Settings.moa"),miniMenu.createMenuItem("WebChat.moa"),miniMenu.createMenuItem("NanoCode.moa")]
let Current_Settings: miniMenu.MenuItem[] = []
let SubMenu = ""
const sillySpacingForListGUI = [10, 23, 36, 49, 62, 75, 88, 101, 114];
pause(300)
let text2 = textsprite.create("> Void Kernel Micro", 0, 1)
text2.setPosition(61, 6)
let text3 = textsprite.create("> PTX Build 2.0.6", 0, 1)
text3.setPosition(55, 16)
let text4 = textsprite.create("> Hold UP+B to erase data", 0, 1)
text4.setPosition(79, 26)
pause(1000)
text = textsprite.create("> Loading Micro:OS v0.1.0", 0, 1)
text.setPosition(79, 36)

// MARK: OS Boot Sequence
if (Settings == null || controller.B.isPressed() && controller.up.isPressed()) {
    Settings = "100010"
    radio.setGroup(113)
    blockSettings.writeString("settings", Settings)
} else {
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
}
let Active_Processes: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Name       | System Load"), miniMenu.createMenuItem("Kyrios     | High"), miniMenu.createMenuItem("Aegis      | Low"), miniMenu.createMenuItem("Horizon    | Medium"), miniMenu.createMenuItem("process.moa| Low")]
Current_Settings = [
    miniMenu.createMenuItem(["Keyboard - Radio", "Keyboard - OnScreen", "Keyboard - Pin Header", "Keyboard - Radio"][parseInt(Settings.charAt(1), 10) + 1]),
    miniMenu.createMenuItem(["Mouse - Radio", "Mouse - D-Pad", "Mouse - Pin Header", "Mouse - Radio"][parseInt(Settings.charAt(2), 10) + 1]),
    miniMenu.createMenuItem(["Connectivity - Off", "Connectivity - Radio", "Connectivity - Pin Header", "Connectivity - Off"][parseInt(Settings.charAt(3), 10) + 1]),
    miniMenu.createMenuItem("Radio Channel - " + (parseInt(Settings.charAt(4))) + ""),
    miniMenu.createMenuItem(["Wallpaper - Strings", "Wallpaper - Sunrise", "Wallpaper - Stripes", "Wallpaper - Squiggles", "Wallpaper - Strings"][parseInt(Settings.charAt(5), 10)]),
]
let fileNamesString = blockSettings.readString("file_names");
let User_Files_Temp: string[] = fileNamesString ? JSON.parse(fileNamesString) : [];
if (User_Files_Temp.length === 0 || controller.B.isPressed() && controller.up.isPressed()) {
    User_Files_Temp = ["Home"];
    blockSettings.writeString("file_names", JSON.stringify(User_Files_Temp));
}
for (let i = 0; i < User_Files_Temp.length; i++) {
    User_Files.push(miniMenu.createMenuItem(User_Files_Temp[i]));
}
pause(randint(1000, 2000))
sprites.destroy(text)
sprites.destroy(text2)
let Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Sunrise`, assets.image`Wallpaper - Stripes`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
scene.setBackgroundImage(Wallpaper)
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
    controller.moveSprite(Mouse_Cursor, 50, 50)
    Mouse_Cursor.z = 453453453453
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    App_Title = textsprite.create("Write", 0, 1)
    ListMenuGUI = miniMenu.createMenuFromArray([miniMenu.createMenuItem("")])
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroy(Close_App)
}

// Okay kernel ends here

// MARK: Button Presses
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (Mouse_Cursor.overlapsWith(Close_App)) {
        close_apps()
    }
    if (App_Open !== "App Library") {
        if (spriteutils.isDestroyed(Mouse_Cursor)) {
            // motherfucker why is this needed for the code to work you can't even kill the mouse cursor
        } else if (Mouse_Cursor.overlapsWith(xCell_Icon)) {
            close_apps()
            Open_xCell("")
        } else if (Mouse_Cursor.overlapsWith(Write_icon)) {
            close_apps()
            Open_Write("")
        } else if (Mouse_Cursor.overlapsWith(Web_Chat_Icon)) {
            close_apps()
            Open_Web()
        } else if (Mouse_Cursor.overlapsWith(Settings_Icon)) {
            close_apps()
            Open_Settings()
        } else if (Mouse_Cursor.overlapsWith(File_Manager_Icon)) {
            close_apps()
            Open_FileManager()
        } else if (Mouse_Cursor.overlapsWith(NanoCode_Icon)) {
            close_apps()
            Open_NanoCode()
        } else if (Mouse_Cursor.overlapsWith(Process_Icon)) {
            close_apps()
            Open_ProcessManager()
        } else if (Mouse_Cursor.overlapsWith(Library_icon)) {
            close_apps()
            Open_Library()
        } else if (App_Open == "File Manager" || App_Open == "Settings") {
            let menu_selection = 0;
            for (let i = 0; i < ListMenuContents.length; i++) {
                if (Mouse_Cursor.y > sillySpacingForListGUI[i] && Mouse_Cursor.y < sillySpacingForListGUI[i] + 12) {
                    menu_selection = i + 1;
                    listSelection(App_Open, menu_selection, SubMenu)
                    break;
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
        }
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {

})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (App_Open == "null") {
        Open_Library()
    } else {
        close_apps()
    } 
})


// Button presses end here

// MARK: Radio


// Radio ends here

// MARK: Background tasks
forever(function () {
    // Don't set this pause to anything above 25 or you will get a seizure 
    pause(10)
    Start_Icon_Names()
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
function Open_Library () {
    App_Open = "App Library"
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(149, 12)
    Close_App.z = 23
    Taskbar = sprites.create(assets.image`Library Background`, SpriteKind.App_UI)
    Taskbar.setPosition(80, 60)
}

function Open_Web () {
    App_Open = "Web Chat"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Web Chat", 0, 1)
    App_Title.setPosition(26, 4)
}


function Open_xCell (load_file: string) {
    App_Open = "xCell"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("xCell", 0, 1)
    App_Title.setPosition(16, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
}

function Open_Write (load_file: string) {
    App_Open = "Write"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Write", 0, 1)
    App_Title.setPosition(17, 4)
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
function Open_Settings () {
    App_Open = "Settings"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = [miniMenu.createMenuItem("Connectivity"),miniMenu.createMenuItem("Input"),miniMenu.createMenuItem("Customization"),miniMenu.createMenuItem("System")]
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 1)
    App_Title.setPosition(25, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
}

function Open_NanoCode () {
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
    App_Title.setPosition(25, 4)
}
function Open_FileManager () {
    App_Open = "File Manager"
    SubMenu = "Home"
    List_Scroll = 0
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("File Manager", 0, 1)
    App_Title.setPosition(37, 4)
    ListMenuContents = [miniMenu.createMenuItem("System"), miniMenu.createMenuItem("User Files")]
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
}
function Open_ProcessManager () {
    App_Open = "Process Manager"
    SubMenu = "Home"
    List_Scroll = 0
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(1)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Process Manager", 0, 1)
    App_Title.setPosition(46, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(Active_Processes)
    ListMenuGUI.setDimensions(160, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(80, 58)
    ListMenuGUI.z = -30
}
function Open_NanoCode_App (app_name: string) {
    
}

// Apps end here

// MARK: App functions
function close_apps () {
    // works good enough so no touching
    App_Open = "null"
    SubMenu = "null"
    Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Sunrise`, assets.image`Wallpaper - Stripes`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
    scene.setBackgroundImage(Wallpaper)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroyAllSpritesOfKind(SpriteKind.App_UI)
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
}

function listSelection(app: string, selection: number, submenu: string) {
    if (app == "File Manager") {
        if (submenu == "System") {
            close_apps()
            if (selection + List_Scroll == 1) {    
                SubMenu = "Home"
                Open_FileManager()
            } else if (selection + List_Scroll == 2) {
                game.reset()
            } else if (selection + List_Scroll == 3) {
                // might make an image viewer some day
                Open_FileManager()
            } else if (selection + List_Scroll == 4) {
                Open_FileManager()
            } else if (selection + List_Scroll == 5) {
                Open_Write("")
            } else if (selection + List_Scroll == 6) {
                Open_xCell("")
            } else if (selection + List_Scroll == 7) {
                Open_Settings()
            } else if (selection + List_Scroll == 8) {
                Open_Web()
            } else if (selection + List_Scroll == 9) {
                Open_NanoCode()
            }
        } else if (submenu == "User") {
            // i don't even know whats going on here anymore
            const FileAtSelection = JSON.stringify(User_Files[selection + List_Scroll]).substr(JSON.stringify(User_Files[selection + List_Scroll]).indexOf('"') + 1,JSON.stringify(User_Files[selection + List_Scroll]).indexOf('"', JSON.stringify(User_Files[selection + List_Scroll]).indexOf('"') + 1));
            close_apps()
            if (FileAtSelection == "Home") {
                SubMenu = "Home"
                Open_FileManager()
            } else {
                // temporary workaround
                SubMenu = "Home"
                Open_FileManager()
            }
        } else if (submenu == "Home") {
            ListMenuGUI.close()
            if (selection + List_Scroll == 1) {
                SubMenu = "System"
                ListMenuContents = System_Files
                ListMenuGUI = miniMenu.createMenuFromArray(System_Files)
            } else if (selection + List_Scroll == 2) {
                SubMenu = "User"
                ListMenuContents = User_Files
                ListMenuGUI = miniMenu.createMenuFromArray(User_Files)
            }
            ListMenuGUI.setButtonEventsEnabled(false)
            ListMenuGUI.setDimensions(151, 97)
            ListMenuGUI.setPosition(76, 58)
            ListMenuGUI.z = -30
        }
    } else if (app == "Settings") {
        if (submenu == "Home") {
            if (selection + List_Scroll == 1) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[3],
                    Current_Settings[2]
                ]
                SubMenu = "Connectivity"
            } else if (selection + List_Scroll == 2) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[0],
                    Current_Settings[1]
                ]
                SubMenu = "Input"
            } else if (selection + List_Scroll == 3) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    Current_Settings[4]
                ]
                SubMenu = "Customization"
            } else if (selection + List_Scroll == 4) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("Data Management"),
                    miniMenu.createMenuItem("System Information")
                ]
                SubMenu = "System"
            }
        } else if (submenu == "Connectivity") {
            if (selection + List_Scroll == 1) {
                close_apps()
                SubMenu = "Home"
                Open_Settings()
            } else if (selection + List_Scroll == 2) {
                changeSettings(4)
                ListMenuContents[1] = Current_Settings[3]
            } else if (selection + List_Scroll == 3) {
                changeSettings(3)
                ListMenuContents[2] = Current_Settings[2]
            }
        } else if (submenu == "Input") {
            if (selection + List_Scroll == 1) {
                close_apps()
                SubMenu = "Home"
                Open_Settings()
            } else if (selection + List_Scroll == 2) {
                changeSettings(1)
                ListMenuContents[1] = Current_Settings[0]
            } else if (selection + List_Scroll == 3) {
                changeSettings(2)
                ListMenuContents[2] = Current_Settings[1]
            } else if (selection + List_Scroll == 4) {
                
            } else if (selection + List_Scroll == 5) {
                
            }
        } else if (submenu == "Customization") {
            if (selection + List_Scroll == 1) {
                close_apps()
                SubMenu = "Home"
                Open_Settings()
            } else if (selection + List_Scroll == 2) {
                changeSettings(5)
                ListMenuContents[1] = Current_Settings[4]
            } else if (selection + List_Scroll == 3) {

            } else if (selection + List_Scroll == 4) {
                
            } else if (selection + List_Scroll == 5) {
                
            }
        } else if (submenu == "System") {
            if (selection + List_Scroll == 1) {
                close_apps()
                SubMenu = "Home"
                Open_Settings()
            } else if (selection + List_Scroll == 2) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("Delete all user files"),
                    miniMenu.createMenuItem("Set settings to default"),
                    miniMenu.createMenuItem("Wipe Device")
                ]
                SubMenu = "Data Management"
            } else if (selection + List_Scroll == 3) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("MicroOS v0.1.0"),
                    miniMenu.createMenuItem("NanoSDK 2025.1")
                ]
                SubMenu = "System Information"
            }
        } else if (submenu == "Data Management") {
            if (selection + List_Scroll == 1) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("Data Management"),
                    miniMenu.createMenuItem("System Information")
                ]
                SubMenu = "System"
            } else if (selection + List_Scroll == 2) {
                User_Files = [miniMenu.createMenuItem("home")]
            } else if (selection + List_Scroll == 3) {
                Settings = "100010"
                game.reset()
            } else if (selection + List_Scroll == 4) {
                User_Files = [miniMenu.createMenuItem("home")]
                Settings = "100010"
                blockSettings.writeString("Settings", Settings)
                game.reset()
            }
        } else if (submenu == "System Information") {
            if (selection + List_Scroll == 1) {
                ListMenuContents = [
                    miniMenu.createMenuItem("Back"),
                    miniMenu.createMenuItem("Data Management"),
                    miniMenu.createMenuItem("System Information")
                ]
                SubMenu = "System"
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
        dingus52 = 2
        dingus51 = ["Keyboard - OnScreen", "Keyboard - Pin Header", "Keyboard - Radio", "Keyboard - OnScreen"][dingus53]
    } else if (selection == 2) {
        dingus52 = 2
        dingus51 = ["Mouse - D-Pad", "Mouse - Pin Header", "Mouse - Radio", "Mouse - D-Pad"][dingus53]
    } else if (selection == 3) {
        dingus52 = 2
        dingus51 = ["Connectivity - Radio", "Connectivity - Pin Header", "Connectivity - Off", "Connectivity - Radio"][dingus53]
    } else if (selection == 4) {
        dingus52 = 9
        if (dingus53 > dingus52) {
            dingus53 = 1
        }
        dingus51 = "Radio Channel - " + (dingus53).toString()  
    } else if (selection == 5) {
        dingus52 = 3
        dingus51 = ["Wallpaper - Strings", "Wallpaper - Sunrise", "Wallpaper - Stripes", "Wallpaper - Squiggles", "Wallpaper - Strings"][dingus53]
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
// App functions end here

// MARK: Encryption

function decrypt(string: string, key: number) {
    if (Active_Processes.indexOf(miniMenu.createMenuItem("Aegis")) !== -1) {
        let output = '';
        for (let i = 0; i < string.length; i++) {
            output += String.fromCharCode(string.charCodeAt(i) ^ key);
        }
        return output;
    } else {
        return null
    }
}

function encrypt(string: string, key: number): string {
    if (Active_Processes.indexOf(miniMenu.createMenuItem("Aegis")) !== -1) {
        let output = '';
        for (let i = 0; i < string.length; i++) {
            output += String.fromCharCode(string.charCodeAt(i) ^ key);
        }
        return output;
    } else {
        return null
    }
}

// Encryption ends here