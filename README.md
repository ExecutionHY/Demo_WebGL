# RapidRoll_WebGL

A small game based on WebGL

### Basic

- [x] following camera (move on z-axis)
- [ ] Ball rolling on the boards
- [ ] Different kind of boards
- [ ] Score system

### Advanced

- [ ] Paper1: refractive objects
- [ ] More scences

### Memo

Q1: If you can not load images as texture:

```
step1. Safari -> Preferences -> Advanced -> Show Develop menu in menu bar
step2. Develop -> Disable local file districtions
```

Q2: If you want to put GLSL codes into files:

- Start a HttpRequest to get GLSL files
- Wait for responce, and then init the shaderProgram