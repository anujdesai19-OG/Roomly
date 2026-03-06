export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
