"use strict"
import { FFmpeg } from "../assets/ffmpeg/dist/esm/index.js"

const dropTarget = document.getElementById("drop-target")
const loadingCard = document.getElementById("loading")
const loadingMessage = document.getElementById("loading-message")
const progressCard = document.getElementById("progress")
const progressIcon = document.getElementById("progress-icon")
const progressTitle = document.getElementById("progress-title")
const progressBar = document.getElementById("progress-bar")
const downloadButton = document.getElementById("download-button")

const ffmpeg = new FFmpeg()
try {
    loadingMessage.innerHTML = "Loading FFmpeg"
    await ffmpeg.load({
        coreURL: new URL("./assets/core/dist/esm/ffmpeg-core.js", location.href).href,
        wasmURL: new URL("./assets/core/dist/esm/ffmpeg-core.wasm", location.href).href
    })
    ffmpeg.on("log", ({ message }) => {
        console.log(message)
    })
    await ffmpeg.createDir("/uploads")
    await ffmpeg.createDir("/output")
} catch (error) {
    console.error(error)
    alert(`Unable to load ffmpeg!\n${error}\nSee the JavaScript console for more details.`)
}

loadingMessage.innerHTML = "Finishing up"

// The entire page is a dropzone to help avoid user error

let draggingAllowed = true

document.body.addEventListener("dragover", (event) => {
    event.preventDefault()
    if (draggingAllowed === false) {
        return
    }
    event.dataTransfer.dropEffect = "copy"
    dropTarget.classList.add("dragging-over")
})

document.body.addEventListener("dragend", (event) => {
    event.preventDefault()
    if (draggingAllowed === false) {
        return
    }
    dropTarget.classList.remove("dragging-over")
})

document.body.addEventListener("dragleave", (event) => {
    event.preventDefault()
    if (draggingAllowed === false) {
        return
    }
    dropTarget.classList.remove("dragging-over")
})

document.body.addEventListener("drop", async (event) => {
    event.preventDefault()
    if (draggingAllowed === false) {
        return
    }
    dropTarget.classList.remove("dragging-over")
    const items = event.dataTransfer.items
    /**
     * @type {File[]}
     */
    const files = []
    /**
     * 
     * @param {FileSystemEntry} entry 
     * @param {*} path 
     * @returns 
     */
    async function checkDirectory(entry) {
        files.length = 0
        if (entry.isDirectory !== true) {
            console.error(`Folder isn't a folder.`)
            alert(`Folder isn't a folder.`)
            return false
        }
        try {
            const folderReader = entry.createReader()
            console.debug(entry)
            const entries = await new Promise((resolve, reject) => {
                folderReader.readEntries(resolve, reject)
            })
            let folderIsValid = false
            for (const childEntry of entries) {
                if (childEntry.isDirectory === true) {
                    console.error("Folder contains more folders.")
                    return false
                }
                if (childEntry.name === "session.mpd") {
                    console.log("session.mpd file was found!")
                    folderIsValid = true
                }
                console.debug(childEntry)
                const file = await new Promise((resolve, reject) => {
                    childEntry.file(resolve, reject)
                })
                console.debug(file)
                files.push(file)
            }
            return folderIsValid

        } catch (error) {
            console.error(`Error while reading items: ${error}`)
            alert(`Error while reading items!\n${error}`)
            return false
        }
    }
    if (items.length !== 1) {
        alert("You can't drag in more than one item.")
        return
    }
    const entry = items[0].webkitGetAsEntry()
    if (entry !== null) {
        if (await checkDirectory(entry) === false) {
            alert("Invalid folder. Make sure you have dragged in the correct one. See the JavaScript console for more details.")
            return
        }
        draggingAllowed = false
        console.debug(files)
        try {
            await ffmpeg.mount("WORKERFS", { files: files }, "/uploads")
        } catch (error) {
            console.error(error)
            alert(`Can't mount WorkerFS!\n${error}\nSee the JavaScript console for more details.`)
            return
        }
        console.debug(await ffmpeg.listDir("/uploads"))
        dropTarget.hidden = true
        progressCard.hidden = false
        const progressBarInner = progressBar.querySelector("div")
        ffmpeg.on("progress", ({ progress }) => {
            progressBarInner.style.width = `${Math.floor(progress * 100)}%`
            progressBarInner.innerText = `${Math.floor(progress * 100)}%`
            progressBar.ariaValueNow = Math.floor(progress * 100)
        })
        try {
            const execResult = await ffmpeg.exec(["-i", "/uploads/session.mpd", "-c:v", "copy", "-c:a", "copy", "/output/session.mp4"])
            if (execResult !== 0) {
                throw Error(`ffmpeg exited with a non-zero exit code: ${execResult}`)
            }
        } catch (error) {
            console.error(error)
            alert(`${error}\nSee the JavaScript console for more details.`)
            return
        }
        bootstrap.Collapse.getOrCreateInstance(progressBar.parentElement).hide()
        console.debug(await ffmpeg.listDir("/output"))
        try {
            const outputURL = await ffmpeg.getFileURL("/output/session.mp4")
            console.log(outputURL)
            downloadButton.href = outputURL
            downloadButton.download = `${entry.name}.mp4`
            downloadButton.classList.remove("disabled")
            progressTitle.innerHTML = "All done!"
            progressIcon.classList.remove("bi-arrow-repeat")
            progressIcon.classList.add("bi-check-lg")
        } catch (error) {
            console.error(error)
            alert(`Export failed!\n${error}\nSee the JavaScript console for more details.`)
        }
    }
})

loadingMessage.innerHTML = "Done!"
loadingCard.hidden = true
dropTarget.hidden = false