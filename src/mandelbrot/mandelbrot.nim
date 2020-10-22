import nimgl/[glfw, opengl]

var GLData: tuple[program, vertexShader, fragmentShader: uint32]
const 
  WIN_WIDTH = 1000
  WIN_HEIGHT = 800


proc keyProc(window: GLFWWindow, key: int32, scancode: int32, action: int32, mods: int32): void {.cdecl.} =
  if key == GLFWKey.ESCAPE and action == GLFWPress:
    window.setWindowShouldClose(true)


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

proc logProgramLinkingError() =
  var logSize: int32
  glGetProgramiv(GLData.program, GL_INFO_LOG_LENGTH, logSize.addr)

  var logStr = cast[ptr GLchar](alloc(logSize))
  glGetProgramInfoLog(GLData.program, logSize, nil, logStr)
  echo "Error linking shader program: ", logStr
  # Cleanup
  dealloc(logStr)
  quit(-1)

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


proc initShaders(vertex_shader_path: string, fragment_shader_path: string) = 
  GLData.program = glCreateProgram()
  GLData.vertexShader = addShader(vertex_shader_path, GL_VERTEX_SHADER)
  GLData.fragmentShader = addShader(fragment_shader_path, GL_FRAGMENT_SHADER)

  glLinkProgram(GLData.program)
  var success: int32
  glGetProgramiv(GLData.program, GL_LINK_STATUS, success.addr)
  if success == 0: logProgramLinkingError()


proc main() =
  assert glfwInit()

  glfwWindowHint(GLFWContextVersionMajor, 4)
  glfwWindowHint(GLFWContextVersionMinor, 1)
  glfwWindowHint(GLFWOpenglForwardCompat, GLFW_TRUE) # Used for Mac
  glfwWindowHint(GLFWOpenglProfile, GLFW_OPENGL_CORE_PROFILE)
  glfwWindowHint(GLFWResizable, GLFW_FALSE)

  let window = glfwCreateWindow(WIN_WIDTH, WIN_HEIGHT, "Simple Mandelbrot fractal")
  assert window != nil

  discard window.setKeyCallback(keyProc)
  window.makeContextCurrent()
 
  assert glInit()
  
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

  while not window.windowShouldClose:
    glClearColor(0.2, 0.2, 0.2, 0.5)
    glUseProgram(GLData.program)
    glClear(GL_COLOR_BUFFER_BIT or GL_DEPTH_BUFFER_BIT)
    glBindVertexArray(mesh.vao)
    glDrawElements(GL_TRIANGLES, indices.len.cint, GL_UNSIGNED_INT, nil)
    window.swapBuffers()
    glfwPollEvents()

  window.destroyWindow()
  glDeleteShader(GLData.vertexShader)
  glDeleteShader(GLData.fragmentShader)
  glDeleteVertexArrays(1, mesh.vao.addr)
  glDeleteBuffers(1, mesh.vbo.addr)
  glDeleteBuffers(1, mesh.ebo.addr)
  glfwTerminate()


main()