export interface IOptions {
  density?: string
  cellSize?: number
  wordCount?: number
  keepOriginalColor?: boolean
  bgColor?: string
}

const defaultOptions = {
  density: "a",
  cellSize: 5,
  wordCount: 0,
  keepOriginalColor: true,
  bgColor: "#000000",
}

class Cell {
  x: number
  y: number
  symbol: string
  color: string
  constructor(x: number, y: number, symbol: string, color: string) {
    this.x = x
    this.y = y
    this.symbol = symbol
    this.color = color
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.fillText(this.symbol, this.x, this.y)
  }
}

export class AsciiEffect {
  #imageCellArray: Cell[] = []
  #pixels: ImageData | null = null

  #ctx
  #width
  #height
  #options: IOptions = defaultOptions

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.#ctx = ctx
    this.#width = width
    this.#height = height
  }

  #convertToSymbol(num: number) {
    let density = this.#options.density
      ? this.#options.density
      : defaultOptions.density!

    const len = density.length - 1
    if (num >= 0 && num <= 255 && len > 0) {
      const scaledNumber = Math.floor((num / 255) * len)
      return density.charAt(scaledNumber)
    } else {
      return density.charAt(len - 1)
    }
  }

  #loadImage(img: HTMLImageElement) {
    this.#ctx.clearRect(0, 0, this.#width, this.#height)
    this.#ctx.drawImage(img, 0, 0, this.#width, this.#height)
    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height)
  }

  #scanImage(cellSize: number, wordCount: number) {
    if (this.#pixels) {
      for (let y = 0; y < this.#pixels.height; y += cellSize) {
        for (let x = 0; x < this.#pixels.width; x += cellSize) {
          const posX = x * 4
          const posY = y * 4
          const pos = posY * this.#pixels.width + posX

          const red = this.#pixels.data[pos]
          const green = this.#pixels.data[pos + 1]
          const blue = this.#pixels.data[pos + 2]

          const total = red + green + blue
          const avg = total / 3 // see optimization #1, we can put this line inside the else block

          let color
          if (this.#options.keepOriginalColor) {
            color = `rgb(${red}, ${green}, ${blue})`
          } else {
            color = `rgb(${avg}, ${avg}, ${avg})`
          }

          // optimization #1
          // we can replace convertToSymbol with the following:
          // notice we use 256 and not 255, since we don't want to access index out of range
          // const symbol = this.#convertToSymbol(avg)
          const symbol = this.#options.density[Math.floor((avg / 256) * this.#options.density.length)]

          // we can skip calculating the avg if we use total instead, like this
          // const symbol = this.#options.density[Math.floor((total / 768) * this.#options.density.length)]

          // note, not sure what wordCount is for.. and I don't know why we are mapping from 0 to 250
          // so I've mapped it from 0 to maximum possible number of total (255*3)
          // possibly we can use 256 * 3 if the next logic is changed
          const wc = mapNumber(wordCount, 0, 255 * 3)

          if (total >= wc) {
            this.#imageCellArray.push(new Cell(x, y, symbol, color))
          }
        }
      }
    } else {
      console.log("error")
    }
  }

  draw(el: HTMLImageElement, options?: IOptions): ImageData {
    this.#options = { ...defaultOptions, ...options }
    this.#imageCellArray = []
    this.#pixels = null

    this.#loadImage(el)
    let cellSize = this.#options.cellSize || defaultOptions.cellSize
    let wordCount = this.#options.wordCount || defaultOptions.wordCount
    let bgColor = this.#options.bgColor || defaultOptions.bgColor

    this.#scanImage(cellSize, wordCount)

    this.#ctx.font = cellSize * 1.2 + "px Verdana"
    this.#ctx.clearRect(0, 0, this.#width, this.#height)
    this.#ctx.fillStyle = bgColor
    this.#ctx.fillRect(0, 0, this.#width, this.#height)

    for (let i = 0; i < this.#imageCellArray.length; i++) {
      this.#imageCellArray[i].draw(this.#ctx)
    }

    // we got warning in browser:
    //
    // Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true. See: https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
    //
    // e.g. when getting context
    // const ctx = canvasEl.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D

    return this.#ctx.getImageData(0, 0, this.#width, this.#height)
  }
}

function mapNumber(num: number, min: number, max: number) {
  if (num < 0) {
    return min
  } else if (num > 10) {
    return max
  } else {
    return min + (num / 10) * (max - min)
  }
}
