// 石榴庄地铁站坐标
export const SHILIUMAZHUANG_STATION = {
  name: '石榴庄地铁站',
  lng: 116.4153,
  lat: 39.7735
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
  // Import beijingMapData dynamically
  const beijingMapData = (window as any).__beijingMapData
  if (!beijingMapData || !beijingMapData.features || beijingMapData.features.length === 0) {
    // Fallback: use rectangular boundary if map data not available
    return lng >= 115.42 && lng <= 117.50 && lat >= 39.44 && lat <= 41.06
  }

  for (const district of beijingMapData.features) {
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

// 生成数据来源点
export function generateDataSources(count?: number) {
  const targetCount = count || Math.floor(Math.random() * 41) + 10 // 10-50
  const sources = []
  
  // 北京范围（用于初始随机生成）
  const lngMin = 115.42
  const lngMax = 117.50
  const latMin = 39.44
  const latMax = 41.06
  
  // 石榴庄坐标
  const targetLng = SHILIUMAZHUANG_STATION.lng
  const targetLat = SHILIUMAZHUANG_STATION.lat
  
  let attempts = 0
  const maxAttempts = targetCount * 10 // Prevent infinite loop
  
  while (sources.length < targetCount && attempts < maxAttempts) {
    attempts++
    
    const lng = lngMin + Math.random() * (lngMax - lngMin)
    const lat = latMin + Math.random() * (latMax - latMin)
    
    // 检查是否在北京地图边界内
    if (!isPointInBeijing(lng, lat)) continue
    
    // 排除目标点附近
    const dist = Math.sqrt((lng - targetLng) ** 2 + (lat - targetLat) ** 2)
    if (dist > 0.05) { // 至少距离目标点0.05度
      sources.push({
        id: sources.length + 1,
        name: `数据源-${String(sources.length + 1).padStart(3, '0')}`,
        lng,
        lat,
        value: Math.floor(Math.random() * 100) + 1
      })
    }
  }
  
  return sources
}

// 生成贝塞尔曲线路径
export function generateCurvePath(start: [number, number], end: [number, number]) {
  const [x1, y1] = start
  const [x2, y2] = end
  
  // 计算中点并添加偏移形成曲线
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  
  // 计算垂直方向的偏移
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  
  // 曲线偏移量（根据距离调整）
  const offset = len * 0.15
  const offsetX = -dy / len * offset
  const offsetY = dx / len * offset
  
  const ctrlX = midX + offsetX
  const ctrlY = midY + offsetY
  
  return [
    [x1, y1],
    [ctrlX, ctrlY],
    [x2, y2]
  ]
}
