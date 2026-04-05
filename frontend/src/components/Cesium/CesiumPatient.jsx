import { Entity, PointGraphics, LabelGraphics } from "resium";
import { Cartesian3, Color } from "cesium";

export function CesiumPatient({ incident }) {
  if (!incident || !incident.location) return null;
  
  const position = Cartesian3.fromDegrees(incident.location[1], incident.location[0], 5);
  
  const priorityColor = {
    CRITICAL: Color.RED,
    HIGH: Color.ORANGE,
    STABLE: Color.YELLOW
  };

  const color = priorityColor[incident.severity] || Color.YELLOW;

  return (
    <Entity position={position} name={`PAT-${incident.id}`}>
      <PointGraphics pixelSize={15} color={color} outlineColor={Color.WHITE} outlineWidth={2} />
      <LabelGraphics 
        text={`PAT-${incident.id}\n${incident.severity}`} 
        font="bold 12px sans-serif"
        fillColor={color}
        showBackground={true}
        backgroundColor={new Color(0, 0, 0, 0.8)}
        pixelOffset={{x: 0, y: -25}}
      />
    </Entity>
  );
}
