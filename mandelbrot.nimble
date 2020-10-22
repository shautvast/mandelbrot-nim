# Package

version       = "0.1.0"
author        = "Sander Hautvast"
description   = "A new awesome nimble package"
license       = "MIT"
srcDir        = "src"
bin = @["mandelbrot/mandelbrot"]

# Dependencies

requires "nim >= 1.4.0", "nimgl >= 1.1.5"