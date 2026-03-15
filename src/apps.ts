// Running every app at a kernel level is such a good idea ikr

// MARK: createAppBar
function createAppBar(fill: number = 1, accent: number = 2) {
    let bg = image.create(160, 120)
    bg.fill(fill)
    bg.fillRect(0, 0, 160, 9, accent)
    scene.setBackgroundImage(bg)
}

// MARK: Open Library
function Open_Library() {
    close_apps()
    App_Open = "App Library"
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(148, 13)
    Close_App.z = 23
    let library_background = image.create(150, 95)
    library_background.fillRect(3, 0, 144, 95, 7)
    library_background.fillRect(0, 3, 150, 89, 7)
    library_background.fillRect(3, 3, 144, 89, 8)
    Taskbar = sprites.create(library_background, SpriteKind.App_UI)
    Taskbar.setPosition(80, 53)
}

// MARK: Open Web Chat
function Open_Web() {
    close_apps()
    App_Open = "Web Chat"
    Temp = "Type here..."
    createAppBar()
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

// MARK: Open xCell
function Open_xCell(load_file: string) {
    close_apps()
    App_Open = "xCell"
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("xCell", 0, 1)
    App_Title.setPosition(15, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
}

// MARK: Open Write
function Open_Write(load_file: string) {
    close_apps()
    App_Open = "Write"
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Write", 0, 1)
    App_Title.setPosition(16, 4)
    text = textsprite.create("Unfinished", 0, 15)
    text.setPosition(80, 60)
}

// MARK: Open Settings
function Open_Settings() {
    close_apps()
    App_Open = "Settings"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = [miniMenu.createMenuItem("Connectivity"),miniMenu.createMenuItem("Input"),miniMenu.createMenuItem("Customization"),miniMenu.createMenuItem("System"),miniMenu.createMenuItem("App Settings")]
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 1)
    App_Title.setPosition(24, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
}

// MARK: Open NanoCode
function Open_NanoCode(project: string = null, file: string = null) {
    close_apps()
    App_Open = "NanoCode"
    SubMenu = "Editor"
    createAppBar(15)
    text = textsprite.create(" Save | Compile          ", 1, 15)
    text.setPosition(72, 13)
    text.setBorder(2,1,0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("NanoCode", 0, 1)
    App_Title.setPosition(24, 4)
    open_nanocode_file = file
    if (project == null || project == "") {
        ListMenuContents = [miniMenu.createMenuItem("DAN example"), miniMenu.createMenuItem("DAI default"), miniMenu.createMenuItem("ASM home"), miniMenu.createMenuItem("TXP 22"), miniMenu.createMenuItem("PRN Hello World!")]
    } else {
        ListMenuContents = project.split("~").map(line => miniMenu.createMenuItem(line))
    }
    if (ListMenuContents.length == 0 || ListMenuContents[ListMenuContents.length - 1].text !== " ") {
        ListMenuContents.push(miniMenu.createMenuItem(" "))
    }
    List_Scroll = 0
    ListMenuGUIHidden = []
    ListMenuGUI = miniMenu.createMenuFromArray([])
    reloadListGUI(76, 63, 151, 84, true)
    scrollBar = sprites.create(assets.image`scrollBar`, SpriteKind.App_UI)
    scrollBar.setPosition(156, 57)
    scrollBar.z = -2
    scrollBarRond = sprites.create(assets.image`scrollBar2`, SpriteKind.App_UI)
    scrollBarRond.setPosition(156, 96)
    scrollBarRond.z = -1
    createArrows()
    updateScrollBar(7, true)
}

// MARK: Open File Manager
function Open_FileManager(submenu: string = "Home", file: string = null) {
    close_apps()
    App_Open = "File Manager"
    SubMenu = submenu
    List_Scroll = 0
    ListMenuGUIHidden = []
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    scrollBar = sprites.create(assets.image`scrollBar`, SpriteKind.App_UI)
    scrollBar.setPosition(156, 57)
    scrollBar.z = -2
    scrollBarRond = sprites.create(assets.image`scrollBar2`, SpriteKind.App_UI)
    scrollBarRond.setPosition(156, 96)
    scrollBar.z = -1
    App_Title = textsprite.create("File Manager", 0, 1)
    App_Title.setPosition(36, 4)
    if (SubMenu == "User") {
        ListMenuContents = User_Files.slice()
    } else if (submenu == "Details") {
        const splitFile = file.split(".")
        const name = splitFile[0]
        const extension = splitFile[1]
        ListMenuContents = [miniMenu.createMenuItem("Details"), miniMenu.createMenuItem("Name: " + name), miniMenu.createMenuItem("Type: " + extension + " file"), miniMenu.createMenuItem("Size: 0KB"), miniMenu.createMenuItem(" "), miniMenu.createMenuItem(" "), miniMenu.createMenuItem(" "), miniMenu.createMenuItem("Back")]
    } else {
        ListMenuContents = [miniMenu.createMenuItem("System"), miniMenu.createMenuItem("User Files")]
    }
    ListMenuGUI = miniMenu.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    createArrows()
    updateScrollBar(8)
}

// MARK: Open Process Manager
function Open_ProcessManager() {
    close_apps()
    App_Open = "Process Manager"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = Active_Processes
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Process Manager", 0, 1)
    App_Title.setPosition(45, 4)
    ListMenuGUI = miniMenu.createMenuFromArray(Active_Processes)
    ListMenuGUI.setDimensions(160, 97)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setPosition(80, 58)
    ListMenuGUI.selectedIndex = 1
    ListMenuGUI.z = -30
}

