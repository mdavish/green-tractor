"use client";
import { cn } from "@/lib/utils";
import { CldImage } from "next-cloudinary";

export type ImageSize = "xs" | "small" | "medium" | "large";

export interface ResponsiveImageProps {
  cloudinaryPublicId: string | undefined | null;
  className?: string;
  alt: string;
  size?: ImageSize;
  crop?: string;
  gravity?: string;
  fallbackText?: string | React.ReactNode;
}

export default function ResponsiveImage({
  cloudinaryPublicId,
  className,
  alt,
  size = "small",
  crop = "thumb",
  gravity = "auto",
  fallbackText = (
    <>
      Image <br /> Placeholder
    </>
  ),
}: ResponsiveImageProps) {
  const imageSizeMap: Record<
    ImageSize,
    { tailwindClass: string; height: number; width: number }
  > = {
    xs: { tailwindClass: "h-[40px] w-[40px]", height: 40, width: 40 },
    small: { tailwindClass: "h-[300px] w-[300px]", height: 300, width: 300 },
    medium: { tailwindClass: "h-[500px] w-[500px]", height: 500, width: 500 },
    large: { tailwindClass: "h-[700px] w-[700px]", height: 700, width: 700 },
  };

  const { height, width, tailwindClass } = imageSizeMap[size];

  const sharedClassName = cn("rounded-md shrink-0 mx-auto", className);

  if (cloudinaryPublicId) {
    return (
      <CldImage
        className={sharedClassName}
        src={cloudinaryPublicId}
        alt={alt}
        width={width}
        height={height}
        // TODO:
        // Figure out how to make this more ddynamic
        sizes="(max-width: 768px) 100vw, 50vw"
        crop={crop}
        gravity={gravity}
      />
    );
  } else {
    return (
      <div className={cn(sharedClassName, "bg-slate-200 flex", tailwindClass)}>
        <h1 className="mx-auto my-auto text-slate-900 text-2xl text-center">
          {fallbackText}
        </h1>
      </div>
    );
  }
}
