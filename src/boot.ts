// MARK: Sprite Kinds
// do not touch this for the love of god
namespace SpriteKind {
    export const Desktop_UI = SpriteKind.create()
    export const Mouse = SpriteKind.create()
    export const App_UI = SpriteKind.create()
}

// MARK: VM Detector
let isVM = false
if (browserEvents.currentTime() > -1) {
    isVM = true
}

// MARK: Global Variables
let Taskbar: Sprite = null
let menu_selection : number = null
let ListMenuGUI: any = null
let NanoCode_Icon: Sprite = null
let File_Manager_Icon: Sprite = null
let Process_Icon: Sprite = null
let Settings_Icon: Sprite = null
let Web_Chat_Icon: Sprite = null
let WEBmessage = ""
let KeyboardVisible = false
let Write_icon: Sprite = null
let Library_icon: Sprite = null
let RadioValueQueue: string[] = []
let IncomingMessageChunks: string[] = []
let ExpectedChunks = 0
let xCell_Icon: Sprite = null
let outline: Sprite = null
let Mouse_Cursor: Sprite = null
let RoomCode = "12345678"
let App_Title: TextSprite = null
let NanoSDK_App_Running = false
let WebChatSend: Sprite = null
let Temp = ""
let open_nanocode_file: String = null
let Close_App: Sprite = null
let ArrowUp: Sprite = null
let ArrowDown: Sprite = null
let scrollBar: Sprite = null
let scrollBarRond: Sprite = null
let App_Open = "null"
let clipboard = ""
let List_Scroll = 0
let rclick_override = 0
let current_rclick_menu: miniMenu.MenuItem[] = null
let ListMenuGUIHidden: miniMenu.MenuItem[] = []
let RightClickMenu: any = null
let Username = ""
let Settings = blockSettings.readString("settings")
let text: TextSprite = null
let ListMenuContents: miniMenu.MenuItem[] = []
let User_Files: miniMenu.MenuItem[] = []
let User_Apps: miniMenu.MenuItem[] = []
let System_Files: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Home"),miniMenu.createMenuItem("MicroOS.sys"),miniMenu.createMenuItem("assets.ts"),miniMenu.createMenuItem("File.moa"),miniMenu.createMenuItem("runtime.moa"),miniMenu.createMenuItem("Write.moa"),miniMenu.createMenuItem("xCell.moa"),miniMenu.createMenuItem("Settings.moa"),miniMenu.createMenuItem("WebChat.moa"),miniMenu.createMenuItem("NanoCode.moa")]
let Current_Settings: miniMenu.MenuItem[] = []
let WebChatMessages: miniMenu.MenuItem[] = [miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem(" "),miniMenu.createMenuItem("System (Verified)"),miniMenu.createMenuItem("Welcome to Web Chat!"),miniMenu.createMenuItem("Type here...")]
let SubMenu = ""
const sillySpacingForListGUI = [10, 22, 34, 46, 58, 71, 83, 95];
pause(300)
let text2 = textsprite.create("> Void Kernel Micro", 0, 1)
text2.setPosition(61, 6)
let text3 = textsprite.create("> PXT Build 4.0.12", 0, 1)
text3.setPosition(58, 16)
pause(200)
text = textsprite.create("> Loading MicroOS v0.1.1", 0, 1)
text.setPosition(76, 26)

const themes = [[7, 8, 2], [10, 9, 10], [5, 6, 6], [11, 10, 10], [8, 9, 9]]

let theme = themes[0]

// MARK: Load Settings
if (Settings == null || controller.B.isPressed() && controller.up.isPressed()) {
    Settings = "100010000"
    radio.setGroup(113)
    blockSettings.writeString("settings", Settings)
    blockSettings.writeString("Username", "User")
    blockSettings.writeString("RoomCode", RoomCode)
} else {
    radio.setGroup(113 + parseInt(Settings.charAt(4)))
    Username = blockSettings.readString("Username")
    RoomCode = blockSettings.readString("RoomCode")
}
let darkMode = false
if (parseInt(Settings.charAt(7)) == 1) {
        darkMode = true
}
let Active_Processes: miniMenu.MenuItem[] = [miniMenu.createMenuItem("Name       | System Load"), miniMenu.createMenuItem("Kyrios     | High"), miniMenu.createMenuItem("Aegis      | Low"), miniMenu.createMenuItem("Horizon    | Medium"), miniMenu.createMenuItem("process.moa| Low")]
Current_Settings = [
    miniMenu.createMenuItem(["Keyboard - Jacdac", "Keyboard - OnScreen", "Keyboard - Jacdac"][parseInt(Settings.charAt(1), 10) + 1]),
    miniMenu.createMenuItem(["Mouse - D-Pad", "Mouse - Jacdac","Mouse - D-Pad"][parseInt(Settings.charAt(2), 10)]),
    miniMenu.createMenuItem(["Connectivity - Off", "Connectivity - Radio", "Connectivity - Jacdac", "Connectivity - Off"][parseInt(Settings.charAt(3), 10) + 1]),
    miniMenu.createMenuItem("Radio Channel - " + (parseInt(Settings.charAt(4))) + ""),
    miniMenu.createMenuItem(["Wallpaper - Strings", "Wallpaper - Squiggles", "Wallpaper - Strings"][parseInt(Settings.charAt(5), 10)]),
    miniMenu.createMenuItem("Name - " + blockSettings.readString("Username")),
    miniMenu.createMenuItem(["Show Clock - True", "Show Clock - False", "Show Clock - True"][parseInt(Settings.charAt(6), 10)]),
    miniMenu.createMenuItem("Room Code - " + RoomCode),
    miniMenu.createMenuItem(["Dark Mode - Off", "Dark Mode - On", "Dark Mode - Off"][parseInt(Settings.charAt(7), 10)]),
    miniMenu.createMenuItem(["Theme - Default", "Theme - Blush", "Theme - Ocean", "Theme - Orange", "Theme - Default"][parseInt(Settings.charAt(8), 10)])
]

theme = themes[parseInt(Settings.charAt(8), 10)]

// MARK: NanoFS Init
let fileNamesString = blockSettings.readString("file_names");
let User_Files_Temp: string[] = fileNamesString ? JSON.parse(fileNamesString) : [];
if (User_Files_Temp.length == 0 || controller.B.isPressed() && controller.up.isPressed()) {
    if (User_Files_Temp.length !== 0) {}
    User_Files_Temp = ["Home"];
    blockSettings.writeString("file_names", JSON.stringify(User_Files_Temp));
}
for (let i = 0; i < User_Files_Temp.length; i++) {
    User_Files.push(miniMenu.createMenuItem(User_Files_Temp[i]));
}

pause(randint(1000, 2000)) // haha funny delay

// MARK: Post Startup Tasks
sprites.destroy(text)
sprites.destroy(text2)
let Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(5), 10)]
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
clock.z = -10
if (Settings.charAt(6) == "0") {
    clock.setText(hour.toString() + ":" + minute.toString().substr(1,2))
}

// MARK: Right Click Menus
const rclick_menu_files = [miniMenu.createMenuItem("Open"), miniMenu.createMenuItem("Rename"), miniMenu.createMenuItem("Copy"), miniMenu.createMenuItem("Details"), miniMenu.createMenuItem("Delete")]
const rclick_menu_files_empty = [miniMenu.createMenuItem("New File"), miniMenu.createMenuItem("Paste")]


Define_Sprites()

generateTaskbar(theme[0], theme[1])

// MARK: Define Sprites
function Define_Sprites () {
    // remember to add new sprites here or the whole os will shit itself
    App_Open = "null"
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

// MARK: Generate Taskbar
function generateTaskbar(primary: number = 7, accent: number = 8) {
    if (spriteutils.isDestroyed(Taskbar)) { } else {
        Taskbar.destroy()
    }
    let taskbarImg = image.create(154, 12)
    taskbarImg.fillRect(0, 1, 154, 10, primary)
    taskbarImg.fillRect(1, 0, 152, 12, primary)
    taskbarImg.drawLine(12, 2, 12, 9, accent)
    Taskbar = sprites.create(taskbarImg, SpriteKind.Desktop_UI)
    Taskbar.z = -11
    Taskbar.setPosition(80, 111)
}

// MARK: Soft Error
function softerror(code: number) {
    if (App_Open !== "death") {
        game.splash("Error " + code)
    }
}

// MARK: Error
function error(code: number) {
    if (App_Open !== "death") {
        close_apps()
        game.splash("Error " + code)
    }
}

// MARK: Kernel Panic
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