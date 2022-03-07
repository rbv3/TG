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

const directionTowardsAxisZ = `
    vec3 directionTowardsAxis(vec3 coordinates, float diameter) {
        return vec3(0, (diameter/2.0)-coordinates.y, -coordinates.z);
    }
`;

const directionTowardsAxisX = `
    vec3 directionTowardsAxis(vec3 coordinates, float diameter) {
        return vec3(-coordinates.x, (diameter/2.0)-coordinates.y, 0);
    }
`;

const floorDeformationZ = `
    vec3 floorDeformation(vec3 coordinates, float diameter) {
        float X, Y, Z;

        float zPower2 = pow(coordinates.z, 2.0);
        float diameterPower2 = pow(diameter, 2.0);

        X = coordinates.x;
        Y = (diameter * zPower2) / (diameterPower2 + zPower2);
        Z = (diameterPower2 * coordinates.z) / (diameterPower2 + zPower2);

        return vec3(X, Y, Z);
    }
`;

const floorDeformationX = `
    vec3 floorDeformation(vec3 coordinates, float diameter) {
        float X, Y, Z;

        float xPower2 = pow(coordinates.x, 2.0);
        float diameterPower2 = pow(diameter, 2.0);

        X = (diameterPower2 * coordinates.x) / (diameterPower2 + xPower2);
        Y = (diameter * xPower2) / (diameterPower2 + xPower2);
        Z = coordinates.z;

        return vec3(X, Y, Z);
    }
`;

const getDeformation = `
    ${floorDeformationX}
    ${directionTowardsAxisX}

    vec3 getDeformation(vec3 coordinates, float diameter) {
        vec3 floorCoord = floorDeformation(vec3(coordinates.x, 0, coordinates.z), diameter);
        vec3 direction = normalize(directionTowardsAxis(coordinates, diameter));
        vec3 translate = direction * coordinates.y;

        return vec3(floorCoord.x + translate.x, floorCoord.y + translate.y, floorCoord.z + translate.z);
    }
`;

export const _BuildingVertexShader = `
    ${getDistance}
    ${isInsideCircle}
    ${getDeformation}

    uniform vec3 center;
    uniform float radius;
    uniform float diameter;
    uniform bool isVisible;
    uniform bool isRamaOn;
    uniform vec3 scale;
    
    varying vec3 vNormal;
    varying float isInside;

    void main() {
        isInside = isInsideCircle(center, position, radius);
        
        vec4 projectedPos = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
        vec3 deformedPos = getDeformation(projectedPos.xyz, diameter);

        if(isRamaOn)
            gl_Position = vec4(deformedPos, projectedPos.w);
        else
            gl_Position = projectedPos;

        vNormal = normalMatrix * normal;
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

        if(abs(isInside - 1.0) < epsilon) { // check if is equal to 1
            if(isVisible) 
                discard;

            opacityValue = opacity;
        }
        else {
            if(!isVisible)
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