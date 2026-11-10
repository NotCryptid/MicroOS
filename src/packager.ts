// MARK: NanoSDK Packager
// Not a compiler: the app body ships as plain NanoSDK source and is decoded
// by the runtime (nanoSDK_decode in nanosdk_runtime.ts) when the app opens.
// All this does is validate the 3-line header (DAN, DAI, ASM), bake the DAI
// icon in, work out the title X position, and strip blank lines /
// indentation to save storage.
// Package format: name~icon~submenu~titleX~<source line>~<source line>...

function package_nanosdk_code(source: string): string {
    let lines: string[] = []
    let raw = source.split("~")
    for (let i = 0; i < raw.length; i++) {
        let l = raw[i].trim()
        if (l != "") { lines.push(l) }
    }

    if (lines.length < 3) { return null }
    let t0 = lines[0].split(" "); let t1 = lines[1].split(" "); let t2 = lines[2].split(" ")
    let name = t0.slice(1).join(" ")
    let hdr = [name, nsc_compile_icon(t1.slice(1).join(" ")), t2.slice(1).join(" "), nsc_title_x(name).toString()]

    // Older apps carry a TXP line as the 4th header line; it's ignored now.
    let bodyStart = 3
    if (lines.length > 3 && lines[3].substr(0, 3).toUpperCase() == "TXP") { bodyStart = 4 }

    return hdr.concat(lines.slice(bodyStart)).join("~")
}

// MARK: Packager Helpers

// MARK: DAI Icon Resolution
// Resolves a DAI parameter at compile time: "default" (or empty) passes
// through as-is, otherwise the parameter is treated as a Write asset file
// name WITH extension (eg. "icon.wrt") whose hex-pixel content gets baked
// directly into the package, so the runtime never has to touch the file
// system to render an app's icon.
function nsc_compile_icon(param: string): string {
    if (param == null || param == "" || param.toLowerCase() == "default") {
        return "default"
    }
    let dot = -1
    for (let ci = param.length - 1; ci >= 0; ci--) {
        if (param.charAt(ci) == ".") { dot = ci; break }
    }
    if (dot <= 0) { return "default" }
    let assetContent = settings.readString(fileKey(param.substr(dot + 1), param.substr(0, dot)))
    if (assetContent == null) { return "default" }
    return assetContent.split("~").join("")
}

// MARK: Title X Position
// App titles are textsprites (fixed-width font) positioned by their centre.
// Glyphs don't fill their whole cell though: each has blank columns on the
// left that depend on the letter, so centring on the cell width leaves
// titles starting at different visible x positions. This reads the real
// glyph data from the font and places the title so the first visible pixel
// of the first letter always lands on x = 1 (where the built-in app titles
// sit).
function nsc_glyph_lead(font: image.Font, ch: number): number {
    if (font.multiplier != null && font.multiplier > 1) { return 0 }
    let dataW = font.charWidth
    let charSize = ((font.charHeight + 7) >> 3) * dataW
    let rowSize = 2 + charSize
    let data = font.data
    let count = Math.idiv(data.length, rowSize)
    for (let g = 0; g < count; g++) {
        let off = g * rowSize
        if (data.getNumber(NumberFormat.UInt16LE, off) != ch) { continue }
        let bytesPerCol = charSize / dataW
        for (let col = 0; col < dataW; col++) {
            for (let by = 0; by < bytesPerCol; by++) {
                if (data[off + 2 + col * bytesPerCol + by] != 0) { return col }
            }
        }
        return 0
    }
    return 0
}

function nsc_title_x(name: string): number {
    let font = image.getFontForText(name)
    let lead = name.length > 0 ? nsc_glyph_lead(font, name.charCodeAt(0)) : 0
    return Math.floor(font.charWidth * name.length / 2) + 1 - lead
}

function nsc_tokens(line: string): string[] {
    let parts: string[] = []
    let cur = ""
    for (let ci = 0; ci < line.length; ci++) {
        let ch = line.charAt(ci)
        if (ch == " " || ch == "\t") {
            if (cur != "") { parts.push(cur); cur = "" }
        } else { cur += ch }
    }
    if (cur != "") { parts.push(cur) }
    return parts
}

function nsc_cmp(s: string): string {
    let c = s.toLowerCase()
    switch (c) {
        case "eql": return "="
        case "mor": return ">"
        case "les": return "<"
        case "moe": return "≥"
        case "loe": return "≤"
        default: return s
    }
}

function nsc_op(s: string): string {
    switch (s.toLowerCase()) {
        case "add": return "a"
        case "sub": return "s"
        case "mul": return "m"
        case "div": return "d"
        default: return s
    }
}

function nsc_btn(s: string): string {
    let b = s.toLowerCase()
    switch (b) {
        case "btna": return "a"
        case "btnb": return "b"
        case "dpdu": return "u"
        case "dpdd": return "d"
        case "dpdl": return "l"
        case "dpdr": return "r"
        default: return b
    }
}

function nsc_bs(s: string): string {
    switch (s.toLowerCase()) {
        case "dwn": return "t"
        case "ndn": return "f"
        default: return s
    }
}
