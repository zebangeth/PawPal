export type HitboxPoint = {
  x: number;
  y: number;
};

export type HitboxRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const PET_HITBOX_SCALE = 0.8;

export function pointInCenteredHitbox(
  point: HitboxPoint,
  rect: HitboxRect,
  scale = PET_HITBOX_SCALE
): boolean {
  if (rect.width <= 0 || rect.height <= 0 || scale <= 0 || scale > 1) return false;

  const insetX = (rect.width * (1 - scale)) / 2;
  const insetY = (rect.height * (1 - scale)) / 2;
  const left = rect.left + insetX;
  const right = rect.left + rect.width - insetX;
  const top = rect.top + insetY;
  const bottom = rect.top + rect.height - insetY;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}

export function pointInElementHitbox(
  point: HitboxPoint,
  element: Element,
  scale = PET_HITBOX_SCALE
): boolean {
  return pointInCenteredHitbox(point, element.getBoundingClientRect(), scale);
}
