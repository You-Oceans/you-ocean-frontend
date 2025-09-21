import { SpeciesData } from "../types/species";

export const transformDataToPoints = (data: SpeciesData[] = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item) => {
    const angleInDegrees =
      ((item.hour * 3600 + item.second) / (24 * 3600)) * 360;
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);

    // Calculate x and y coordinates - place points inside the circle at radius 120
    const radius = 120;
    const x = radius * Math.cos(angleInRadians);
    const y = radius * Math.sin(angleInRadians);

    let color;
    switch (item.label) {
      case "BLUE_A":
        color = "#8B5CF6"; // Purple
        break;
      case "BLUE_B":
        color = "#06B6D4"; // Cyan (visible on white background)
        break;
      case "HUMPBACK":
        color = "#84CC16"; // Lime green
        break;
      case "SHIP":
        color = "#EF4444"; // Red
        break;
      default:
        color = "#6B7280";
    }

    return {
      ...item,
      x,
      y,
      label: item.label,
      color,
    };
  });
};
