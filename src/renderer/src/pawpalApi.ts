type PawPalWindow = Window & { pawpal?: Window["pawpal"] };

export function pawpalApi(): Window["pawpal"] | undefined {
  return (window as PawPalWindow).pawpal;
}
