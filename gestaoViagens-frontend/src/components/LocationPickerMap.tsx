"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../lib/googleMapsLoader";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

export function LocationPickerMap({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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

        const initialCenter =
          lat != null && lng != null
            ? { lat, lng }
            : { lat: -26.4851, lng: -49.0713 };

        const map = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: lat != null && lng != null ? 16 : 12,
        });

        mapInstanceRef.current = map;

        if (lat != null && lng != null) {
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            draggable: true,
          });
          markerRef.current = marker;

          marker.addListener("dragend", (e: any) => {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            onChange(newLat, newLng);
          });
        }

        map.addListener("click", (e: any) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();

          if (markerRef.current) {
            markerRef.current.setPosition({ lat: newLat, lng: newLng });
          } else {
            const marker = new window.google.maps.Marker({
              position: { lat: newLat, lng: newLng },
              map,
              draggable: true,
            });
            markerRef.current = marker;
            marker.addListener("dragend", (event: any) => {
              const dLat = event.latLng.lat();
              const dLng = event.latLng.lng();
              onChange(dLat, dLng);
            });
          }

          map.panTo({ lat: newLat, lng: newLng });
          onChange(newLat, newLng);
        });
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (lat == null || lng == null) return;

    const position = { lat, lng };

    if (!markerRef.current) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        draggable: true,
      });
      markerRef.current = marker;
      marker.addListener("dragend", (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onChange(newLat, newLng);
      });
    } else {
      markerRef.current.setPosition(position);
    }

    mapInstanceRef.current.panTo(position);
    mapInstanceRef.current.setZoom(16);
  }, [lat, lng, onChange]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 300,
        border: "1px solid #ccc",
        borderRadius: 8,
        marginTop: 16,
      }}
    />
  );
}
