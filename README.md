# ASCII Art Converter

Image > converts > ASCII Art

## Demo

https://asciiart-converter.netlify.app/

## Tech Stack

**Client:** Typescript, TailwindCSS, DaisyUI, Vite

## Usage/Examples

```javascript
import { AsciiEffect } from 'library'

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext("2d")

let img = new Image()
img.src = 'your_local.png'
// this will not work in production because of cors.

let options = {
    density: 'aaaa',
    cellSize: 5,
    wordCount: 10,
    keepOriginalColor: true
    bgColor: '#000000'
}

img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    let effect = new AsciiEffect(ctx, img.width, img.height)
    effect.draw(img, options)
}
```
