// MARK: Sprite Kinds
// do not touch this for the love of god
namespace SpriteKind {
    export const Desktop_UI = SpriteKind.create()
    export const Mouse = SpriteKind.create()
    export const App_UI = SpriteKind.create()
}

// MARK: Is Destroyed
// The only thing MicroOS ever used from the arcade-sprite-util extension --
// inlined so the whole (otherwise unused) package doesn't have to be a
// dependency.
function isDestroyed(sprite: Sprite): boolean {
    return !sprite || !!(sprite.flags & sprites.Flag.Destroyed)
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
let visibleRows: number = 8
let WEBmessage = ""
let WebChatRemoveAttachment: Sprite = null
let attachement: string = null
let KeyboardVisible = false
let Write_icon: Sprite = null
let Library_icon: Sprite = null
let WebChatIndicatorPending = false
let xCell_Icon: Sprite = null
let outline: Sprite = null
let Mouse_Cursor: Sprite = null
let RoomCode = "12345678"
let App_Title: TextSprite = null
let NanoSDK_App_Running = false
let WebChatSend: Sprite = null
let Temp = ""
let open_document: String = null
let Close_App: Sprite = null
let ArrowUp: Sprite = null
let ArrowDown: Sprite = null
let scrollBar: Sprite = null
let scrollBarRond: Sprite = null
let App_Open = "null"
let clipboardName = ""
let clipboardExt = ""
let List_Scroll = 0
let rclick_override = 0
let current_rclick_menu: microUtilities.MenuItem[] = null
// Which message the Web Chat right-click menu (Serial/Save) is currently
// for -- set right before that menu is created, read when "Save" is clicked.
let rclickWebChatEntry: WebChatEntry = null
let ListMenuGUIHidden: microUtilities.MenuItem[] = []
let RightClickMenu: any = null
let Username = ""
let Settings = settings.readString("settings")
let text: TextSprite = null
let ListMenuContents: microUtilities.MenuItem[] = []
let User_Files: microUtilities.MenuItem[] = []
let User_Apps: microUtilities.MenuItem[] = []
let System_Files: microUtilities.MenuItem[] = [microUtilities.createMenuItem("Home"),microUtilities.createMenuItem("MicroOS.sys"),microUtilities.createMenuItem("assets.ts"),microUtilities.createMenuItem("File.moa"),microUtilities.createMenuItem("runtime.moa"),microUtilities.createMenuItem("Write.moa"),microUtilities.createMenuItem("xCell.moa"),microUtilities.createMenuItem("Settings.moa"),microUtilities.createMenuItem("WebChat.moa"),microUtilities.createMenuItem("NanoCode.moa")]
let Current_Settings: microUtilities.MenuItem[] = []
// WebChatEntry is declared in webchat_v2.ts -- it's an interface (erased at
// compile time), so referencing it here doesn't depend on file load order,
// but constructing one with `new` would, hence the plain object literal.
let WebChatHistory: WebChatEntry[] = [
    { senderId: "000000000", senderName: "System", verified: true, text: "Welcome to Web Chat!", attachmentId: "", attachmentName: "", attachmentData: null, attachmentReady: false }
]
let SubMenu = ""
const sillySpacingForListGUI = [10, 22, 34, 46, 58, 71, 83, 95];
pause(300)
let text2 = textsprite.create("> Void Kernel Micro", 0, 1)
text2.setPosition(61, 6)
let text3 = textsprite.create("> PXT Build 4.0.14", 0, 1)
text3.setPosition(58, 16)
pause(200)
text = textsprite.create("> Loading MicroOS v0.4.0", 0, 1)
text.setPosition(76, 26)

const themes = [[7, 9, 2], [10, 9, 10], [5, 6, 6], [11, 10, 10], [1, 9, 9]]

let theme = themes[0]

// MARK: Load Settings
// Settings digit layout: 0 unused, 1 radio channel, 2 wallpaper,
// 3 show clock, 4 dark mode, 5 theme, 6 indicator. (Username/RoomCode are
// stored as their own separate strings, not digits here.)
if (Settings == null || controller.B.isPressed() && controller.up.isPressed()) {
    Settings = "1100000"
    radio.setGroup(113)
    settings.writeString("settings", Settings)
    settings.writeString("Username", "User")
    settings.writeString("RoomCode", RoomCode)
    Username = "User"
} else {
    radio.setGroup(113 + parseInt(Settings.charAt(1)))
    Username = settings.readString("Username")
    RoomCode = settings.readString("RoomCode")
}
webChatProtocol.setUsername(Username)
webChatProtocol.setRoomCode(RoomCode)
let darkMode = false
if (parseInt(Settings.charAt(4)) == 1) {
        darkMode = true
}
let Active_Processes: microUtilities.MenuItem[] = [microUtilities.createMenuItem("Name       | System Load"), microUtilities.createMenuItem("Kyrios     | High"), microUtilities.createMenuItem("Aegis      | Low"), microUtilities.createMenuItem("Horizon    | Medium"), microUtilities.createMenuItem("process.moa| Low")]
Current_Settings = [
    microUtilities.createMenuItem("Radio Channel - " + (parseInt(Settings.charAt(1))) + ""),
    microUtilities.createMenuItem(["Wallpaper - Strings", "Wallpaper - Squiggles", "Wallpaper - Strings"][parseInt(Settings.charAt(2), 10)]),
    microUtilities.createMenuItem("Name - " + settings.readString("Username")),
    microUtilities.createMenuItem(["Show Clock - True", "Show Clock - False", "Show Clock - True"][parseInt(Settings.charAt(3), 10)]),
    microUtilities.createMenuItem("Room Code - " + RoomCode),
    microUtilities.createMenuItem(["Dark Mode - Off", "Dark Mode - On", "Dark Mode - Off"][parseInt(Settings.charAt(4), 10)]),
    microUtilities.createMenuItem(["Theme - Default", "Theme - Blush", "Theme - Ocean", "Theme - Orange", "Theme - Default"][parseInt(Settings.charAt(5), 10)]),
    microUtilities.createMenuItem(["Indicator - On", "Indicator - Off", "Indicator - On"][parseInt(Settings.charAt(6), 10)]),
]

theme = themes[parseInt(Settings.charAt(5), 10)]

// MARK: NanoFS Init
let fileNamesString = settings.readString("file_names");
let User_Files_Temp: string[] = fileNamesString ? JSON.parse(fileNamesString) : [];
if (User_Files_Temp.length == 0 || controller.B.isPressed() && controller.up.isPressed()) {
    if (User_Files_Temp.length !== 0) {}
    User_Files_Temp = ["Home"];
    settings.writeString("file_names", JSON.stringify(User_Files_Temp));
}
for (let i = 0; i < User_Files_Temp.length; i++) {
    User_Files.push(microUtilities.createMenuItem(User_Files_Temp[i]));
}

pause(randint(1000, 2000)) // haha funny delay

// MARK: Post Startup Tasks
sprites.destroy(text)
sprites.destroy(text2)
let Wallpaper = [assets.image`Wallpaper - Strings`, assets.image`Wallpaper - Squiggles`][parseInt(Settings.charAt(2), 10)]
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
if (Settings.charAt(3) == "0") {
    clock.setText(hour.toString() + ":" + minute.toString().substr(1,2))
}

// MARK: Right Click Menus
const rclick_menu_files = [microUtilities.createMenuItem("Open"), microUtilities.createMenuItem("Rename"), microUtilities.createMenuItem("Copy"), microUtilities.createMenuItem("Share"), microUtilities.createMenuItem("Details"), microUtilities.createMenuItem("Delete")]
const rclick_menu_files_empty = [microUtilities.createMenuItem("New File"), microUtilities.createMenuItem("Paste")]


Define_Sprites()

generateTaskbar(theme[0], theme[1])

// MARK: Define Sprites
function Define_Sprites () {
    // remember to add new sprites here or the whole os will break itself
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
    ListMenuGUI = microUtilities.createMenuFromArray([microUtilities.createMenuItem("")])
    sprites.destroyAllSpritesOfKind(SpriteKind.SimpleMenu)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroy(Close_App)
}

// MARK: Generate Taskbar
function generateTaskbar(primary: number = 7, accent: number = 8) {
    if (isDestroyed(Taskbar)) { } else {
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
        sprites.destroyAllSpritesOfKind(SpriteKind.SimpleMenu)
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