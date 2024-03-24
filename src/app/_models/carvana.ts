export interface Results {
  suggestions: Suggestion[];
}

export interface Suggestion {
  text: string;
  filters: Filter;
}

export interface Filter {
  makes: CarDetails[];
  colors: string[];
  year: {
    max: number;
    min: number;
  };
}

export interface CarDetails {
  name: string;
  parentModels?: {
    name: string;
    trim?: string[];
  }[];
  colors?: string[];
}
