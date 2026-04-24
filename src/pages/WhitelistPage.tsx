import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, CheckCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { whitelistAPI } from '@/lib/api'

interface Whitelist {
  id: number
  applicantName: string
  applicantPhone: string
  deviceInfo: string
  purpose: string
  flightArea: string
  flightTime: string
  status: string
  approvalRemark: string
  approvalTime: number
  createTime: number
  updateTime: number
}

export default function WhitelistPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<Whitelist[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [approveModal, setApproveModal] = useState(false)
  const [editItem, setEditItem] = useState<Whitelist | null>(null)
  const [approveId, setApproveId] = useState<number | null>(null)
  const [approveRemark, setApproveRemark] = useState('')
  const [formData, setFormData] = useState({
    applicantName: '', applicantPhone: '', deviceInfo: '',
    purpose: '', flightArea: '', flightTime: '',
  })

  const fetchData = async () => {
    try {
      const res: any = await whitelistAPI.list(pageNum, pageSize, searchKey)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch {
      error('加载失败')
    }
  }

  useEffect(() => { fetchData() }, [pageNum, searchKey])

  const handleSearch = () => { setSearchKey(keyword); setPageNum(1) }

  const resetForm = () => {
    setFormData({ applicantName: '', applicantPhone: '', deviceInfo: '', purpose: '', flightArea: '', flightTime: '' })
    setEditItem(null)
  }

  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: Whitelist) => {
    setEditItem(item)
    setFormData({
      applicantName: item.applicantName, applicantPhone: item.applicantPhone,
      deviceInfo: item.deviceInfo, purpose: item.purpose,
      flightArea: item.flightArea, flightTime: item.flightTime,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await whitelistAPI.update(editItem.id, formData)
        success('更新成功')
      } else {
        await whitelistAPI.create(formData)
        success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try {
      await whitelistAPI.delete(id)
      success('删除成功')
      fetchData()
    } catch { error('删除失败') }
  }

  const handleApprove = async () => {
    if (approveId === null) return
    try {
      await whitelistAPI.approve(approveId, approveRemark)
      success('审批成功')
      setApproveModal(false)
      setApproveRemark('')
      fetchData()
    } catch { error('审批失败') }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      pending: { label: '待审批', variant: 'warning' },
      approved: { label: '已批准', variant: 'success' },
      rejected: { label: '已拒绝', variant: 'destructive' },
    }
    const s = map[status] || { label: status, variant: 'muted' }
    return <Badge variant={s.variant}>{s.label}</Badge>
  }

  const formatTime = (ts: number) => ts ? new Date(ts).toLocaleString('zh-CN') : '-'

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">白名单报备</h1>
          <p className="text-muted-foreground text-sm mt-1">管理和审批飞行白名单</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增报备</Button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex gap-3">
          <Input placeholder="搜索申请人姓名/电话" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-72" />
          <Button variant="secondary" onClick={handleSearch}><Search className="w-4 h-4 mr-1" />搜索</Button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>申请人</th><th>电话</th><th>设备信息</th><th>用途</th>
                <th>飞行区域</th><th>飞行时间</th><th>状态</th><th>创建时间</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>{item.applicantName}</td>
                  <td>{item.applicantPhone}</td>
                  <td className="max-w-[160px] truncate">{item.deviceInfo}</td>
                  <td className="max-w-[120px] truncate">{item.purpose}</td>
                  <td>{item.flightArea}</td>
                  <td>{item.flightTime}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td className="text-muted-foreground text-xs">{formatTime(item.createTime)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {item.status === 'pending' && (
                        <button className="p-1 rounded hover:bg-success/10 text-success" title="审批"
                          onClick={() => { setApproveId(item.id); setApproveRemark(''); setApproveModal(true) }}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground" title="编辑"
                        onClick={() => openEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-destructive" title="删除"
                        onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑报备' : '新增报备'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">申请人姓名</label>
              <Input value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">申请人电话</label>
              <Input value={formData.applicantPhone} onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">设备信息</label>
            <Input value={formData.deviceInfo} onChange={(e) => setFormData({ ...formData, deviceInfo: e.target.value })} placeholder="请输入设备信息" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">报备用途</label>
            <Input value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="请输入用途" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">飞行区域</label>
              <Input value={formData.flightArea} onChange={(e) => setFormData({ ...formData, flightArea: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">飞行时间</label>
              <Input value={formData.flightTime} onChange={(e) => setFormData({ ...formData, flightTime: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleSubmit}>{editItem ? '保存' : '创建'}</Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal open={approveModal} onClose={() => setApproveModal(false)} title="审批报备">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">审批备注</label>
            <textarea className="input h-24 resize-none" value={approveRemark} onChange={(e) => setApproveRemark(e.target.value)} placeholder="请输入审批意见" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setApproveModal(false)}>取消</Button>
            <Button onClick={handleApprove}>确认通过</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
