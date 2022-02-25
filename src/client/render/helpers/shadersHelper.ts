const getDistance = `
    float getDistance(vec3 center, vec3 coordinates) {
        float a, b, x, z, distance;
        a = center.x;
        b = center.z;
        x = coordinates.x;
        z = coordinates.z;

        distance = sqrt(pow((x-a), 2.0) + pow((z-b), 2.0));

        return distance;
    }
`;

const isInsideCircle = `
    float isInsideCircle(vec3 center, vec3 coordinates, float radius) {
        float distance, squaredRadius;

        distance = getDistance(center, coordinates);
        
        if(distance <= radius)
            return 1.0;
        else
            return 0.0;
    }
`;

const getDeformationWeights = `
    vec3 getDeformationWeights(vec3 center, vec3 coordinates, float diameter) {
        float X, Y, Z;
        X = 1.0;
        Y = diameter;
        Z = 1.0;

        return vec3(X, Y, Z);
    }
`;

export const _BuildingVertexShader = `
    ${getDistance}
    ${isInsideCircle}
    ${getDeformationWeights}

    uniform vec3 center;
    uniform float radius;
    uniform vec3 scale;
    uniform float diameter;
    uniform bool isVisible;
    uniform float opacity;
    
    varying vec3 vNormal;
    varying float isInside;

    void main() {
        float epsilon = 0.00001;
        float distance;
        
        isInside = isInsideCircle(center, position, radius);
        
        vNormal = normalMatrix * normal;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);

        // Rama
        distance = getDistance(center, position);
        float weightedDistance = min(distance/200.0, 1.0);
        vec3 deformedWeights = getDeformationWeights(center, position, weightedDistance);
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position * deformedWeights, 1.0);
    }
`;

export const _BuildingFragmentShader = `
    ${getDistance}

    struct DirectionalLight {
        vec3 direction;
        vec3 color;
    };

    uniform vec3 center;
    uniform float opacity;
    uniform vec3 color;
    uniform vec3 diffuse;
    uniform bool isVisible;

    varying vec3 vNormal;
    varying float isInside;

    uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

    void main() {
        float epsilon = 0.001;
        float opacityValue;
        DirectionalLight dirLight = directionalLights[0];

        gl_FragDepth = gl_FragCoord.z;

        if(abs(isInside - 1.0) < epsilon) { // check if is equal to 1
            if(isVisible == true) {
                discard;
            }
            if(opacity < 0.8) {
                gl_FragDepth = 0.0;
            }

            opacityValue = opacity;
        }
        else {
            if(isVisible == false)
                discard;
            opacityValue = 1.0;
        }

        vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);

        for(int l = 0; l < NUM_DIR_LIGHTS; l++) {
            vec3 lightDirection = directionalLights[l].direction ;
            addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * directionalLights[l].color;
        }

        gl_FragColor = vec4(addedLights.xyz * color, opacityValue); 
    }
`;

export const _FloorVertexShader = `
    ${getDistance}
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