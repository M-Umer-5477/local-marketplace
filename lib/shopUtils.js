/**
 * Checks if a shop is currently open based on its schedule.
 * Handles overnight hours (e.g., 22:00 - 06:00).
 * @param {object} shop - Shop object with isShopOpen, openingTime, closingTime
 * @returns {boolean} Whether the shop is currently open
 */
export function checkIsShopOpen(shop) {
  if (!shop) return false;
  if (shop.isShopOpen === false) return false;
  if (!shop.openingTime || !shop.closingTime) return true;

  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = shop.openingTime.split(":").map(Number);
    const [closeH, closeM] = shop.closingTime.split(":").map(Number);

    if (isNaN(openH) || isNaN(closeH)) return true; // Safe fallback

    const startMinutes = openH * 60 + (openM || 0);
    const endMinutes = closeH * 60 + (closeM || 0);

    if (endMinutes > startMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight hours (e.g. 22:00 - 06:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  } catch (error) {
    return true; // Safe fallback
  }
}
