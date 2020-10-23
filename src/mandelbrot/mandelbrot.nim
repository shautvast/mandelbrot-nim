import nimgl/[glfw, opengl]

# keeps track of the GL program and the shaders, to interact with GL
var GLData: tuple[program, vertexShader, fragmentShader: uint32]
const 
  WIN_WIDTH = 1000
  WIN_HEIGHT = 800

# navigation parameters
var 
  center_x = 0.0f
  center_y = 0.0f
  zoom:float64 = 1.0
  dx = -0.001
  dy = 0.0
  zf = 0.999

# handle keys
proc keyProc(window: GLFWWindow, key: int32, scancode: int32, action: int32, mods: int32): void {.cdecl.} =
  if action == GLFWPress:
    if key == GLFWKey.ESCAPE:
      window.setWindowShouldClose(true)
    if key == GLFWKey.UP:
      dy += 0.001f
    if key == GLFWKey.DOWN:
      dy -= 0.001f
    if key == GLFWKey.LEFT:
      dx -= 0.001f
    if key == GLFWKey.RIGHT:
      dx += 0.001f;

# prints an error message if necessary (if the shader won't)
proc logShaderCompilationFailure(shader: uint32, shader_path:string) = 
  var logSize: int32
  glGetShaderiv(shader, GL_INFO_LOG_LENGTH, logSize.addr)

  var logStr = cast[ptr GLchar](alloc(logSize))
      
  glGetShaderInfoLog(shader, logSize, nil, logStr)
  echo "Error compiling shader: ", logStr
  echo "Shader location: ", shader_path
  # Cleanup
  dealloc(logStr)
  quit(-1)

# prints an error message if necessary
proc logProgramLinkingError() =
  var logSize: int32
  glGetProgramiv(GLData.program, GL_INFO_LOG_LENGTH, logSize.addr)

  var logStr = cast[ptr GLchar](alloc(logSize))
  glGetProgramInfoLog(GLData.program, logSize, nil, logStr)
  echo "Error linking shader program: ", logStr
  # Cleanup
  dealloc(logStr)
  quit(-1)

# compiles a shader given a source file and a type 
proc addShader(shader_path: string, shader_type: GLenum):uint32 =
  let 
    shadercode = readFile(shader_path)
    shader = glCreateShader(shader_type)
  var shadercodeCString = cstring(shadercode)
  glShaderSource(shader, 1, addr shadercodeCString, nil)
  glCompileShader(shader)
 
  var success: int32 
  glGetShaderiv(shader, GL_COMPILE_STATUS, success.addr)
  if success == 0: logShaderCompilationFailure(shader, shader_path)
  glAttachShader(GLData.program, shader)
  return shader


# loads program and shaders
proc initShaders(vertex_shader_path: string, fragment_shader_path: string) = 
  GLData.program = glCreateProgram()
  GLData.vertexShader = addShader(vertex_shader_path, GL_VERTEX_SHADER)
  GLData.fragmentShader = addShader(fragment_shader_path, GL_FRAGMENT_SHADER)

  glLinkProgram(GLData.program)
  var success: int32
  glGetProgramiv(GLData.program, GL_LINK_STATUS, success.addr)
  if success == 0: logProgramLinkingError()


# pass data to the fragment shader
proc set_float(name: string, value:float) =
  glUniform1f(glGetUniformLocation(GLData.program, name.cstring()), value.cfloat());


proc main() =
  assert glfwInit()

  glfwWindowHint(GLFWContextVersionMajor, 4)
  glfwWindowHint(GLFWContextVersionMinor, 1)
  glfwWindowHint(GLFWOpenglForwardCompat, GLFW_TRUE) # Used for Mac
  glfwWindowHint(GLFWOpenglProfile, GLFW_OPENGL_CORE_PROFILE)
  glfwWindowHint(GLFWResizable, GLFW_FALSE)

  let window = glfwCreateWindow(WIN_WIDTH, WIN_HEIGHT, "Mandelbrot fractal")
  assert window != nil

  discard window.setKeyCallback(keyProc)
  window.makeContextCurrent()
 
  assert glInit()
  
  # two triangles that together make up the entire window
  var vertices = @[
    -1.0f, -1.0f, -0.0f,
     1.0f,  1.0f, -0.0f,
    -1.0f,  1.0f, -0.0f,
     1.0f, -1.0f, -0.0]

  var indices = @[
    0'u32, 1'u32, 2'u32,
    0'u32, 3'u32, 1'u32]
  # 2---,1
  # | .' |
  # 0'---3
  
  # load the data into GL
  var mesh: tuple[vao,vbo,ebo: uint32]

  glGenVertexArrays(1, mesh.vao.addr)
  glGenBuffers(1, mesh.vbo.addr)
  glGenBuffers(1, mesh.ebo.addr)
  glBindVertexArray(mesh.vao)
  
  # bind vertices 
  glBindBuffer(GL_ARRAY_BUFFER, mesh.vbo)
  glBufferData(GL_ARRAY_BUFFER, cint(cfloat.sizeof*vertices.len), vertices[0].addr, GL_STATIC_DRAW)
 
  # bind indices = elements
  glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mesh.ebo)
  glBufferData(GL_ELEMENT_ARRAY_BUFFER, cint(cuint.sizeof*indices.len), indices[0].addr, GL_STATIC_DRAW)
  
  glVertexAttribPointer(0'u32, 3, EGL_FLOAT, false, 3 * cfloat.sizeof, nil)
  glEnableVertexAttribArray(0)
  glBindBuffer(GL_ARRAY_BUFFER, 0)
  glBindVertexArray(mesh.vao)
  initShaders("src/mandelbrot/shader.vert", "src/mandelbrot/shader.frag")

  glUseProgram(GLData.program)
  glClear(GL_COLOR_BUFFER_BIT or GL_DEPTH_BUFFER_BIT)
  glBindVertexArray(mesh.vao)
  
  # main loop
  while not window.windowShouldClose:
    # update zoom params
    zoom *= zf
    if zf < 0.0: zf = 0.0
    center_y += dy * zoom
    if center_y > 1.0f: center_y = 1.0f
    if center_y < -1.0f: center_y = -1.0f
    center_x += dx * zoom
    if center_x > 1.0f: center_x = 1.0f
    if center_x < -1.0f: center_x = -1.0f

    # pass the data to the shader
    set_float("zoom", zoom)
    set_float("center_x", center_x)
    set_float("center_y", center_y)

    glDrawElements(GL_TRIANGLES, indices.len.cint, GL_UNSIGNED_INT, nil)
    window.swapBuffers()
    glfwPollEvents()
  
  #cleanup
  window.destroyWindow()
  glDeleteShader(GLData.vertexShader)
  glDeleteShader(GLData.fragmentShader)
  glDeleteVertexArrays(1, mesh.vao.addr)
  glDeleteBuffers(1, mesh.vbo.addr)
  glDeleteBuffers(1, mesh.ebo.addr)
  glfwTerminate()


main()