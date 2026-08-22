// MARK: Companion Serial Protocol
// Implements a newline-delimited JSON request/response protocol over USB
// serial (microUtilities.readSerialString / writeSerialString) so an
// external "companion app" (web-based, Web Serial API) can inspect and
// manage this device: browse/read/write the user file directory, read and
// change settings, and pull device info (serial number, board revision,
// storage, MicroOS version). See docs/SERIAL_PROTOCOL.md for the protocol
// spec consumed by that companion app.
//
// Framing: one JSON object per line (LF-terminated). Every request carries
// an "id"; every response echoes it back alongside "ok" and either result
// fields or an "error" string. This file only runs the request/response
// loop -- it doesn't know or care what's on the other end of the wire.

// MARK: Serial Buffer Guard
// Above this many buffered characters with no newline yet, something's
// wrong (runaway sender, corrupted stream) -- drop the buffer rather than
// growing it forever. Comfortably above a base64'd max-capacity file.
const SERIAL_MAX_LINE = 24000

let serialRecvBuffer = ""

// MARK: Settings Field Map
// Mirrors the digit layout documented in boot.ts: index 0 unused, 1 radio
// channel, 2 wallpaper, 3 show clock, 4 dark mode, 5 theme, 6 indicator.
// Username/RoomCode are their own string keys, not digits.
const SERIAL_SETTINGS_FIELDS = ["radioChannel", "wallpaper", "username", "showClock", "roomCode", "darkMode", "theme", "indicator"]

// MARK: Boot Diagnostic
// TEMPORARY -- pinpoints, via the indicator LED alone, which USB-serial
// backend actually got compiled into this build. isSerialSupported() being
// false (poll loop below permanently no-ops) looks identical from a Web
// Serial client's point of view to a genuine runtime failure in a backend
// that IS compiled in, and there's no other way to tell those apart without
// a debugger. Runs once at boot, before the poll loop starts ticking.
// Remove once USB serial is confirmed working end-to-end.
//   1 blink  = Arcade-on-micro:bit backend compiled in (expected on hw---n3)
//   2 blinks = plain pxt-microbit target's uBit.serial compiled in
//   solid 3s = no serial backend compiled in at all -- isSerialSupported()
//              is false and everything below this point is a no-op
;(function serialBootDiagnostic() {
    const backend = microUtilities.serialBackend()
    if (backend === 0) {
        microUtilities.setPixel(0, 0, true)
        pause(3000)
        microUtilities.setPixel(0, 0, false)
        return
    }
    const blinks = backend === 1 ? 1 : 2
    for (let i = 0; i < blinks; i++) {
        microUtilities.setPixel(0, 0, true)
        pause(150)
        microUtilities.setPixel(0, 0, false)
        pause(150)
    }
})()

// MARK: Poll Loop
forever(function () {
    pause(20)
    if (!microUtilities.isSerialSupported()) return
    if (microUtilities.serialBytesAvailable() > 0) {
        serialRecvBuffer += microUtilities.readSerialString()
        if (serialRecvBuffer.length > SERIAL_MAX_LINE) {
            serialRecvBuffer = ""
            serialSendError(null, "line too long, buffer reset")
            return
        }
        let newlineAt = serialRecvBuffer.indexOf("\n")
        while (newlineAt >= 0) {
            const line = serialRecvBuffer.substr(0, newlineAt)
            serialRecvBuffer = serialRecvBuffer.substr(newlineAt + 1)
            handleSerialLine(line)
            newlineAt = serialRecvBuffer.indexOf("\n")
        }
    }
})

// MARK: Send Response
function serialSendResponse(id: any, fields: any) {
    fields["id"] = id
    fields["ok"] = true
    microUtilities.writeSerialString(JSON.stringify(fields) + "\n")
}

// MARK: Send Error
function serialSendError(id: any, message: string) {
    microUtilities.writeSerialString(JSON.stringify({ id: id, ok: false, error: message }) + "\n")
}

// MARK: Handle Line
function handleSerialLine(line: string) {
    line = line.trim()
    if (line == "") return
    let req: any = null
    try {
        req = JSON.parse(line)
    } catch (e) {
        serialSendError(null, "invalid json")
        return
    }
    if (typeof req !== "object" || req == null || typeof req.cmd !== "string") {
        serialSendError(req && req.id !== undefined ? req.id : null, "malformed request")
        return
    }
    const id = req.id !== undefined ? req.id : null
    try {
        dispatchSerialCommand(id, req.cmd, req)
    } catch (e) {
        serialSendError(id, "internal error")
    }
}

// MARK: Dispatch Command
function dispatchSerialCommand(id: any, cmd: string, req: any) {
    switch (cmd) {
        case "ping":
            serialSendResponse(id, {})
            break
        case "device.info":
            serialCmdDeviceInfo(id)
            break
        case "fs.list":
            serialCmdFsList(id)
            break
        case "fs.read":
            serialCmdFsRead(id, req)
            break
        case "fs.write":
            serialCmdFsWrite(id, req)
            break
        case "settings.list":
            serialCmdSettingsList(id)
            break
        case "settings.set":
            serialCmdSettingsSet(id, req)
            break
        case "settings.getRaw":
            serialCmdSettingsGetRaw(id, req)
            break
        case "settings.setRaw":
            serialCmdSettingsSetRaw(id, req)
            break
        default:
            serialSendError(id, "unknown command")
            break
    }
}

// MARK: device.info
function serialCmdDeviceInfo(id: any) {
    serialSendResponse(id, {
        serialNumber: microUtilities.serialNumber(),
        boardRevision: microUtilities.boardRevision(),
        isMicrobit: microUtilities.isMicrobit(),
        osVersion: MicroOS_Version,
        storageCapacity: microUtilities.storageCapacity(StorageUnit.Bytes),
        storageUsage: microUtilities.storageUsage(StorageUnit.Bytes),
        ramCapacity: microUtilities.ramCapacity(StorageUnit.Bytes),
        ramUsage: microUtilities.ramUsage(StorageUnit.Bytes),
        cpuSpeed: microUtilities.cpuSpeed()
    })
}

// MARK: fs.list
function serialCmdFsList(id: any) {
    const files: any[] = []
    for (let i = 0; i < User_Files.length; i++) {
        const entryName = User_Files[i].text
        if (entryName == "Home") continue
        const parts = entryName.split(".")
        if (parts.length !== 2) continue
        const content = settings.readString(fileKey(parts[1], parts[0]))
        files.push({
            name: parts[0],
            ext: parts[1],
            size: content == null ? 0 : utf8ByteLength(content)
        })
    }
    serialSendResponse(id, { files: files })
}

// MARK: fs.read
function serialCmdFsRead(id: any, req: any) {
    const name: string = req.name
    const ext: string = req.ext
    if (!name || !ext) {
        serialSendError(id, "missing name/ext")
        return
    }
    const content = settings.readString(fileKey(ext, name))
    if (content == null) {
        serialSendError(id, "file not found")
        return
    }
    serialSendResponse(id, {
        name: name,
        ext: ext,
        data: control.createBufferFromUTF8(content).toBase64()
    })
}

// MARK: fs.write
function serialCmdFsWrite(id: any, req: any) {
    const name: string = req.name
    const ext: string = req.ext
    const data: string = req.data
    if (!name || !ext || data == undefined) {
        serialSendError(id, "missing name/ext/data")
        return
    }
    if (name == "Home" || name.indexOf("~") >= 0 || name.indexOf("§") >= 0 || name.indexOf(".") >= 0) {
        serialSendError(id, "invalid file name")
        return
    }
    if (ext.indexOf("~") >= 0 || ext.indexOf("§") >= 0 || ext.indexOf(".") >= 0) {
        serialSendError(id, "invalid file extension")
        return
    }
    let content: string
    try {
        content = Buffer.fromBase64(data).toString()
    } catch (e) {
        serialSendError(id, "invalid base64 data")
        return
    }
    const key = fileKey(ext, name)
    const isNewFile = settings.readString(key) == null
    if (!hasStorageSpaceFor(key, content)) {
        serialSendError(id, "not enough storage space")
        return
    }
    settings.writeString(key, content)
    if (isNewFile) {
        User_Files.push(microUtilities.createMenuItem(name + "." + ext))
        settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
        if (App_Open == "File Manager") {
            Open_FileManager("User", null, true)
        }
    }
    serialSendResponse(id, { name: name, ext: ext })
}

// MARK: settings.list
function serialCmdSettingsList(id: any) {
    serialSendResponse(id, {
        settings: {
            radioChannel: parseInt(Settings.charAt(1), 10) || 0,
            wallpaper: parseInt(Settings.charAt(2), 10) || 0,
            username: Username,
            showClock: Settings.charAt(3) == "0",
            roomCode: RoomCode,
            darkMode: Settings.charAt(4) == "1",
            theme: parseInt(Settings.charAt(5), 10) || 0,
            indicator: Settings.charAt(6) != "1"
        }
    })
}

// MARK: settings.set
// Directly sets one decoded settings field to a specific value (as opposed
// to changeSettings()'s cycle-to-next-value behavior, which is driven by UI
// clicks). Field names match the keys returned by settings.list.
function serialCmdSettingsSet(id: any, req: any) {
    const field: string = req.field
    const value: any = req.value
    if (SERIAL_SETTINGS_FIELDS.indexOf(field) < 0) {
        serialSendError(id, "unknown settings field")
        return
    }

    let digitIndex = -1
    let digitValue = ""
    let displayText = ""
    let currentSettingsIndex = -1

    switch (field) {
        case "radioChannel": {
            const v = Math.max(0, Math.min(9, value | 0))
            digitIndex = 1
            digitValue = v.toString()
            displayText = "Radio Channel - " + v
            currentSettingsIndex = 0
            break
        }
        case "wallpaper": {
            const v = Math.max(0, Math.min(1, value | 0))
            digitIndex = 2
            digitValue = v.toString()
            displayText = ["Wallpaper - Strings", "Wallpaper - Squiggles"][v]
            currentSettingsIndex = 1
            break
        }
        case "username": {
            if (typeof value !== "string" || value == "") {
                serialSendError(id, "invalid username")
                return
            }
            Username = value
            settings.writeString("Username", Username)
            webChatProtocol.setUsername(Username)
            Current_Settings[2] = microUtilities.createMenuItem("Name - " + Username)
            serialSettingsRefreshUI(2)
            serialSendResponse(id, {})
            return
        }
        case "showClock": {
            const v = value ? "0" : "1"
            digitIndex = 3
            digitValue = v
            displayText = value ? "Show Clock - True" : "Show Clock - False"
            currentSettingsIndex = 3
            if (value) {
                clock.setText(hour.toString() + ":" + minute.toString().substr(1, 2))
            } else {
                clock.setText("")
            }
            break
        }
        case "roomCode": {
            if (typeof value !== "string" || value == "") {
                serialSendError(id, "invalid room code")
                return
            }
            RoomCode = value
            settings.writeString("RoomCode", RoomCode)
            webChatProtocol.setRoomCode(RoomCode)
            Current_Settings[4] = microUtilities.createMenuItem("Room Code - " + RoomCode)
            serialSettingsRefreshUI(4)
            serialSendResponse(id, {})
            return
        }
        case "darkMode": {
            const v = value ? "1" : "0"
            digitIndex = 4
            digitValue = v
            displayText = value ? "Dark Mode - On" : "Dark Mode - Off"
            currentSettingsIndex = 5
            darkMode = !!value
            break
        }
        case "theme": {
            const v = Math.max(0, Math.min(3, value | 0))
            digitIndex = 5
            digitValue = v.toString()
            displayText = ["Theme - Default", "Theme - Blush", "Theme - Ocean", "Theme - Orange"][v]
            currentSettingsIndex = 6
            theme = themes[v]
            generateTaskbar(theme[0], theme[1])
            break
        }
        case "indicator": {
            const v = value ? "0" : "1"
            digitIndex = 6
            digitValue = v
            displayText = value ? "Indicator - On" : "Indicator - Off"
            currentSettingsIndex = 7
            if (!value) {
                microUtilities.setPixel(0, 0, false)
            }
            break
        }
    }

    Settings = Settings.slice(0, digitIndex) + digitValue + Settings.slice(digitIndex + 1)
    settings.writeString("settings", Settings)
    Current_Settings[currentSettingsIndex] = microUtilities.createMenuItem(displayText)
    radio.setGroup(113 + parseInt(Settings.charAt(1), 10))
    serialSettingsRefreshUI(currentSettingsIndex)
    serialSendResponse(id, {})
}

// MARK: Refresh Settings UI
// If the Settings app happens to be open when a serial edit lands, redraw
// it the same way changeSettings() does. Skipped otherwise, since
// reloadListGUI()/createAppBar() operate on whatever app currently owns
// ListMenuContents and would corrupt a different app's view.
function serialSettingsRefreshUI(currentSettingsIndex: number) {
    if (App_Open != "Settings") return
    createAppBar(0, theme[2])
    reloadListGUI(76, 58, 151, 97, darkMode)
}

// MARK: settings.getRaw
// Escape hatch for reading any non-file, non-secret settings key directly,
// for keys not covered by the decoded settings.list summary.
function serialCmdSettingsGetRaw(id: any, req: any) {
    const key: string = req.key
    if (!key || key.charAt(0) == "#" || key.indexOf("file_") == 0 || key == "__secrets") {
        serialSendError(id, "key not accessible")
        return
    }
    const value = settings.readString(key)
    if (value == null) {
        serialSendError(id, "key not found")
        return
    }
    serialSendResponse(id, { key: key, value: value })
}

// MARK: settings.setRaw
function serialCmdSettingsSetRaw(id: any, req: any) {
    const key: string = req.key
    const value: string = req.value
    if (!key || key.charAt(0) == "#" || key.indexOf("file_") == 0 || key == "__secrets") {
        serialSendError(id, "key not accessible")
        return
    }
    if (typeof value !== "string") {
        serialSendError(id, "value must be a string")
        return
    }
    settings.writeString(key, value)
    serialSendResponse(id, { key: key })
}
