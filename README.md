# About Micro:OS
Micro:OS is a lightweight operating system made in PTX and TypeScript for devices such as the Micro:Bit or Pi Zero
### Upcoming Features
- Write App
- Process Manager
- Web Chat App
- xCell App
- Pin Header Drivers
- ThingAI Instance Code
- ThingAI App
- Image Viewer
- Music Player/Creator
### Known issues (Latest Release)
None
### Known issues (Latest commit)

# Hardware requirements
### Barebones (15-20 fps)
- 32Mhz CPU
- 100KB of RAM
- 1MB of storage
### Bearable (30-45 fps)
- 64Mhz CPU
- 128KB of RAM
- 1MB of storage
- Pretty much the average MicroBit 2.2
### Recommended (80-90 fps)
- ~162Mhz CPU
- 256KB of RAM
- 2MB of storage
### Overkill (600-630fps)
- 1Ghz CPU
- 512MB of ram
- 16GB of storage
# Source code instructions
### Setting up the MicroOS project in VS Code
1. Download the [MakeCode Arcade extension](https://marketplace.visualstudio.com/items?itemName=ms-edu.pxt-vscode-web) for Visual Studio Code.
2. Download and unzip the [source code](https://github.com/NotCryptid/MicroOS/archive/refs/heads/master.zip)
3. Open the source code folder in Visual Studio Code.
4. Head over to the ```Asset Explorer``` tab on the sidebar.
5. Select ```Install Project Dependencies``` from the ```actions``` menu.
### Setting up the MicroOS project on the MakeCode Website
1. Head over to the [Microsoft MakeCode Arcade](https://arcade.makecode.com/) website.
2. Select ```import```
3. Select ```Import URL...```
4. Input ```https://github.com/NotCryptid/MicroOS``` as the repository url.
5. Select ```Go Ahead!```
### Building the Operating System
> [!NOTE]
> You can skip steps 1-6 if you set up the project in the Makecode Arcade Website
1. Upload the source code to a github repository.
> [!IMPORTANT]
> Ensure the main branch is named ```master```
2. Head over to the [Microsoft MakeCode Arcade](https://arcade.makecode.com/) website.
3. Select ```import```
> Without signing into github (Recommended)
4. Select ```Import URL...```
5. Input your GitHub repository url.
> [!IMPORTANT]
> Ensure your GitHub repository is public.
6. Select ```Go Ahead!```
> With signing into github
4. Select ```Your GitHub Repo...```
5. Sign in with GitHub.
6. Select your GitHub repository.

Once you've opened the Operating System in MakeCode you can continue with the following steps.

7. Click the 3 dots next to the ```Download``` button.
8. Select ```Choose hardware```
9. Select your hardware.
10. Click the ```Download``` button.

After you're done you can safely delete the project from the MakeCode Arcade site.

### Setting up MicroLink
> [!NOTE]
> Unless you want to play around with some experimental features its recommended to get the Stable release.
1. Download a [Stable](https://github.com/NotCryptid/MicroOS/tree/master/MicroLink/MicroLink%20Stable.hex) or [Latest](https://github.com/NotCryptid/MicroOS/tree/master/MicroLink/MicroLink%20Latest.hex) MicroLink Release.
2. Head over to the [Microsoft MakeCode Micro:Bit](https://makecode.microbit.org/) website.
3. Select ```import```
4. Select ```Import File...```
5. Upload the hex file you downloaded.
6. Configure the settings to match your needs.
7. Connect your Micro:Bit via USB.
8. Click Download.
9. Upload the exported hex file to your Micro:Bit either with WebUSB or by dragging and dropping the file to the Micro:Bit.

After you're done you can safely delete the project from the MakeCode Micro:Bit site.
