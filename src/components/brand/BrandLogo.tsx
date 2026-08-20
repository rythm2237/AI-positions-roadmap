import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  alt?: string;
};

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export function BrandLogo({ className = "", priority = false, alt = "AI Role Path" }: BrandLogoProps) {
  return (
    <Image
      src="/brand/ai-role-path/logo-horizontal-dark.svg"
      alt={alt}
      width={620}
      height={118}
      priority={priority}
      className={className}
    />
  );
}

export function BrandLogoWithDescriptor({ className = "", priority = false, alt = "AI Role Path — Career Operating System" }: BrandLogoProps) {
  return (
    <Image
      src="/brand/ai-role-path/logo-with-descriptor-dark.svg"
      alt={alt}
      width={620}
      height={140}
      priority={priority}
      className={className}
    />
  );
}

export function BrandMark({ size = 38, className = "" }: BrandMarkProps) {
  return (
    <Image
      src="/brand/ai-role-path/mark-gradient.svg"
      alt=""
      aria-hidden="true"
      width={Math.round(size * (106 / 119))}
      height={size}
      className={className}
    />
  );
}
