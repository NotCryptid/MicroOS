function compile_nanosdk_code(source: string): string {

    // MARK: Pass 1 - :BLW resolution
    let raw = source.split("~")
    let lines: string[] = []
    let i = 0
    while (i < raw.length) {
        let l = raw[i].trim()
        if (l == "" || l == " ") { i++; continue }
        if (i >= 4 && l.substr(l.length - 4) == ":BLW") {
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

        let tk = l.split(" ").filter(s => s != "")
        if (tk.length == 0) { continue }
        let cmd = tk[0].toUpperCase()
        let a = tk.slice(1)

        // MARK: Basic Commands
        if (cmd == "PRN") { out.push("105§" + a.join(" ")); continue }
        if (cmd == "END") { out.push("106§" + a.join(" ")); continue }
        if (cmd == "ASM") { out.push("107§" + a.join(" ")); continue }

        // MARK: Logic
        if (cmd == "IFB" || cmd == "WHN") {
            let pfx = cmd == "IFB" ? "201" : "401"
            let ac = a[0].toLowerCase()
            if (ac == "end") { out.push(pfx + "§e"); continue }
            if (ac == "els") { out.push(pfx + "§l"); continue }
            if (ac == "var") { out.push(pfx + "§v§" + a[1] + "§" + nsc_cmp(a[2]) + "§" + a.slice(3).join(" ")); continue }
            if (ac == "btn") { out.push(pfx + "§b§" + nsc_btn(a[1]) + "§" + nsc_bs(a[2])); continue }
            if (ac == "spr") { out.push(pfx + "§s§" + a[1] + "§" + (a[2].toLowerCase() == "tch" ? "tch" : nsc_cmp(a[2])) + "§" + a.slice(3).join(" ")); continue }
            if (cmd == "WHN" && ac == "sel") { out.push("401§sel§" + nsc_pad(a[1]) + "§" + a[2]); continue }
        }

        // MARK: Loop
        if (cmd == "LOP") {
            let p = a[0].toLowerCase()
            if (p == "end") { out.push("202§e"); continue }
            if (p == "ext") { out.push("203"); continue }
            out.push("202§" + (p == "inf" ? "inf" : parseInt(p).toString())); continue
        }

        // MARK: ListGUI
        if (cmd == "CLG") { out.push("301"); continue }
        if (cmd == "LGP") { out.push("302§" + nsc_pad(a[0]) + "§" + nsc_pad(a[1])); continue }
        if (cmd == "LGD") { out.push("303§" + nsc_pad(a[0]) + "§" + nsc_pad(a[1])); continue }
        if (cmd == "LGO") { lgoN = parseInt(a[0].toLowerCase().substr(3)); lgoA = []; continue }
        if (cmd == "LGS") { out.push("305§" + nsc_pad(a[0]) + "§" + a.slice(1).join(" ")); continue }
        if (cmd == "LGV") { out.push("306§" + nsc_pad(a[0]) + "§" + a[1]); continue }
        if (cmd == "LGR") { out.push("307§" + nsc_pad(a[0])); continue }
        if (cmd == "DLG") { out.push("308"); continue }
        if (cmd == "LGH") {
            let m = a[0].toLowerCase()
            out.push("309§" + (m == "off" ? "o" : m == "auto" ? "a" : parseInt(m).toString())); continue
        }

        out.push("000") // unknown — no-op passthrough
    }

    return hdr.concat(out).join("~")
}

// MARK: Compiler Helpers

function nsc_cmp(s: string): string {
    let c = s.toLowerCase()
    if (c == "eql") return "="
    if (c == "mor") return ">"
    if (c == "les") return "<"
    if (c == "moe") return "≥"
    if (c == "loe") return "≤"
    return s
}

function nsc_btn(s: string): string {
    let b = s.toLowerCase()
    if (b == "btna") return "a"
    if (b == "btnb") return "b"
    if (b == "dpdu") return "u"
    if (b == "dpdd") return "d"
    if (b == "dpdl") return "l"
    if (b == "dpdr") return "r"
    return b
}

function nsc_bs(s: string): string {
    let b = s.toLowerCase()
    if (b == "dwn") return "t"
    if (b == "ndn") return "f"
    return b
}

function nsc_pad(s: string): string {
    let n = parseInt(s)
    if (isNaN(n)) return s
    if (Math.abs(n) < 10)  return (n < 0 ? "-0" : "00") + Math.abs(n)
    if (Math.abs(n) < 100) return (n < 0 ? "-"  : "0")  + Math.abs(n)
    return n.toString()
}

// MARK: NanoSDK Compiler end
