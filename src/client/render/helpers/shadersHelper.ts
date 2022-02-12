const getDistance = `
    float getDistance(vec3 center, vec3 coordinates) {
        float a, b, x, y, distance;
        a = center.x;
        b = center.y;
        x = coordinates.x;
        y = coordinates.y;

        distance = pow((x-a), 2.0) + pow((y-b), 2.0);

        return distance;
    }
`;

const isInsideCircle = `
    ${getDistance}

    float isInsideCircle(vec3 center, vec3 coordinates, float radius) {
        float distance, squaredRadius;

        squaredRadius = pow(radius, 2.0);
        distance = getDistance(center, coordinates);
        
        if(distance <= squaredRadius)
            return 1.0;
        else
            return 0.0;
    }
`;

export const _BuildingVertexShader = `
    ${isInsideCircle}

    uniform vec3 center;
    uniform float radius;
    uniform vec3 scale;

    varying float isInside;

    void main() {
        isInside = isInsideCircle(center, position, radius);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
    }
`;

export const _BuildingFragmentShader = `
    uniform float opacity;
    uniform vec3 color;

    varying float isInside;

    void main() {
        if(abs(isInside - 1.0) < 0.00001) 
            gl_FragColor = vec4(color[0], color[1], color[2], opacity);
        else 
            gl_FragColor = vec4(color[0], color[1], color[2], 1.0);
    }
`;