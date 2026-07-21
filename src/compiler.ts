// MARK: NanoSDK Compiler

function compile_nanosdk_code(source: string): string {

    // MARK: Pass 1 - :BLW resolution
    // LOP :BLW is special — we do NOT join it here, instead we handle it
    // in the body pass so we can keep the IFB line separate for parsing.
    // All other :BLW lines get joined with the line below.
    let raw = source.split("~")
    let lines: string[] = []
    let i = 0
    while (i < raw.length) {
        let l = raw[i].trim()
        if (l == "" || l == " ") { i++; continue }
        let isLopBlw = l.toUpperCase() == "LOP :BLW"
        if (i >= 4 && !isLopBlw && l.substr(l.length - 4) == ":BLW") {
            let base = l.substr(0, l.length - 4).trim()
            i++
            while (i < raw.length && raw[i].trim() == "") { i++ }
            lines.push(i < raw.length ? base + " " + raw[i++].trim() : base)
        } else { lines.push(l); i++ }
    }

    // MARK: Pass 2 - Header
    let t0 = lines[0].split(" "); let t1 = lines[1].split(" ")
    let t2 = lines[2].split(" "); let t3 = lines[3].split(" ")
    let hdr = [t0.slice(1).join(" "), t1.slice(1).join(" "), t2.slice(1).join(" "), t3[1]]

    // MARK: Pass 3 - Body
    let out: string[] = []
    let body = lines.slice(4)
    let lgoN = 0
    let lgoA: string[] = []

    for (let li = 0; li < body.length; li++) {
        let l = body[li]

        // MARK: LGO string consumption
        if (lgoN > 0) {
            lgoA.push(l); lgoN--
            if (lgoN == 0) { out.push("304§" + lgoA.join("§")); lgoA = [] }
            continue
        }

        let tk = nsc_tokens(l)
        if (tk.length == 0) { continue }
        let cmd = tk[0].toUpperCase()
        let a = tk.slice(1)

        switch (cmd) {
            // MARK: Basic Commands
            case "PRN": out.push("105§" + a.join(" ")); continue
            case "END": out.push("106§" + a.join(" ")); continue
            case "ASM": out.push("107§" + a.join(" ")); continue

            // MARK: Logic — IFB and WHN share the same condition encoding
            case "IFB":
            case "WHN": {
                let pfx = cmd == "IFB" ? "201" : "401"
                let ac = a[0].toLowerCase()
                switch (ac) {
                    case "end": out.push(pfx + "§e"); continue
                    case "els": out.push(pfx + "§l"); continue
                    case "var": out.push(pfx + "§v§" + a[1] + "§" + nsc_cmp(a[2]) + "§" + a.slice(3).join(" ")); continue
                    case "btn": out.push(pfx + "§b§" + nsc_btn(a[1]) + "§" + nsc_bs(a[2])); continue
                    case "spr": out.push(pfx + "§s§" + a[1] + "§" + (a[2].toLowerCase() == "tch" ? "tch" : nsc_cmp(a[2])) + "§" + a.slice(3).join(" ")); continue
                    case "sel": if (cmd == "WHN") { out.push("401§sel§" + nsc_pad(a[1])); continue }
                }
                break
            }

            // MARK: Loop
            case "LOP": {
                let p = a.length > 0 ? a[0].toLowerCase() : ""
                switch (p) {
                    case "end": out.push("202§e"); continue
                    case "ext": out.push("202§x"); continue
                    case "inf": out.push("202§inf"); continue
                    case ":blw": {
                        // LOP :BLW — next line is the condition (IFB btn/var/spr)
                        li++
                        if (li < body.length) {
                            let ctk = nsc_tokens(body[li])
                            let cac = ctk.length > 1 ? ctk[1].toLowerCase() : ""
                            let ca = ctk.slice(2)
                            let condStr = ""
                            switch (cac) {
                                case "btn": condStr = "b§" + nsc_btn(ca[0]) + "§" + nsc_bs(ca[1]); break
                                case "var": condStr = "v§" + ca[0] + "§" + nsc_cmp(ca[1]) + "§" + ca.slice(2).join(" "); break
                                case "spr": condStr = "s§" + ca[0] + "§" + (ca[1].toLowerCase() == "tch" ? "tch" : nsc_cmp(ca[1])) + "§" + ca.slice(2).join(" "); break
                            }
                            out.push("202§BLW§" + condStr)
                        }
                        continue
                    }
                    default: out.push("202§" + parseInt(p).toString()); continue
                }
            }

            // MARK: ListGUI
            case "CLG": {
                let p = a.length > 0 ? a[0].toLowerCase() : ""
                let enc = p == "ful" ? "f" : p == "scl" ? "s" : ""
                out.push(enc ? "301§" + enc : "301"); continue
            }
            case "LGP": out.push("302§" + nsc_pad(a[0]) + "§" + nsc_pad(a[1])); continue
            case "LGD": out.push("303§" + nsc_pad(a[0]) + "§" + nsc_pad(a[1])); continue
            case "LGO": lgoN = parseInt(a[0].toLowerCase().substr(3)); lgoA = []; continue
            case "LGS": out.push("305§" + nsc_pad(a[0]) + "§" + a.slice(1).join(" ")); continue
            case "LGV": out.push("306§" + nsc_pad(a[0]) + "§" + a[1]); continue
            case "LGR": out.push("307§" + nsc_pad(a[0])); continue
            case "DLG": out.push("308"); continue
            case "LGH": {
                let m = a[0].toLowerCase()
                out.push("309§" + (m == "off" ? "o" : m == "auto" ? "a" : parseInt(m).toString())); continue
            }
            case "LGT": out.push("310§" + a[0].toLowerCase()); continue
            case "LSB": {
                let m = a[0].toLowerCase()
                out.push("311§" + (m == "on" ? "t" : "f")); continue
            }
        }

        out.push("000") // unknown — no-op passthrough
    }

    return hdr.concat(out).join("~")
}

// MARK: Compiler Helpers

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

function nsc_pad(s: string): string {
    let n = parseInt(s)
    if (isNaN(n)) return s
    if (Math.abs(n) < 10)  return (n < 0 ? "-0" : "00") + Math.abs(n)
    if (Math.abs(n) < 100) return (n < 0 ? "-"  : "0")  + Math.abs(n)
    return n.toString()
}