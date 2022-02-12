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
    
    varying vec3 vPos;
    varying vec3 vNormal;
    varying float isInside;

    void main() {
        vPos = (modelViewMatrix * vec4(position, 1.0 )).xyz;
        vNormal = normalMatrix * normal;

        isInside = isInsideCircle(center, position, radius);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
    }
`;

export const _BuildingFragmentShader = `
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
    };

    uniform vec3 center;
    uniform float opacity;
    uniform vec3 color;
    uniform vec3 diffuse;

    varying vec3 vPos;
    varying vec3 vNormal;
    varying float isInside;

    uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

    void main() {
        float epsilon = 0.00001;
        float opacityValue;
        DirectionalLight dirLight = directionalLights[0];

        if(abs(isInside - 1.0) < epsilon) // check if is equal to 1
            opacityValue = opacity;
        else 
            opacityValue = 1.0;

        vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);

        for(int l = 0; l < NUM_DIR_LIGHTS; l++) {
            vec3 lightDirection = directionalLights[l].direction ;
            addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * directionalLights[l].color;
        }

        gl_FragColor = vec4(addedLights.xyz * color, opacityValue); 
    }
`;

export const _FloorVertexShader = `
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


export const _FloorFragmentShader = `
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