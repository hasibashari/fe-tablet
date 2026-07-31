'use client'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export default function Logo({
  size = 22,
  color = 'currentColor',
  className = '',
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 1.5C12.4 6.8 17.2 11.6 22.5 12C17.2 12.4 12.4 17.2 12 22.5C11.6 17.2 6.8 12.4 1.5 12C6.8 11.6 11.6 6.8 12 1.5Z"
        fill={color}
      />
      <path
        d="M12 6.5C12.2 9.5 14.5 11.8 17.5 12C14.5 12.2 12.2 14.5 12 17.5C11.8 14.5 9.5 12.2 6.5 12C9.5 11.8 11.8 9.5 12 6.5Z"
        fill={color}
        opacity="0.75"
      />
    </svg>
  )
}
