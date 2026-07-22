// Web Chat protocol v2.
//
// Replaces v1's hand-rolled chunking on top of radio.sendValue/
// radio.onReceivedValue, which packed every chunk into a single number (3
// characters at a time). v2 instead rides on microUtilities.sendUnrestrictedString,
// which already reassembles arbitrary-length strings across as many raw
// radio packets as it takes -- so this file only has to define what goes
// inside that string, not how to get it there in one piece.
//
// Delivered over that transport:
// - Bigger packets: a chat message is one microUtilities string (up to
//   ~6.3KB), not one number per 3 characters.
// - File sharing: sendFile splits a Buffer into fixed-size pieces and sends
//   each as its own envelope; the receiving end reassembles them by fileId.
// - Serial number based verification: every envelope carries the sender's
//   hardware serial number (microUtilities.serialNumber()), so a recipient
//   can tell who actually sent something. This is inclusion, not proof --
//   nothing stops a device from lying about its own serial number.
// - Encryption: message/file bytes are XORed with a keystream derived from
//   the room code plus a per-message nonce. This keeps casual eavesdroppers
//   on the same radio group out of rooms they don't know the code for; it
//   is NOT cryptographically secure (no authentication, no key exchange,
//   room code is the whole keyspace) and shouldn't be treated as such.
namespace webChatProtocol {
    const _PROTOCOL_TAG = "W2"
    // Separates envelope fields. A control character so it doesn't collide
    // with anything a user is likely to type into a message or filename.
    const _FIELD_SEP = ""
    // Raw bytes per file chunk, before base64 (x4/3) and the header are
    // added. Keeps the resulting envelope string comfortably under
    // sendUnrestrictedString's ~6.3KB (255 chunks * 25 bytes/chunk) cap.
    const _MAX_FILE_CHUNK_BYTES = 4000
    // Drop a partially-received file if no new chunk shows up in this long.
    // Longer than the transport's own 4s per-envelope reassembly timeout
    // since a file can take many envelopes to arrive in full.
    const _FILE_REASSEMBLY_TIMEOUT_MS = 15000

    class _PendingFile {
        chunks: Buffer[] = []
        received = 0
        lastSeen = 0
        constructor(
            public senderId: string,
            public senderName: string,
            public fileId: number,
            public fileName: string,
            public total: number
        ) { }
    }

    let _roomCode = ""
    let _username = "Unknown"
    let _pendingFiles: _PendingFile[] = []
    let _initialized = false

    let _onMessageReceived: (senderId: string, senderName: string, verified: boolean, text: string, attachmentId: string, attachmentName: string) => void
    let _onFileReceived: (fileId: string, senderId: string, senderName: string, fileName: string, data: Buffer) => void

    // MARK: Room code / identity

    /**
     * Sets the shared room code used both to filter out envelopes from
     * other rooms and as the encryption key. Must match on every device
     * that should be able to read each other's messages/files.
     */
    export function setRoomCode(code: string): void {
        _roomCode = code || ""
    }

    /**
     * Sets the display name attached to outgoing messages and files.
     */
    export function setUsername(name: string): void {
        _username = _sanitize(name) || "Unknown"
    }

    function _getSenderId(): string {
        return microUtilities.serialNumber()
    }

    // MARK: Crypto (obfuscation, see file header note)

    function _hashString(s: string): number {
        // FNV-1a, 32-bit.
        let h = 0x811c9dc5
        for (let i = 0; i < s.length; i++) {
            h = h ^ s.charCodeAt(i)
            h = Math.imul(h, 0x01000193)
        }
        return h >>> 0
    }

    function _mulberry32(seed: number): () => number {
        let state = seed >>> 0
        return function () {
            state = (state + 0x6d2b79f5) >>> 0
            let t = state
            t = Math.imul(t ^ (t >>> 15), t | 1)
            t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
            return ((t ^ (t >>> 14)) >>> 0)
        }
    }

    // Combines the room code's hash with a per-message nonce so the same
    // room code never produces the same keystream twice -- reusing a
    // keystream across two messages is what makes XOR ciphers trivially
    // breakable.
    function _deriveSeed(nonce: number): number {
        return (_hashString(_roomCode) ^ Math.imul(nonce + 1, 0x9e3779b1)) >>> 0
    }

    function _xorWithKeystream(data: Buffer, nonce: number): Buffer {
        const next = _mulberry32(_deriveSeed(nonce))
        const out = Buffer.create(data.length)
        let word = 0
        let bytesLeftInWord = 0
        for (let i = 0; i < data.length; i++) {
            if (bytesLeftInWord === 0) {
                word = next()
                bytesLeftInWord = 4
            }
            out[i] = data[i] ^ (word & 0xff)
            word = word >>> 8
            bytesLeftInWord--
        }
        return out
    }

    // XOR is its own inverse given the same keystream, so encrypt/decrypt
    // are the same operation.
    function _crypt(data: Buffer, nonce: number): Buffer {
        return _xorWithKeystream(data, nonce)
    }

    function _roomFingerprint(): string {
        return _toHex(_hashString(_roomCode) & 0xffff)
    }

    function _sanitize(text: string): string {
        // Field separator can't survive inside a field.
        return text ? text.split(_FIELD_SEP).join("") : ""
    }

    // MARK: Transport init

    function _init(): void {
        if (_initialized) return
        _initialized = true
        microUtilities.onUnrestrictedStringReceived(_handleEnvelope)
        forever(function () {
            pause(1000)
            _expireStaleFiles()
        })
    }

    function _expireStaleFiles(): void {
        const now = control.millis()
        for (let i = _pendingFiles.length - 1; i >= 0; i--) {
            const pending = _pendingFiles[i]
            if (now - pending.lastSeen > _FILE_REASSEMBLY_TIMEOUT_MS) {
                _pendingFiles.splice(i, 1)
            }
        }
    }

    function _findPendingFile(senderId: string, fileId: number): _PendingFile {
        for (let i = 0; i < _pendingFiles.length; i++) {
            const p = _pendingFiles[i]
            if (p.senderId === senderId && p.fileId === fileId) return p
        }
        return undefined
    }

    function _removePendingFile(target: _PendingFile): void {
        for (let i = 0; i < _pendingFiles.length; i++) {
            if (_pendingFiles[i] === target) {
                _pendingFiles.splice(i, 1)
                return
            }
        }
    }

    // Not cryptographically random -- fine here, the nonce only has to
    // avoid keystream reuse within a room, not resist prediction.
    function _randomUint16(): number {
        return Math.floor(Math.random() * 0x10000)
    }

    // Number.toString only supports the no-arg (decimal) form in MakeCode's
    // static TypeScript -- no radix argument -- so hex formatting needs a
    // manual digit-by-digit conversion instead.
    function _toHex(n: number): string {
        const digits = "0123456789abcdef"
        if (n <= 0) return "0"
        let result = ""
        let v = n
        while (v > 0) {
            result = digits.charAt(v % 16) + result
            v = Math.floor(v / 16)
        }
        return result
    }

    // MARK: Envelope parsing

    function _handleEnvelope(raw: string): void {
        const sepIndex = _lastHeaderFieldEnd(raw)
        if (sepIndex < 0) return
        const header = raw.slice(0, sepIndex)
        const body = raw.slice(sepIndex + 1)
        const fields = header.split(_FIELD_SEP)
        if (fields.length < 6 || fields[0] !== _PROTOCOL_TAG) return
        if (fields[4] !== _roomFingerprint()) return

        const type = fields[1]
        const senderId = fields[2]
        const senderName = fields[3]
        const nonce = parseInt(fields[5], 16)

        if (type === "MSG") {
            if (fields.length < 9) return
            const plain = _crypt(Buffer.fromBase64(body), nonce)
            const verified = fields[6] === "1"
            const attachmentId = fields[7]
            const attachmentName = fields[8]
            if (_onMessageReceived) _onMessageReceived(senderId, senderName, verified, plain.toString(), attachmentId, attachmentName)
        } else if (type === "FILE") {
            if (fields.length < 11) return
            const fileId = parseInt(fields[6], 16)
            const index = parseInt(fields[7], 10)
            const total = parseInt(fields[8], 10)
            const fileName = fields[10]
            const chunk = _crypt(Buffer.fromBase64(body), nonce)

            let pending = _findPendingFile(senderId, fileId)
            if (pending && pending.total !== total) {
                _removePendingFile(pending)
                pending = undefined
            }
            if (!pending) {
                pending = new _PendingFile(senderId, senderName, fileId, fileName, total)
                _pendingFiles.push(pending)
            }
            if (!pending.chunks[index]) {
                pending.chunks[index] = chunk
                pending.received++
            }
            pending.lastSeen = control.millis()

            if (pending.received >= pending.total) {
                _removePendingFile(pending)
                if (_onFileReceived) {
                    _onFileReceived(_toHex(pending.fileId), pending.senderId, pending.senderName, pending.fileName, Buffer.concat(pending.chunks))
                }
            }
        }
    }

    // Envelope body (the base64 payload) is always the last field, but it
    // can itself contain "=" padding and arbitrary base64 characters -- so
    // find the split point by counting header fields from the front rather
    // than searching from the end.
    function _lastHeaderFieldEnd(raw: string): number {
        let seen = 0
        for (let i = 0; i < raw.length; i++) {
            if (raw.charAt(i) === _FIELD_SEP) {
                seen++
                if (seen === _headerFieldCountFor(raw)) return i
            }
        }
        return -1
    }

    // MSG envelopes have 9 header fields (8 separators before the body),
    // FILE envelopes have 11 (10 separators). Peek at the type field to
    // know which to expect.
    function _headerFieldCountFor(raw: string): number {
        const firstSep = raw.indexOf(_FIELD_SEP)
        if (firstSep < 0) return -1
        const secondSep = raw.indexOf(_FIELD_SEP, firstSep + 1)
        if (secondSep < 0) return -1
        const type = raw.slice(firstSep + 1, secondSep)
        return type === "FILE" ? 10 : 8
    }

    function _getVerified(): string {
        // "Verified" just means the sender's serial number is a real piece
        // of hardware identity rather than the simulator's meaningless
        // stand-in -- see the isMicrobit() doc comment.
        return microUtilities.isMicrobit() ? "1" : "0"
    }

    // MARK: Sending

    /**
     * Sends a chat message to whoever else is on the same room code.
     * Optionally attaches a file, sent as its own set of envelopes right
     * after the message and linked to it by attachmentName/attachmentId so
     * the receiving end can show it grouped under the message.
     */
    export function sendMessage(text: string, attachmentName: string = "", attachmentData: Buffer = null): void {
        _init()
        const nonce = _randomUint16()
        const cipher = _crypt(Buffer.fromUTF8(_sanitize(text)), nonce)
        const hasAttachment = !!(attachmentData && attachmentName)
        const attachmentId = hasAttachment ? _randomUint16() : 0
        const header = [
            _PROTOCOL_TAG, "MSG", _getSenderId(), _sanitize(_username), _roomFingerprint(), _toHex(nonce),
            _getVerified(), hasAttachment ? _toHex(attachmentId) : "", hasAttachment ? _sanitize(attachmentName) : ""
        ].join(_FIELD_SEP)
        microUtilities.sendUnrestrictedString(header + _FIELD_SEP + cipher.toBase64())
        if (hasAttachment) {
            _sendFileChunks(attachmentId, attachmentName, attachmentData)
        }
    }

    /**
     * Sends a file to whoever else is on the same room code, splitting it
     * across as many envelopes as it takes. Standalone -- for a file tied
     * to a chat message, pass it to sendMessage instead.
     */
    export function sendFile(fileName: string, data: Buffer): void {
        _init()
        _sendFileChunks(_randomUint16(), fileName, data)
    }

    function _sendFileChunks(fileId: number, fileName: string, data: Buffer): void {
        const total = Math.max(Math.ceil(data.length / _MAX_FILE_CHUNK_BYTES), 1)

        for (let i = 0; i < total; i++) {
            const start = i * _MAX_FILE_CHUNK_BYTES
            const length = Math.min(_MAX_FILE_CHUNK_BYTES, data.length - start)
            const chunk = data.slice(start, length)
            const nonce = _randomUint16()
            const cipher = _crypt(chunk, nonce)
            const header = [
                _PROTOCOL_TAG, "FILE", _getSenderId(), _sanitize(_username), _roomFingerprint(),
                _toHex(nonce), _toHex(fileId), i.toString(), total.toString(),
                data.length.toString(), _sanitize(fileName)
            ].join(_FIELD_SEP)
            microUtilities.sendUnrestrictedString(header + _FIELD_SEP + cipher.toBase64())
        }
    }

    // MARK: Receiving

    /**
     * Registers code to run when a chat message arrives for the current
     * room code. Messages from other rooms are silently ignored. verified
     * is true if the sender's serial number is real hardware identity (see
     * isMicrobit()). attachmentId/attachmentName are both "" if the message
     * has no attachment; otherwise attachmentId matches the fileId that'll
     * later show up in onFileReceived once the attachment finishes arriving.
     */
    export function onMessageReceived(cb: (senderId: string, senderName: string, verified: boolean, text: string, attachmentId: string, attachmentName: string) => void): void {
        _init()
        _onMessageReceived = cb
    }

    /**
     * Registers code to run when a file has been fully received for the
     * current room code. fileId matches whatever sent it -- either the id
     * sendFile generated internally, or the attachmentId a related
     * onMessageReceived call already reported.
     */
    export function onFileReceived(cb: (fileId: string, senderId: string, senderName: string, fileName: string, data: Buffer) => void): void {
        _init()
        _onFileReceived = cb
    }
}

// App-level wiring: everything below hooks the protocol above up to the
// actual Web Chat UI (WebChatHistory, the on-screen list, the taskbar
// notification dot).

// One chat message: a name row, a text row, and an optional attachment row
// grouped together. An interface (not a class) so boot.ts can declare
// WebChatHistory's initial value as a plain object literal without caring
// whether this file has loaded yet -- interfaces are compile-time only.
interface WebChatEntry {
    senderId: string
    senderName: string
    verified: boolean
    text: string
    // "" for all three attachment fields means "no attachment".
    attachmentId: string
    attachmentName: string
    attachmentData: Buffer
    attachmentReady: boolean
}

// Keep the last this many messages around for scrollback, plus the pinned
// "Type here..." placeholder. A message is its name+text+attachment rows
// grouped together, not counted per row.
const _WEBCHAT_HISTORY_MESSAGES = 30

// A completed file that arrived before the chat message referencing it did
// (MSG and FILE envelopes are sent back-to-back, but delivery order isn't
// guaranteed) -- held here until that message shows up.
interface _PendingAttachment {
    senderId: string
    fileId: string
    fileName: string
    data: Buffer
}
let _pendingAttachments: _PendingAttachment[] = []

// Fully-received messages waiting to be applied to WebChatHistory -- same
// reason the old v1 code queued into RadioValueQueue instead of applying
// immediately: only touch WebChatHistory (and rebuild the on-screen list)
// while chat is open and the user isn't mid-keystroke.
let _incomingWebChatMessages: WebChatEntry[] = []

// MARK: Radio Receive
webChatProtocol.onMessageReceived(function (senderId: string, senderName: string, verified: boolean, text: string, attachmentId: string, attachmentName: string) {
    let attachmentData: Buffer = null
    let attachmentReady = false
    if (attachmentId !== "") {
        for (let i = 0; i < _pendingAttachments.length; i++) {
            const p = _pendingAttachments[i]
            if (p.senderId === senderId && p.fileId === attachmentId) {
                attachmentData = p.data
                attachmentReady = true
                _pendingAttachments.splice(i, 1)
                break
            }
        }
    }
    _incomingWebChatMessages.push({
        senderId: senderId, senderName: senderName, verified: verified, text: text,
        attachmentId: attachmentId, attachmentName: attachmentName,
        attachmentData: attachmentData, attachmentReady: attachmentReady
    })
    WebChatIndicatorPending = true
})

webChatProtocol.onFileReceived(function (fileId: string, senderId: string, senderName: string, fileName: string, data: Buffer) {
    // Might belong to a message already applied to history...
    for (let i = 0; i < WebChatHistory.length; i++) {
        const entry = WebChatHistory[i]
        if (entry.senderId === senderId && entry.attachmentId === fileId && !entry.attachmentReady) {
            entry.attachmentData = data
            entry.attachmentReady = true
            if (App_Open == "Web Chat" && KeyboardVisible == false) {
                refreshWebChatList()
            }
            return
        }
    }
    // ...or to one still sitting in the incoming queue...
    for (let i = 0; i < _incomingWebChatMessages.length; i++) {
        const msg = _incomingWebChatMessages[i]
        if (msg.senderId === senderId && msg.attachmentId === fileId && !msg.attachmentReady) {
            msg.attachmentData = data
            msg.attachmentReady = true
            return
        }
    }
    // ...or the message hasn't arrived yet at all -- stash it for later.
    _pendingAttachments.push({ senderId: senderId, fileId: fileId, fileName: fileName, data: data })
})

// MARK: Web Chat Rows
// One row-metadata entry per displayed line: which history entry it came
// from and which part of that message it represents. Rebuilt on demand
// (from WebChatHistory, which is small -- at most 30 messages) rather than
// kept in sync through every scroll operation, since a fresh build is both
// simpler and cheap enough to not matter.
interface _WebChatRow {
    entry: WebChatEntry
    part: string // "name" | "text" | "attachment" | "typehere"
}

function _webChatRows(): _WebChatRow[] {
    let rows: _WebChatRow[] = []
    for (let e = 0; e < WebChatHistory.length; e++) {
        const entry = WebChatHistory[e]
        rows.push({ entry: entry, part: "name" })
        rows.push({ entry: entry, part: "text" })
        if (entry.attachmentName !== "") {
            rows.push({ entry: entry, part: "attachment" })
        }
    }
    rows.push({ entry: null, part: "typehere" })
    return rows
}

function _webChatRowText(row: _WebChatRow): string {
    if (row.part === "typehere") return Temp
    const entry = row.entry
    if (row.part === "name") return entry.senderName + (entry.verified ? " (Verified)" : "")
    if (row.part === "text") return entry.text
    // attachment
    return (entry.attachmentReady ? "Attached " : "Receiving ") + entry.attachmentName + (entry.attachmentReady ? "" : "...")
}

/**
 * Maps a currently-visible Web Chat row index (0 = top of the list) back to
 * the message it belongs to, accounting for scroll position and the
 * blank-row padding refreshWebChatList adds when there's not enough
 * history to fill the box yet. Returns null for padding rows or anything
 * out of range.
 */
function webChatRowAt(visibleRowIndex: number): _WebChatRow {
    const rows = _webChatRows()
    const total = rows.length
    let absoluteIndex: number
    if (total <= visibleRows) {
        absoluteIndex = visibleRowIndex - (visibleRows - total)
    } else {
        absoluteIndex = ListMenuGUIHidden.length + visibleRowIndex
    }
    if (absoluteIndex < 0 || absoluteIndex >= total) return null
    return rows[absoluteIndex]
}

// MARK: Refresh Web Chat List
function refreshWebChatList() {
    const rows = _webChatRows()
    const displayRows = rows.map(row => miniMenu.createMenuItem(_webChatRowText(row)))
    const total = displayRows.length
    if (total <= visibleRows) {
        // Not enough real content to fill the box yet -- pad the top so
        // "Type here..." (always the last row) still lands on the bottom
        // row instead of floating wherever the short list ends.
        let padded: miniMenu.MenuItem[] = []
        for (let i = 0; i < visibleRows - total; i++) {
            padded.push(miniMenu.createMenuItem(" "))
        }
        ListMenuGUIHidden = []
        ListMenuContents = padded.concat(displayRows)
        List_Scroll = 0
    } else {
        // Default view is the newest screenful; everything older sits in
        // ListMenuGUIHidden until scrolled into view with the up arrow.
        ListMenuGUIHidden = displayRows.slice(0, total - visibleRows)
        ListMenuContents = displayRows.slice(total - visibleRows)
        List_Scroll = ListMenuGUIHidden.length
    }
    reloadListGUI(80, 58, 160, 97, darkMode)
    // "Type here..." is always the last row, and this is the default
    // (unscrolled) view, so the visible window is always exactly
    // visibleRows long here -- it's on screen and worth highlighting.
    ListMenuGUI.selectedIndex = ListMenuContents.length - 1
}

// MARK: Web Chat Append
// Shared by incoming radio messages and local echo.
function pushWebChatEntry(entry: WebChatEntry): void {
    WebChatHistory.push(entry)
    while (WebChatHistory.length > _WEBCHAT_HISTORY_MESSAGES) {
        WebChatHistory.shift()
    }
    refreshWebChatList()
}

function _fileNameTaken(fullName: string): boolean {
    for (let i = 0; i < User_Files.length; i++) {
        if (User_Files[i].text == fullName) return true
    }
    return false
}

// If "name.ext" is already in User Files, tries "name_0.ext", "name_1.ext",
// etc. until it finds one that isn't -- so an incoming attachment never
// silently overwrites (or gets rejected in favor of) an existing file that
// happens to share its name.
function _uniqueAttachmentName(name: string, ext: string): string {
    if (!_fileNameTaken(name + "." + ext)) return name
    let suffix = 0
    while (_fileNameTaken(name + "_" + suffix + "." + ext)) {
        suffix++
    }
    return name + "_" + suffix
}

/**
 * Reads a file already saved on this device and imports it into the
 * receiver's User Files -- called when the user clicks a ready "Attached
 * ..." row.
 */
function importWebChatAttachment(entry: WebChatEntry): void {
    if (!entry.attachmentReady) return
    const parts = entry.attachmentName.split(".")
    if (parts.length !== 2) {
        softerror(110)
        return
    }
    const ext = parts[1]
    const name = _uniqueAttachmentName(parts[0], ext)
    if (!isValidFileName(name, ext)) return
    const content = entry.attachmentData.toString()
    const key = fileKey(ext, name)
    if (!hasStorageSpaceFor(key, content)) {
        softerror(113)
        return
    }
    settings.writeString(key, content)
    User_Files.push(miniMenu.createMenuItem(name + "." + ext))
    settings.writeString("file_names", JSON.stringify(User_Files.map(item => item.text)))
}

// MARK: Web Chat Queue
function processRadioQueue() {
    if (WebChatIndicatorPending) {
        WebChatIndicatorPending = false
        if (microUtilities.isMicrobit() && App_Open !== "Web Chat" && parseInt(Settings.charAt(6), 10) !== 1) {
            microUtilities.setPixel(0, 0, true)
        }
    }
    if (App_Open == "Web Chat" && KeyboardVisible == false) {
        while (_incomingWebChatMessages.length > 0) {
            pushWebChatEntry(_incomingWebChatMessages.shift())
        }
    }
}
