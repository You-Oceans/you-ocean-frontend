/**
 * Extract unique species from data array
 * @param data - Array of data items with label property
 * @returns Array of unique species names
 */
export const extractUniqueSpecies = (data: any[]): string[] => {
  if (!data || data.length === 0) {
    return [];
  }
  return Array.from(new Set(data.map((item) => item.label)));
};

/**
 * Initialize selected species with all available species
 * @param allSpecies - Array of all available species
 * @param currentSelected - Currently selected species
 * @returns Array of species to be selected
 */
export const initializeSelectedSpecies = (
  allSpecies: string[], 
  currentSelected: string[]
): string[] => {
  if (currentSelected.length === 0) {
    return [...allSpecies];
  }
  return currentSelected;
};
