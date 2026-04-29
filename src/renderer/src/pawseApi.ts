type PawseWindow = Window & { pawse?: Window["pawse"] };

export function pawseApi(): Window["pawse"] | undefined {
  return (window as PawseWindow).pawse;
}
