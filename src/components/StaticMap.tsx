import { cn } from "@/lib/utils";

export default function StaticMap({
  lat,
  lng,
  className,
  alt,
  width = 300,
  height = 300,
}: {
  lat: number;
  lng: number;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
  const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+555555(${lng},${lat})/${lng},${lat},15,0/${width}x${height}?access_token=${mapboxToken}`;
  return (
    <img
      width={width}
      height={height}
      className={cn(className)}
      src={url}
      alt={alt ?? "A map"}
    />
  );
}
