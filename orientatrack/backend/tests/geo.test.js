// backend/tests/geo.test.js
const { calcularDistancia, calcularRumb } = require('../logic/geo');

describe('Proves de càlculs d\'orientació', () => {

    test('La distància entre dos punts idèntics ha de ser zero', () => {
        expect(calcularDistancia(41.38, 2.17, 41.38, 2.17)).toBe(0);
    });

    test('Distància aproximada entre Barcelona i Madrid (aprox 500km)', () => {
        const d = calcularDistancia(41.3851, 2.1734, 40.4168, -3.7038);
        // Comprovem que estigui en el rang de 500km (en metres)
        expect(d).toBeGreaterThan(500000);
        expect(d).toBeLessThan(510000);
    });

    test('Rumb cap al Nord exacte ha de ser 0 graus', () => {
        // Pugem latitud sense canviar longitud
        const rumb = calcularRumb(41, 2, 42, 2);
        expect(rumb).toBe(0);
    });

    test('Rumb cap a l\'Est ha de ser 90 graus', () => {
        const rumb = calcularRumb(41, 2, 41, 3);
        expect(rumb).toBeCloseTo(90, 0);
    });

    test('Detecció de pas pel punt de control (Geofencing 20m)', () => {
        // Simulem que estem a 10 metres del punt
        const d = calcularDistancia(41.3870, 2.1700, 41.3871, 2.1701);
        const estaDins = d < 20; 
        expect(estaDins).toBe(true);
    });
});