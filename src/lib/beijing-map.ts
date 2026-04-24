// Beijing map GeoJSON data - will be loaded dynamically
export let beijingMapData: any = null
export let beijingDistricts: any[] = []

// Load Beijing GeoJSON data from public directory
export async function loadBeijingMap() {
  try {
    const response = await fetch('/beijing.json')
    const data = await response.json()
    beijingMapData = data
    beijingDistricts = data.features
    
    // Save to global for use in other modules
    ;(window as any).__beijingMapData = data
    
    return data
  } catch (error) {
    console.error('Failed to load Beijing map data:', error)
    return null
  }
}

// Point-in-polygon algorithm (ray casting)
function isPointInPolygon(point: [number, number], polygon: number[][][]): boolean {
  let inside = false
  for (const ring of polygon) {
    const x = point[0], y = point[1]
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]
      const xj = ring[j][0], yj = ring[j][1]
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
  }
  return inside
}

// Check if point is inside any Beijing district
function isPointInBeijing(lng: number, lat: number): boolean {
  if (!beijingDistricts.length) return true // Fallback: allow all points if data not loaded

  for (const district of beijingDistricts) {
    const coords = district.geometry.coordinates
    const geomType = district.geometry.type

    if (geomType === 'Polygon') {
      if (isPointInPolygon([lng, lat], coords)) return true
    } else if (geomType === 'MultiPolygon') {
      for (const polygon of coords) {
        if (isPointInPolygon([lng, lat], polygon)) return true
      }
    }
  }
  return false
}

// Generate random markers within Beijing boundaries
export function generateMarkers() {
  const types = ['staff', 'emergency', 'monitor'] as const
  const typeNames = {
    staff: '工作人员',
    emergency: '应急物资',
    monitor: '监测点'
  }

  const targetCount = Math.floor(Math.random() * 41) + 10 // 10-50
  const markers = []

  // Beijing approximate boundaries for initial random generation
  const lngMin = 115.42
  const lngMax = 117.50
  const latMin = 39.44
  const latMax = 41.06

  let attempts = 0
  const maxAttempts = targetCount * 10 // Prevent infinite loop

  while (markers.length < targetCount && attempts < maxAttempts) {
    attempts++
    const type = types[Math.floor(Math.random() * types.length)]
    const lng = lngMin + Math.random() * (lngMax - lngMin)
    const lat = latMin + Math.random() * (latMax - latMin)

    // Check if point is within Beijing boundaries
    if (isPointInBeijing(lng, lat)) {
      const addTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)

      markers.push({
        id: markers.length + 1,
        type,
        typeName: typeNames[type],
        name: `${typeNames[type]}-${String(markers.length + 1).padStart(3, '0')}`,
        lng,
        lat,
        addTime: addTime.toLocaleString('zh-CN'),
        description: `这是${typeNames[type]}的说明信息，位于北京市区域内，负责相关安保工作。`
      })
    }
  }

  return markers
}
