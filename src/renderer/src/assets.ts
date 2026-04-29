import type { PetState } from "../../shared/types";

export function createAssetUrls(): Record<PetState, string> {
  return {
    walking: window.pawse.assetUrl("lovart_footage/puppy/1 - playing outside.gif"),
    idle: window.pawse.assetUrl("lovart_footage/puppy/standing pose.gif"),
    sitting: window.pawse.assetUrl("lovart_footage/puppy/3 - welcome to work.gif"),
    happy: window.pawse.assetUrl("lovart_footage/puppy/1 - waiting for playing outside.gif"),
    knocking: window.pawse.assetUrl("lovart_footage/puppy/1 - waiting for playing outside.gif"),
    thirsty: window.pawse.assetUrl("lovart_footage/water_gifs/want_water.gif"),
    drinking: window.pawse.assetUrl("lovart_footage/water_gifs/got_water.gif"),
    focusGuard: window.pawse.assetUrl("lovart_footage/puppy/standing pose4.gif"),
    annoyed: window.pawse.assetUrl("lovart_footage/puppy/4 - sleeping.gif")
  };
}
