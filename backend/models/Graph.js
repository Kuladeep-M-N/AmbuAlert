const AStarSolver = require('../services/AStarSolver');

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
    
    let url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&alternatives=false&steps=true`;
    
    try {
        let r = await fetch(url);
        let data = await r.json();
        if (data && data.routes && data.routes.length > 0) {
             let route = data.routes[0];
             let parsedCoords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Lon,Lat -> Lat,Lon
             
             // Extract maneuver points as 'signal nodes' for Green Corridor
             const signalNodes = [];
             route.legs.forEach(leg => {
               leg.steps.forEach(step => {
                 if (step.maneuver && step.maneuver.type !== 'depart' && step.maneuver.type !== 'arrive') {
                   // Add signal control point
                   signalNodes.push([step.maneuver.location[1], step.maneuver.location[0]]); // [lat, lng]
                 }
               });
             });

             return {
                 coordinates: parsedCoords,
                 distance: route.distance / 1000,
                 etaMinutes: route.duration / 60,
                 signalNodes
             };
        }
    } catch(e) {
        console.error("OSRM Fetch Error", e);
    }
    return null;
  }

  async findMultipleRoutes(startLoc, endLoc, severity = 'ROUTINE') {
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

       const trafficLevels = ['Low', 'Medium', 'High'];
       
       let scoredRoutes = routes.map((r, index) => {
           // Simulate ML traffic classification mapping over the geographic vector
           let predictedTraffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
           
           // Ensure the "best" direct API route strongly trends better
           if (index === 0 && predictedTraffic === 'High') {
               predictedTraffic = 'Medium'; 
           }

           return {
               id: `route-${index+1}`,
               coordinates: r.coordinates,
               distance: r.distance,
               distanceStr: r.distance.toFixed(2) + ' km',
               trafficString: predictedTraffic,
               etaMinutes: Math.ceil(r.etaMinutes)
           }
       });

       // 3. AI-Powered A* Routing Logic
       // Evaluates f = g + h (distance + traffic friction + heuristic focus)
       const aStarScored = AStarSolver.solve(scoredRoutes, startLoc, endLoc, severity);

       const colors = ['#22c55e', '#eab308', '#ef4444'];

       return aStarScored.map((r, index) => {
           r.color = colors[index % 3];
           r.isOptimal = index === 0;
           r.aiReason = r.aStarMetric.reason;
           r.fScore = r.aStarMetric.f;
           return r;
       });
  }

  densifyRoute(coords) {
    if (!coords || coords.length < 2) return coords;
    const dense = [];
    for (let i = 0; i < coords.length - 1; i++) {
        const start = coords[i];
        const end = coords[i + 1];
        dense.push(start);
        
        // Rough distance in degrees (approx ~111km per degree)
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0.0005) { // Roughly ~55m threshold
            const steps = Math.ceil(dist / 0.0004); // Subdivide every ~45m
            for (let s = 1; s < steps; s++) {
                const r = s / steps;
                dense.push([start[0] + dx*r, start[1] + dy*r]);
            }
        }
    }
    dense.push(coords[coords.length - 1]);
    return dense;
  }
}

module.exports = new Graph();
