// MARK: Radio Recieve Name
radio.onReceivedString(function (name: string) {
    RadioValueQueue.push(name)
})

// MARK: Radio Recieve Value
radio.onReceivedValue(function (name: string, value: number) {
    handleWebChatChunk(name, value)
})

// MARK: Refresh Web Chat List
function refreshWebChatList() {
    ListMenuContents = WebChatMessages.slice()
    reloadListGUI(80, 58, 160, 97, darkMode)
    ListMenuGUI.selectedIndex = 7
}

// MARK: Web Chat Queue
function processRadioQueue() {
    if (App_Open == "Web Chat" && KeyboardVisible == false) {
        while (RadioValueQueue.length > 0) {
            let message = RadioValueQueue.shift()
            if (message) {
                let parts = message.split("|")
                if (parts.length >= 2) {
                    let senderName = parts[0]
                    let messageText = parts.slice(1).join("|")
                    
                    WebChatMessages[7] = miniMenu.createMenuItem(senderName)
                    WebChatMessages.push(miniMenu.createMenuItem(messageText))
                    WebChatMessages.push(miniMenu.createMenuItem(Temp))
                    while (WebChatMessages.length > 8) {
                        WebChatMessages.shift();
                    }

                    WebChatMessages[7] = miniMenu.createMenuItem(Temp)
                    refreshWebChatList()
                }
            }
        }
    }
}

// MARK: Web Chat Send
function sendWebChatMessage(username: string, message: string) {
    let fullMessage = username + "|" + message
    let chunkSize = 18
    let totalChunks = Math.ceil(fullMessage.length / chunkSize)

    radio.sendValue("WCH", totalChunks * 1000 + parseInt(RoomCode.substr(0, 3)))
    pause(50)

    for (let i = 0; i < totalChunks; i++) {
        let start = i * chunkSize
        let end = Math.min(start + chunkSize, fullMessage.length)
        let chunk = fullMessage.substr(start, end - start)

        let chunkValues = encodeStringToValues(chunk)
        for (let j = 0; j < chunkValues.length; j++) {
            let name = "WC" + String.fromCharCode(48 + i) + String.fromCharCode(48 + j)
            radio.sendValue(name, chunkValues[j])
            pause(30)
        }
    }
    
    radio.sendValue("WCE", parseInt(RoomCode.substr(0, 4)))
}

// MARK: Web Chat Encode
function encodeStringToValues(text: string): number[] {
    let values: number[] = []
    for (let i = 0; i < text.length; i += 3) {
        let val = 0
        for (let j = 0; j < 3 && i + j < text.length; j++) {
            val = val * 256 + text.charCodeAt(i + j)
        }
        values.push(val)
    }
    return values
}

// MARK: Web Chat Decode
function decodeValueToString(value: number, length: number): string {
    let result = ""
    let chars: number[] = []
    while (value > 0) {
        chars.unshift(value % 256)
        value = Math.floor(value / 256)
    }
    for (let i = 0; i < chars.length && i < length; i++) {
        result += String.fromCharCode(chars[i])
    }
    return result
}

// MARK: Web Chat Chunk Handler
function handleWebChatChunk(name: string, value: number) {
    if (name.substr(0, 2) == "WC") {
        if (name == "WCH") {
            let roomCheck = value % 1000
            if (roomCheck == parseInt(RoomCode.substr(0, 3))) {
                IncomingMessageChunks = []
                ExpectedChunks = Math.floor(value / 1000)
            }
        } else if (name == "WCE") {
            if (value == parseInt(RoomCode.substr(0, 4)) && IncomingMessageChunks.length > 0) {
                let fullMessage = IncomingMessageChunks.join("")
                RadioValueQueue.push(fullMessage)
                IncomingMessageChunks = []
            }
        } else if (name.length == 4) {
            let decoded = decodeValueToString(value, 3)
            IncomingMessageChunks.push(decoded)
        }
    }
}