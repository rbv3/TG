export function isInsideCircle(center: THREE.Vector3, coordinates: THREE.Vector3, radius: number): boolean {
    // (x−a)^2 + (y−b)^2 = r^2
    const {x: a, y: b} = center;
    const {x, y} = coordinates;

    const distance = Math.pow((x-a), 2) + Math.pow((y-b), 2);

    return distance <= radius
}