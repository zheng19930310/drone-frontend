import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { taskAPI } from '@/lib/api'

interface Task {
  id: number
  taskName: string
  taskType: string
  location: string
  coordinateLat: string
  coordinateLng: string
  taskTime: string
  contactPerson: string
  contactPhone: string
  status: string
  remark: string
  createTime: number
  updateTime: number
}

export default function TaskPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    taskName: '', taskType: 'general', location: '', coordinateLat: '', coordinateLng: '',
    taskTime: '', contactPerson: '', contactPhone: '', remark: '',
  })

  const fetchData = async () => {
    try {
      const res: any = await taskAPI.list(pageNum, pageSize, searchKey, statusFilter)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch { error('加载失败') }
  }

  useEffect(() => { fetchData() }, [pageNum, searchKey, statusFilter])

  const handleSearch = () => { setSearchKey(keyword); setPageNum(1) }
  const resetForm = () => {
    setFormData({ taskName: '', taskType: 'general', location: '', coordinateLat: '', coordinateLng: '', taskTime: '', contactPerson: '', contactPhone: '', remark: '' })
    setEditItem(null)
  }
  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: Task) => {
    setEditItem(item)
    setFormData({
      taskName: item.taskName, taskType: item.taskType, location: item.location,
      coordinateLat: item.coordinateLat, coordinateLng: item.coordinateLng, taskTime: item.taskTime,
      contactPerson: item.contactPerson, contactPhone: item.contactPhone, remark: item.remark,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) { await taskAPI.update(editItem.id, formData); success('更新成功') }
      else { await taskAPI.create(formData); success('创建成功') }
      setModalOpen(false); fetchData()
    } catch { error('操作失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await taskAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  const typeMap: Record<string, string> = { general: '普通安保', important: '重大活动', important_place: '要地', important_person: '要人' }
  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      pending: { label: '待调度', variant: 'warning' },
      scheduled: { label: '已调度', variant: 'default' },
      in_progress: { label: '执行中', variant: 'success' },
      finished: { label: '已结束', variant: 'muted' },
    }
    const v = map[s] || { label: s, variant: 'muted' }
    return <Badge variant={v.variant}>{v.label}</Badge>
  }

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">任务管理</h1><p className="text-muted-foreground text-sm mt-1">管理安保任务</p></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增任务</Button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="搜索任务名称" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-56" />
          <select className="select w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">全部状态</option>
            <option value="pending">待调度</option><option value="scheduled">已调度</option>
            <option value="in_progress">执行中</option><option value="finished">已结束</option>
          </select>
          <Button variant="secondary" onClick={handleSearch}><Search className="w-4 h-4 mr-1" />搜索</Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>任务名称</th><th>任务类型</th><th>地点</th><th>任务时间</th><th>联系人</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.taskName}</td>
                  <td><span className="badge badge-default">{typeMap[item.taskType] || item.taskType}</span></td>
                  <td className="max-w-[200px] truncate">{item.location}</td>
                  <td>{item.taskTime}</td>
                  <td>{item.contactPerson} {item.contactPhone && `(${item.contactPhone})`}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td className="text-muted-foreground text-xs">{item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>}
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑任务' : '新增任务'} width="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">任务名称</label>
              <Input value={formData.taskName} onChange={(e) => setFormData({ ...formData, taskName: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">任务类型</label>
              <select className="select" value={formData.taskType} onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}>
                <option value="general">普通安保</option><option value="important">重大活动</option>
                <option value="important_place">要地</option><option value="important_person">要人</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">任务地点</label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="请输入地点" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">纬度</label>
              <Input value={formData.coordinateLat} onChange={(e) => setFormData({ ...formData, coordinateLat: e.target.value })} placeholder="纬度" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">经度</label>
              <Input value={formData.coordinateLng} onChange={(e) => setFormData({ ...formData, coordinateLng: e.target.value })} placeholder="经度" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">任务时间</label>
              <Input value={formData.taskTime} onChange={(e) => setFormData({ ...formData, taskTime: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">联系人</label>
              <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">联系电话</label>
              <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">备注</label>
            <textarea className="input h-20 resize-none" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} placeholder="请输入" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleSubmit}>{editItem ? '保存' : '创建'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
