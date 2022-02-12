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

export enum LayerType {
    Surface = 'surface',
    Park = 'park',
    Water = 'water',
    Building = 'building'
}
