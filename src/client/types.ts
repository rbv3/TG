export type CityLayer = {
    color: number[];
    coordinates: number[];
    indices: number[];
    normals?: number[];
}

export type City = {
    buildings: CityLayer;
    parks: CityLayer;
    surface: CityLayer;
    water: CityLayer;
}

export type SpacialCoords = {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    s: number;
}

export enum LayerType {
    Surface = 'surface',
    Park = 'park',
    Water = 'water',
    Building = 'building'
}