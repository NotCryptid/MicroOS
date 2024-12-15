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
let FileManagerGUI: miniMenu.MenuSprite = null
let SettingsGUI: miniMenu.MenuSprite = null
let ThingAI_Icon: Sprite = null
let File_Manager_Icon: Sprite = null
let Settings_Icon: Sprite = null
let Web_Chat_Icon: Sprite = null
let Write_icon: Sprite = null
let xCell_Icon: Sprite = null
let Mouse_Cursor: Sprite = null
let App_Title: TextSprite = null
let Close_App: Sprite = null
let App_Open = ""
let File_Scroll = 0
let Settings = blockSettings.readString("settings")
let text: TextSprite = null
let User_Files: miniMenu.MenuItem[] = []
let System_Files: miniMenu.MenuItem[] = []
let Avaiable_Settings: miniMenu.MenuItem[] = []
let sillySpacingForListGUI = []
radio.setGroup(113)
System_Files = [
    miniMenu.createMenuItem("home"),
    miniMenu.createMenuItem("MicroOS.uf2"),
    miniMenu.createMenuItem("wallpaper.asset"),
    miniMenu.createMenuItem("File.moa"),
    miniMenu.createMenuItem("Write.moa"),
    miniMenu.createMenuItem("xCell.moa"),
    miniMenu.createMenuItem("Settings.moa"),
    miniMenu.createMenuItem("WebChat.moa"),
    miniMenu.createMenuItem("ThingAI.moa")
]
pause(300)
let text2 = textsprite.create("> Void Kernel 2024.1", 0, 12)
text2.setPosition(64, 6)
let text3 = textsprite.create("> PTX Build 2.0.3", 0, 12)
text3.setPosition(55, 16)
let text4 = textsprite.create("> Hold B + UP to erase", 0, 12)
text4.setPosition(70, 26)
pause(1000)
text = textsprite.create("> Loading Micro:OS v0.0.2", 0, 12)
text.setPosition(79, 36)
if (Settings == null || (controller.B.isPressed() && controller.up.isPressed())) {
    Settings = "10000"
    blockSettings.writeString("settings", Settings)
}
Avaiable_Settings = [
    miniMenu.createMenuItem(["Keyboard - Radio", "Keyboard - OnScreen", "Keyboard - Pin Header", "Keyboard - Radio"][parseInt(Settings.charAt(1), 10) + 1]),
    miniMenu.createMenuItem(["Mouse - Radio", "Mouse - D-Pad", "Mouse - Pin Header", "Mouse - Radio"][parseInt(Settings.charAt(2), 10) + 1]),
    miniMenu.createMenuItem(["Connectivity - Off", "Connectivity - Radio", "Connectivity - Pin Header", "Connectivity - Off"][parseInt(Settings.charAt(3), 10) + 1]),
    miniMenu.createMenuItem("Web Chat Channel - " + (parseInt(Settings.charAt(4))) + ""),
]
let fileNamesString = blockSettings.readString("file_names");
let User_Files_Temp: string[] = fileNamesString ? JSON.parse(fileNamesString) : [];
if (User_Files_Temp.length === 0 || (controller.B.isPressed() && controller.up.isPressed())) {
    User_Files_Temp = ["home", "test.txt"];
    blockSettings.writeString("file_names", JSON.stringify(User_Files_Temp));
}
for (let i = 0; i < User_Files_Temp.length; i++) {
    User_Files.push(miniMenu.createMenuItem(User_Files_Temp[i]));
}
pause(randint(1000, 2000))
sprites.destroy(text)
sprites.destroy(text2)
scene.setBackgroundImage(assets.image`Wallpaper`)
Define_Sprites()

function Define_Sprites () {
    // remember to add new sprites here or the whole os will shit itself
    App_Open = "null"
    Taskbar = sprites.create(assets.image`Taskbar`, SpriteKind.Desktop_UI)
    Taskbar.setPosition(80, 60)
    xCell_Icon = sprites.create(assets.image`xCell`, SpriteKind.Desktop_UI)
    xCell_Icon.setPosition(9, 112)
    Write_icon = sprites.create(assets.image`Write`, SpriteKind.Desktop_UI)
    Write_icon.setPosition(19, 112)
    ThingAI_Icon = sprites.create(assets.image`ThingAI`, SpriteKind.Desktop_UI)
    ThingAI_Icon.setPosition(29, 112)
    Web_Chat_Icon = sprites.create(assets.image`Web Chat`, SpriteKind.Desktop_UI)
    Web_Chat_Icon.setPosition(39, 112)
    Settings_Icon = sprites.create(assets.image`Settings`, SpriteKind.Desktop_UI)
    Settings_Icon.setPosition(49, 112)
    File_Manager_Icon = sprites.create(assets.image`File Manager`, SpriteKind.Desktop_UI)
    File_Manager_Icon.setPosition(59, 112)
    Mouse_Cursor = sprites.create(assets.image`Cursor`, SpriteKind.Mouse)
    Mouse_Cursor.setPosition(80, 60)
    Mouse_Cursor.setStayInScreen(true)
    controller.moveSprite(Mouse_Cursor, 50, 50)
    Mouse_Cursor.z = 453453453453
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    App_Title = textsprite.create("Write", 0, 12)
    FileManagerGUI = miniMenu.createMenuFromArray([miniMenu.createMenuItem("")])
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroy(Close_App)
}
// Okay kernel ends here

// MARK: Button Presses
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
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
    } else if (Mouse_Cursor.overlapsWith(ThingAI_Icon)) {
        close_apps()
        Open_ThingAI()
    } else if (Mouse_Cursor.overlapsWith(Close_App)) {
        close_apps()
    } else if (App_Open == "File Manager") {
        // i totally understand how this works
        File_Scroll = 0
        if (Mouse_Cursor.y < 24 && (Mouse_Cursor.y > 11 && Mouse_Cursor.x < 150)) {
            App_Open = "File Manager System"
            FileManagerGUI.close()
            FileManagerGUI = miniMenu.createMenuFromArray(System_Files)
            FileManagerGUI.setButtonEventsEnabled(false)
            FileManagerGUI.setDimensions(151, 97)
            FileManagerGUI.setPosition(76, 58)
            FileManagerGUI.z = -30
        } else if (Mouse_Cursor.y < 37 && (Mouse_Cursor.y > 24 && Mouse_Cursor.x < 150)) {
            App_Open = "File Manager User"
            FileManagerGUI.close()
            FileManagerGUI = miniMenu.createMenuFromArray(User_Files)
            FileManagerGUI.setButtonEventsEnabled(false)
            FileManagerGUI.setDimensions(151, 97)
            FileManagerGUI.setPosition(76, 58)
            FileManagerGUI.z = -30
        }
    } else if (App_Open == "File Manager System" || App_Open == "File Manager User") {
        sillySpacingForListGUI = [10, 23, 36, 49, 62, 75, 88, 101, 114];
        let menu_selection = 0;
        
        for (let i = 0; i < sillySpacingForListGUI.length; i++) {
            if (Mouse_Cursor.y > sillySpacingForListGUI[i]) {
                menu_selection = i + 1;
            } else {
                break;
            }
        }
        openFile(App_Open, menu_selection)
    } else if (App_Open = "Settings") {
        sillySpacingForListGUI = [10, 23, 36, 49];
        let menu_selection = 0;
        
        for (let i = 0; i < sillySpacingForListGUI.length; i++) {
            if (Mouse_Cursor.y > sillySpacingForListGUI[i]) {
                menu_selection = i + 1;
            } else {
                break;
            }
        }
        changeSettings(menu_selection)
        console.log(Settings)
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // this is gonna be right click
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {

})

// Button presses end here

// MARK: Background tasks
forever(function () {
    // Don't set this pause to anything above 25 or you will get a seizure 
    pause(10)
    Start_Icon_Names()
    if (App_Open == "File Manager System" || App_Open == "File Manager User") {
    	// make scrolling in file manager later
    }
})

function Start_Icon_Names () {
    if (Mouse_Cursor.overlapsWith(xCell_Icon)) {
        xCell_Icon.sayText("xCell", 50, false)
    } else if (Mouse_Cursor.overlapsWith(Write_icon)) {
        Write_icon.sayText("Write", 50, false)
    } else if (Mouse_Cursor.overlapsWith(Web_Chat_Icon)) {
        Web_Chat_Icon.sayText("Web Chat", 50, false)
    } else if (Mouse_Cursor.overlapsWith(Settings_Icon)) {
        Settings_Icon.sayText("Settings", 50, false)
    } else if (Mouse_Cursor.overlapsWith(File_Manager_Icon)) {
        File_Manager_Icon.sayText("File Manager", 50, false)
    } else if (Mouse_Cursor.overlapsWith(ThingAI_Icon)) {
        ThingAI_Icon.sayText("ThingAI", 50, false)
    }
}
// Background tasks end here

// MARK: Apps
// Running every app at a kernel level is such a good idea ikr
function Open_Web () {
    App_Open = "Web Chat"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Web Chat", 0, 12)
    App_Title.setPosition(26, 4)
}


function Open_xCell (load_file: string) {
    App_Open = "xCell"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("xCell", 0, 12)
    App_Title.setPosition(16, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
}

function Open_Write (load_file: string) {
    App_Open = "Write"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Write", 0, 12)
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
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 12)
    App_Title.setPosition(25, 4)
    SettingsGUI = miniMenu.createMenuFromArray(Avaiable_Settings)
    SettingsGUI.setDimensions(160, 97)
    SettingsGUI.setButtonEventsEnabled(false)
    SettingsGUI.setPosition(80, 58)
    SettingsGUI.z = -30
}

function Open_ThingAI () {
    App_Open = "ThingAI"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(15)
    text = textsprite.create("ThingAI App Isn't Available", 0, 12)
    text.setPosition(80, 60)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("ThingAI", 0, 12)
    App_Title.setPosition(23, 4)
}
function Open_FileManager () {
    App_Open = "File Manager"
    File_Scroll = 0
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("File Manager", 0, 12)
    App_Title.setPosition(37, 4)
    FileManagerGUI = miniMenu.createMenuFromArray([miniMenu.createMenuItem("System"), miniMenu.createMenuItem("User Files")])
    FileManagerGUI.setDimensions(151, 97)
    FileManagerGUI.setButtonEventsEnabled(false)
    FileManagerGUI.setPosition(76, 58)
    FileManagerGUI.z = -30
}
// Apps end here

// MARK: App related tasks
function close_apps () {
    // works good enough so no touching
    App_Open = "null"
    scene.setBackgroundImage(assets.image`Wallpaper`)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroyAllSpritesOfKind(SpriteKind.App_UI)
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
}

function openFile(page: string, selection: number) {
    if (page === "File Manager System") {
        if (selection + File_Scroll == 1) {
            close_apps()
            Open_FileManager()
        } else if (selection + File_Scroll == 2) {
            game.reset()
        } else if (selection + File_Scroll == 3) {
            // might make an image viewer some day
        } else if (selection + File_Scroll == 4) {
            close_apps()
            Open_FileManager()
        } else if (selection + File_Scroll == 5) {
            close_apps()
            Open_Write("")
        } else if (selection + File_Scroll == 6) {
            close_apps()
            Open_xCell("")
        } else if (selection + File_Scroll == 7) {
            close_apps()
            Open_Settings()
        } else if (selection + File_Scroll == 8) {
            close_apps()
            Open_Web()
        } else if (selection + File_Scroll == 9) {
            close_apps()
            Open_ThingAI()
        }
    } else if (page === "File Manager User") {
        if (selection + File_Scroll == 1) {
            close_apps()
            Open_FileManager()
        } else if (selection + File_Scroll == 2) {
            close_apps()
            Open_Write("This is a test file")
        }
    }
}

function changeSettings(selection: number) {
    let dingus53 = parseInt(Settings.charAt(selection), 10) + 1;
    let dingus52 = 0
    let dingus51 = "spoingy"
    if (selection == 1) {
        dingus52 = 2
        dingus51 = ["Keyboard - OnScreen", "Keyboard - Pin Header", "Keyboard - Radio", "Keyboard - OnScreen"][dingus53 - 1]
    } else if (selection == 2) {
        dingus52 = 2
        dingus51 = ["Mouse - D-Pad", "Mouse - Pin Header", "Mouse - Radio", "Mouse - D-Pad"][dingus53 - 1]
    } else if (selection == 3) {
        dingus52 = 2
        dingus51 = ["Connectivity - Radio", "Connectivity - Pin Header", "Connectivity - Off", "Connectivity - Radio"][dingus53 - 1]
    } else if (selection == 4) {
        dingus52 = 9
        dingus51 = "Web Chat Channel - " + (dingus53 - 1).toString()
    }

    if (dingus53 > dingus52) {
        dingus53 = 0
    }

    Settings = Settings.slice(0, selection) + dingus53.toString() + Settings.slice(selection + 1)
    Avaiable_Settings[selection - 1] = miniMenu.createMenuItem(dingus51)
    blockSettings.writeString("settings", Settings)
}
// App related tasks end here
