export type StrainType = 'Feminizada' | 'Autofloreciente' | 'Regular';

export interface Strain {
  id: string;
  name: string;
  type: StrainType;
  estimated_cycle_days: number;
  flowering_days?: number; // Para fotoperiódicas, esto es útil, pero para el MVP usamos ciclo total
}

export const strainsLibrary: Strain[] = [
  {
    id: 'gorilla-glue-auto',
    name: 'Gorilla Glue Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 75,
  },
  {
    id: 'banana-4-fem',
    name: 'Banana 4',
    type: 'Feminizada',
    estimated_cycle_days: 120, // 30 veg + 90 floración aprox
  },
  {
    id: 'og-kush-fem',
    name: 'OG Kush',
    type: 'Feminizada',
    estimated_cycle_days: 105, // 30 veg + 75 floración aprox
  },
  {
    id: 'amnesia-haze-auto',
    name: 'Amnesia Haze Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 85, // Las sativas auto tardan un poco más
  },
  {
    id: 'blue-dream-fem',
    name: 'Blue Dream',
    type: 'Feminizada',
    estimated_cycle_days: 110, // 30 veg + 80 floración aprox
  },
  {
    id: 'gelato-auto',
    name: 'Gelato Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 70,
  },
  {
    id: 'white-widow-fem',
    name: 'White Widow',
    type: 'Feminizada',
    estimated_cycle_days: 100, // 30 veg + 70 floración aprox
  },
  {
    id: 'northern-lights-auto',
    name: 'Northern Lights Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 65, // Muy rápida
  },
  {
    id: 'sour-diesel-fem',
    name: 'Sour Diesel',
    type: 'Feminizada',
    estimated_cycle_days: 115, // 30 veg + 85 floración aprox
  },
  {
    id: 'critical-mass-auto',
    name: 'Critical Mass Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 65,
  },
  {
    id: 'jack-herer-fem',
    name: 'Jack Herer',
    type: 'Feminizada',
    estimated_cycle_days: 110, // 30 veg + 80 floración aprox
  },
  {
    id: 'girl-scout-cookies-auto',
    name: 'Girl Scout Cookies Auto',
    type: 'Autofloreciente',
    estimated_cycle_days: 75,
  }
];
