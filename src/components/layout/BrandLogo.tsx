import logoImg from '../../assets/Logis 2.png';

interface BrandLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export function BrandLogo({ width, height = 36, className = '', alt = 'LogistteX' }: BrandLogoProps) {
  return (
    <img
      src={logoImg}
      alt={alt}
      draggable={false}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
      className={`object-contain select-none ${className}`}
    />
  );
}
