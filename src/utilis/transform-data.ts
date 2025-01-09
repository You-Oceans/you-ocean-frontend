import { SpeciesData } from "../types/species";

export const transformDataToPoints = (data: SpeciesData[] = []) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    // Convert hour and second to angle (degrees)
    const angleInDegrees =
      ((item.hour * 3600 + item.second) / (24 * 3600)) * 360;
    // Convert angle to radians
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);

    // Calculate x and y coordinates (radius is 150)
    const radius = 150;
    const x = radius * Math.cos(angleInRadians);
    const y = radius * Math.sin(angleInRadians);

    return {
      ...item,
      x,
      y,
      color: item.label === "BLUE_B" ? "#ffffff" : "#22c55e",
    };
  });
};
