'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  href?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    loading = false, 
    disabled,
    href,
    className = '', 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all'
    
    const variantStyles = {
      primary: 'bg-black text-white hover:opacity-80',
      secondary: 'bg-white text-black border border-black hover:bg-gray-50',
    }
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-8 py-3 text-base',
      lg: 'px-10 py-4 text-lg',
    }
    
    const disabledStyles = 'opacity-50 cursor-not-allowed'
    
    const buttonClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${(disabled || loading) ? disabledStyles : ''}
      ${className}
    `.trim()

    if (href && !disabled && !loading) {
      return (
        <Link href={href} className={buttonClassName}>
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            처리 중...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 메뉴 아이템 버튼 (화살표 포함)
interface MenuButtonProps {
  href: string
  children: React.ReactNode
}

export function MenuButton({ href, children }: MenuButtonProps) {
  return (
    <Link href={href} className="menu-item">
      <span className="text-lg font-medium">{children}</span>
      <span className="text-xl">›</span>
    </Link>
  )
}
