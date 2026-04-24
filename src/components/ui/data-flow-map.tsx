import React, { useEffect, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { loadBeijingMap, beijingMapData } from '@/lib/beijing-map'
import { SHILIUMAZHUANG_STATION, generateDataSources, generateCurvePath } from '@/lib/data-flow-map'

interface DataSource {
  id: number
  name: string
  lng: number
  lat: number
  value: number
}

export function DataFlowMap() {
  const chartRef = useRef<any>(null)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [flowCount, setFlowCount] = useState(0)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    loadBeijingMap().then((data) => {
      if (data) {
        echarts.registerMap('beijing', data)
        setMapLoaded(true)
        setDataSources(generateDataSources())
      }
    })
  }, [])

  // 模拟数据流动效果
  useEffect(() => {
    if (!mapLoaded || dataSources.length === 0) return

    const target = SHILIUMAZHUANG_STATION
    let currentIndex = 0

    const interval = setInterval(() => {
      if (dataSources.length === 0) return
      
      // 每次一个数据点流入
      currentIndex = (currentIndex + 1) % dataSources.length
      setFlowCount(prev => prev + 1)
    }, 1500) // 每1.5秒流入一个数据

    return () => clearInterval(interval)
  }, [mapLoaded, dataSources])

  // 生成飞行动画数据 - 所有线都连接到石榴庄地铁站
  const linesData = dataSources.map(source => ({
    coords: [
      [source.lng, source.lat],  // 起点：数据源
      [SHILIUMAZHUANG_STATION.lng, SHILIUMAZHUANG_STATION.lat]  // 终点：石榴庄地铁站
    ],
    lineStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
        { offset: 1, color: 'rgba(59, 130, 246, 0.6)' }
      ]),
      width: 2,
      curveness: 0.3  // 曲线弯曲度
    }
  }))

  // 飞行动画特效
  const effectScatterData = dataSources.map(source => ({
    name: source.name,
    value: [source.lng, source.lat, source.value]
  }))

  // 目标点
  const targetPoint = {
    name: SHILIUMAZHUANG_STATION.name,
    value: [SHILIUMAZHUANG_STATION.lng, SHILIUMAZHUANG_STATION.lat, flowCount]
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesName === '数据来源点') {
          return `<div style="padding: 8px;">
            <div style="font-weight: bold;">${params.data.name}</div>
            <div>数据量: ${params.data.value[2]}</div>
          </div>`
        } else if (params.seriesName === '目标点') {
          return `<div style="padding: 8px;">
            <div style="font-weight: bold;">${params.data.name}</div>
            <div>累计流入: ${flowCount} 次</div>
          </div>`
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
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(59, 130, 246, 0.3)'
        }
      }
    },
    series: [
      // 曲线连接线
      {
        name: '数据流入',
        type: 'lines',
        coordinateSystem: 'geo',
        data: linesData,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.6,
          color: '#3b82f6',
          symbol: 'arrow',
          symbolSize: 8
        },
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.2)',
          width: 1,
          curveness: 0.3
        }
      },
      // 数据来源点 - 波动扩散效果
      {
        name: '数据来源点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: effectScatterData,
        symbolSize: 8,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: 4,
          period: 3
        },
        itemStyle: {
          color: '#3b82f6',
          shadowBlur: 10,
          shadowColor: 'rgba(59, 130, 246, 0.5)'
        },
        label: {
          show: false
        }
      },
      // 目标点 - 石榴庄地铁站
      {
        name: '目标点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [targetPoint],
        symbolSize: 20,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'fill',
          scale: 6,
          period: 2
        },
        itemStyle: {
          color: '#ef4444',
          shadowBlur: 20,
          shadowColor: 'rgba(239, 68, 68, 0.8)'
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 12,
          color: '#fff',
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          padding: [4, 8],
          borderRadius: 4
        }
      }
    ]
  }

  if (!mapLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        正在加载地图...
      </div>
    )
  }

  return (
    <div className="relative">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '500px', width: '100%' }}
        notMerge={true}
      />

      {/* 统计信息 */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border">
        <div className="text-xs font-medium mb-2 text-muted-foreground">数据流入统计</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-500">{flowCount}</span>
          <span className="text-xs text-muted-foreground">次</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          数据来源点: {dataSources.length} 个
        </div>
      </div>

      {/* 图例 */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border space-y-2">
        <div className="text-xs font-medium mb-2">图例</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-xs">数据来源点</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs">石榴庄地铁站</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <span className="text-xs">数据流向</span>
        </div>
      </div>
    </div>
  )
}
