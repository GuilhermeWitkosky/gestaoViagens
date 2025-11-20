"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../lib/googleMapsLoader";

type RoutePoint = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  ordem: number;
};

type Props = {
  points: RoutePoint[];
};

export function RouteMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

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

        if (points.length === 0) {
          const fallbackCenter = { lat: -26.4851, lng: -49.0713 };
          const map = new window.google.maps.Map(mapRef.current, {
            center: fallbackCenter,
            zoom: 12,
          });
          mapInstanceRef.current = map;
          return;
        }

        const validPoints = points.filter(
          (p) =>
            typeof p.latitude === "number" &&
            !Number.isNaN(p.latitude) &&
            typeof p.longitude === "number" &&
            !Number.isNaN(p.longitude)
        );

        if (validPoints.length === 0) {
          const fallbackCenter = { lat: -26.4851, lng: -49.0713 };
          const map = new window.google.maps.Map(mapRef.current, {
            center: fallbackCenter,
            zoom: 12,
          });
          mapInstanceRef.current = map;
          return;
        }

        const start = validPoints[0];
        const center = { lat: start.latitude, lng: start.longitude };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
        });
        mapInstanceRef.current = map;

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
        });
        directionsRenderer.setMap(map);
        directionsRendererRef.current = directionsRenderer;

        if (validPoints.length === 1) {
          return;
        }

        const origin = {
          lat: validPoints[0].latitude,
          lng: validPoints[0].longitude,
        };

        const destination = {
          lat: validPoints[validPoints.length - 1].latitude,
          lng: validPoints[validPoints.length - 1].longitude,
        };

        const waypoints =
          validPoints.length > 2
            ? validPoints.slice(1, validPoints.length - 1).map((p) => ({
                location: {
                  lat: p.latitude,
                  lng: p.longitude,
                },
                stopover: true,
              }))
            : [];

        directionsService.route(
          {
            origin,
            destination,
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
          },
          (result: any, status: any) => {
            if (status === "OK" && result) {
              directionsRenderer.setDirections(result);
            } else {
              console.error("Erro ao traçar rota", status);
            }
          }
        );
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [points]);

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
