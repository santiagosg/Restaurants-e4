import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'

interface TestimonialCardProps {
  name: string
  role?: string
  content: string
  rating: number
  avatar?: string
}

export function TestimonialCard({
  name,
  role,
  content,
  rating,
  avatar,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      {/* Quote icon */}
      <div className="text-blue-600 opacity-20 mb-4">
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Content */}
      <p className="text-gray-700 text-base leading-relaxed mb-6">
        "{content}"
      </p>

      {/* Author */}
      <div className="flex items-start gap-4">
        <Avatar
          src={avatar}
          fallback={name.charAt(0).toUpperCase()}
          size="lg"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <RatingStars rating={rating} size="sm" />
          </div>
          {role && (
            <p className="text-sm text-gray-500">{role}</p>
          )}
        </div>
      </div>
    </div>
  )
}