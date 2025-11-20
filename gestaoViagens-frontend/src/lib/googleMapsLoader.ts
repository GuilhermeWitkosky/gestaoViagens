"use client";

declare global {
  interface Window {
    initGestaoMap?: () => void;
    google?: any;
  }
}

let googleMapsScriptPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string) {
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window undefined"));
      return;
    }

    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const scriptId = "google-maps-script-gestao";
    if (document.getElementById(scriptId)) {
      window.initGestaoMap = () => resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGestaoMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Erro ao carregar Google Maps"));

    window.initGestaoMap = () => resolve();
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}
