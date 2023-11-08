import { AsciiEffect, IOptions } from "./library"

const formEl = document.getElementById("form") as HTMLFormElement
const iconEl = document.getElementById("icon") as HTMLSpanElement
const loadingEl = document.getElementById("loading") as HTMLSpanElement
const convertBtnEl = document.getElementById("convertBtn") as HTMLButtonElement
const downloadBtnEl = document.getElementById(
  "downloadBtn"
) as HTMLButtonElement

const emptyImageEl = document.getElementById("emptyImage") as HTMLDivElement
const imageEl = document.getElementById("image") as HTMLInputElement
const canvasContainerEl = document.getElementById(
  "canvasContainer"
) as HTMLDivElement

const canvasEl = document.createElement("canvas") as HTMLCanvasElement
const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D

let effect: AsciiEffect | null = null

let selectedImage: any
let loading = false

formEl.addEventListener("submit", (e: Event | any) => {
  e.preventDefault()
  if (loading || !(effect && selectedImage)) return

  downloadBtnEl.disabled = true
  loading = true
  updateIcon()

  const data: IOptions = {
    density: e.target.density.value as string,
    cellSize: +e.target.resolution.value,
    wordCount: 10 - e.target.wordCount.value,
    keepOriginalColor: e.target.keepColor.checked,
    bgColor: e.target.bgColor.value,
  }

  let imgData = effect.draw(selectedImage, data)

  const img = new Image()
  img.src = canvasEl.toDataURL("image/png")
  img.width = imgData.width
  img.height = imgData.height
  updateImg(img)

  downloadBtnEl.disabled = false
  loading = false
  updateIcon()
})

imageEl.addEventListener("change", () => {
  const f = imageEl.files ? imageEl.files[0] : null
  const reader = new FileReader()
  reader.onload = function(event: ProgressEvent<FileReader>) {
    const img = new Image()
    img.src = event.target!.result as string

    /* TODO: we need to add the event handler BEFORE we try to trigger it */
    img.onload = function() {
      selectedImage = img
      canvasEl.width = img.width
      canvasEl.height = img.height
      convertBtnEl.disabled = false
      effect = new AsciiEffect(ctx, img.width, img.height)
      updateImg(img)
    }
  }
  reader.readAsDataURL(f as any)
})

downloadBtnEl.addEventListener("click", e => {
  e.preventDefault()
  const dataURL = canvasEl.toDataURL("image/png")
  const downloadLink = document.createElement("a")
  downloadLink.href = dataURL
  downloadLink.download = `ascii${new Date().getTime()}.png`
  downloadLink.click()
})

function updateIcon() {
  if (loading) {
    loadingEl.classList.remove("hidden")
    iconEl.classList.add("hidden")
  } else {
    loadingEl.classList.add("hidden")
    iconEl.classList.remove("hidden")
  }
}

function updateImg(img: HTMLImageElement) {
  const { width, height } = getWidthAndHeight(img.width, img.height)
  img.style.objectFit = "contain"
  img.width = width
  img.height = height
  emptyImageEl.classList.add("hidden")
  canvasContainerEl.classList.remove("hidden")
  canvasContainerEl.classList.add("flex")
  canvasContainerEl.innerHTML = ""
  canvasContainerEl.appendChild(img)
}

function getWidthAndHeight(imgW: number, imgH: number) {
  const maxHeight = 400
  const aspectRatio = imgW / imgH
  const newWidth = maxHeight * aspectRatio

  const width = newWidth
  const height = maxHeight

  return { width, height }
}

// live update
// extracted parts of form submit handler
// TODO: remove unneeded parts
const run = () => {
  if (loading || !(effect && selectedImage)) return

  const data: IOptions = {
    density: formEl.density.value as string,
    cellSize: +formEl.resolution.value,
    wordCount: 10 - formEl.wordCount.value,
    keepOriginalColor: formEl.keepColor.checked,
    bgColor: formEl.bgColor.value,
  }

  let imgData = effect.draw(selectedImage, data)

  // TODO: do we need to create new image every time
  const img = new Image()

  // TODO: converting image data to DataURL seems slow (unnecessary encoding / decoding)
  img.src = canvasEl.toDataURL("image/png")
  img.width = imgData.width
  img.height = imgData.height
  updateImg(img)

  downloadBtnEl.disabled = false
  loading = false
  updateIcon()
}

let high_perf = true

if (high_perf) {
  document.getElementById('wordCount')?.addEventListener('input', run)
  document.getElementById('resolution')?.addEventListener('input', run)
} else {
  document.getElementById('wordCount')?.addEventListener('change', run)
  document.getElementById('resolution')?.addEventListener('change', run)
}
document.getElementById('density')?.addEventListener('change', run)
document.getElementById('keepColor')?.addEventListener('change', run)
document.getElementById('bgColor')?.addEventListener('change', run)

