import { Entity, PointGraphics, LabelGraphics } from "resium";
import { Cartesian3, Color } from "cesium";

export function CesiumAmbulance({ ambulance }) {
  if (!ambulance || !ambulance.location) return null;
  
  // Notice OSRM coords are typically returned as [Lat, Lng], so index 1 is longitude
  const position = Cartesian3.fromDegrees(ambulance.location[1], ambulance.location[0], 5);
  
  return (
    <Entity position={position} name={`AMB-${ambulance.id}`}>
      <PointGraphics pixelSize={12} color={Color.CYAN} outlineColor={Color.WHITE} outlineWidth={2} />
      <LabelGraphics 
        text={`${ambulance.id} (${ambulance.team})`} 
        font="bold 14px sans-serif"
        fillColor={Color.WHITE}
        showBackground={true}
        backgroundColor={new Color(0.1, 0.1, 0.2, 0.8)}
        pixelOffset={{x: 0, y: -20}}
      />
    </Entity>
  );
}
