"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../lib/googleMapsLoader";

type MarkerData = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
};

type Props = {
  markers: MarkerData[];
};

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleMap({ markers }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não configurada");
      return;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled) return;
        if (!mapRef.current) return;

        const hasMarkers = markers.length > 0;
        const first = hasMarkers ? markers[0] : null;

        const center = hasMarkers
          ? { lat: first!.latitude, lng: first!.longitude }
          : { lat: -26.4851, lng: -49.0713 };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: hasMarkers ? 13 : 12,
        });

        mapInstanceRef.current = map;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (hasMarkers) {
          const bounds = new window.google.maps.LatLngBounds();

          markers.forEach((m) => {
            const position = { lat: m.latitude, lng: m.longitude };
            const marker = new window.google.maps.Marker({
              position,
              map,
              title: m.nome,
            });
            markersRef.current.push(marker);
            bounds.extend(position);
          });

          if (markers.length > 1) {
            map.fitBounds(bounds);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 400,
        borderRadius: 8,
        border: "1px solid #ccc",
        marginTop: 16,
      }}
    />
  );
}
