// Running every app at a kernel level is such a good idea ikr

// MARK: Create ScrollBar Sprites
function createScrollBarSprites(barY: number = 57, rondY: number = 96) {
    scrollBar = sprites.create(assets.image`scrollBar`, SpriteKind.App_UI)
    scrollBar.setPosition(156, barY)
    scrollBar.z = -2
    scrollBarRond = sprites.create(assets.image`scrollBar2`, SpriteKind.App_UI)
    scrollBarRond.setPosition(156, rondY)
    scrollBarRond.z = -1
}

// MARK: Create App Bar
function createAppBar(fill: number = 1, accent: number = 2) {
    let fill2 = fill
    if (fill == 0) {
        if (darkMode) {
            fill2 = 15
        } else {
            fill2 = 1
        }
    }
    if (accent == 2) {
        accent = theme[2]
    }
    let bg = image.create(160, 120)
    bg.fill(fill2)
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
    library_background.fillRect(3, 0, 144, 95, 7) // outline
    library_background.fillRect(0, 3, 150, 89, 7) // outline
    library_background.fillRect(3, 3, 144, 89, 9) // background
    Taskbar = sprites.create(library_background, SpriteKind.App_UI)
    Taskbar.z = -30
    Taskbar.setPosition(80, 53)
}

// MARK: Open Web Chat
function Open_Web(included_attachement: string = null) {
    if (microUtilities.isMicrobit()) { 
        microUtilities.setPixel(0,0, false)
    }
    close_apps()
    App_Open = "Web Chat"
    Temp = "Type here..."
    createAppBar(0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    WebChatSend = sprites.create(assets.image`WebSend`, SpriteKind.App_UI)
    WebChatSend.setPosition(154, 99)
    if (included_attachement !== null) { 
        WebChatRemoveAttachment = sprites.create(assets.image`WebAttachementRemove`, SpriteKind.App_UI)
        WebChatRemoveAttachment.setPosition(142, 99)
        attachement = included_attachement
    }
    App_Title = textsprite.create("Web Chat", 0, 1)
    App_Title.setPosition(25, 4)
    createScrollBarSprites(51, 83)
    // refreshWebChatList reads visibleRows to decide the padding/scroll
    // split -- set it before calling in case a previous app left it stale.
    visibleRows = 8
    refreshWebChatList()
    // Pulled up off their default spots so they don't sit under the send
    // button (WebChatSend, centred at y=99).
    createArrows(88)
    updateScrollBar(8, darkMode, 82)
}

// MARK: Open xCell
function Open_xCell(file_contents: string = null, file_name: string = null) {
    close_apps()
    App_Open = "xCell"
    createAppBar(0)
    let text_color = 15
    if (darkMode) {
        text_color = 1
    }
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("xCell", 0, 1)
    App_Title.setPosition(15, 4)
    text = textsprite.create("Unfinished", 0, text_color)
    text.setPosition(80, 60)
}

// MARK: Open Write
function Open_Write(file_contents: string = null, file_name: string = null) {
    close_apps()
    App_Open = "Write"
    SubMenu = "Editor"
    createAppBar(0)
    text = textsprite.create(" Save | Save As          ", 1, 15)
    text.setPosition(72, 13)
    text.setBorder(2,1,0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Write", 0, 1)
    App_Title.setPosition(16, 4)
    open_document = file_name
    if (file_contents == null || file_contents == "") {
        ListMenuContents = [microUtilities.createMenuItem(" ")]
    } else {
        ListMenuContents = file_contents.split("~").map(line => microUtilities.createMenuItem(line))
    }
    if (ListMenuContents.length == 0 || ListMenuContents[ListMenuContents.length - 1].text !== " ") {
        ListMenuContents.push(microUtilities.createMenuItem(" "))
    }
    List_Scroll = 0
    ListMenuGUIHidden = []
    ListMenuGUI = microUtilities.createMenuFromArray([])
    reloadListGUI(76, 63, 151, 84, darkMode)
    createScrollBarSprites()
    createArrows()
    updateScrollBar(7, darkMode)
}

// MARK: Open Settings
function Open_Settings() {
    close_apps()
    App_Open = "Settings"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = [microUtilities.createMenuItem("Connectivity"),microUtilities.createMenuItem("Customization"),microUtilities.createMenuItem("System"),microUtilities.createMenuItem("App Settings")]
    createAppBar(0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Settings", 0, 1)
    App_Title.setPosition(24, 4)
    ListMenuGUI = microUtilities.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    reloadListGUI(76, 58, 151, 97, darkMode)
    createScrollBarSprites()
    createArrows()
    updateScrollBar(8, darkMode)
}

// MARK: Open NanoCode
function Open_NanoCode(project: string = null, file_name: string = null) {
    close_apps()
    App_Open = "NanoCode"
    SubMenu = "Editor"
    createAppBar(15)
    text = textsprite.create(" Save | Save As | Compile", 1, 15)
    text.setPosition(72, 13)
    text.setBorder(2,1,0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("NanoCode", 0, 1)
    App_Title.setPosition(24, 4)
    open_document = file_name
    if (project == null || project == "") {
        ListMenuContents = [microUtilities.createMenuItem("DAN example"), microUtilities.createMenuItem("DAI default"), microUtilities.createMenuItem("ASM home"), microUtilities.createMenuItem("TXP 22"), microUtilities.createMenuItem("PRN Hello World!")]
    } else {
        ListMenuContents = project.split("~").map(line => microUtilities.createMenuItem(line))
    }
    if (ListMenuContents.length == 0 || ListMenuContents[ListMenuContents.length - 1].text !== " ") {
        ListMenuContents.push(microUtilities.createMenuItem(" "))
    }
    List_Scroll = 0
    ListMenuGUIHidden = []
    ListMenuGUI = microUtilities.createMenuFromArray([])
    reloadListGUI(76, 63, 151, 84, true)
    createScrollBarSprites()
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
    createAppBar(0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    createScrollBarSprites()
    App_Title = textsprite.create("File Manager", 0, 1)
    App_Title.setPosition(36, 4)
    if (SubMenu == "User") {
        ListMenuContents = User_Files.slice()
    } else if (submenu == "Details") {
        const splitFile = file.split(".")
        const name = splitFile[0]
        const extension = splitFile[1]
        const sizeBytes = fileEntrySize(fileKey(extension, name))
        ListMenuContents = [microUtilities.createMenuItem("Details"), microUtilities.createMenuItem("Name: " + name), microUtilities.createMenuItem("Type: " + extension + " file"), microUtilities.createMenuItem("Size: " + sizeBytes + " bytes"), microUtilities.createMenuItem(" "), microUtilities.createMenuItem(" "), microUtilities.createMenuItem(" "), microUtilities.createMenuItem("Back")]
    } else {
        ListMenuContents = [microUtilities.createMenuItem("System"), microUtilities.createMenuItem("User Files")]
    }
    ListMenuGUI = microUtilities.createMenuFromArray(ListMenuContents)
    ListMenuGUI.setDimensions(151, 97)
    ListMenuGUI.setPosition(76, 58)
    ListMenuGUI.z = -30
    reloadListGUI(76, 58, 151, 97, darkMode)
    createArrows()
    updateScrollBar(8, darkMode)
}

// MARK: Open Process Manager
function Open_ProcessManager() {
    close_apps()
    App_Open = "Process Manager"
    SubMenu = "Home"
    List_Scroll = 0
    ListMenuContents = Active_Processes
    createAppBar(0)
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create("Process Manager", 0, 1)
    App_Title.setPosition(45, 4)
    ListMenuGUI = microUtilities.createMenuFromArray(Active_Processes)
    ListMenuGUI.setDimensions(160, 97)
    ListMenuGUI.setPosition(80, 58)
    ListMenuGUI.selectedIndex = 1
    ListMenuGUI.z = -30
    reloadListGUI(80, 58, 160, 97, darkMode)
}

