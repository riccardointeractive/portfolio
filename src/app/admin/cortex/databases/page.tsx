'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Card, Button, Modal, Input, Textarea, Badge,
  ColorPicker, IconPicker, EmptyState
} from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { formatRelativeDate, customColorBg } from '@/app/admin/cortex/lib/utils'
import { DEFAULT_DATABASE_COLOR, type Database } from '@/app/admin/cortex/lib/types'

type SortField = 'name' | 'updatedAt' | 'records'
type SortDirection = 'asc' | 'desc'

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<Database[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDatabase, setEditingDatabase] = useState<Database | null>(null)

  // Search & Sort
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [sortLoaded, setSortLoaded] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: DEFAULT_DATABASE_COLOR,
    icon: 'folder'
  })

  // Load sort preference from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem('cortex-databases-sort')
    if (savedSort) {
      try {
        const { field, direction } = JSON.parse(savedSort)
        if (field) setSortField(field)
        if (direction) setSortDirection(direction)
      } catch (e) {
        // Ignore invalid JSON
      }
    }
    setSortLoaded(true)
  }, [])

  // Save sort preference to localStorage (only after initial load)
  useEffect(() => {
    if (!sortLoaded) return
    localStorage.setItem('cortex-databases-sort', JSON.stringify({
      field: sortField,
      direction: sortDirection
    }))
  }, [sortField, sortDirection, sortLoaded])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await databasesApi.list()
      setDatabases(res.data || [])
    } catch (error) {
      console.error('Failed to load databases:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedDatabases = useMemo(() => {
    let result = [...databases]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(db =>
        db.name.toLowerCase().includes(q) ||
        db.description?.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'records':
          comparison = a.records.length - b.records.length
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [databases, search, sortField, sortDirection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDatabase) {
        await databasesApi.update(editingDatabase.id, formData)
      } else {
        await databasesApi.create(formData)
      }
      setModalOpen(false)
      setEditingDatabase(null)
      setFormData({ name: '', description: '', color: DEFAULT_DATABASE_COLOR, icon: 'folder' })
      loadData()
    } catch (error) {
      console.error('Failed to save database:', error)
    }
  }

  const openCreateModal = () => {
    setEditingDatabase(null)
    setFormData({ name: '', description: '', color: DEFAULT_DATABASE_COLOR, icon: 'folder' })
    setModalOpen(true)
  }

  const openEditModal = (db: Database) => {
    setEditingDatabase(db)
    setFormData({
      name: db.name,
      description: db.description || '',
      color: db.color,
      icon: db.icon
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all data in this database.')) return
    try {
      await databasesApi.delete(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete database:', error)
    }
  }

  const handleSetSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setSortModalOpen(false)
  }

  const clearSearch = () => {
    setSearch('')
    setSearchOpen(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-tertiary">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>
          <Icon name="plus" size={18} />
          New Database
        </Button>
      </div>

      {databases.length === 0 ? (
        <EmptyState
          icon={<Icon name="layers" size={48} />}
          title="No databases yet"
          description="Create your first database to start organizing structured data"
          action={
            <Button onClick={openCreateModal}>
              <Icon name="plus" size={18} />
              Create Database
            </Button>
          }
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {searchOpen ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-default rounded-lg">
                <Icon name="search" size={16} className="text-tertiary" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-primary placeholder-tertiary outline-none text-sm w-40"
                  autoFocus
                />
                <button onClick={clearSearch} className="p-0.5 hover:bg-elevated rounded">
                  <Icon name="close" size={14} />
                </button>
              </div>
            ) : (
              <Button
                variant={search ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <Icon name="search" size={16} />
                Search
                {search && <Badge variant="info" className="ml-1 text-xs">1</Badge>}
              </Button>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortModalOpen(!sortModalOpen)}
              >
                <Icon name={sortDirection === 'asc' ? 'sort-ascending' : 'sort-descending'} size={16} />
                Sort
              </Button>

              {sortModalOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortModalOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg z-50 py-1">
                    {[
                      { field: 'name' as SortField, label: 'Name' },
                      { field: 'updatedAt' as SortField, label: 'Updated' },
                      { field: 'records' as SortField, label: 'Records' },
                    ].map(option => (
                      <button
                        key={option.field}
                        onClick={() => handleSetSort(option.field)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-elevated flex items-center justify-between"
                      >
                        <span className={sortField === option.field ? 'text-primary' : 'text-tertiary'}>
                          {option.label}
                        </span>
                        {sortField === option.field && (
                          <Icon
                            name={sortDirection === 'asc' ? 'sort-ascending' : 'sort-descending'}
                            size={14}
                            className="text-primary"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1" />

            <span className="text-sm text-tertiary">
              {filteredAndSortedDatabases.length} database{filteredAndSortedDatabases.length !== 1 ? 's' : ''}
            </span>
          </div>

          {search && (
            <div className="flex flex-wrap gap-2 p-3 bg-elevated rounded-lg">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-base rounded-lg text-sm">
                <Icon name="search" size={14} className="text-tertiary" />
                <span className="text-secondary">&quot;{search}&quot;</span>
                <button onClick={clearSearch} className="p-1 hover:bg-elevated rounded">
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
          )}

          {filteredAndSortedDatabases.length === 0 ? (
            <div className="text-center py-12 text-tertiary">
              No databases match &quot;{search}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedDatabases.map(db => (
                <Card key={db.id} className="group overflow-hidden hover:bg-elevated transition-colors">
                  <Link href={`/admin/cortex/databases/${db.id}`} className="block p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={customColorBg(db.color)}
                      >
                        <Icon name={db.icon} size={24} color={db.color} weight="fill" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(db) }}
                          className="p-2 text-tertiary hover:text-primary rounded-lg hover:bg-base"
                          title="Edit"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(db.id) }}
                          className="p-2 text-tertiary hover:text-error rounded-lg hover:bg-base"
                          title="Delete"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-display text-base text-primary mb-1">{db.name}</h3>
                    {db.description && (
                      <p className="text-sm text-tertiary mb-3 line-clamp-2">{db.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Icon name="list" size={14} />
                        {db.records.length} records
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="layers" size={14} />
                        {db.fields.length} fields
                      </span>
                    </div>
                    <p className="text-xs text-tertiary mt-2">
                      Updated {formatRelativeDate(db.updatedAt)}
                    </p>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingDatabase(null)
        }}
        title={editingDatabase ? 'Edit Database' : 'Create Database'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Contacts, Inventory, Tasks"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What is this database for?"
            rows={2}
          />
          <ColorPicker
            label="Color"
            value={formData.color}
            onChange={color => setFormData(prev => ({ ...prev, color }))}
          />
          <IconPicker
            label="Icon"
            value={formData.icon}
            onChange={icon => setFormData(prev => ({ ...prev, icon }))}
            color={formData.color}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => {
              setModalOpen(false)
              setEditingDatabase(null)
            }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingDatabase ? 'Save Changes' : 'Create Database'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
