// Free background removal that runs in the admin's own browser (no paid service).
// The remover (@imgly/background-removal) is only downloaded the first time an admin uses it,
// so shoppers never load it. The first photo takes longer while it downloads; later ones are quicker.
const REMOVER_URL = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";

let removerPromise = null;

function loadRemover() {
  if (!removerPromise) {
    removerPromise = import(/* webpackIgnore: true */ REMOVER_URL).catch((error) => {
      removerPromise = null;
      throw error;
    });
  }
  return removerPromise;
}

// Takes a File, Blob, or image URL; returns a PNG File with a see-through background.
export async function removeImageBackground(source, fileName = "bow.png") {
  const { removeBackground } = await loadRemover();
  const blob = await removeBackground(source, { output: { format: "image/png", quality: 1 } });
  const pngName = fileName.replace(/\.[a-z0-9]+$/i, "") + ".png";
  return new File([blob], pngName, { type: "image/png" });
}
