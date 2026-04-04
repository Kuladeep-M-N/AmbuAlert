class Graph {
  calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  async fetchOSRM(startLoc, endLoc, waypoint = null) {
    let coordsStr = `${startLoc[1]},${startLoc[0]}`;
    if (waypoint) {
        coordsStr += `;${waypoint[1]},${waypoint[0]}`;
    }
    coordsStr += `;${endLoc[1]},${endLoc[0]}`;
    
    let url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&alternatives=false`;
    
    try {
        let r = await fetch(url);
        let data = await r.json();
        if (data && data.routes && data.routes.length > 0) {
             let route = data.routes[0];
             let parsedCoords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Lon,Lat -> Lat,Lon
             return {
                 coordinates: parsedCoords,
                 distance: route.distance / 1000,
                 etaMinutes: route.duration / 60,
             };
        }
    } catch(e) {
        console.error("OSRM Fetch Error", e);
    }
    return null;
  }

  async findMultipleRoutes(startLoc, endLoc) {
       let routes = [];
       // 1. Best Route
       let best = await this.fetchOSRM(startLoc, endLoc);
       if (best) routes.push(best);

       // 2. Alt 1 (Detour)
       let wp1 = [ (startLoc[0] + endLoc[0])/2 + 0.005, (startLoc[1] + endLoc[1])/2 + 0.005 ];
       let alt1 = await this.fetchOSRM(startLoc, endLoc, wp1);
       if (alt1) routes.push(alt1);

       // 3. Alt 2 (Detour opposite)
       let wp2 = [ (startLoc[0] + endLoc[0])/2 - 0.005, (startLoc[1] + endLoc[1])/2 - 0.005 ];
       let alt2 = await this.fetchOSRM(startLoc, endLoc, wp2);
       if (alt2) routes.push(alt2);

       let colors = ['#22c55e', '#eab308', '#ef4444'];
       let traffics = ['Low', 'Medium', 'High'];

       return routes.map((r, index) => {
           r.id = `route-${index+1}`;
           r.color = colors[index % 3];
           r.isOptimal = index === 0;
           
           if (index > 0) {
               r.etaMinutes += (index * 2); // fake traffic bump
               r.distance += (index * 0.2); // slight distance increase
           }
           
           r.distanceStr = r.distance.toFixed(2) + ' km';
           r.etaMinutes = Math.max(1, Math.ceil(r.etaMinutes));
           r.trafficString = traffics[index % 3];
           return r;
       });
  }

  randomizeTraffic() {
      // Mocked for UI
  }
}

module.exports = new Graph();
