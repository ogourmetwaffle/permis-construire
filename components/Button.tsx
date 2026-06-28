import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors transition-shadow'
  const variants: Record<string, string> = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 focus-visible:ring-gray-300'
  }
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button {...rest} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || rest.disabled} aria-busy={loading}>
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
