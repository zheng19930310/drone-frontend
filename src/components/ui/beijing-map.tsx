import React, { useEffect, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { loadBeijingMap, generateMarkers, beijingMapData } from '@/lib/beijing-map'

interface Marker {
  id: number
  type: string
  typeName: string
  name: string
  lng: number
  lat: number
  addTime: string
  description: string
}

interface BeijingMapProps {
  onMarkerClick?: (marker: Marker) => void
}

export function BeijingMap({ onMarkerClick }: BeijingMapProps) {
  const chartRef = useRef<any>(null)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Load Beijing map data and register with ECharts
    loadBeijingMap().then((data) => {
      if (data) {
        echarts.registerMap('beijing', data)
        setMapLoaded(true)
        setMarkers(generateMarkers())
      }
    })

    // Auto refresh markers every 30 seconds
    const interval = setInterval(() => {
      setMarkers(generateMarkers())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesType === 'scatter') {
          const data = params.data
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
              <div>类型: ${data.typeName}</div>
              <div>经度: ${data.lng.toFixed(4)}</div>
              <div>纬度: ${data.lat.toFixed(4)}</div>
            </div>
          `
        }
        return params.name
      }
    },
    geo: {
      map: 'beijing',
      roam: true,
      zoom: 1.1,
      center: [116.4074, 40.0],
      label: {
        show: true,
        color: '#94a3b8',
        fontSize: 10
      },
      itemStyle: {
        areaColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        shadowColor: 'rgba(59, 130, 246, 0.3)',
        shadowBlur: 10
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(59, 130, 246, 0.3)'
        },
        label: {
          color: '#fff'
        }
      },
      regions: beijingMapData?.features?.map((f: any) => ({
        name: f.properties.name,
        itemStyle: {
          areaColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6',
          borderWidth: 0.5
        }
      })) || []
    },
    series: [
      {
        name: '工作人员',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: markers.filter(m => m.type === 'staff').map(m => ({
          value: [m.lng, m.lat],
          ...m
        })),
        symbol: 'path://M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9V7L15 1H5L-1 7V9L3 13V17C3 18.66 4.34 20 6 20H9C10.66 20 12 18.66 12 17V14C12 13.45 11.55 13 11 13H9V10C9 8.9 9.9 8 11 8H13C14.1 8 15 8.9 15 10V13H13C12.45 13 12 13.45 12 14V17C12 17.55 12.45 18 13 18H18C19.66 18 21 16.66 21 15V11L21 9Z',
        symbolSize: 20,
        itemStyle: {
          color: '#10b981',
          shadowBlur: 8,
          shadowColor: 'rgba(16, 185, 129, 0.5)'
        },
        emphasis: {
          scale: true,
          symbolSize: 26,
          itemStyle: {
            shadowBlur: 15
          }
        }
      },
      {
        name: '应急物资',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: markers.filter(m => m.type === 'emergency').map(m => ({
          value: [m.lng, m.lat],
          ...m
        })),
        symbol: 'path://M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12H13V17H11V12H7V10H11V5H13V10H17V12Z',
        symbolSize: 18,
        itemStyle: {
          color: '#f59e0b',
          shadowBlur: 8,
          shadowColor: 'rgba(245, 158, 11, 0.5)'
        },
        emphasis: {
          scale: true,
          symbolSize: 24,
          itemStyle: {
            shadowBlur: 15
          }
        }
      },
      {
        name: '监测点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: markers.filter(m => m.type === 'monitor').map(m => ({
          value: [m.lng, m.lat],
          ...m
        })),
        symbol: 'triangle',
        symbolSize: 16,
        symbolRotate: 180,
        itemStyle: {
          color: '#ef4444',
          shadowBlur: 8,
          shadowColor: 'rgba(239, 68, 68, 0.5)'
        },
        emphasis: {
          scale: true,
          symbolSize: 22,
          itemStyle: {
            shadowBlur: 15
          }
        }
      }
    ]
  }

  const handleEvents = {
    click: (params: any) => {
      if (params.seriesType === 'scatter' && params.data) {
        setSelectedMarker(params.data)
        onMarkerClick?.(params.data)
      }
    }
  }

  if (!mapLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        正在加载北京地图...
      </div>
    )
  }

  return (
    <div className="relative">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '500px', width: '100%' }}
        onEvents={handleEvents}
        notMerge={true}
      />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border space-y-2">
        <div className="text-xs font-medium mb-2">图例</div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9V7L15 1H5L-1 7V9L3 13V17C3 18.66 4.34 20 6 20H9C10.66 20 12 18.66 12 17V14C12 13.45 11.55 13 11 13H9V10C9 8.9 9.9 8 11 8H13C14.1 8 15 8.9 15 10V13H13C12.45 13 12 13.45 12 14V17C12 17.55 12.45 18 13 18H18C19.66 18 21 16.66 21 15V11L21 9Z"/>
          </svg>
          <span className="text-xs">工作人员</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12H13V17H11V12H7V10H11V5H13V10H17V12Z"/>
          </svg>
          <span className="text-xs">应急物资</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22H22L12 2Z"/>
          </svg>
          <span className="text-xs">监测点</span>
        </div>
      </div>

      {/* Marker Info Popup */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 border border-border max-w-xs shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-sm">{selectedMarker.name}</h3>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">类型:</span>
              <span>{selectedMarker.typeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">添加时间:</span>
              <span>{selectedMarker.addTime}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-border/50">
              <span className="text-muted-foreground block mb-1">说明:</span>
              <span className="text-foreground">{selectedMarker.description}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
