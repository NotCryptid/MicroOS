// MARK: ListGUI Reload Function
// why does this exist twice
function Reload_ListGUI(data: microUtilities.MenuItem[], x: number, y: number, width: number, height: number, destroy: Boolean) {
    if (destroy && !isDestroyed(ListMenuGUI)) {
        ListMenuGUI.destroy()
    }
    ListMenuGUI = microUtilities.createMenuFromArray(data)
    ListMenuGUI.setDimensions(width, height)
    ListMenuGUI.setPosition(x, y)
    ListMenuGUI.z = -30
    nanoSDK_apply_theme(nanoSDK_theme)
    nanoSDK_apply_scrollbar(nanoSDK_scrollbar)
}

// MARK: ListGUI Theme
function nanoSDK_apply_theme(mode: string) {
    let dark = mode == "d" || (mode == "m" && darkMode)
    ListMenuGUI.setColors(dark ? 1 : 15, dark ? 15 : 1, dark ? 15 : 1, dark ? 1 : 15)
}

// MARK: App Bar Theme
// Keeps the app's background in sync with the ListGUI's own theme (set via
// LGT), rather than the fixed light background NanoSDK apps used to open
// with regardless of theme.
function nanoSDK_apply_app_bar() {
    let dark = nanoSDK_theme == "d" || (nanoSDK_theme == "m" && darkMode)
    createAppBar(dark ? 15 : 1)
}

// MARK: ListGUI Visible Rows
function nanoSDK_visible_rows(): number {
    return Math.max(1, Math.floor(menu_data[3] / 12))
}

// MARK: ListGUI Scroll Bar
// SimpleMenu (MicroUtilities) has no built-in scroll indicator, so this
// reuses the OS's fixed-position scrollbar + arrow sprites instead. They're
// anchored at x=156, which is why the "scl" CLG preset narrows the list box
// to leave room for them.
function nanoSDK_apply_scrollbar(enabled: boolean) {
    if (!enabled) {
        if (!isDestroyed(scrollBar)) { scrollBar.destroy() }
        if (!isDestroyed(scrollBarRond)) { scrollBarRond.destroy() }
        if (!isDestroyed(ArrowUp)) { ArrowUp.destroy() }
        if (!isDestroyed(ArrowDown)) { ArrowDown.destroy() }
        return
    }
    if (isDestroyed(scrollBar)) { createScrollBarSprites() }
    if (isDestroyed(ArrowUp)) { createArrows() }
    let dark = nanoSDK_theme == "d" || (nanoSDK_theme == "m" && darkMode)
    updateScrollBar(nanoSDK_visible_rows(), dark)
}

// MARK: ListGUI Window Rebuild
// NanoSDK's menu_array is the full logical list (what LGV/LGS/LGR index
// into); ListMenuContents/ListMenuGUIHidden/List_Scroll are the shared OS
// scroll-window globals reused here so the generic arrow-click/wheel/drag
// scroll handlers (input.ts) work for NanoSDK lists too.
function nanoSDK_rebuild_list_window(preserveScroll: boolean) {
    let visible = nanoSDK_visible_rows()
    if (!preserveScroll) { List_Scroll = 0 }
    let maxScroll = Math.max(0, menu_array.length - visible)
    List_Scroll = Math.max(0, Math.min(List_Scroll, maxScroll))
    ListMenuGUIHidden = menu_array.slice(0, List_Scroll)
    ListMenuContents = menu_array.slice(List_Scroll)
    Reload_ListGUI(ListMenuContents, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
}

// MARK: Variable Definitions

let program: string[][] = []   // decoded app body, one [CMD, ...args] per instruction
let command_data: string[] = []
let line = 0                   // 0-based index into program
let variables: {[key: string]: string} = {}
let condition_met = ["null"]
let loop_repeats_left: string[] = []
let loop_line: number[] = []
let loop_condition: string[][] = [] // stores condition params for conditional loops (LOP :BLW)
let menu_array: microUtilities.MenuItem[] = []
let menu_data = [80, 58, 160, 97]
let nanoSDK_hover_highlight = false
let nanoSDK_clicked_row = -1   // row clicked since last WHN sel check (-1 = none)
let nanoSDK_theme = "m"
let nanoSDK_scrollbar = false

// WHN (When) registry
// bodyStart = program index of first instruction inside the when block
// bodyEnd   = program index of the last instruction inside the when block
let when_cond_data: string[][] = []  // [condType, param1, param2, ...] for each when
let when_ranges: number[][] = []     // [[bodyStart, bodyEnd], ...] for each when
let when_lines: number[] = []        // program index of each registered WHN, so a WHN inside a loop registers only once

// MARK: DAI Icon Decoding
// Icon pixel data is baked into the package at packaging time (see
// nsc_compile_icon in packager.ts) as a flat string of hex nibbles, one per
// pixel, row-major, matching the Write-app icon-asset palette. "default"
// (or anything malformed) falls back to the built-in icon below.
const NANO_SDK_DEFAULT_ICON = "0AAAABB0AA1AB1B3AA11B133AA11B133AB1B1132BB131122BB13312203332220"

function nanoSDK_decode_icon(hex: string, size: number = 8): Image {
    let source = (hex == null || hex == "" || hex.toLowerCase() == "default") ? NANO_SDK_DEFAULT_ICON : hex
    let img = image.create(size, size)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let idx = y * size + x
            let ch = idx < source.length ? source.charAt(idx) : "0"
            let val = parseInt(ch, 16)
            img.setPixel(x, y, isNaN(val) ? 0 : val)
        }
    }
    return img
}

// MARK: Source Decoder
// Turns packaged source lines (see package_nanosdk_code) into program
// entries of the form [CMD, ...args], once, when the app opens. Aliases are
// normalised here (eql -> "=", btna -> "a", ...) so the executor stays simple.
// Every index in NanoSDK (LGS, LGV, LGR, LGH, WHN sel) is 0-based.
function nanoSDK_decode(src: string[]): string[][] {
    // :BLW joins a line with the one below it (except LOP :BLW, whose
    // condition line is consumed by the LOP case below)
    let lines: string[] = []
    let i = 0
    while (i < src.length) {
        let l = src[i].trim()
        if (l == "") { i++; continue }
        if (l.toUpperCase() != "LOP :BLW" && l.length > 4 && l.substr(l.length - 4).toUpperCase() == ":BLW") {
            let base = l.substr(0, l.length - 4).trim()
            i++
            while (i < src.length && src[i].trim() == "") { i++ }
            lines.push(i < src.length ? base + " " + src[i++].trim() : base)
        } else { lines.push(l); i++ }
    }

    let out: string[][] = []
    let lgoN = 0
    let lgoA: string[] = []

    for (let li = 0; li < lines.length; li++) {
        let l = lines[li]

        if (lgoN > 0) {
            lgoA.push(l); lgoN--
            if (lgoN == 0) { out.push(["LGO"].concat(lgoA)); lgoA = [] }
            continue
        }

        let tk = nsc_tokens(l)
        if (tk.length == 0) { continue }
        let cmd = tk[0].toUpperCase()
        let a = tk.slice(1)

        switch (cmd) {
            case "PRN":
            case "END":
            case "ASM": out.push([cmd, a.join(" ")]); continue

            case "IFB":
            case "WHN": {
                if (a.length == 0) { break }
                switch (a[0].toLowerCase()) {
                    case "end": out.push([cmd, "e"]); continue
                    case "els": if (cmd == "IFB") { out.push(["IFB", "l"]); continue }; break
                    case "var": if (a.length < 3) { break }
                        out.push([cmd, "v", a[1], nsc_cmp(a[2]), a.slice(3).join(" ")]); continue
                    case "btn": if (a.length < 3) { break }
                        out.push([cmd, "b", nsc_btn(a[1]), nsc_bs(a[2])]); continue
                    case "spr": if (a.length < 3) { break }
                        out.push([cmd, "s", a[1], a[2].toLowerCase() == "tch" ? "tch" : nsc_cmp(a[2]), a.slice(3).join(" ")]); continue
                    case "sel": if (cmd == "WHN" && a.length >= 2) { out.push(["WHN", "sel", a[1]]); continue }
                }
                break
            }

            case "LOP": {
                let p = a.length > 0 ? a[0].toLowerCase() : ""
                switch (p) {
                    case "end": out.push(["LOP", "e"]); continue
                    case "ext": out.push(["LOP", "x"]); continue
                    case "inf": out.push(["LOP", "inf"]); continue
                    case ":blw": {
                        // next line is the condition (IFB btn/var/spr)
                        li++
                        let before = out.length
                        if (li < lines.length) {
                            let ctk = nsc_tokens(lines[li])
                            let cac = ctk.length > 1 ? ctk[1].toLowerCase() : ""
                            let ca = ctk.slice(2)
                            switch (cac) {
                                case "btn": if (ca.length >= 2) { out.push(["LOP", "BLW", "b", nsc_btn(ca[0]), nsc_bs(ca[1])]) }; break
                                case "var": if (ca.length >= 2) { out.push(["LOP", "BLW", "v", ca[0], nsc_cmp(ca[1]), ca.slice(2).join(" ")]) }; break
                                case "spr": if (ca.length >= 2) { out.push(["LOP", "BLW", "s", ca[0], ca[1].toLowerCase() == "tch" ? "tch" : nsc_cmp(ca[1]), ca.slice(2).join(" ")]) }; break
                            }
                        }
                        if (out.length == before) { out.push(["NOP"]) } // missing/invalid condition
                        continue
                    }
                    default: {
                        let n = parseInt(p)
                        // not a number: invalid (error 301)
                        out.push(isNaN(n) ? ["NOP"] : ["LOP", n.toString()]); continue
                    }
                }
            }

            case "CLG": {
                let p = a.length > 0 ? a[0].toLowerCase() : ""
                out.push(["CLG", p == "ful" ? "f" : p == "scl" ? "s" : ""]); continue
            }
            case "LGP":
            case "LGD": if (a.length < 2) { break }
                out.push([cmd, a[0], a[1]]); continue
            case "LGO": if (a.length < 1) { break }
                lgoN = parseInt(a[0])
                if (isNaN(lgoN)) { lgoN = 0; break }
                lgoA = []; continue
            case "LGS": if (a.length < 1) { break }
                out.push(["LGS", a[0], a.slice(1).join(" ")]); continue
            case "LGV": if (a.length < 2) { break }
                out.push(["LGV", a[0], a[1]]); continue
            case "LGR": if (a.length < 1) { break }
                out.push(["LGR", a[0]]); continue
            case "DLG": out.push(["DLG"]); continue
            case "LGH": {
                if (a.length < 1) { break }
                let m = a[0].toLowerCase()
                out.push(["LGH", m == "off" ? "o" : m == "auto" ? "a" : parseInt(m).toString()]); continue
            }
            case "LGT": if (a.length < 1) { break }
                out.push(["LGT", a[0].toLowerCase()]); continue
            case "LSB": if (a.length < 1) { break }
                out.push(["LSB", a[0].toLowerCase() == "on" ? "t" : "f"]); continue

            case "DVR":
            case "SVR": if (a.length < 2) { break }
                out.push([cmd, a[0], a[1]]); continue
            case "VRM": if (a.length < 3) { break }
                out.push(["VRM", a[0], nsc_op(a[1]), a[2]]); continue
            case "VCJ": if (a.length < 1) { break }
                out.push(["VCJ", a[0], a.slice(1).join(" ")]); continue
        }

        out.push(["NOP"]) // unknown or malformed command (reported as error 301)
    }
    if (lgoN > 0) { out.push(["NOP"]) } // LGO promised more lines than the app has
    return out
}

// MARK: Program Validation
// The decoder marks every invalid command as NOP. Used when packaging and
// when opening an app: any NOP means error 301.
function nanoSDK_program_valid(p: string[][]): boolean {
    for (let i = 0; i < p.length; i++) {
        if (p[i][0] == "NOP") { return false }
    }
    return true
}

// MARK: Start Runtime
function Open_NanoSDK_App(app_binary: string) {
    let binary = app_binary.split("~")
    program = nanoSDK_decode(binary.slice(4))
    if (!nanoSDK_program_valid(program)) {
        softerror(301)
        return
    }
    close_apps()
    NanoSDK_App_Running = true
    App_Open = binary[0]
    SubMenu = binary[2]
    if (!isDestroyed(NanoSDK_Taskbar_Icon)) {
        NanoSDK_Taskbar_Icon.destroy()
    }
    NanoSDK_Taskbar_Icon = sprites.create(nanoSDK_decode_icon(binary[1]), SpriteKind.Desktop_UI)
    NanoSDK_Taskbar_Icon.setPosition(92, 111)
    NanoSDK_Taskbar_Name = binary[0]

    command_data = []
    line = 0
    variables = {}
    condition_met = ["null"]
    loop_repeats_left = []
    loop_line = []
    loop_condition = []
    menu_array = []
    menu_data = [80, 58, 160, 97]
    nanoSDK_hover_highlight = false
    nanoSDK_clicked_row = -1
    nanoSDK_theme = "m"
    nanoSDK_scrollbar = false
    when_cond_data = []
    when_ranges = []
    when_lines = []

    nanoSDK_apply_app_bar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create(binary[0], 0, 1)
    App_Title.setPosition(parseInt(binary[3]), 4)
}

// MARK: Variable String/Value Resolution
// !VAR! embedded inside a larger string is replaced with that variable's value.
// A value that is *only* a variable reference doesn't need the closing "!"
// (e.g. "!score" or "!score!" both work when the whole argument is the reference).
function nanoSDK_resolve_vars(str: string): string {
    if (str == null || str.indexOf("!") == -1) { return str }

    if (str.charAt(0) == "!") {
        let rest = str.substr(1)
        let bang = rest.indexOf("!")
        if (bang == -1 || bang == rest.length - 1) {
            let name = bang == -1 ? rest : rest.substr(0, bang)
            return variables[name] != null ? variables[name] : str
        }
    }

    let result = ""
    let i = 0
    while (i < str.length) {
        if (str.charAt(i) == "!") {
            let end = str.indexOf("!", i + 1)
            if (end > i) {
                let name = str.substr(i + 1, end - (i + 1))
                result += variables[name] != null ? variables[name] : str.substr(i, end + 1 - i)
                i = end + 1
                continue
            }
        }
        result += str.charAt(i)
        i++
    }
    return result
}

// MARK: When Condition Check
// Returns true if a registered when's condition is currently met
function nanoSDK_check_when(idx: number): boolean {
    let cond = when_cond_data[idx]
    let ctype = cond[0]

    switch (ctype) {
        // MARK: When Button
        case "b": {
            let down = false
            let btn = cond[1]
            switch (btn) {
                case "a": down = controller.A.isPressed(); break
                case "b": down = controller.B.isPressed(); break
                case "u": down = controller.up.isPressed(); break
                case "d": down = controller.down.isPressed(); break
                case "l": down = controller.left.isPressed(); break
                case "r": down = controller.right.isPressed(); break
            }
            return cond[2] == "t" ? down : !down
        }

        // MARK: When Variable
        case "v": {
            let val = variables[cond[1]] != null ? variables[cond[1]] : cond[1]
            let target = nanoSDK_resolve_vars(cond[3])
            let op = cond[2]
            switch (op) {
                case "=": return val == target
                case ">": return parseFloat(val) > parseFloat(target)
                case "<": return parseFloat(val) < parseFloat(target)
                case "≥": return parseFloat(val) >= parseFloat(target)
                case "≤": return parseFloat(val) <= parseFloat(target)
            }
            break
        }

        // MARK: When ListGUI Select
        case "sel": {
            // Edge-triggered: fires once per click on the row, not while hovering
            let targetIdx = parseInt(cond[1])
            if (nanoSDK_clicked_row == targetIdx) {
                nanoSDK_clicked_row = -1
                return true
            }
            return false
        }
    }

    return false
}

// MARK: When Poll
// Starts the body of the first registered when whose condition is met.
// Returns true if one was started.
function nanoSDK_poll_whens(): boolean {
    for (let wi = 0; wi < when_cond_data.length; wi++) {
        if (nanoSDK_check_when(wi)) {
            when_exec_idx = wi
            when_exec_line = when_ranges[wi][0]
            return true
        }
    }
    return false
}

// MARK: Loop Skip
// Moves line past the LOP end matching a loop whose start was just read.
function nanoSDK_skip_loop() {
    let depth = 1
    while (line < program.length && depth > 0) {
        let ld = program[line]
        if (ld[0] == "LOP" && ld[1] != "e" && ld[1] != "x") { depth++ }
        if (ld[0] == "LOP" && ld[1] == "e") { depth-- }
        line++
    }
}

// MARK: When Body Execution
// Runs one line of a when body and returns whether to keep executing it
let when_exec_idx = -1   // which when is currently mid-execution (-1 = none)
let when_exec_line = 0   // current line within that when body

// MARK: Runtime
function executeNanoSDKLine() {
    // MARK: When Body Execution Step
    // If we're mid-way through executing a when body, continue it
    if (when_exec_idx >= 0) {
        let range = when_ranges[when_exec_idx]
        if (when_exec_line > range[1]) {
            // Done with this when body
            when_exec_idx = -1
            return
        }
        // Execute one line of the when body
        let saved_line = line
        line = when_exec_line
        nanoSDK_run_line()
        when_exec_line = line
        line = saved_line
        return
    }

    // MARK: When Check
    // When app has finished main execution, only when checks keep it alive
    if (line >= program.length) {
        if (when_cond_data.length == 0) {
            NanoSDK_App_Running = false
        }
        nanoSDK_poll_whens()
        return
    }

    // MARK: Main Execution
    nanoSDK_run_line()

    // After main execution also check whens (for IFB-wrapped whens mid-program)
    if (NanoSDK_App_Running && when_cond_data.length > 0) {
        nanoSDK_poll_whens()
    }
}

function nanoSDK_run_line() {
    if (line >= program.length) { return }

    command_data = program[line]
    let cmd = command_data[0]
    line++

    // MARK: IFB End early pop (before condition check so nested brackets close correctly)
    if (cmd == "IFB" && command_data[1] == "e") {
        condition_met.pop()
        return
    }

    // MARK: Condition Gate
    if (condition_met[condition_met.length - 1] == "false") {
        // Still need to track nested IFB opens so we can pop correctly
        if (cmd == "IFB" && command_data[1] != "e" && command_data[1] != "l") {
            condition_met.push("skip") // nested bracket inside false block
        }
        if (cmd == "IFB" && command_data[1] == "l") {
            // els flips the condition
            if (condition_met[condition_met.length - 1] == "true") {
                condition_met[condition_met.length - 1] = "false"
            } else if (condition_met[condition_met.length - 1] == "false") {
                condition_met[condition_met.length - 1] = "true"
            }
        }
        return
    }
    if (condition_met[condition_met.length - 1] == "skip") {
        // brackets nested deeper inside a skipped one must be tracked too,
        // otherwise their IFB end pops the wrong entry
        if (cmd == "IFB" && command_data[1] != "e" && command_data[1] != "l") {
            condition_met.push("skip")
        }
        return
    }

    switch (cmd) {

        // MARK: Basic Commands
        case "PRN":
            NanoSDK_App_Running = false
            game.splash(nanoSDK_resolve_vars(command_data[1]))
            NanoSDK_App_Running = true
            break
        case "END":
            close_apps()
            if (command_data[1] && command_data[1] != "") {
                game.splash(nanoSDK_resolve_vars(command_data[1]))
            }
            break
        case "ASM":
            // mid-code submenu change
            SubMenu = command_data[1]
            break

        // MARK: Logic
        case "IFB": {
            {
                // MARK: IFB
                condition_met.push("false")
                let action = command_data[1]

                switch (action) {
                    case "l": {
                        // IFB els — flip top condition
                        condition_met.pop()
                        let top = condition_met[condition_met.length - 1]
                        condition_met[condition_met.length - 1] = top == "true" ? "false" : "true"
                        break
                    }
                    case "v": {
                        // IFB var
                        let lhs = variables[command_data[2]] != null ? variables[command_data[2]] : command_data[2]
                        let rhs = nanoSDK_resolve_vars(command_data[4])
                        let met = false
                        switch (command_data[3]) {
                            case "=": met = lhs == rhs; break
                            case ">": met = parseFloat(lhs) > parseFloat(rhs); break
                            case "<": met = parseFloat(lhs) < parseFloat(rhs); break
                            case "≥": met = parseFloat(lhs) >= parseFloat(rhs); break
                            case "≤": met = parseFloat(lhs) <= parseFloat(rhs); break
                        }
                        if (met) { condition_met[condition_met.length - 1] = "true" }
                        break
                    }
                    case "b": {
                        // IFB btn
                        let down = false
                        switch (command_data[2]) {
                            case "a": down = controller.A.isPressed(); break
                            case "b": down = controller.B.isPressed(); break
                            case "u": down = controller.up.isPressed(); break
                            case "d": down = controller.down.isPressed(); break
                            case "l": down = controller.left.isPressed(); break
                            case "r": down = controller.right.isPressed(); break
                        }
                        let met = command_data[3] == "t" ? down : !down
                        if (met) { condition_met[condition_met.length - 1] = "true" }
                        break
                    }
                    case "s":
                        // IFB spr — stub
                        break
                }
                // "e" already handled above
            }
            break
        }

        // MARK: Loop
        case "LOP": {
            {
                if (command_data[1] == "e") {
                    // Loop end — check condition or decrement
                    let cond = loop_condition[loop_condition.length - 1]
                    if (cond && cond.length > 0) {
                        // Conditional loop (LOP :BLW) — re-evaluate condition
                        let met = false
                        switch (cond[0]) {
                            case "b": {
                                let down = false
                                switch (cond[1]) {
                                    case "a": down = controller.A.isPressed(); break
                                    case "b": down = controller.B.isPressed(); break
                                    case "u": down = controller.up.isPressed(); break
                                    case "d": down = controller.down.isPressed(); break
                                    case "l": down = controller.left.isPressed(); break
                                    case "r": down = controller.right.isPressed(); break
                                }
                                met = cond[2] == "t" ? down : !down
                                break
                            }
                            case "v": {
                                let lhs = variables[cond[1]] != null ? variables[cond[1]] : cond[1]
                                let rhs = nanoSDK_resolve_vars(cond[3])
                                switch (cond[2]) {
                                    case "=": met = lhs == rhs; break
                                    case ">": met = parseFloat(lhs) > parseFloat(rhs); break
                                    case "<": met = parseFloat(lhs) < parseFloat(rhs); break
                                    case "≥": met = parseFloat(lhs) >= parseFloat(rhs); break
                                    case "≤": met = parseFloat(lhs) <= parseFloat(rhs); break
                                }
                                break
                            }
                        }
                        if (met) {
                            line = loop_line[loop_line.length - 1]
                        } else {
                            loop_line.pop()
                            loop_repeats_left.pop()
                            loop_condition.pop()
                        }
                    } else if (loop_repeats_left[loop_repeats_left.length - 1] == "inf") {
                        line = loop_line[loop_line.length - 1]
                    } else if (loop_repeats_left[loop_repeats_left.length - 1] !== "0") {
                        line = loop_line[loop_line.length - 1]
                        loop_repeats_left[loop_repeats_left.length - 1] = (parseInt(loop_repeats_left[loop_repeats_left.length - 1]) - 1).toString()
                    } else {
                        loop_line.pop()
                        loop_repeats_left.pop()
                        loop_condition.pop()
                    }
                } else if (command_data[1] == "x") {
                    // LOP EXT — exit current loop by popping and jumping past end
                    // Find the matching loop end and jump past it
                    loop_line.pop()
                    loop_repeats_left.pop()
                    loop_condition.pop()
                    nanoSDK_skip_loop()
                } else {
                    // Loop start — check if this is a conditional loop (command_data[1] == "BLW")
                    // Conditional loops are decoded as [LOP, BLW, condType, ...params]
                    if (command_data[1] == "BLW") {
                        loop_repeats_left.push("inf")
                        loop_line.push(line)
                        loop_condition.push(command_data.slice(2))
                    } else if (command_data[1] == "0") {
                        // LOP 0 ignores the loop entirely
                        nanoSDK_skip_loop()
                    } else {
                        loop_repeats_left.push(command_data[1])
                        loop_line.push(line)
                        loop_condition.push([])
                    }
                }
            }
            break
        }

        // MARK: When
        case "WHN": {
            {
                if (command_data[1] == "e") {
                    // WHN end — nothing to do during registration pass,
                    // but during when-body execution this signals end (handled by when_exec_line > range[1])
                } else {
                    // A WHN inside a loop is reached again on every pass:
                    // only register it the first time, then just skip it
                    let whenIdx = when_lines.indexOf(line - 1)
                    if (whenIdx >= 0) {
                        line = when_ranges[whenIdx][1] + 2
                        break
                    }

                    // Register a new when
                    // Find the matching WHN end to get the body range
                    let bodyStart = line // line after WHN declaration
                    let depth = 1
                    let scanLine = line
                    while (scanLine < program.length && depth > 0) {
                        let ld = program[scanLine]
                        if (ld[0] == "WHN" && ld[1] != "e") depth++
                        if (ld[0] == "WHN" && ld[1] == "e") depth--
                        scanLine++
                    }
                    let bodyEnd = scanLine - 2 // last instruction before the matching WHN end
                    // Skip past the whole when block during main execution
                    line = scanLine

                    // Store cond data: type + params
                    let cdata = command_data.slice(1) // [condType, ...params]
                    when_cond_data.push(cdata)
                    when_ranges.push([bodyStart, bodyEnd])
                    when_lines.push(bodyStart - 1)
                }
            }
            break
        }

        // MARK: ListGUI
        case "CLG":
            switch (command_data[1]) {
                case "f": menu_data = [80, 58, 160, 97]; break
                case "s": menu_data = [76, 58, 151, 97]; break
            }
            nanoSDK_rebuild_list_window(false)
            break
        case "LGP":
            menu_data[0] = parseInt(command_data[1])
            menu_data[1] = parseInt(command_data[2])
            if (ListMenuGUI) { ListMenuGUI.setPosition(menu_data[0], menu_data[1]) }
            break
        case "LGD":
            menu_data[2] = parseInt(command_data[1])
            menu_data[3] = parseInt(command_data[2])
            if (ListMenuGUI) { ListMenuGUI.setDimensions(menu_data[2], menu_data[3]) }
            break
        case "LGO":
            menu_array = []
            for (let i = 1; i < command_data.length; i++) {
                menu_array.push(microUtilities.createMenuItem(nanoSDK_resolve_vars(command_data[i])))
            }
            nanoSDK_rebuild_list_window(false)
            break
        case "LGS": {
            let lgsIndex = parseInt(nanoSDK_resolve_vars(command_data[1]))
            if (lgsIndex >= 0 && lgsIndex < menu_array.length) {
                menu_array[lgsIndex] = microUtilities.createMenuItem(nanoSDK_resolve_vars(command_data[2]))
                nanoSDK_rebuild_list_window(true)
            }
            break
            }
        case "LGV": {
            let lgvIndex = parseInt(command_data[1])
            if (lgvIndex >= 0 && lgvIndex < menu_array.length) {
                variables[command_data[2]] = menu_array[lgvIndex].text
            }
            break
            }
        case "LGR":
            menu_array.splice(parseInt(command_data[1]), 1)
            nanoSDK_rebuild_list_window(true)
            break
        case "DLG":
            menu_array = []
            if (!isDestroyed(ListMenuGUI)) { ListMenuGUI.destroy() }
            nanoSDK_apply_scrollbar(false)
            break
        case "LGH":
            switch (command_data[1]) {
                case "o":
                    nanoSDK_hover_highlight = false
                    if (!isDestroyed(ListMenuGUI)) { ListMenuGUI.selectedIndex = -1 }
                    break
                case "a":
                    nanoSDK_hover_highlight = true
                    break
                default:
                    // explicit indexes are absolute; the menu only holds the visible window
                    if (!isDestroyed(ListMenuGUI)) {
                        let sel = parseInt(command_data[1]) - List_Scroll
                        ListMenuGUI.selectedIndex = sel >= 0 && sel < ListMenuContents.length ? sel : -1
                    }
            }
            break
        case "LGT":
            nanoSDK_theme = command_data[1]
            if (ListMenuGUI) { nanoSDK_apply_theme(nanoSDK_theme) }
            nanoSDK_apply_app_bar()
            break
        case "LSB":
            nanoSDK_scrollbar = command_data[1] == "t"
            if (ListMenuGUI) { nanoSDK_apply_scrollbar(nanoSDK_scrollbar) }
            break

        // MARK: Variable Commands
        case "DVR":
        case "SVR":
        case "VRM":
        case "VCJ": {
            let variableDataTemp = command_data[2]
            if (cmd == "VRM") {
                variableDataTemp = command_data[3]
            }
            variableDataTemp = nanoSDK_resolve_vars(variableDataTemp)

            switch (cmd) {
                // Define Variable
                case "DVR":
                    variables[command_data[1]] = variableDataTemp
                    break
                // Set Variable
                case "SVR":
                    variables[command_data[1]] = variableDataTemp
                    break
                // Variable Operation
                case "VRM": {
                    const lhs = parseFloat(variables[command_data[1]])
                    const rhs = parseFloat(variableDataTemp)
                    let operationOutput = 0
                    switch (command_data[2]) {
                        case "a": operationOutput = lhs + rhs; break
                        case "s": operationOutput = lhs - rhs; break
                        case "m": operationOutput = lhs * rhs; break
                        case "d": operationOutput = lhs / rhs; break
                    }
                    variables[command_data[1]] = operationOutput + ""
                    break
                }
                // VCJ — Variable Content Join: var = var + (text or !var!)
                case "VCJ":
                    variables[command_data[1]] = (variables[command_data[1]] != null ? variables[command_data[1]] : "") + variableDataTemp
                    break
            }
            break
        }
    }
}