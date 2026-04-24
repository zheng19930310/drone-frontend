import React, { useEffect, useState } from 'react'
import { Search, Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { alarmAPI } from '@/lib/api'

interface AlarmRecord {
  id: number
  alarmType: string
  equipmentId: number
  alarmContent: string
  scanCount: number
  flightCount: number
  status: string
  handleRemark: string
  createTime: number
  updateTime: number
}

export default function AlarmPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<AlarmRecord[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [alarmType, setAlarmType] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [handleModal, setHandleModal] = useState(false)
  const [handleId, setHandleId] = useState<number | null>(null)
  const [handleRemark, setHandleRemark] = useState('')
  const [formData, setFormData] = useState({
    alarmType: 'equipment', equipmentId: 0, alarmContent: '', scanCount: 0, flightCount: 0,
  })

  const fetchData = async () => {
    try {
      const res: any = await alarmAPI.list(pageNum, pageSize, alarmType, statusFilter)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch { error('加载失败') }
  }

  useEffect(() => { fetchData() }, [pageNum, alarmType, statusFilter])

  const resetForm = () => {
    setFormData({ alarmType: 'equipment', equipmentId: 0, alarmContent: '', scanCount: 0, flightCount: 0 })
  }

  const openCreate = () => { resetForm(); setModalOpen(true) }

  const handleSubmit = async () => {
    try {
      await alarmAPI.create(formData)
      success('创建成功')
      setModalOpen(false)
      fetchData()
    } catch { error('操作失败') }
  }

  const openHandle = (id: number) => {
    setHandleId(id)
    setHandleRemark('')
    setHandleModal(true)
  }

  const handleConfirm = async () => {
    if (handleId === null) return
    try {
      await alarmAPI.handle(handleId, handleRemark)
      success('处理成功')
      setHandleModal(false)
      fetchData()
    } catch { error('处理失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await alarmAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  const typeBadge = (s: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      equipment: { label: '设备预警', variant: 'warning' },
      violation: { label: '违规飞行', variant: 'destructive' },
    }
    const v = map[s] || { label: s, variant: 'muted' }
    return <Badge variant={v.variant}>{v.label}</Badge>
  }

  const statusBadge = (s: string) => {
    return <Badge variant={s === 'handled' ? 'success' : 'warning'}>{s === 'handled' ? '已处理' : '未处理'}</Badge>
  }

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">预警记录</h1><p className="text-muted-foreground text-sm mt-1">管理预警信息</p></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增预警</Button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <select className="select w-36" value={alarmType} onChange={(e) => { setAlarmType(e.target.value); setPageNum(1) }}>
            <option value="">全部类型</option>
            <option value="equipment">设备预警</option>
            <option value="violation">违规飞行</option>
          </select>
          <select className="select w-36" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPageNum(1) }}>
            <option value="">全部状态</option>
            <option value="unhandled">未处理</option>
            <option value="handled">已处理</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>预警类型</th><th>设备ID</th><th>预警内容</th><th>扫描次数</th><th>飞行次数</th><th>状态</th><th>处理备注</th><th>时间</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>{typeBadge(item.alarmType)}</td>
                  <td>{item.equipmentId || '-'}</td>
                  <td className="max-w-[200px] truncate">{item.alarmContent}</td>
                  <td>{item.scanCount}</td>
                  <td>{item.flightCount}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td className="max-w-[150px] truncate">{item.handleRemark || '-'}</td>
                  <td className="text-muted-foreground text-xs">{item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {item.status === 'unhandled' && (
                        <button className="p-1 rounded hover:bg-success/10 text-success" title="处理" onClick={() => openHandle(item.id)}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 rounded hover:bg-destructive/10 text-destructive" title="删除" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>}
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

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增预警">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">预警类型</label>
              <select className="select" value={formData.alarmType} onChange={(e) => setFormData({ ...formData, alarmType: e.target.value })}>
                <option value="equipment">设备预警</option><option value="violation">违规飞行</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备ID</label>
              <Input type="number" value={formData.equipmentId} onChange={(e) => setFormData({ ...formData, equipmentId: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">预警内容</label>
            <textarea className="input h-20 resize-none" value={formData.alarmContent} onChange={(e) => setFormData({ ...formData, alarmContent: e.target.value })} placeholder="请输入" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">扫描次数</label>
              <Input type="number" value={formData.scanCount} onChange={(e) => setFormData({ ...formData, scanCount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">飞行次数</label>
              <Input type="number" value={formData.flightCount} onChange={(e) => setFormData({ ...formData, flightCount: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>创建</Button>
          </div>
        </div>
      </Modal>

      {/* Handle Modal */}
      <Modal open={handleModal} onClose={() => setHandleModal(false)} title="处理预警">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">处理备注</label>
            <textarea className="input h-24 resize-none" value={handleRemark} onChange={(e) => setHandleRemark(e.target.value)} placeholder="请输入处理说明" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setHandleModal(false)}>取消</Button>
            <Button onClick={handleConfirm}>确认处理</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
