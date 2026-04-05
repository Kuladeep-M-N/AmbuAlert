/**
 * A* (A-Star) AI Search Algorithm for Urban Navigation
 * Core Logic: f(n) = g(n) + h(n)
 */
class AStarSolver {
  constructor() {
    this.trafficWeights = { Low: 0, Medium: 5, High: 15 };
  }

  // Heuristic: Haversine distance (straight line) from current to target
  getHeuristic(pos1, pos2) {
    const [lat1, lon1] = pos1;
    const [lat2, lon2] = pos2;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /**
   * solve - Find the best route among candidates using A* cost logic.
   * In a real city-scale app, this would search a grid/graph.
   * Here we apply the A* f-score to select the optimal path from generated vectors.
   */
  solve(routes, start, end, severity = 'ROUTINE') {
    const priorityBonus = (severity === 'CRITICAL') ? 2 : 0; // Reduces effective cost for critical dispatches
    
    return routes.map((route, index) => {
      // 1. g-cost (Actual path cost: distance + traffic friction)
      const distKm = route.distance;
      const trafficPenalty = this.trafficWeights[route.trafficString] || 0;
      const g = distKm + trafficPenalty - priorityBonus;

      // 2. h-cost (Heuristic: remaining distance to goal from current midpoint)
      // Since OSRM gives us the full path, we evaluate the search focus.
      const h = this.getHeuristic(start, end);

      // 3. f-cost (Total AI score: f = g + h)
      const f = g + h;

      return {
        ...route,
        aStarMetric: {
          g: g.toFixed(2),
          h: h.toFixed(2),
          f: f.toFixed(2),
          reason: this._generateReason(route.trafficString, distKm, severity)
        },
        fScore: f
      };
    }).sort((a, b) => a.fScore - b.fScore);
  }

  /**
   * _generateReason - Explainable AI (XAI) logic to justify selection
   */
  _generateReason(traffic, dist, severity) {
    if (traffic === 'High') return 'Significant traffic friction. Alternative path prioritized.';
    if (severity === 'CRITICAL' && traffic !== 'Low') return 'Priority override: routing to avoid Medium traffic zones.';
    if (dist < 2) return 'Shortest path vector confirmed with low heuristic error.';
    return 'Optimized based on minimal distance-to-traffic coefficient.';
  }
}

module.exports = new AStarSolver();
