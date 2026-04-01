export function calculateVPD(temperature: number, humidity: number): number {
  // Cálculo de Presión de Vapor de Saturación (VPsat) en kPa
  const vpsat = 0.61078 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  // Cálculo de Presión de Vapor Real (VPair) en kPa
  const vpair = vpsat * (humidity / 100);
  // Diferencia de Presión de Vapor (VPD) en kPa
  const vpd = vpsat - vpair;
  return Number(vpd.toFixed(2));
}

export function getVPDStatus(vpd: number): { 
  color: string; 
  bg: string; 
  label: string; 
  border: string;
} {
  if (vpd < 0.4 || vpd > 1.6) {
    return { 
      color: 'text-red-500', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30',
      label: 'Estrés crítico / Riesgo' 
    };
  }
  if (vpd >= 0.8 && vpd <= 1.2) {
    return { 
      color: 'text-green-500', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30',
      label: 'Rango óptimo' 
    };
  }
  return { 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/20', 
    border: 'border-yellow-500/30',
    label: 'Riesgo leve' 
  };
}