"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../lib/googleMapsLoader";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (data: { address: string; lat?: number; lng?: number }) => void;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const callbackRef = useRef<typeof onPlaceSelected>(undefined);

  useEffect(() => {
    callbackRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não configurada");
      return;
    }

    let cancelled = false;
    let listener: any = null;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled) return;
        if (!inputRef.current) return;

        const location = new window.google.maps.LatLng(-26.4851, -49.0713); // Latitude e Longitude de Jaraguá do Sul, SC
        const radius = 10000; // Raio de 10 km

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode", "establishment"],
          fields: ["formatted_address", "geometry", "name", "place_id"],
          componentRestrictions: { country: "BR" }, // Restringe para resultados no Brasil
          bounds: new window.google.maps.LatLngBounds(location),
          radius,
        });

        listener = autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          const address = place.formatted_address ?? inputRef.current?.value ?? "";

          const location = place.geometry?.location;
          const lat = location ? location.lat() : undefined;
          const lng = location ? location.lng() : undefined;

          callbackRef.current?.({ address, lat, lng });
        });
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      if (listener && window.google && window.google.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: 8, marginTop: 4 }}
      placeholder="Digite o endereço"
    />
  );
}
