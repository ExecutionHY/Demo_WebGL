# Demo_WebGL

CG demos based on WebGL

Physics engine: [Cannon](https://github.com/schteppe/cannon.js).

API: [http://schteppe.github.io/cannon.js/docs/classes/Body.html](http://schteppe.github.io/cannon.js/docs/classes/Body.html)

### Basic

- [x] following camera (move on z-axis)
- [ ] update to WebGL2

### Advanced

- [ ] Paper1: refractive objects
- [ ] More scences

### Memo

Q1: If you can not load images as texture:

A1: disable local file districtions

```
step1. Safari -> Preferences -> Advanced -> Show Develop menu in menu bar
step2. Develop -> Disable local file districtions
```

A2: start local server to debug, e.g. LiveServer in VSCode.

Q2: If you want to put GLSL codes into files:

- Start a HttpRequest to get GLSL files
- Wait for responce, and then init the shaderProgram