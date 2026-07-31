// MARK: xCell Grid Engine
// A lightweight spreadsheet: a fixed 4-column (A-D) x 6-row grid, rendered
// through the same SimpleMenu row list every other app uses (see
// microUtilities.SimpleMenu) rather than a bespoke sprite grid -- one
// header row of column letters plus six data rows fits exactly in the
// 7-row list area Open_Write/Open_NanoCode already use.
const XCELL_COLS = ["A", "B", "C", "D"]
const XCELL_ROWS = 6
const XCELL_CELL_WIDTH = 4

let xcellGrid: string[][] = xcellNewGrid()

function xcellNewGrid(): string[][] {
    let grid: string[][] = []
    for (let r = 0; r < XCELL_ROWS; r++) {
        let row: string[] = []
        for (let c = 0; c < XCELL_COLS.length; c++) {
            row.push("")
        }
        grid.push(row)
    }
    return grid
}

function xcellCellRef(row: number, col: number): string {
    return XCELL_COLS[col] + (row + 1)
}

// Returns [row, col] for a ref like "A1", or null if it's out of range.
function xcellParseRef(ref: string): number[] {
    if (ref == null || ref.length < 2) {
        return null
    }
    const colChar = ref.charAt(0).toUpperCase()
    let col = -1
    for (let c = 0; c < XCELL_COLS.length; c++) {
        if (XCELL_COLS[c] == colChar) {
            col = c
            break
        }
    }
    if (col < 0) {
        return null
    }
    const rowNum = parseInt(ref.substr(1), 10)
    if (isNaN(rowNum) || rowNum < 1 || rowNum > XCELL_ROWS) {
        return null
    }
    return [rowNum - 1, col]
}

// MARK: Load / Save
// Files are "~"-joined "REF=raw" lines, matching the line-per-entry
// convention Write/NanoCode already use for their own file format.
function xcellLoad(contents: string) {
    xcellGrid = xcellNewGrid()
    if (contents == null || contents == "") {
        return
    }
    const lines = contents.split("~")
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const eq = line.indexOf("=")
        if (eq <= 0) {
            continue
        }
        const pos = xcellParseRef(line.substr(0, eq))
        if (pos) {
            xcellGrid[pos[0]][pos[1]] = line.substr(eq + 1)
        }
    }
}

function xcellSerialize(): string {
    let lines: string[] = []
    for (let r = 0; r < XCELL_ROWS; r++) {
        for (let c = 0; c < XCELL_COLS.length; c++) {
            const raw = xcellGrid[r][c]
            if (raw != null && raw != "") {
                lines.push(xcellCellRef(r, c) + "=" + raw)
            }
        }
    }
    return lines.join("~")
}

// MARK: Formula Evaluation
function xcellIsDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9"
}

function xcellIsAlpha(ch: string): boolean {
    return (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")
}

function xcellTokenize(s: string): string[] {
    let tokens: string[] = []
    let i = 0
    while (i < s.length) {
        const c = s.charAt(i)
        if (c == " ") {
            i++
        } else if (xcellIsDigit(c) || c == ".") {
            let j = i
            while (j < s.length && (xcellIsDigit(s.charAt(j)) || s.charAt(j) == ".")) {
                j++
            }
            tokens.push(s.substr(i, j - i))
            i = j
        } else if (xcellIsAlpha(c)) {
            let j = i
            while (j < s.length && (xcellIsAlpha(s.charAt(j)) || xcellIsDigit(s.charAt(j)))) {
                j++
            }
            tokens.push(s.substr(i, j - i).toUpperCase())
            i = j
        } else if ("+-*/(),:".indexOf(c) >= 0) {
            tokens.push(c)
            i++
        } else {
            // Unrecognized character -- push it as its own token so the
            // parser trips over it and reports #ERR instead of silently
            // dropping part of the formula.
            tokens.push(c)
            i++
        }
    }
    return tokens
}

// Hand-rolled recursive-descent evaluator (expr -> term -> factor) with
// SUM(range) support. `visiting` is the chain of cell refs currently being
// evaluated, so a formula that (directly or indirectly) references itself
// is caught instead of blowing the stack.
class XcellParser {
    tokens: string[]
    pos: number
    error: boolean
    visiting: string[]

    constructor(tokens: string[], visiting: string[]) {
        this.tokens = tokens
        this.pos = 0
        this.error = false
        this.visiting = visiting
    }

    peek(): string {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null
    }

    take(): string {
        const t = this.peek()
        this.pos++
        return t
    }

    parseExpr(): number {
        let value = this.parseTerm()
        while (!this.error) {
            const t = this.peek()
            if (t == "+") {
                this.take()
                value += this.parseTerm()
            } else if (t == "-") {
                this.take()
                value -= this.parseTerm()
            } else {
                break
            }
        }
        return value
    }

    parseTerm(): number {
        let value = this.parseFactor()
        while (!this.error) {
            const t = this.peek()
            if (t == "*") {
                this.take()
                value *= this.parseFactor()
            } else if (t == "/") {
                this.take()
                const divisor = this.parseFactor()
                if (divisor == 0) {
                    this.error = true
                    return 0
                }
                value /= divisor
            } else {
                break
            }
        }
        return value
    }

    parseFactor(): number {
        const t = this.peek()
        if (t == null) {
            this.error = true
            return 0
        }
        if (t == "-") {
            this.take()
            return -this.parseFactor()
        }
        if (t == "+") {
            this.take()
            return this.parseFactor()
        }
        if (t == "(") {
            this.take()
            const value = this.parseExpr()
            if (this.peek() != ")") {
                this.error = true
                return 0
            }
            this.take()
            return value
        }
        if (t == "SUM") {
            return this.parseSum()
        }
        if (xcellIsDigit(t.charAt(0)) || t.charAt(0) == ".") {
            this.take()
            const n = parseFloat(t)
            if (isNaN(n)) {
                this.error = true
                return 0
            }
            return n
        }
        const pos = xcellParseRef(t)
        if (pos) {
            this.take()
            const result = xcellEvaluateCell(pos[0], pos[1], this.visiting)
            if (result.error) {
                this.error = true
                return 0
            }
            return result.value
        }
        this.error = true
        return 0
    }

    parseSum(): number {
        this.take() // "SUM"
        if (this.peek() != "(") {
            this.error = true
            return 0
        }
        this.take()
        const startPos = xcellParseRef(this.take())
        if (!startPos) {
            this.error = true
            return 0
        }
        let endPos = startPos
        if (this.peek() == ":") {
            this.take()
            endPos = xcellParseRef(this.take())
            if (!endPos) {
                this.error = true
                return 0
            }
        }
        if (this.peek() != ")") {
            this.error = true
            return 0
        }
        this.take()

        const minRow = Math.min(startPos[0], endPos[0])
        const maxRow = Math.max(startPos[0], endPos[0])
        const minCol = Math.min(startPos[1], endPos[1])
        const maxCol = Math.max(startPos[1], endPos[1])
        let total = 0
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const result = xcellEvaluateCell(r, c, this.visiting)
                if (result.error) {
                    this.error = true
                    return 0
                }
                total += result.value
            }
        }
        return total
    }
}

interface XcellResult {
    value: number
    error: boolean
}

// Evaluates a single cell to a number for use inside another formula.
// Empty cells are 0; plain text cells are 0 (Excel would error, but a
// silent 0 keeps SUM() over a labeled range from blowing up); numbers pass
// through; formulas are parsed and evaluated recursively.
function xcellEvaluateCell(row: number, col: number, visiting: string[]): XcellResult {
    const ref = xcellCellRef(row, col)
    if (visiting.indexOf(ref) >= 0) {
        return { value: 0, error: true }
    }
    const raw = xcellGrid[row][col]
    if (raw == null || raw == "") {
        return { value: 0, error: false }
    }
    if (raw.charAt(0) == "=") {
        visiting.push(ref)
        const parser = new XcellParser(xcellTokenize(raw.substr(1)), visiting)
        const value = parser.parseExpr()
        const failed = parser.error || parser.pos < parser.tokens.length
        visiting.pop()
        return { value: failed ? 0 : value, error: failed }
    }
    if (xcellLooksNumeric(raw)) {
        const n = parseFloat(raw)
        if (!isNaN(n)) {
            return { value: n, error: false }
        }
    }
    return { value: 0, error: false }
}

function xcellLooksNumeric(raw: string): boolean {
    if (raw == "") {
        return false
    }
    const c = raw.charAt(0)
    return xcellIsDigit(c) || c == "-" || c == "."
}

function xcellFormatNumber(n: number): string {
    if (n == Math.round(n) && Math.abs(n) < 100000) {
        return n.toString()
    }
    return (Math.round(n * 100) / 100).toString()
}

// The value shown in a cell: formulas resolve to their computed number (or
// "#ERR"), numbers are reformatted, everything else is shown as typed.
function xcellDisplayCell(row: number, col: number): string {
    const raw = xcellGrid[row][col]
    if (raw == null || raw == "") {
        return ""
    }
    if (raw.charAt(0) == "=") {
        const result = xcellEvaluateCell(row, col, [])
        return result.error ? "#ERR" : xcellFormatNumber(result.value)
    }
    if (xcellLooksNumeric(raw)) {
        const n = parseFloat(raw)
        if (!isNaN(n)) {
            return xcellFormatNumber(n)
        }
    }
    return raw
}

// MARK: Rendering
// Pads/truncates a cell's display text to exactly XCELL_CELL_WIDTH
// characters. Numbers that don't fit become "###" (Excel's own "column too
// narrow" tell) instead of a silently truncated, misleading value.
function xcellFormattedCellSlot(row: number, col: number): string {
    const display = xcellDisplayCell(row, col)
    if (display.length <= XCELL_CELL_WIDTH) {
        let out = display
        while (out.length < XCELL_CELL_WIDTH) {
            out += " "
        }
        return out
    }
    if (display == "#ERR") {
        return display
    }
    if (xcellLooksNumeric(xcellGrid[row][col]) || xcellGrid[row][col].charAt(0) == "=") {
        let out = ""
        for (let i = 0; i < XCELL_CELL_WIDTH; i++) {
            out += "#"
        }
        return out
    }
    return display.substr(0, XCELL_CELL_WIDTH)
}

function xcellBuildHeaderRow(): string {
    let s = "  "
    for (let c = 0; c < XCELL_COLS.length; c++) {
        let cell = XCELL_COLS[c]
        while (cell.length < XCELL_CELL_WIDTH) {
            cell += " "
        }
        s += cell + " "
    }
    return s
}

function xcellBuildDataRow(row: number): string {
    let s = (row + 1).toString() + " "
    for (let c = 0; c < XCELL_COLS.length; c++) {
        s += xcellFormattedCellSlot(row, c) + " "
    }
    return s
}

// Rebuilds the on-screen grid from xcellGrid. Row 0 of the list is the
// (never-edited) column header; rows 1-6 are the data rows.
function xcellRefresh() {
    let items: microUtilities.MenuItem[] = [microUtilities.createMenuItem(xcellBuildHeaderRow())]
    for (let r = 0; r < XCELL_ROWS; r++) {
        items.push(microUtilities.createMenuItem(xcellBuildDataRow(r)))
    }
    ListMenuContents = items
    reloadListGUI(76, 63, 151, 84, darkMode)
}

function xcellSetCell(row: number, col: number, raw: string) {
    xcellGrid[row][col] = raw
    xcellRefresh()
}

// Maps a click's x position (within the list sprite) to a data column, or
// -1 if it landed on the row-label gutter/margin instead of a cell.
function xcellColumnAt(x: number): number {
    if (x < 12) {
        return -1
    }
    if (x < 42) {
        return 0
    }
    if (x < 72) {
        return 1
    }
    if (x < 102) {
        return 2
    }
    if (x < 148) {
        return 3
    }
    return -1
}

// MARK: Right-Click Clipboard
// Which cell/row/column the currently-open right-click menu was opened
// for -- set in input.ts right before openRightClickMenu(), read back in
// listSelection's "xCell" case once the user picks an action.
let xcellRclickTarget = ""
let xcellRclickRow = -1
let xcellRclickCol = -1

let xcellCellClipboard: string = null
let xcellRowClipboard: string[] = null
let xcellColClipboard: string[] = null

function xcellCopyCell(row: number, col: number) {
    xcellCellClipboard = xcellGrid[row][col]
}

// "Copy Output" grabs the computed display value rather than the raw
// formula, so pasting it elsewhere drops in a plain value (like Excel's
// paste-values-only).
function xcellCopyCellOutput(row: number, col: number) {
    xcellCellClipboard = xcellDisplayCell(row, col)
}

function xcellPasteCell(row: number, col: number) {
    if (xcellCellClipboard == null) {
        return
    }
    xcellSetCell(row, col, xcellCellClipboard)
}

function xcellClearCell(row: number, col: number) {
    xcellSetCell(row, col, "")
}

function xcellCopyRow(row: number) {
    let values: string[] = []
    for (let c = 0; c < XCELL_COLS.length; c++) {
        values.push(xcellGrid[row][c])
    }
    xcellRowClipboard = values
}

function xcellPasteRow(row: number) {
    if (xcellRowClipboard == null) {
        return
    }
    for (let c = 0; c < XCELL_COLS.length; c++) {
        xcellGrid[row][c] = xcellRowClipboard[c]
    }
    xcellRefresh()
}

function xcellClearRow(row: number) {
    for (let c = 0; c < XCELL_COLS.length; c++) {
        xcellGrid[row][c] = ""
    }
    xcellRefresh()
}

function xcellCopyCol(col: number) {
    let values: string[] = []
    for (let r = 0; r < XCELL_ROWS; r++) {
        values.push(xcellGrid[r][col])
    }
    xcellColClipboard = values
}

function xcellPasteCol(col: number) {
    if (xcellColClipboard == null) {
        return
    }
    for (let r = 0; r < XCELL_ROWS; r++) {
        xcellGrid[r][col] = xcellColClipboard[r]
    }
    xcellRefresh()
}

function xcellClearCol(col: number) {
    for (let r = 0; r < XCELL_ROWS; r++) {
        xcellGrid[r][col] = ""
    }
    xcellRefresh()
}
