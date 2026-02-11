export class RouteCreator {
    constructor() {
        this.DRAFT_KEY = 'orientatrack_draft_route';
        this.draftFites = this.loadDraft();
    }

    saveDraft() {
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(this.draftFites));
    }

    loadDraft() {
        const saved = localStorage.getItem(this.DRAFT_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    addFitaToDraft(lat, lon, nomPersonalitzat = null) {
        const numeroFita = this.draftFites.length + 1;
        const nomFinal = nomPersonalitzat && nomPersonalitzat.trim() !== "" 
            ? nomPersonalitzat 
            : `Fita ${numeroFita}`;

        const novaFita = {
            id: `DRAFT-${Date.now()}`,
            lat: Number(lat),
            lon: Number(lon),
            nom: nomFinal,
            radius_m: 20
        };

        this.draftFites.push(novaFita);
        this.saveDraft();
        return novaFita;
    }

    clearDraft() {
        this.draftFites = [];
        localStorage.removeItem(this.DRAFT_KEY);
    }

    exportToGPXString(nomRuta) {
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OrientaTrack" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${nomRuta}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>`;

        this.draftFites.forEach(f => {
            gpx += `
  <wpt lat="${f.lat}" lon="${f.lon}">
    <name>${f.nom}</name>
    <extensions>
      <radius>${f.radius_m}</radius>
    </extensions>
  </wpt>`;
        });

        gpx += `\n</gpx>`;
        return gpx;
    }
}