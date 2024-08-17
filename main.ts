// this is the kernel do not touch this for the love of god
namespace SpriteKind {
    
    export const Desktop_UI = SpriteKind.create()
    export const Mouse = SpriteKind.create()
    export const App_UI = SpriteKind.create()
}

// this definitely does something
let Taskbar: Sprite = null
let File_Manager_selection = null
let myMenu: miniMenu.MenuSprite = null
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
let text: TextSprite = null
let User_Files: miniMenu.MenuItem[] = []
let System_Files: miniMenu.MenuItem[] = []

radio.setGroup(113)
System_Files = [
miniMenu.createMenuItem("home"),
miniMenu.createMenuItem("MicroOS.hex"),
miniMenu.createMenuItem("wallpaper.asset"),
miniMenu.createMenuItem("File.moa"),
miniMenu.createMenuItem("Write.moa"),
miniMenu.createMenuItem("xCell.moa"),
miniMenu.createMenuItem("Settings.moa"),
miniMenu.createMenuItem("WebChat.moa"),
miniMenu.createMenuItem("ThingAI.moa")
]
User_Files = [miniMenu.createMenuItem("home"), miniMenu.createMenuItem("test.txt")]
pause(300)
let text2 = textsprite.create("> Void Kernel 2024.1", 0, 12)
text2.setPosition(64, 6)
pause(500)
text = textsprite.create("> Loading Micro:OS v0.1", 0, 12)
text.setPosition(73, 16)
pause(randint(3000, 5000))
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
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    App_Title = textsprite.create("Write", 0, 12)
    myMenu = miniMenu.createMenuFromArray([miniMenu.createMenuItem("")])
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroy(Close_App)
}
// Okay kernel ends here

// Button Presses and shit
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
            myMenu.close()
            myMenu = miniMenu.createMenuFromArray(System_Files)
            myMenu.setButtonEventsEnabled(false)
            myMenu.setDimensions(151, 97)
            myMenu.setPosition(76, 58)
            myMenu.z = -30
        } else if (Mouse_Cursor.y < 37 && (Mouse_Cursor.y > 24 && Mouse_Cursor.x < 150)) {
            App_Open = "File Manager User"
            myMenu.close()
            myMenu = miniMenu.createMenuFromArray(User_Files)
            myMenu.setButtonEventsEnabled(false)
            myMenu.setDimensions(151, 97)
            myMenu.setPosition(76, 58)
            myMenu.z = -30
        }
    } else if (App_Open == "File Manager System" || App_Open == "File Manager User") {
        // this stupid fucker works diferently on a vm and actual hardware but still incorrectly on both
        File_Manager_selection = Mouse_Cursor.y - 11 / 13 + 1 + ""
        File_Manager_selection = parseInt(File_Manager_selection.charAt(1))
        if (File_Manager_selection < 9.01) {
            openFile(App_Open, File_Manager_selection)
            console.log(File_Manager_selection)
        }
    }
})

// figure out what to do with this later
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
	// possibly spotlight search or some shit???
    // maybe like an app library type shit???
    // power options???
    // quick settings???
})
// Button presses end here

// Background tasks
forever(function () {
    Mouse_Cursor.z = 453453453453
    pause(20)
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

// Apps
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
}
function Open_Settings () {
    App_Open = "Settings"
    scene.setBackgroundImage(assets.image`App`)
    scene.setBackgroundColor(12)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 12)
    App_Title.setPosition(25, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
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
    // should probably rename this but im too lazy to do that
    myMenu = miniMenu.createMenuFromArray([miniMenu.createMenuItem("System"), miniMenu.createMenuItem("User Files")])
    myMenu.setDimensions(151, 97)
    myMenu.setButtonEventsEnabled(false)
    myMenu.setPosition(76, 58)
    myMenu.z = -30
}
// Apps end here

// App related tasks
function close_apps () {
    // works good enough so no touching
    App_Open = "null"
    scene.setBackgroundImage(assets.image`Wallpaper`)
    sprites.destroyAllSpritesOfKind(SpriteKind.Text)
    sprites.destroyAllSpritesOfKind(SpriteKind.App_UI)
    sprites.destroyAllSpritesOfKind(SpriteKind.MiniMenu)
}

function openFile (page: string, selection: number) {
    if (page = "File Manager System") {
        if (selection + File_Scroll == 1) {
            close_apps()
            Open_FileManager()
        } else if (selection + File_Scroll == 2) {
            game.reset()
        }
    }
    if (page = "File Manager User") {
        if (selection + File_Scroll == 1) {
            close_apps()
            Open_FileManager()
        }
    }
}
// App related tasks end here
