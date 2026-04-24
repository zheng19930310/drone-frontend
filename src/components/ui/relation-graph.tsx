import React, { useEffect, useState, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

interface GraphNode {
  name: string
  symbolSize: number
  category: number
  x?: number
  y?: number
  fixed?: boolean
}

interface GraphLink {
  source: string
  target: string
}

interface RelationGraphProps {
  title: string
  centerName: string
  categories: string[]
  centerColor: string
  satelliteColors: string[]
  minSatellites?: number
  maxSatellites?: number
}

function generateGraphData(
  centerName: string,
  categories: string[],
  minCount: number,
  maxCount: number
): { nodes: GraphNode[]; links: GraphLink[]; categories: { name: string }[] } {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // 中心节点
  nodes.push({
    name: centerName,
    symbolSize: 60,
    category: 0,
    x: 400,
    y: 250,
    fixed: false // 可拖动
  })

  // 生成随机数量的卫星节点
  const satelliteCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount
  
  for (let i = 0; i < satelliteCount; i++) {
    const catIndex = (i % (categories.length - 1)) + 1 // 0是中心点
    const satelliteName = `${categories[catIndex]}-${String(i + 1).padStart(2, '0')}`
    
    nodes.push({
      name: satelliteName,
      symbolSize: 20 + Math.random() * 15,
      category: catIndex
    })

    links.push({
      source: centerName,
      target: satelliteName
    })

    // 部分卫星节点之间也有关联
    if (i > 0 && Math.random() > 0.6) {
      const prevIndex = Math.floor(Math.random() * i)
      links.push({
        source: satelliteName,
        target: nodes[prevIndex + 1].name
      })
    }
  }

  const categoryData = categories.map(name => ({ name }))

  return { nodes, links, categories: categoryData }
}

export function RelationGraph({
  title,
  centerName,
  categories,
  centerColor,
  satelliteColors,
  minSatellites = 5,
  maxSatellites = 15
}: RelationGraphProps) {
  const [graphData, setGraphData] = useState(() =>
    generateGraphData(centerName, categories, minSatellites, maxSatellites)
  )

  // 自动更新数据
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(generateGraphData(centerName, categories, minSatellites, maxSatellites))
    }, 20000) // 每20秒随机变更数量
    return () => clearInterval(interval)
  }, [centerName, categories, minSatellites, maxSatellites])

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<div style="padding: 8px;">
            <div style="font-weight: bold;">${params.data.name}</div>
            <div>类型: ${categories[params.data.category]}</div>
          </div>`
        }
        return `${params.data.source} → ${params.data.target}`
      }
    },
    legend: {
      data: categories,
      bottom: 0,
      textStyle: {
        fontSize: 10
      }
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: graphData.nodes,
        links: graphData.links,
        categories: graphData.categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          fontSize: 10
        },
        draggable: true, // 所有节点都可拖动
        force: {
          repulsion: 300,
          edgeLength: 80,
          gravity: 0.1
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          opacity: 0.6
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3
          }
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} notMerge={true} />
}
