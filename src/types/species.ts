export interface SpeciesData {
  id: number;
  date: string;
  hour: number;
  second: number;
  label: string;
  confidence: number;
  duration: number;
  mean_frequency: number;
  l50_power: number;
  l75_power: number;
  l90_power: number;
  isLoading: boolean;
}

export interface SpeciesDetails {
  isOpen: boolean;
  data: SpeciesData | null;
}
