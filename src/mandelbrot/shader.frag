#version 410 core
in vec4 gl_FragCoord;
 
out vec4 fragColor;
 
uniform float center_x;
uniform float center_y;
uniform float zoom;
 
#define MAX_ITERATIONS 600

const vec3 colors[256] = vec3[256](
    vec3(0.0,0.0,0.0),
    vec3(0.5,0.0,0.0),
    vec3(0.0,0.5,0.0),
    vec3(0.5,0.5,0.0),
    vec3(0.0,0.0,0.5),
    vec3(0.5,0.0,0.5),
    vec3(0.0,0.5,0.5),
    vec3(0.75,0.75,0.75),
    vec3(0.5,0.5,0.5),
    vec3(0.99609375,0.0,0.0),
    vec3(0.0,0.99609375,0.0),
    vec3(0.99609375,0.99609375,0.0),
    vec3(0.0,0.0,0.99609375),
    vec3(0.99609375,0.0,0.99609375),
    vec3(0.0,0.99609375,0.99609375),
    vec3(0.99609375,0.99609375,0.99609375),
    vec3(0.0,0.0,0.0),
    vec3(0.0,0.0,0.37109375),
    vec3(0.0,0.0,0.52734375),
    vec3(0.0,0.0,0.68359375),
    vec3(0.0,0.0,0.83984375),
    vec3(0.0,0.0,0.99609375),
    vec3(0.0,0.37109375,0.0),
    vec3(0.0,0.37109375,0.37109375),
    vec3(0.0,0.37109375,0.52734375),
    vec3(0.0,0.37109375,0.68359375),
    vec3(0.0,0.37109375,0.83984375),
    vec3(0.0,0.37109375,0.99609375),
    vec3(0.0,0.52734375,0.0),
    vec3(0.0,0.52734375,0.37109375),
    vec3(0.0,0.52734375,0.52734375),
    vec3(0.0,0.52734375,0.68359375),
    vec3(0.0,0.52734375,0.83984375),
    vec3(0.0,0.52734375,0.99609375),
    vec3(0.0,0.68359375,0.0),
    vec3(0.0,0.68359375,0.37109375),
    vec3(0.0,0.68359375,0.52734375),
    vec3(0.0,0.68359375,0.68359375),
    vec3(0.0,0.68359375,0.83984375),
    vec3(0.0,0.68359375,0.99609375),
    vec3(0.0,0.83984375,0.0),
    vec3(0.0,0.83984375,0.37109375),
    vec3(0.0,0.83984375,0.52734375),
    vec3(0.0,0.83984375,0.68359375),
    vec3(0.0,0.83984375,0.83984375),
    vec3(0.0,0.83984375,0.99609375),
    vec3(0.0,0.99609375,0.0),
    vec3(0.0,0.99609375,0.37109375),
    vec3(0.0,0.99609375,0.52734375),
    vec3(0.0,0.99609375,0.68359375),
    vec3(0.0,0.99609375,0.83984375),
    vec3(0.0,0.99609375,0.99609375),
    vec3(0.37109375,0.0,0.0),
    vec3(0.37109375,0.0,0.37109375),
    vec3(0.37109375,0.0,0.52734375),
    vec3(0.37109375,0.0,0.68359375),
    vec3(0.37109375,0.0,0.83984375),
    vec3(0.37109375,0.0,0.99609375),
    vec3(0.37109375,0.37109375,0.0),
    vec3(0.37109375,0.37109375,0.37109375),
    vec3(0.37109375,0.37109375,0.52734375),
    vec3(0.37109375,0.37109375,0.68359375),
    vec3(0.37109375,0.37109375,0.83984375),
    vec3(0.37109375,0.37109375,0.99609375),
    vec3(0.37109375,0.52734375,0.0),
    vec3(0.37109375,0.52734375,0.37109375),
    vec3(0.37109375,0.52734375,0.52734375),
    vec3(0.37109375,0.52734375,0.68359375),
    vec3(0.37109375,0.52734375,0.83984375),
    vec3(0.37109375,0.52734375,0.99609375),
    vec3(0.37109375,0.68359375,0.0),
    vec3(0.37109375,0.68359375,0.37109375),
    vec3(0.37109375,0.68359375,0.52734375),
    vec3(0.37109375,0.68359375,0.68359375),
    vec3(0.37109375,0.68359375,0.83984375),
    vec3(0.37109375,0.68359375,0.99609375),
    vec3(0.37109375,0.83984375,0.0),
    vec3(0.37109375,0.83984375,0.37109375),
    vec3(0.37109375,0.83984375,0.52734375),
    vec3(0.37109375,0.83984375,0.68359375),
    vec3(0.37109375,0.83984375,0.83984375),
    vec3(0.37109375,0.83984375,0.99609375),
    vec3(0.37109375,0.99609375,0.0),
    vec3(0.37109375,0.99609375,0.37109375),
    vec3(0.37109375,0.99609375,0.52734375),
    vec3(0.37109375,0.99609375,0.68359375),
    vec3(0.37109375,0.99609375,0.83984375),
    vec3(0.37109375,0.99609375,0.99609375),
    vec3(0.52734375,0.0,0.0),
    vec3(0.52734375,0.0,0.37109375),
    vec3(0.52734375,0.0,0.52734375),
    vec3(0.52734375,0.0,0.68359375),
    vec3(0.52734375,0.0,0.83984375),
    vec3(0.52734375,0.0,0.99609375),
    vec3(0.52734375,0.37109375,0.0),
    vec3(0.52734375,0.37109375,0.37109375),
    vec3(0.52734375,0.37109375,0.52734375),
    vec3(0.52734375,0.37109375,0.68359375),
    vec3(0.52734375,0.37109375,0.83984375),
    vec3(0.52734375,0.37109375,0.99609375),
    vec3(0.52734375,0.52734375,0.0),
    vec3(0.52734375,0.52734375,0.37109375),
    vec3(0.52734375,0.52734375,0.52734375),
    vec3(0.52734375,0.52734375,0.68359375),
    vec3(0.52734375,0.52734375,0.83984375),
    vec3(0.52734375,0.52734375,0.99609375),
    vec3(0.52734375,0.68359375,0.0),
    vec3(0.52734375,0.68359375,0.37109375),
    vec3(0.52734375,0.68359375,0.52734375),
    vec3(0.52734375,0.68359375,0.68359375),
    vec3(0.52734375,0.68359375,0.83984375),
    vec3(0.52734375,0.68359375,0.99609375),
    vec3(0.52734375,0.83984375,0.0),
    vec3(0.52734375,0.83984375,0.37109375),
    vec3(0.52734375,0.83984375,0.52734375),
    vec3(0.52734375,0.83984375,0.68359375),
    vec3(0.52734375,0.83984375,0.83984375),
    vec3(0.52734375,0.83984375,0.99609375),
    vec3(0.52734375,0.99609375,0.0),
    vec3(0.52734375,0.99609375,0.37109375),
    vec3(0.52734375,0.99609375,0.52734375),
    vec3(0.52734375,0.99609375,0.68359375),
    vec3(0.52734375,0.99609375,0.83984375),
    vec3(0.52734375,0.99609375,0.99609375),
    vec3(0.68359375,0.0,0.0),
    vec3(0.68359375,0.0,0.37109375),
    vec3(0.68359375,0.0,0.52734375),
    vec3(0.68359375,0.0,0.68359375),
    vec3(0.68359375,0.0,0.83984375),
    vec3(0.68359375,0.0,0.99609375),
    vec3(0.68359375,0.37109375,0.0),
    vec3(0.68359375,0.37109375,0.37109375),
    vec3(0.68359375,0.37109375,0.52734375),
    vec3(0.68359375,0.37109375,0.68359375),
    vec3(0.68359375,0.37109375,0.83984375),
    vec3(0.68359375,0.37109375,0.99609375),
    vec3(0.68359375,0.52734375,0.0),
    vec3(0.68359375,0.52734375,0.37109375),
    vec3(0.68359375,0.52734375,0.52734375),
    vec3(0.68359375,0.52734375,0.68359375),
    vec3(0.68359375,0.52734375,0.83984375),
    vec3(0.68359375,0.52734375,0.99609375),
    vec3(0.68359375,0.68359375,0.0),
    vec3(0.68359375,0.68359375,0.37109375),
    vec3(0.68359375,0.68359375,0.52734375),
    vec3(0.68359375,0.68359375,0.68359375),
    vec3(0.68359375,0.68359375,0.83984375),
    vec3(0.68359375,0.68359375,0.99609375),
    vec3(0.68359375,0.83984375,0.0),
    vec3(0.68359375,0.83984375,0.37109375),
    vec3(0.68359375,0.83984375,0.52734375),
    vec3(0.68359375,0.83984375,0.68359375),
    vec3(0.68359375,0.83984375,0.83984375),
    vec3(0.68359375,0.83984375,0.99609375),
    vec3(0.68359375,0.99609375,0.0),
    vec3(0.68359375,0.99609375,0.37109375),
    vec3(0.68359375,0.99609375,0.52734375),
    vec3(0.68359375,0.99609375,0.68359375),
    vec3(0.68359375,0.99609375,0.83984375),
    vec3(0.68359375,0.99609375,0.99609375),
    vec3(0.83984375,0.0,0.0),
    vec3(0.83984375,0.0,0.37109375),
    vec3(0.83984375,0.0,0.52734375),
    vec3(0.83984375,0.0,0.68359375),
    vec3(0.83984375,0.0,0.83984375),
    vec3(0.83984375,0.0,0.99609375),
    vec3(0.83984375,0.37109375,0.0),
    vec3(0.83984375,0.37109375,0.37109375),
    vec3(0.83984375,0.37109375,0.52734375),
    vec3(0.83984375,0.37109375,0.68359375),
    vec3(0.83984375,0.37109375,0.83984375),
    vec3(0.83984375,0.37109375,0.99609375),
    vec3(0.83984375,0.52734375,0.0),
    vec3(0.83984375,0.52734375,0.37109375),
    vec3(0.83984375,0.52734375,0.52734375),
    vec3(0.83984375,0.52734375,0.68359375),
    vec3(0.83984375,0.52734375,0.83984375),
    vec3(0.83984375,0.52734375,0.99609375),
    vec3(0.83984375,0.68359375,0.0),
    vec3(0.83984375,0.68359375,0.37109375),
    vec3(0.83984375,0.68359375,0.52734375),
    vec3(0.83984375,0.68359375,0.68359375),
    vec3(0.83984375,0.68359375,0.83984375),
    vec3(0.83984375,0.68359375,0.99609375),
    vec3(0.83984375,0.83984375,0.0),
    vec3(0.83984375,0.83984375,0.37109375),
    vec3(0.83984375,0.83984375,0.52734375),
    vec3(0.83984375,0.83984375,0.68359375),
    vec3(0.83984375,0.83984375,0.83984375),
    vec3(0.83984375,0.83984375,0.99609375),
    vec3(0.83984375,0.99609375,0.0),
    vec3(0.83984375,0.99609375,0.37109375),
    vec3(0.83984375,0.99609375,0.52734375),
    vec3(0.83984375,0.99609375,0.68359375),
    vec3(0.83984375,0.99609375,0.83984375),
    vec3(0.83984375,0.99609375,0.99609375),
    vec3(0.99609375,0.0,0.0),
    vec3(0.99609375,0.0,0.37109375),
    vec3(0.99609375,0.0,0.52734375),
    vec3(0.99609375,0.0,0.68359375),
    vec3(0.99609375,0.0,0.83984375),
    vec3(0.99609375,0.0,0.99609375),
    vec3(0.99609375,0.37109375,0.0),
    vec3(0.99609375,0.37109375,0.37109375),
    vec3(0.99609375,0.37109375,0.52734375),
    vec3(0.99609375,0.37109375,0.68359375),
    vec3(0.99609375,0.37109375,0.83984375),
    vec3(0.99609375,0.37109375,0.99609375),
    vec3(0.99609375,0.52734375,0.0),
    vec3(0.99609375,0.52734375,0.37109375),
    vec3(0.99609375,0.52734375,0.52734375),
    vec3(0.99609375,0.52734375,0.68359375),
    vec3(0.99609375,0.52734375,0.83984375),
    vec3(0.99609375,0.52734375,0.99609375),
    vec3(0.99609375,0.68359375,0.0),
    vec3(0.99609375,0.68359375,0.37109375),
    vec3(0.99609375,0.68359375,0.52734375),
    vec3(0.99609375,0.68359375,0.68359375),
    vec3(0.99609375,0.68359375,0.83984375),
    vec3(0.99609375,0.68359375,0.99609375),
    vec3(0.99609375,0.83984375,0.0),
    vec3(0.99609375,0.83984375,0.37109375),
    vec3(0.99609375,0.83984375,0.52734375),
    vec3(0.99609375,0.83984375,0.68359375),
    vec3(0.99609375,0.83984375,0.83984375),
    vec3(0.99609375,0.83984375,0.99609375),
    vec3(0.99609375,0.99609375,0.0),
    vec3(0.99609375,0.99609375,0.37109375),
    vec3(0.99609375,0.99609375,0.52734375),
    vec3(0.99609375,0.99609375,0.68359375),
    vec3(0.99609375,0.99609375,0.83984375),
    vec3(0.99609375,0.99609375,0.99609375),
    vec3(0.03125,0.03125,0.03125),
    vec3(0.0703125,0.0703125,0.0703125),
    vec3(0.109375,0.109375,0.109375),
    vec3(0.1484375,0.1484375,0.1484375),
    vec3(0.1875,0.1875,0.1875),
    vec3(0.2265625,0.2265625,0.2265625),
    vec3(0.265625,0.265625,0.265625),
    vec3(0.3046875,0.3046875,0.3046875),
    vec3(0.34375,0.34375,0.34375),
    vec3(0.3828125,0.3828125,0.3828125),
    vec3(0.421875,0.421875,0.421875),
    vec3(0.4609375,0.4609375,0.4609375),
    vec3(0.5,0.5,0.5),
    vec3(0.5390625,0.5390625,0.5390625),
    vec3(0.578125,0.578125,0.578125),
    vec3(0.6171875,0.6171875,0.6171875),
    vec3(0.65625,0.65625,0.65625),
    vec3(0.6953125,0.6953125,0.6953125),
    vec3(0.734375,0.734375,0.734375),
    vec3(0.7734375,0.7734375,0.7734375),
    vec3(0.8125,0.8125,0.8125),
    vec3(0.8515625,0.8515625,0.8515625),
    vec3(0.890625,0.890625,0.890625),
    vec3(0.9296875,0.9296875,0.9296875)
);

int get_iterations()
{
    double real = ((gl_FragCoord.x / 1000.0f - 1.2f) * zoom + center_x) * 1.5f;
    double imag = ((gl_FragCoord.y / 800.0f - 0.9f) * zoom + center_y) * 1.5f;
 

    int iterations = 0;
    double const_real = real;
    double const_imag = imag;
 
    while (iterations < MAX_ITERATIONS)
    {
        double tmp_real = real;
        real = (real * real - imag * imag) + const_real;
        imag = (2.0 * tmp_real * imag) + const_imag;
         
        double dist = real * real + imag * imag;
 
        if (dist > 4.0)
            break;
 
        ++iterations;
    }
    return iterations;
}
 
 
vec4 return_color()
{
    int iter = get_iterations();
    if (iter == MAX_ITERATIONS)
    {
        gl_FragDepth = 0.0f;
        return vec4(0.0f, 0.0f, 0.0f, 1.0f);
    }
    int colorIndex = int((float(iter)/float(MAX_ITERATIONS))*256);
    vec3 color = colors[colorIndex];
    return vec4(color.x, color.y, color.z, 1.0);
    
}
 
void main()
{
    fragColor = return_color();
}

