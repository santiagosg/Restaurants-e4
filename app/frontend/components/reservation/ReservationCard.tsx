import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface TimeSlot {
  time: string
  available: boolean
}

export function ReservationCard() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [partySize, setPartySize] = useState<number>(2)
  const [specialRequests, setSpecialRequests] = useState('')

  // Horarios de ejemplo
  const timeSlots: TimeSlot[] = [
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: false },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: false },
    { time: '20:30', available: true },
    { time: '21:00', available: true },
    { time: '21:30', available: true },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Reserva:', { selectedDate, selectedTime, partySize, specialRequests })
    // Aquí iría la lógica de reserva
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-gray-100 p-6 sticky top-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Reservar Mesa
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="success">Disponible hoy</Badge>
          <span className="text-sm text-gray-500">Respuesta en 5 min</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Horarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora disponible
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((slot, i) => (
              <button
                key={i}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`
                  py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${selectedTime === slot.time
                    ? 'bg-blue-600 text-white shadow-md'
                    : slot.available
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Número de personas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de personas
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={`
                  w-10 h-10 rounded-lg text-sm font-medium transition-all border-2
                  ${partySize === n
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }
                `}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPartySize(9)}
              className={`
                w-20 h-10 rounded-lg text-sm font-medium transition-all border-2
                ${partySize === 9
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }
              `}
            >
              8+
            </button>
          </div>
        </div>

        {/* Solicitudes especiales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solicitudes especiales <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Ej: Alérgias, celebración de cumpleaños..."
            rows={3}
            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={!selectedDate || !selectedTime}
        >
          {!selectedDate || !selectedTime ? (
            <>
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Completar datos
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Confirmar Reserva
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>✓ Confirmación inmediata</p>
          <p>✓ Cancelación gratuita hasta 24h antes</p>
        </div>
      </form>
    </div>
  )
}
