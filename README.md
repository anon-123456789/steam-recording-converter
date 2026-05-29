# steam-recording-converter
A web-based conversion tool that creates MP4 files from Steam Game Recordings.

> [!WARNING]
> You probably shouldn't use this tool. Because of the inherent limitations in the web platform and the libraries/dependencies I use, this isn't the best way of getting your recordings converted. This is mainly just a project for me to keep me busy (because that's what I do when I'm bored for some reason)

## Official instance
If you don't want to build it yourself, check out the official instance at <https://steam-recording-converter.pages.dev>. It's built from the same source code you see here.

## Building
You will need to compile my custom fork of [ffmpeg.wasm](https://ffmpegwasm.netlify.app). The steps below describe how to do that. **I have only tested building on a Linux system. Building on other operating systems may or may not work.**

1. Install [Docker](https://docs.docker.com/engine/install/), (GNU) make, and [Node.js](https://nodejs.org) on your computer.
2. Clone [my fork of ffmpeg.wasm](https://github.com/anon-123456789/ffmpeg-wasm-dash):
```bash
git clone https://github.com/anon-123456789/ffmpeg-wasm-dash.git
cd ffmpeg-wasm-dash
```
3. Build ffmpeg core:
```bash
make prd
```
4. Build the JavaScript part:
```bash
# The build process runs automatically in the postinstall
npm install
```
5. Go into `packages/core` (still inside ffmpeg-wasm-dash) and copy the `dist` folder (not just the contents, the whole folder) into `src/assets/core` in this repo.
6. Do the same thing for `packages/ffmpeg` as well.
7. Upload to a hosting service or serve up the contents of the `src` folder.

## Dev server
A preconfigured Express.js server is included in the `server` folder. You don't need to use this when deploying, as only a static web server is required. You can use it by following these steps:

1. Enter the `server` folder:
```bash
cd server
```
2. Install the dependencies:
```bash
npm install
```
3. Run the server:
```bash
npm start
```

## License
steam-recording-converter
<br>
Copyright &copy; 2026 anon-123456789

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.