// MARK: NanoSDK Runtime

// ListGUI Reload Function
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

// Variable definitions and shit

let binary: string[] = []
let command_data = null
let current_command = null
let command_category = null
let line = 5 // Line 5 cuz the first 4 have already ran during app preparation
let variables: {[key: number]: string} = {}
let condition_met = ["null"]
let when_checks: string[] = []
let loop_repeats_left = [""]
let loop_line = [0]
let menu_array: miniMenu.MenuItem[] = []
let menu_data = [80, 58, 160, 97]
let nanoSDK_hover_highlight = false

function Open_NanoSDK_App(app_binary: string) {
    // Prepare app
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

    // Set variables to default
    command_data = null
    current_command = null
    command_category = null
    line = 5 // Line 5 cuz the first 4 have already ran during app preparation
    variables = {}
    condition_met = ["null"]
    when_checks = []
    loop_repeats_left = [""]
    loop_line = [0]
    menu_array = []
    menu_data = [80, 58, 160, 97]
    nanoSDK_hover_highlight = false
}

// Example compiled app for later: test~default~test~12~105§test~301~302§80§58~303§160§97~304§test1§test2§test3§test4~202§inf~201§b§b§t~106§test~201§e~202§e

// Runtime
function executeNanoSDKLine() {
    // Split up command
    command_data = binary[line - 1].split("§")
    current_command = command_data[0].split("")
    command_category = current_command[0]
    current_command = current_command[1] + current_command[2]

    if (line > binary.length && when_checks.length == 0) {} else {
        // Set next line to run
        line++
    }

    // Check for if bracket end
    if (command_category == "2" && command_data[1] == "e") {
        condition_met.pop()
    }

    // Check if bracket conditions met
    if (condition_met[condition_met.length - 1] == "false") {
        // Skip if condition not met
    } else {

        // Continue if conditions met
        switch (command_category) {
            // Basic Commands
            case "1":
                if (current_command == "05") {
                    // Print
                    game.splash(command_data[1])
                } else if (current_command == "06") {
                    // End
                    close_apps()
                    if (command_data !== null) {
                        game.splash(command_data[1])
                    }
                } else {
                    error(301)
                }
                break

            // Logic
            case "2":
                if (current_command == "01") {
                    // If Bracket
                    condition_met.push("false")
                    switch (command_data[1]) {
                        // If Variable
                        case "v":
                            switch (command_data[3]) {
                                case "=":
                                    if (command_data[2] == command_data[4]) {
                                        condition_met[condition_met.length - 1] = "true"
                                    }
                                    break

                                case ">":
                                    if (command_data[2] > command_data[4]) {
                                        condition_met[condition_met.length - 1] = "true"
                                    }
                                    break

                                case "<":
                                    if (command_data[2] < command_data[4]) {
                                        condition_met[condition_met.length - 1] = "true"
                                    }
                                    break

                                case "≥":
                                    if (command_data[2] >= command_data[4]) {
                                        condition_met[condition_met.length - 1] = "true"
                                    }
                                    break

                                case "≤":
                                    if (command_data[2] <= command_data[4]) {
                                        condition_met[condition_met.length - 1] = "true"
                                    }
                                    break
                            }
                            break

                        // If Sprite
                        case "s":
                            // I'll do this later
                            break

                        // If Button
                        case "b":
                            let button_down = false
                            switch (command_data[2]) {
                                case "a":
                                    if (controller.A.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                case "b":
                                    if (controller.B.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                case "u":
                                    if (controller.up.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                case "d":
                                    if (controller.down.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                case "l":
                                    if (controller.left.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                case "r":
                                    if (controller.right.isPressed()) {
                                        button_down = true
                                    }
                                    break

                                default:
                                    error(302)
                                    break
                            }

                            if (command_data[3] == "t") {
                                if (button_down) {
                                    condition_met[condition_met.length - 1] = "true"
                                }
                            } else if (command_data[3] == "f") {
                                if (!button_down) {
                                    condition_met[condition_met.length - 1] = "true"
                                }
                            } else {
                                error(302)
                            }
                            break

                        // If End
                        case "e":
                            condition_met.pop()
                            break

                        // If Else
                        case "l":
                            if (condition_met[condition_met.length - 1] == "true") {
                                condition_met[condition_met.length - 1] = "false"
                            } else {
                                condition_met[condition_met.length - 1] = "true"
                            }
                            break

                        default:
                            error(301)
                            break
                    }
                } else if (current_command == "02") {
                    // Loop
                    if (command_data[1] == "e") {
                        if (loop_repeats_left[loop_repeats_left.length - 1] == "inf") {
                            line = loop_line[loop_repeats_left.length - 1]
                        } else if (loop_repeats_left[loop_repeats_left.length - 1] !== "0") {
                            line = loop_line[loop_repeats_left.length - 1]
                            loop_repeats_left[loop_repeats_left.length - 1] = (parseInt(loop_repeats_left[loop_repeats_left.length - 1]) - 1).toString()
                        } else {
                            loop_line.pop()
                            loop_repeats_left.pop()
                        }
                    } else {
                        loop_repeats_left.push(command_data[1])
                        loop_line.push(line)
                    }
                }
                break

            // ListGUIs
            case "3":
                if (current_command == "01") {
                    // Create ListGUI
                    Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], false)
                } else if (current_command == "02") {
                    // Set ListGUI Position
                    menu_data[0] = parseInt(command_data[1])
                    menu_data[1] = parseInt(command_data[2])
                    if (ListMenuGUI) {
                        ListMenuGUI.setPosition(menu_data[0], menu_data[1])
                    }
                } else if (current_command == "03") {
                    // Set ListGUI Size
                    menu_data[2] = parseInt(command_data[1])
                    menu_data[3] = parseInt(command_data[2])
                    if (ListMenuGUI) {
                        ListMenuGUI.setDimensions(menu_data[2], menu_data[3])
                    }
                } else if (current_command == "04") {
                    // Set ListGUI Contents to Array
                    menu_array = []
                    for (let i = 1; i < command_data.length; i++) {
                        menu_array.push(miniMenu.createMenuItem(command_data[i]))
                    }
                    Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
                } else if (current_command == "05") {
                    // Set ListGUI Item
                    menu_array[parseInt(command_data[1])] = miniMenu.createMenuItem(command_data[2])
                    Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
                } else if (current_command == "06") {
                    // Set Variable to ListGUI Item Value
                    variables[parseInt(command_data[1])] = menu_array[parseInt(command_data[1])] + ""
                } else if (current_command == "07") {
                    // Remove ListGUI Item
                    menu_array.splice(parseInt(command_data[1]), 1)
                    Reload_ListGUI(menu_array, menu_data[0], menu_data[1], menu_data[2], menu_data[3], true)
                } else if (current_command == "08") {
                    // Destroy ListGUI
                    menu_array = []
                    ListMenuGUI.destroy()
                } else if (current_command == "09") {
                    // Highlight ListGUI Item
                    if (command_data[1] == "o") {
                        // Off
                        nanoSDK_hover_highlight = false
                        ListMenuGUI.selectedIndex = -1
                    } else if (command_data[1] == "a") {
                        // Hover mode
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
}

// NanoSDK Runtime ends here
