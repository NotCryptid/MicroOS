// MARK: ListGUI Reload Function
// why does this exist twice
function Reload_ListGUI(data: miniMenu.MenuItem[], x: number, y: number, width: number, height: number, destroy: Boolean) {
    if (destroy) {
        ListMenuGUI.destroy()
    }  
    ListMenuGUI = miniMenu.createMenuFromArray(data)
    ListMenuGUI.setButtonEventsEnabled(false)
    ListMenuGUI.setDimensions(width, height)
    ListMenuGUI.setPosition(x, y)
    ListMenuGUI.z = -30
    ListMenuGUI.selectedIndex = -1
}

// MARK: Variable Definitions

let binary: string[] = []
let command_data: string[] = []
let current_command = ""
let command_category = ""
let line = 5
let variables: {[key: string]: string} = {}
let condition_met = ["null"]
let loop_repeats_left: string[] = []
let loop_line: number[] = []
let loop_condition: string[][] = [] // stores condition params for conditional loops (LOP :BLW)
let menu_array: miniMenu.MenuItem[] = []
let menu_data = [80, 58, 160, 97]
let nanoSDK_hover_highlight = false

// WHN (When) registry
// Each entry: [condType, ...condParams, bodyStart, bodyEnd]
// bodyStart = line index of first instruction inside the when block
// bodyEnd   = line index of the 401§e instruction
let when_registry: number[][] = []   // [condType_encoded, ...params, bodyStart, bodyEnd] — we store as a parallel structure
let when_cond_data: string[][] = []  // [condType, param1, param2, ...] for each when
let when_ranges: number[][] = []     // [[bodyStart, bodyEnd], ...] for each when

// MARK: Start Runtime
function Open_NanoSDK_App(app_binary: string) {
    binary = app_binary.split("~")
    close_apps()
    NanoSDK_App_Running = true
    App_Open = binary[0]
    SubMenu = binary[2]
    createAppBar()
    Close_App = sprites.create(assets.image`Close`, SpriteKind.App_UI)
    Close_App.setPosition(156, 5)
    App_Title = textsprite.create(binary[0], 0, 1)
    App_Title.setPosition(parseInt(binary[3]), 4)

    command_data = []
    current_command = ""
    command_category = ""
    line = 5
    variables = {}
    condition_met = ["null"]
    loop_repeats_left = []
    loop_line = []
    loop_condition = []
    menu_array = []
    menu_data = [80, 58, 160, 97]
    nanoSDK_hover_highlight = false
    when_cond_data = []
    when_ranges = []
}

// MARK: When Condition Check
// Returns true if a registered when's condition is currently met
function nanoSDK_check_when(idx: number): boolean {
    let cond = when_cond_data[idx]
    let ctype = cond[0]

    // MARK: When Button
    if (ctype == "b") {
        let down = false
        let btn = cond[1]
        if (btn == "a") down = controller.A.isPressed()
        else if (btn == "b") down = controller.B.isPressed()
        else if (btn == "u") down = controller.up.isPressed()
        else if (btn == "d") down = controller.down.isPressed()
        else if (btn == "l") down = controller.left.isPressed()
        else if (btn == "r") down = controller.right.isPressed()
        return cond[2] == "t" ? down : !down
    }

    // MARK: When Variable
    if (ctype == "v") {
        let val = variables[cond[1]] != null ? variables[cond[1]] : cond[1]
        let target = cond[3]
        let op = cond[2]
        if (op == "=")  return val == target
        if (op == ">")  return parseFloat(val) > parseFloat(target)
        if (op == "<")  return parseFloat(val) < parseFloat(target)
        if (op == "≥") return parseFloat(val) >= parseFloat(target)
        if (op == "≤") return parseFloat(val) <= parseFloat(target)
    }

    // MARK: When ListGUI Select
    if (ctype == "sel") {
        let targetIdx = parseInt(cond[1]) - 1
        return ListMenuGUI.selectedIndex == targetIdx
    }

    return false
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
    if (line > binary.length) {
        if (when_cond_data.length == 0) {
            NanoSDK_App_Running = false
        }
        // Check all registered whens
        for (let wi = 0; wi < when_cond_data.length; wi++) {
            if (nanoSDK_check_when(wi)) {
                when_exec_idx = wi
                when_exec_line = when_ranges[wi][0]
                return
            }
        }
        return
    }

    // MARK: Main Execution
    nanoSDK_run_line()

    // After main execution also check whens (for IFB-wrapped whens mid-program)
    if (NanoSDK_App_Running && when_cond_data.length > 0) {
        for (let wi = 0; wi < when_cond_data.length; wi++) {
            if (nanoSDK_check_when(wi)) {
                when_exec_idx = wi
                when_exec_line = when_ranges[wi][0]
                return
            }
        }
    }
}

function nanoSDK_run_line() {
    if (line > binary.length) { return }

    command_data = binary[line - 1].split("§")
    let raw_cmd = command_data[0]
    command_category = raw_cmd.charAt(0)
    current_command = raw_cmd.charAt(1) + raw_cmd.charAt(2)
    line++

    // MARK: IFB End early pop (before condition check so nested brackets close correctly)
    if (command_category == "2" && command_data[1] == "e") {
        condition_met.pop()
        return
    }

    // MARK: Condition Gate
    if (condition_met[condition_met.length - 1] == "false") {
        // Still need to track nested IFB opens so we can pop correctly
        if (command_category == "2" && current_command == "01" && command_data[1] != "e" && command_data[1] != "l") {
            condition_met.push("skip") // nested bracket inside false block
        }
        if (command_category == "2" && command_data[1] == "l") {
            // els flips the condition
            if (condition_met[condition_met.length - 1] == "true") {
                condition_met[condition_met.length - 1] = "false"
            } else if (condition_met[condition_met.length - 1] == "false") {
                condition_met[condition_met.length - 1] = "true"
            }
        }
        return
    }
    if (condition_met[condition_met.length - 1] == "skip") { return }

    switch (command_category) {

        // MARK: Basic Commands
        case "1":
            if (current_command == "05") {
                game.splash(command_data[1])
            } else if (current_command == "06") {
                close_apps()
                if (command_data[1] && command_data[1] != "") {
                    game.splash(command_data[1])
                }
            } else if (current_command == "07") {
                // ASM mid-code submenu change
                SubMenu = command_data[1]
            } else {
                error(301)
            }
            break

        // MARK: Logic
        case "2":
            if (current_command == "01") {
                // MARK: IFB
                condition_met.push("false")
                let action = command_data[1]

                if (action == "l") {
                    // IFB els — flip top condition
                    condition_met.pop()
                    let top = condition_met[condition_met.length - 1]
                    condition_met[condition_met.length - 1] = top == "true" ? "false" : "true"
                } else if (action == "v") {
                    // IFB var
                    let lhs = variables[command_data[2]] != null ? variables[command_data[2]] : command_data[2]
                    let rhs = command_data[4]
                    let met = false
                    if (command_data[3] == "=")  met = lhs == rhs
                    if (command_data[3] == ">")  met = parseFloat(lhs) > parseFloat(rhs)
                    if (command_data[3] == "<")  met = parseFloat(lhs) < parseFloat(rhs)
                    if (command_data[3] == "≥") met = parseFloat(lhs) >= parseFloat(rhs)
                    if (command_data[3] == "≤") met = parseFloat(lhs) <= parseFloat(rhs)
                    if (met) { condition_met[condition_met.length - 1] = "true" }
                } else if (action == "b") {
                    // IFB btn
                    let down = false
                    if (command_data[2] == "a") down = controller.A.isPressed()
                    else if (command_data[2] == "b") down = controller.B.isPressed()
                    else if (command_data[2] == "u") down = controller.up.isPressed()
                    else if (command_data[2] == "d") down = controller.down.isPressed()
                    else if (command_data[2] == "l") down = controller.left.isPressed()
                    else if (command_data[2] == "r") down = controller.right.isPressed()
                    let met = command_data[3] == "t" ? down : !down
                    if (met) { condition_met[condition_met.length - 1] = "true" }
                } else if (action == "s") {
                    // IFB spr — stub
                }
                // "e" already handled above
            } else if (current_command == "02") {
                // MARK: Loop
                if (command_data[1] == "e") {
                    // Loop end — check condition or decrement
                    let cond = loop_condition[loop_condition.length - 1]
                    if (cond && cond.length > 0) {
                        // Conditional loop (LOP :BLW) — re-evaluate condition
                        let met = false
                        if (cond[0] == "b") {
                            let down = false
                            if (cond[1] == "a") down = controller.A.isPressed()
                            else if (cond[1] == "b") down = controller.B.isPressed()
                            else if (cond[1] == "u") down = controller.up.isPressed()
                            else if (cond[1] == "d") down = controller.down.isPressed()
                            else if (cond[1] == "l") down = controller.left.isPressed()
                            else if (cond[1] == "r") down = controller.right.isPressed()
                            met = cond[2] == "t" ? down : !down
                        } else if (cond[0] == "v") {
                            let lhs = variables[cond[1]] != null ? variables[cond[1]] : cond[1]
                            let rhs = cond[3]
                            if (cond[2] == "=")  met = lhs == rhs
                            if (cond[2] == ">")  met = parseFloat(lhs) > parseFloat(rhs)
                            if (cond[2] == "<")  met = parseFloat(lhs) < parseFloat(rhs)
                            if (cond[2] == "≥") met = parseFloat(lhs) >= parseFloat(rhs)
                            if (cond[2] == "≤") met = parseFloat(lhs) <= parseFloat(rhs)
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
                    let depth = 1
                    while (line <= binary.length && depth > 0) {
                        let ld = binary[line - 1].split("§")
                        if (ld[0] == "202" && ld[1] != "e" && ld[1] != "x") depth++
                        if (ld[0] == "202" && ld[1] == "e") depth--
                        line++
                    }
                } else {
                    // Loop start — check if this is a conditional loop (command_data[1] == "BLW")
                    // Conditional loops are stored as 202§BLW§condType§...params
                    if (command_data[1] == "BLW") {
                        loop_repeats_left.push("inf")
                        loop_line.push(line)
                        loop_condition.push(command_data.slice(2))
                    } else {
                        loop_repeats_left.push(command_data[1])
                        loop_line.push(line)
                        loop_condition.push([])
                    }
                }
            }
            break

        // MARK: When
        case "4":
            if (current_command == "01") {
                if (command_data[1] == "e") {
                    // WHN end — nothing to do during registration pass,
                    // but during when-body execution this signals end (handled by when_exec_line > range[1])
                } else {
                    // Register a new when
                    // Find the matching 401§e to get the body range
                    let bodyStart = line // line after WHN declaration
                    let depth = 1
                    let scanLine = line
                    while (scanLine <= binary.length && depth > 0) {
                        let ld = binary[scanLine - 1].split("§")
                        if (ld[0].charAt(0) == "4" && ld[0].charAt(1) + ld[0].charAt(2) == "01" && ld[1] != "e") depth++
                        if (ld[0].charAt(0) == "4" && ld[0].charAt(1) + ld[0].charAt(2) == "01" && ld[1] == "e") depth--
                        scanLine++
                    }
                    let bodyEnd = scanLine - 2 // line of 401§e (0-indexed into binary means scanLine-1, but we want before it)
                    // Skip past the whole when block during main execution
                    line = scanLine

                    // Store cond data: type + params
                    let cdata = command_data.slice(1) // [condType, ...params]
                    when_cond_data.push(cdata)
                    when_ranges.push([bodyStart, bodyEnd])
                }
            }
            break

        // MARK: ListGUI
        case "3":
            if (current_command == "01") {
                Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], false)
            } else if (current_command == "02") {
                menu_data[0] = parseInt(command_data[1])
                menu_data[1] = parseInt(command_data[2])
                if (ListMenuGUI) { ListMenuGUI.setPosition(menu_data[0], menu_data[1]) }
            } else if (current_command == "03") {
                menu_data[2] = parseInt(command_data[1])
                menu_data[3] = parseInt(command_data[2])
                if (ListMenuGUI) { ListMenuGUI.setDimensions(menu_data[2], menu_data[3]) }
            } else if (current_command == "04") {
                menu_array = []
                for (let i = 1; i < command_data.length; i++) {
                    menu_array.push(miniMenu.createMenuItem(command_data[i]))
                }
                Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
            } else if (current_command == "05") {
                menu_array[parseInt(command_data[1])] = miniMenu.createMenuItem(command_data[2])
                Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
            } else if (current_command == "06") {
                variables[command_data[2]] = menu_array[parseInt(command_data[1])].text
            } else if (current_command == "07") {
                menu_array.splice(parseInt(command_data[1]), 1)
                Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
            } else if (current_command == "08") {
                menu_array = []
                ListMenuGUI.destroy()
            } else if (current_command == "09") {
                if (command_data[1] == "o") {
                    nanoSDK_hover_highlight = false
                    ListMenuGUI.selectedIndex = -1
                } else if (command_data[1] == "a") {
                    nanoSDK_hover_highlight = true
                } else {
                    ListMenuGUI.selectedIndex = parseInt(command_data[1])
                }
            } else {
                error(301)
            }
            break
    }
}