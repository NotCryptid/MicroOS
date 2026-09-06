# Graph Report - MicroOS  (2026-08-21)

## Corpus Check
- 17 files · ~19,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 242 nodes · 414 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 61,031 output

## Community Hubs (Navigation)
- xCell Spreadsheet App
- WebChat Protocol & Crypto
- Project Config & Metadata
- Boot Kernel & Global State
- Input Click Handlers
- NanoSDK Script Runtime
- App Backend Utilities
- App Launcher
- xCell Formula Parser
- NanoSDK Compiler

## God Nodes (most connected - your core abstractions)
1. `MicroOS` - 30 edges
2. `listSelection()` - 11 edges
3. `xcellRefresh()` - 11 edges
4. `sendMessage()` - 10 edges
5. `xcellEvaluateCell()` - 10 edges
6. `MouseClick()` - 9 edges
7. `_sendFileChunks()` - 9 edges
8. `createAppBar()` - 8 edges
9. `_handleEnvelope()` - 8 edges
10. `XcellParser` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Micro:Bit` --conceptually_related_to--> `MakeCode Arcade (target platform)`  [AMBIGUOUS]
  README.md → pxt.json
- `Pi Pico` --conceptually_related_to--> `MakeCode Arcade (target platform)`  [AMBIGUOUS]
  README.md → pxt.json
- `_config.yml (GitHub Pages / MakeCode site config)` --references--> `MicroOS`  [EXTRACTED]
  _config.yml → pxt.json
- `Micro:OS description` --references--> `MicroOS`  [EXTRACTED]
  README.md → pxt.json
- `_config.yml (GitHub Pages / MakeCode site config)` --references--> `MakeCode Arcade (target platform)`  [EXTRACTED]
  _config.yml → pxt.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MakeCode Arcade Target Configuration** — pxt_microos, pxt_arcade, config_yml [EXTRACTED 1.00]
- **Shared NanoColor Palette Across Build and Editor** — pxt_microos, pxt_palette, palettes_custom0 [INFERRED 0.85]

## Communities (10 total, 1 thin omitted)

### Community 0 - "xCell Spreadsheet App"
Cohesion: 0.08
Nodes (40): XCELL_COL_LETTERS, xcellApplyColors(), xcellCellRef(), xcellClearCell(), xcellClearCol(), xcellClearRow(), xcellColumnAt(), xcellColumnGUIs (+32 more)

### Community 1 - "WebChat Protocol & Crypto"
Cohesion: 0.09
Nodes (40): _crypt(), _deriveSeed(), _expireStaleFiles(), _fileNameTaken(), _findPendingFile(), _getSenderId(), _getVerified(), _handleEnvelope() (+32 more)

### Community 2 - "Project Config & Metadata"
Cohesion: 0.07
Nodes (28): _config.yml (GitHub Pages / MakeCode site config), images.g.jres, images.g.ts, NanoColor Palette (custom0), MakeCode Arcade (target platform), arcade-text (github:microsoft/arcade-text#v1.3.0), browser-events (dependency), "Lightweight Operating System made in PTX" (+20 more)

### Community 3 - "Boot Kernel & Global State"
Cohesion: 0.08
Nodes (25): Active_Processes, clock, Current_Settings, fileNamesString, generateTaskbar(), getActiveTaskbarIcon(), isDestroyed(), Library_Icon_Files (+17 more)

### Community 4 - "Input Click Handlers"
Cohesion: 0.16
Nodes (19): handleFileManagerSettingsClick(), handleLibraryClick(), handleNanoCodeWriteClick(), handleNanoCodeWriteToolbarClick(), handleRightClickMenuClick(), handleScrollArrowClick(), handleTaskbarIconClick(), handleWebChatClick() (+11 more)

### Community 5 - "NanoSDK Script Runtime"
Cohesion: 0.13
Nodes (21): binary, command_data, condition_met, executeNanoSDKLine(), loop_condition, loop_line, loop_repeats_left, menu_array (+13 more)

### Community 6 - "App Backend Utilities"
Cohesion: 0.23
Nodes (14): changeSettings(), close_apps(), deleteAllUserFiles(), fileEntrySize(), fileKey(), getAppSettingsMenu(), getSystemSettingsMenu(), hasStorageSpaceFor() (+6 more)

### Community 7 - "App Launcher"
Cohesion: 0.40
Nodes (9): createAppBar(), createScrollBarSprites(), Open_FileManager(), Open_NanoCode(), Open_ProcessManager(), Open_Settings(), Open_Web(), Open_Write() (+1 more)

### Community 9 - "NanoSDK Compiler"
Cohesion: 0.46
Nodes (7): compile_nanosdk_code(), nsc_bs(), nsc_btn(), nsc_cmp(), nsc_compile_icon(), nsc_pad(), nsc_tokens()

## Ambiguous Edges - Review These
- `MakeCode Arcade (target platform)` → `Micro:Bit`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `MakeCode Arcade (target platform)` → `Pi Pico`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **63 isolated node(s):** `SpriteKind`, `ListMenuGUIHidden`, `Settings`, `ListMenuContents`, `User_Files` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `MakeCode Arcade (target platform)` and `Micro:Bit`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `MakeCode Arcade (target platform)` and `Pi Pico`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `MicroOS` connect `Project Config & Metadata` to `xCell Spreadsheet App`, `WebChat Protocol & Crypto`, `Boot Kernel & Global State`, `Input Click Handlers`, `NanoSDK Script Runtime`, `App Backend Utilities`, `App Launcher`, `NanoSDK Compiler`?**
  _High betweenness centrality (0.878) - this node is a cross-community bridge._
- **Why does `XcellParser` connect `xCell Formula Parser` to `xCell Spreadsheet App`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `SpriteKind`, `ListMenuGUIHidden`, `Settings` to the rest of the system?**
  _63 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `xCell Spreadsheet App` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._
- **Should `WebChat Protocol & Crypto` be split into smaller, more focused modules?**
  _Cohesion score 0.09413067552602436 - nodes in this community are weakly interconnected._