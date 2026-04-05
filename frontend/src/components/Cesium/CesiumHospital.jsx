import { Entity, PointGraphics, LabelGraphics } from "resium";
import { Cartesian3, Color } from "cesium";

export function CesiumHospital({ hospital }) {
  if (!hospital || !hospital.location) return null;
  
  const position = Cartesian3.fromDegrees(hospital.location[1], hospital.location[0], 10);

  return (
    <Entity position={position} name={hospital.name}>
      <PointGraphics pixelSize={20} color={Color.LIMEGREEN} outlineColor={Color.WHITE} outlineWidth={3} />
      <LabelGraphics 
        text={`H: ${hospital.name}`} 
        font="bold 16px sans-serif"
        fillColor={Color.LIMEGREEN}
        showBackground={true}
        backgroundColor={new Color(0, 0, 0, 0.8)}
        pixelOffset={{x: 0, y: -30}}
      />
    </Entity>
  );
}
