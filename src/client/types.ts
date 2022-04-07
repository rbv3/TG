import { KeyCode } from './constants';

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

export type ActivityMap = {
    [KeyCode.W]: number,
    [KeyCode.A]: number,
    [KeyCode.S]: number,
    [KeyCode.D]: number,
    [KeyCode.Z]: number,
    [KeyCode.X]: number,
    'mouse': number,
    'height0to50': number,
    'height51to100': number,
    'height101to150': number,
    'timeElapsed':number
}
