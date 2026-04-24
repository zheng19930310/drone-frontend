import React, { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { violationAPI, equipmentAPI } from '@/lib/api'

interface ViolationRecord {
  id: number
  equipmentId: number
  droneInfo: string
  flightRecord: string
  scanTime: number
  createTime: number
  updateTime: number
}

export default function ViolationPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<ViolationRecord[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [equipmentId, setEquipmentId] = useState<number | undefined>(undefined)
  const [equipmentList, setEquipmentList] = useState<any[]>([])

  const fetchEquipment = async () => {
    try {
      const res: any = await equipmentAPI.list(1, 100, undefined, '')
      if (res.code === 200) setEquipmentList(res.data.records || [])
    } catch {}
  }

  const fetchData = async () => {
    try {
      const res: any = await violationAPI.list(pageNum, pageSize, equipmentId)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch { error('加载失败') }
  }

  useEffect(() => { fetchEquipment() }, [])
  useEffect(() => { fetchData() }, [pageNum, equipmentId])

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await violationAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  return (
    <div className="page-fade-in space-y-6">
      <div><h1 className="text-2xl font-bold">违规记录</h1><p className="text-muted-foreground text-sm mt-1">查看违规飞行记录</p></div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <select className="select w-52" value={equipmentId ?? ''} onChange={(e) => { setEquipmentId(e.target.value ? Number(e.target.value) : undefined); setPageNum(1) }}>
            <option value="">全部设备</option>
            {equipmentList.map((e) => <option key={e.id} value={e.id}>{e.equipmentName}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>设备</th><th>无人机信息</th><th>飞行记录</th><th>扫描时间</th><th>记录时间</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Badge variant="default">{equipmentList.find((e) => e.id === item.equipmentId)?.equipmentName || `设备#${item.equipmentId}`}</Badge>
                  </td>
                  <td className="max-w-[200px] truncate">{item.droneInfo}</td>
                  <td className="max-w-[250px] truncate">{item.flightRecord}</td>
                  <td className="text-muted-foreground text-xs">{item.scanTime ? new Date(item.scanTime).toLocaleString('zh-CN') : '-'}</td>
                  <td className="text-muted-foreground text-xs">{item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <button className="p-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        {total > pageSize && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-sm text-muted-foreground">共 {total} 条</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)}>上一页</Button>
              <span className="text-sm">{pageNum} / {Math.ceil(total / pageSize)}</span>
              <Button variant="outline" size="sm" disabled={pageNum >= Math.ceil(total / pageSize)} onClick={() => setPageNum(p => p + 1)}>下一页</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
