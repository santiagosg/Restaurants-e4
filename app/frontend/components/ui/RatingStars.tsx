interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  count?: number
}

export function RatingStars({ rating, size = 'md', showCount = false, count }: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const renderStar = (position: number) => {
    const isFilled = position <= Math.round(rating)
    const isHalf = position === Math.round(rating) && rating % 1 >= 0.5

    return (
      <svg
        key={position}
        className={sizeClasses[size]}
        fill={isHalf ? 'url(#half-star)' : isFilled ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 20 20"
      >
        <defs>
          <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isFilled ? 0 : 1}
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
    )
  }

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {[1, 2, 3, 4, 5].map(renderStar)}
      {showCount && count !== undefined && (
        <span className="text-gray-500 text-sm ml-1">({count})</span>
      )}
    </div>
  )
}