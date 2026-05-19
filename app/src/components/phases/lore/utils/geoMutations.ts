/**
 * Geography mutation utilities.
 * Eliminates the repeated clone → find location → find variant → mutate → save
 * boilerplate that appears in every GeographyTab handler.
 */
import type { GeographyData, Location, Variant } from '@/types/data';

/**
 * Deep-clones the geography data, locates the target location (and optionally
 * a variant), runs the mutator function against it, and returns the cloned
 * geography ready for saving.
 *
 * Returns `null` if the location or variant was not found.
 */
export function mutateGeo(
  geo: GeographyData,
  locId: string,
  variantId: string | null,
  mutator: (loc: Location, variant: Variant | null) => void,
): GeographyData | null {
  const cloned: GeographyData = JSON.parse(JSON.stringify(geo));
  const loc = cloned.locations.find((l) => l.id === locId);
  if (!loc) return null;

  let variant: Variant | null = null;
  if (variantId) {
    variant = loc.variants?.find((v) => v.id === variantId) ?? null;
    if (!variant) return null;
  }

  mutator(loc, variant);
  return cloned;
}

/**
 * Helper to get the shots array for the correct level (variant or flat location).
 * Initialises the array if it doesn't exist yet.
 */
export function getShots(loc: Location, variant: Variant | null): any[] {
  if (variant) {
    if (!variant.shots) variant.shots = [];
    return variant.shots;
  }
  if (!loc.shots) loc.shots = [];
  return loc.shots;
}

/**
 * Helper to get the palette array for the correct level (variant or flat location).
 * Initialises the array if it doesn't exist yet.
 */
export function getPalette(loc: Location, variant: Variant | null): string[] {
  if (variant) {
    if (!variant.palette) variant.palette = [];
    return variant.palette;
  }
  if (!loc.palette) loc.palette = [];
  return loc.palette;
}
