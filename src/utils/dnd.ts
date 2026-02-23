export const SLOT_PX = 30;

export function getClientYFromEvent(ev: Event): number {
  if ("changedTouches" in ev && (ev as TouchEvent).changedTouches?.length) {
    return (ev as TouchEvent).changedTouches[0].clientY;
  }
  if ("touches" in ev && (ev as TouchEvent).touches?.length) {
    return (ev as TouchEvent).touches[0].clientY;
  }
  if ("clientY" in ev) {
    return (ev as MouseEvent).clientY;
  }
  return 0;
}
