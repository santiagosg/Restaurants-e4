import { RestaurantDetail } from '@/components/restaurant/RestaurantDetail'
import { getRestaurantWithHours, getMenuByRestaurantId, getErrorMessage } from '@/lib/api'

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const restaurantId = params.id

  // Fetch data en paralelo
  let restaurant = null
  let menu = null
  let error = null

  try {
    const [restaurantResponse, menuResponse] = await Promise.allSettled([
      getRestaurantWithHours(restaurantId),
      getMenuByRestaurantId(restaurantId),
    ])

    if (restaurantResponse.status === 'fulfilled') {
      restaurant = restaurantResponse.value.data
    } else {
      error = getErrorMessage(restaurantResponse.reason)
    }

    if (menuResponse.status === 'fulfilled') {
      menu = menuResponse.value.data
    } else {
      // Si falla el menú, no mostramos error, solo no mostramos el menú
      console.warn('Error fetching menu:', menuResponse.reason)
    }
  } catch (err) {
    error = getErrorMessage(err)
  }

  return <RestaurantDetail restaurant={restaurant} menu={menu} error={error} />
}
