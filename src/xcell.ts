// MARK: xCell Grid Engine
// A lightweight spreadsheet: XCELL_TOTAL_COLS columns (A, B, C...) x
// XCELL_TOTAL_ROWS rows, scrolling XCELL_VISIBLE_COLS/XCELL_VISIBLE_ROWS at
// a time in each direction. Each *visible* column (plus the row-number
// gutter) is its own microUtilities.SimpleMenu sprite rather than one wide
// shared row list -- that's what lets a single cell be highlighted on its
// own (SimpleMenu only highlights whole rows *within its own sprite*, so
// one column highlighting a row doesn't touch its neighbours) and lets the
// grid use the full screen width, since there's no shared scrollbar sprite
// competing for the rightmost columns (see xcellArrowUp/Down/Left/Right).
// Scrolling sideways just changes *which* grid columns those 5 fixed
// physical sprites currently display (xcellColScroll), the same way
// scrolling down changes which grid rows they display (xcellScroll).
const XCELL_TOTAL_COLS = 10
const XCELL_VISIBLE_COLS = 5
const XCELL_COL_LETTERS = xcellBuildColLetters(XCELL_TOTAL_COLS)
const XCELL_TOTAL_ROWS = 20
const XCELL_VISIBLE_ROWS = 6
const XCELL_CELL_WIDTH = 4

function xcellBuildColLetters(n: number): string[] {
    let letters: string[] = []
    for (let i = 0; i < n; i++) {
        letters.push(String.fromCharCode(65 + i))
    }
    return letters
}

let xcellGrid: string[][] = xcellNewGrid()

function xcellNewGrid(): string[][] {
    let grid: string[][] = []
    for (let r = 0; r < XCELL_TOTAL_ROWS; r++) {
        let row: string[] = []
        for (let c = 0; c < XCELL_TOTAL_COLS; c++) {
            row.push("")
        }
        grid.push(row)
    }
    return grid
}

function xcellCellRef(row: number, col: number): string {
    return XCELL_COL_LETTERS[col] + (row + 1)
}

// Returns [row, col] for a ref like "A1", or null if it's out of range.
function xcellParseRef(ref: string): number[] {
    if (ref == null || ref.length < 2) {
        return null
    }
    const colChar = ref.charAt(0).toUpperCase()
    let col = -1
    for (let c = 0; c < XCELL_COL_LETTERS.length; c++) {
        if (XCELL_COL_LETTERS[c] == colChar) {
            col = c
            break
        }
    }
    if (col < 0) {
        return null
    }
    const rowNum = parseInt(ref.substr(1), 10)
    if (isNaN(rowNum) || rowNum < 1 || rowNum > XCELL_TOTAL_ROWS) {
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
    for (let r = 0; r < XCELL_TOTAL_ROWS; r++) {
        for (let c = 0; c < XCELL_TOTAL_COLS; c++) {
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

// The in-game on-screen keyboard (game.askForString on real hardware) only
// ever offers letters, digits and this fixed punctuation set: space , . ? !
// : ; " ( ) -- see pxt_modules/game/prompt.ts's digitsUpper row. It has no
// key for + - * / = at all, in either shift state, so a formula typed on
// hardware can't use them. Each arithmetic operator therefore has a second,
// keyboard-reachable spelling; the classic symbol is still accepted too
// since typing on the simulator goes through a real keyboard that can send
// it directly (that's how "=A1*B2" can show up while the on-screen picker
// itself never offers "=" or "*").
//   +  ,        -  ;        *  !        /  ?
function xcellOperatorFor(c: string): string {
    if (c == "+" || c == ",") { return "+" }
    if (c == "-" || c == ";") { return "-" }
    if (c == "*" || c == "!") { return "*" }
    if (c == "/" || c == "?") { return "/" }
    return null
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
        } else if (c == "(" || c == ")" || c == ":") {
            tokens.push(c)
            i++
        } else if (xcellOperatorFor(c) != null) {
            tokens.push(xcellOperatorFor(c))
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
    if (xcellIsFormula(raw)) {
        visiting.push(ref)
        const parser = new XcellParser(xcellTokenize(xcellFormulaBody(raw)), visiting)
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

// A cell holds a formula if it starts with "=" (the classic, real-keyboard
// spelling) or "(" (the on-screen-keyboard-typable spelling -- the leading
// paren doubles as the formula marker and the expression's own opening
// grouping paren, e.g. "(A1+B2)"). xcellFormulaBody returns the text to
// hand the tokenizer: the "=" marker itself isn't a token so it's
// stripped, but the "(" marker is a real token so it's kept.
function xcellIsFormula(raw: string): boolean {
    const c = raw.charAt(0)
    return c == "=" || c == "("
}

function xcellFormulaBody(raw: string): string {
    return raw.charAt(0) == "=" ? raw.substr(1) : raw
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
    if (xcellIsFormula(raw)) {
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
// Layout: a narrow row-number gutter followed by XCELL_VISIBLE_COLS
// equal-width data columns, flush against each other so the grid reads as
// one continuous table. This spans the full screen width (through the
// gutter other apps reserve for a scrollbar) since xCell scrolls via the
// 4 arrow sprites below instead of a scrollbar sprite -- see
// xcellCreateSprites. The 5 column sprites are physical slots; scrolling
// sideways (xcellColScroll) just changes which absolute grid column each
// slot currently shows, the same way xcellScroll does for rows.
const XCELL_LEFT = 1
const XCELL_LABEL_WIDTH = 16
const XCELL_COL_WIDTH = 28
const XCELL_ROW_HEIGHT = 12
const XCELL_GRID_CENTER_Y = 70

let xcellLabelGUI: any = null
let xcellColumnGUIs: any[] = []
let xcellHeaderTexts: TextSprite[] = []
let xcellHeaderBgs: Sprite[] = []
let xcellArrowUp: Sprite = null
let xcellArrowDown: Sprite = null
let xcellArrowLeft: Sprite = null
let xcellArrowRight: Sprite = null
let xcellScroll = 0
let xcellColScroll = 0

function xcellColumnLeft(slot: number): number {
    return XCELL_LEFT + XCELL_LABEL_WIDTH + slot * XCELL_COL_WIDTH
}

// Maps a click's x position to an absolute grid column, or -1 if it landed
// on the row-number gutter/margin instead of a cell.
function xcellColumnAt(x: number): number {
    if (x < XCELL_LEFT + XCELL_LABEL_WIDTH) {
        return -1
    }
    for (let slot = 0; slot < XCELL_VISIBLE_COLS; slot++) {
        if (x < xcellColumnLeft(slot) + XCELL_COL_WIDTH) {
            return xcellColScroll + slot
        }
    }
    return -1
}

// Pads/truncates a cell's display text to exactly XCELL_CELL_WIDTH
// characters. Numbers that don't fit become "###" (Excel's own "column too
// narrow" tell) instead of a silently truncated, misleading value. (Empty
// space within a cell's own width doesn't need manual padding -- each
// column is its own SimpleMenu, which already fills its unused row width
// with plain background.)
function xcellFormattedCellSlot(row: number, col: number): string {
    const display = xcellDisplayCell(row, col)
    if (display.length <= XCELL_CELL_WIDTH || display == "#ERR") {
        return display
    }
    if (xcellLooksNumeric(xcellGrid[row][col]) || xcellIsFormula(xcellGrid[row][col])) {
        let out = ""
        for (let i = 0; i < XCELL_CELL_WIDTH; i++) {
            out += "#"
        }
        return out
    }
    return display.substr(0, XCELL_CELL_WIDTH)
}

function xcellApplyColors(gui: any) {
    if (darkMode) {
        gui.setColors(1, 15, 15, 1)
    } else {
        gui.setColors(15, 1, 1, 3)
    }
}

// Builds the physical sprites: the row-number gutter, XCELL_VISIBLE_COLS
// data-column SimpleMenus, their column-letter header labels, and the 4
// scroll arrows -- all in the toolbar row, since that's the space that's
// free now the grid itself uses the full screen width instead of leaving
// room for a scrollbar. Called once from Open_xCell; close_apps() tears it
// all down again (SimpleMenu sprites via SpriteKind.SimpleMenu, header
// labels via SpriteKind.Text, arrows via SpriteKind.App_UI).
function xcellCreateSprites() {
    xcellLabelGUI = microUtilities.createMenuFromArray([])
    xcellLabelGUI.setDimensions(XCELL_LABEL_WIDTH, XCELL_VISIBLE_ROWS * XCELL_ROW_HEIGHT)
    xcellLabelGUI.setPosition(XCELL_LEFT + XCELL_LABEL_WIDTH / 2, XCELL_GRID_CENTER_Y)
    xcellLabelGUI.z = -30
    xcellApplyColors(xcellLabelGUI)

    xcellColumnGUIs = []
    xcellHeaderTexts = []
    xcellHeaderBgs = []
    const headerColor = darkMode ? 1 : 15
    for (let slot = 0; slot < XCELL_VISIBLE_COLS; slot++) {
        const gui = microUtilities.createMenuFromArray([])
        gui.setDimensions(XCELL_COL_WIDTH, XCELL_VISIBLE_ROWS * XCELL_ROW_HEIGHT)
        const centerX = xcellColumnLeft(slot) + XCELL_COL_WIDTH / 2
        gui.setPosition(centerX, XCELL_GRID_CENTER_Y)
        gui.z = -30
        xcellApplyColors(gui)
        xcellColumnGUIs.push(gui)

        // A plain fixed-size sprite drawn behind the header text, matching
        // the exact XCELL_COL_WIDTH x XCELL_ROW_HEIGHT footprint of a data
        // cell's own highlight rect (see SimpleMenu.draw in simpleMenu.ts)
        // -- the TextSprite itself only ever auto-sizes to its glyph, so its
        // own .bg can't be used to make the header highlight match the cell
        // highlight's width/height.
        const headerBg = sprites.create(image.create(XCELL_COL_WIDTH, XCELL_ROW_HEIGHT), SpriteKind.App_UI)
        headerBg.setPosition(centerX, 28)
        headerBg.z = -30
        xcellHeaderBgs.push(headerBg)

        const header = textsprite.create("", 0, headerColor)
        header.setPosition(centerX, 28)
        xcellHeaderTexts.push(header)
    }

    xcellArrowLeft = sprites.create(assets.image`Arrow`, SpriteKind.App_UI)
    microUtilities.setSpriteRotation(xcellArrowLeft, 270)
    xcellArrowLeft.setPosition(118, 15)
    xcellArrowUp = sprites.create(assets.image`Arrow`, SpriteKind.App_UI)
    xcellArrowUp.setPosition(128, 15)
    xcellArrowDown = sprites.create(assets.image`Arrow`, SpriteKind.App_UI)
    microUtilities.setSpriteRotation(xcellArrowDown, 180)
    xcellArrowDown.setPosition(138, 15)
    xcellArrowRight = sprites.create(assets.image`Arrow`, SpriteKind.App_UI)
    microUtilities.setSpriteRotation(xcellArrowRight, 90)
    xcellArrowRight.setPosition(148, 15)
}

// Rebuilds the visible window (xcellScroll/xcellColScroll onward) into
// each column sprite's own `.items` and its header label -- cheaper than
// the destroy-and-recreate reloadListGUI() every other app uses, and each
// sprite only ever needs to know about its own column.
function xcellRefresh() {
    let labelItems: microUtilities.MenuItem[] = []
    for (let i = 0; i < XCELL_VISIBLE_ROWS; i++) {
        labelItems.push(microUtilities.createMenuItem((xcellScroll + i + 1).toString()))
    }
    xcellLabelGUI.items = labelItems

    for (let slot = 0; slot < XCELL_VISIBLE_COLS; slot++) {
        const col = xcellColScroll + slot
        xcellHeaderTexts[slot].setText(XCELL_COL_LETTERS[col])
        let colItems: microUtilities.MenuItem[] = []
        for (let i = 0; i < XCELL_VISIBLE_ROWS; i++) {
            colItems.push(microUtilities.createMenuItem(xcellFormattedCellSlot(xcellScroll + i, col)))
        }
        xcellColumnGUIs[slot].items = colItems
    }
}

function xcellSetCell(row: number, col: number, raw: string) {
    xcellGrid[row][col] = raw
    xcellRefresh()
}

function xcellScrollLeft() {
    if (xcellColScroll <= 0) {
        return
    }
    xcellColScroll--
    xcellRefresh()
}

function xcellScrollRight() {
    if (xcellColScroll >= XCELL_TOTAL_COLS - XCELL_VISIBLE_COLS) {
        return
    }
    xcellColScroll++
    xcellRefresh()
}

function xcellScrollUp() {
    if (xcellScroll <= 0) {
        return
    }
    xcellScroll--
    xcellRefresh()
}

function xcellScrollDown() {
    if (xcellScroll >= XCELL_TOTAL_ROWS - XCELL_VISIBLE_ROWS) {
        return
    }
    xcellScroll++
    xcellRefresh()
}

// Highlights the single cell under the mouse (if any) by setting just that
// column's selectedIndex and clearing every other column's -- called every
// tick from background.ts instead of the shared updateListMenuHover(),
// which only knows how to highlight a whole row within one shared sprite.
// Tracks which column-letter header sprite is currently drawn in its
// "active" colors, so xcellUpdateHover only touches a TextSprite (which
// redraws its whole image on every color change) when the hovered column
// actually changes, not on every 10ms background tick.
let xcellHoverCol = -1

function xcellSetHeaderActive(slot: number, active: boolean) {
    const header = xcellHeaderTexts[slot]
    const headerBg = xcellHeaderBgs[slot]
    if (active) {
        headerBg.image.fill(darkMode ? 1 : 3)
        header.fg = darkMode ? 15 : 1
    } else {
        headerBg.image.fill(0)
        header.fg = darkMode ? 1 : 15
    }
    header.update()
}

function xcellUpdateHover() {
    xcellLabelGUI.selectedIndex = -1
    for (let c = 0; c < xcellColumnGUIs.length; c++) {
        xcellColumnGUIs[c].selectedIndex = -1
    }

    // The column-letter header row is its own band above the data rows --
    // hovering it highlights just that column's header, like hovering a
    // cell highlights just that cell, with no row/cell selected below it.
    let hoveredSlot = -1
    const headerY = sillySpacingForListGUI[1]
    if (Mouse_Cursor.y >= headerY && Mouse_Cursor.y < headerY + XCELL_ROW_HEIGHT) {
        const col = xcellColumnAt(Mouse_Cursor.x)
        if (col >= 0) {
            hoveredSlot = col - xcellColScroll
        }
    } else {
        for (let i = 0; i < XCELL_VISIBLE_ROWS; i++) {
            const y = sillySpacingForListGUI[i + 2]
            if (Mouse_Cursor.y >= y && Mouse_Cursor.y < y + XCELL_ROW_HEIGHT) {
                // The row-number gutter is part of this same row band --
                // hovering it (col < 0) still highlights the row label
                // itself, same as hovering any other cell in the row.
                xcellLabelGUI.selectedIndex = i
                const col = xcellColumnAt(Mouse_Cursor.x)
                if (col >= 0) {
                    hoveredSlot = col - xcellColScroll
                    xcellColumnGUIs[hoveredSlot].selectedIndex = i
                }
                break
            }
        }
    }

    if (hoveredSlot != xcellHoverCol) {
        if (xcellHoverCol >= 0) {
            xcellSetHeaderActive(xcellHoverCol, false)
        }
        if (hoveredSlot >= 0) {
            xcellSetHeaderActive(hoveredSlot, true)
        }
        xcellHoverCol = hoveredSlot
    }
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
    for (let c = 0; c < XCELL_TOTAL_COLS; c++) {
        values.push(xcellGrid[row][c])
    }
    xcellRowClipboard = values
}

function xcellPasteRow(row: number) {
    if (xcellRowClipboard == null) {
        return
    }
    for (let c = 0; c < XCELL_TOTAL_COLS; c++) {
        xcellGrid[row][c] = xcellRowClipboard[c]
    }
    xcellRefresh()
}

function xcellClearRow(row: number) {
    for (let c = 0; c < XCELL_TOTAL_COLS; c++) {
        xcellGrid[row][c] = ""
    }
    xcellRefresh()
}

function xcellCopyCol(col: number) {
    let values: string[] = []
    for (let r = 0; r < XCELL_TOTAL_ROWS; r++) {
        values.push(xcellGrid[r][col])
    }
    xcellColClipboard = values
}

function xcellPasteCol(col: number) {
    if (xcellColClipboard == null) {
        return
    }
    for (let r = 0; r < XCELL_TOTAL_ROWS; r++) {
        xcellGrid[r][col] = xcellColClipboard[r]
    }
    xcellRefresh()
}

function xcellClearCol(col: number) {
    for (let r = 0; r < XCELL_TOTAL_ROWS; r++) {
        xcellGrid[r][col] = ""
    }
    xcellRefresh()
}
