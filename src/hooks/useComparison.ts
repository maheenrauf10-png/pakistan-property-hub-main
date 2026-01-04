import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Property {
  id: string;
  title: string;
  price: number;
  price_unit: string;
  city: string;
  area: string;
  size_value: number;
  size_unit: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  listing_type: string;
  property_type: string;
  images?: string[] | null;
  amenities?: string[] | null;
}

interface ComparisonState {
  properties: Property[];
  addProperty: (property: Property) => void;
  removeProperty: (id: string) => void;
  clearAll: () => void;
  isInComparison: (id: string) => boolean;
}

export const useComparison = create<ComparisonState>()(
  persist(
    (set, get) => ({
      properties: [],
      addProperty: (property) => {
        const { properties } = get();
        if (properties.length >= 4) return; // Max 4 properties
        if (properties.some(p => p.id === property.id)) return;
        set({ properties: [...properties, property] });
      },
      removeProperty: (id) => {
        set({ properties: get().properties.filter(p => p.id !== id) });
      },
      clearAll: () => set({ properties: [] }),
      isInComparison: (id) => get().properties.some(p => p.id === id),
    }),
    {
      name: 'property-comparison',
    }
  )
);
