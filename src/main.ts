import { AsciiEffect, IOptions } from "./library"

const formEl = document.getElementById("form") as HTMLFormElement

const convertBtnEl = document.getElementById("convertBtn") as HTMLButtonElement
const downloadBtnEl = document.getElementById(
  "downloadBtn"
) as HTMLButtonElement

const emptyImageEl = document.getElementById("emptyImage") as HTMLDivElement
const imageEl = document.getElementById("image") as HTMLInputElement

const canvasContainerEl = document.getElementById(
  "canvasContainer"
) as HTMLDivElement
const canvasEl = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D

let effect: AsciiEffect | null = null
const maxWidth = 300
const maxHeight = 400
let selectedImage: any

formEl.addEventListener("submit", (e: Event | any) => {
  e.preventDefault()

  const data: IOptions = {
    density: e.target.density.value as string,
    cellSize: +e.target.resolution.value,
    wordCount: 10 - e.target.wordCount.value,
    keepOriginalColor: e.target.keepColor.checked,
    bgColor: e.target.bgColor.value,
  }
  if (effect && selectedImage) {
    effect.draw(selectedImage, data)
    downloadBtnEl.disabled = false
  }
})

imageEl.addEventListener("change", () => {
  const f = imageEl.files ? imageEl.files[0] : null
  const reader = new FileReader()
  reader.onload = function (event: ProgressEvent<FileReader>) {
    const img = new Image()
    img.src = event.target!.result as string
    img.onload = function () {
      selectedImage = img
      emptyImageEl.classList.add("hidden")
      canvasContainerEl.classList.remove("hidden")
      canvasContainerEl.classList.add("flex")

      const { width, height } = getWidthAndHeight(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )

      canvasEl.width = width
      canvasEl.height = height
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(selectedImage, 0, 0, width, height)
      effect = new AsciiEffect(ctx, width, height)
      convertBtnEl.disabled = false
    }
  }
  reader.readAsDataURL(f as any)
})

downloadBtnEl.addEventListener("click", () => {
  const dataURL = canvasEl.toDataURL("image/png")
  const downloadLink = document.createElement("a")
  downloadLink.href = dataURL
  downloadLink.download = `ascii${new Date().getTime()}.png`
  downloadLink.click()
})

function getWidthAndHeight(
  imgW: number,
  imgH: number,
  maxW: number,
  maxH: number
) {
  let widthScale = 1
  let heightScale = 1

  if (imgW > maxW) {
    widthScale = maxW / imgW
  }
  if (imgH > maxH) {
    heightScale = maxH / imgH
  }

  const scale = Math.min(widthScale, heightScale)

  const width = imgW * scale
  const height = imgH * scale

  return { width, height }
}
