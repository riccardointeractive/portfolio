'use client'

import { Card, Checkbox } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn } from '@/app/admin/cortex/lib/utils'
import type { DatabaseRecord } from '@/app/admin/cortex/lib/types'
import type { BaseViewProps } from './types'

interface MyDayViewProps extends BaseViewProps {
  onNavigateToRecord: (recordId: string) => void
}

export function MyDayView({
  database,
  activeView,
  filteredRecords,
  databaseId,
  canDragRecords,
  draggedRecordId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRefreshDatabase,
  onNavigateToRecord,
}: MyDayViewProps) {
  const dateField = database.fields.find(f => f.id === activeView.myDayConfig?.dateFieldId)
  const streakField = database.fields.find(f => f.id === activeView.myDayConfig?.streakFieldId)

  if (!dateField || !streakField) {
    return (
      <Card className="p-8 text-center text-tertiary">
        Required fields not found. Please reconfigure this view.
      </Card>
    )
  }

  const nameField = database.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
    || database.fields.find(f => f.type === 'text')

  const getRecordName = (rec: DatabaseRecord) => {
    if (nameField && rec.values[nameField.id]) {
      return String(rec.values[nameField.id])
    }
    return `Habit ${rec.id.slice(0, 6)}`
  }

  // Get today's date string (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Check if a record is completed today
  const isCompletedToday = (rec: DatabaseRecord) => {
    const lastCompleted = rec.values[dateField.id]
    if (!lastCompleted) return false
    const completedDate = String(lastCompleted).split('T')[0]
    return completedDate === today
  }

  // Get streak value
  const getStreak = (rec: DatabaseRecord) => {
    const streak = rec.values[streakField.id]
    return typeof streak === 'number' ? streak : 0
  }

  // Calculate if streak is still valid (completed yesterday or today)
  const isStreakValid = (rec: DatabaseRecord) => {
    const lastCompleted = rec.values[dateField.id]
    if (!lastCompleted) return false
    const completedDate = String(lastCompleted).split('T')[0]
    return completedDate === today || completedDate === yesterday
  }

  const completedToday = filteredRecords.filter(r => isCompletedToday(r))
  const pendingToday = filteredRecords.filter(r => !isCompletedToday(r))
  const allCompletedToday = pendingToday.length === 0 && filteredRecords.length > 0

  // Perfect Day Streak from config
  const perfectStreak = activeView.myDayConfig!.perfectStreak || 0
  const lastPerfectDay = activeView.myDayConfig!.lastPerfectDay || null

  const progressPercent = filteredRecords.length > 0
    ? Math.round((completedToday.length / filteredRecords.length) * 100)
    : 0

  // Update perfect streak when status changes
  const updatePerfectStreak = async (willBeAllComplete: boolean) => {
    const currentPerfectStreak = activeView.myDayConfig?.perfectStreak || 0
    const currentLastPerfectDay = activeView.myDayConfig?.lastPerfectDay || null

    if (willBeAllComplete) {
      if (currentLastPerfectDay === today) {
        return
      }

      let newPerfectStreak: number
      if (currentLastPerfectDay === yesterday) {
        newPerfectStreak = currentPerfectStreak + 1
      } else {
        newPerfectStreak = 1
      }

      await databasesApi.updateView(databaseId, activeView.id, {
        myDayConfig: {
          dateFieldId: activeView.myDayConfig!.dateFieldId,
          streakFieldId: activeView.myDayConfig!.streakFieldId,
          perfectStreak: newPerfectStreak,
          lastPerfectDay: today
        }
      })
    }
  }

  const toggleHabit = async (rec: DatabaseRecord) => {
    try {
      const wasCompletedToday = isCompletedToday(rec)
      const currentStreak = getStreak(rec)
      const lastCompleted = rec.values[dateField.id]
      const lastCompletedDate = lastCompleted ? String(lastCompleted).split('T')[0] : null

      let newStreak: number
      let newDate: string | null

      if (wasCompletedToday) {
        newStreak = Math.max(0, currentStreak - 1)
        newDate = lastCompletedDate === today ? (currentStreak > 1 ? yesterday : null) : lastCompletedDate
      } else {
        if (lastCompletedDate === yesterday) {
          newStreak = currentStreak + 1
        } else {
          newStreak = 1
        }
        newDate = today
      }

      await databasesApi.updateRecord(databaseId, rec.id, {
        ...rec.values,
        [dateField.id]: newDate,
        [streakField.id]: newStreak
      })

      const willBeAllComplete = !wasCompletedToday && pendingToday.length === 1 && pendingToday[0].id === rec.id
      if (willBeAllComplete) {
        await updatePerfectStreak(true)
      }

      await onRefreshDatabase()
    } catch (error) {
      console.error('Failed to update habit:', error)
    }
  }

  // Format today's date nicely
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })

  const isPerfectStreakActive = lastPerfectDay === today || lastPerfectDay === yesterday

  return (
    <div className="space-y-4">
      {/* Header with date and streak */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-orange-subtle flex items-center justify-center">
              <Icon name="sun" size={24} className="text-accent-orange" />
            </div>
            <div>
              <h2 className="font-display text-lg text-primary">My Day</h2>
              <p className="text-sm text-tertiary">{todayFormatted}</p>
            </div>
          </div>
          {isPerfectStreakActive && perfectStreak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-orange-subtle rounded-xl">
              <Icon name="fire" size={20} className="text-accent-orange" />
              <span className="text-lg font-bold text-accent-orange">{perfectStreak}</span>
              <span className="text-sm text-tertiary">perfect {perfectStreak === 1 ? 'day' : 'days'}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tertiary">Today&apos;s Progress</span>
          <span className="text-sm font-medium text-primary">
            {completedToday.length}/{filteredRecords.length} completed
          </span>
        </div>
        <div className="h-2 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {allCompletedToday && (
          <div className="mt-3 flex items-center gap-2 text-success">
            <Icon name="trophy" size={18} />
            <span className="text-sm font-medium">Perfect day! Keep it up!</span>
          </div>
        )}
      </Card>

      {/* Habits List */}
      <Card className="p-0 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="px-4 py-8 text-center text-tertiary">
            <Icon name="sun" size={32} className="mx-auto mb-2 opacity-50" />
            <p>No daily habits yet.</p>
            <p className="text-sm mt-1">Add records to start tracking your day!</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {/* Pending habits first */}
            {pendingToday.map(rec => (
              <div
                key={rec.id}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors",
                  canDragRecords && "cursor-grab active:cursor-grabbing",
                  draggedRecordId === rec.id && "opacity-50"
                )}
                draggable={canDragRecords}
                onDragStart={e => onDragStart(e, rec.id)}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={e => onDrop(e, rec.id)}
              >
                {canDragRecords && (
                  <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                )}
                <Checkbox
                  checked={false}
                  onChange={() => toggleHabit(rec)}
                />
                <span
                  className="flex-1 cursor-pointer font-medium"
                  onClick={() => onNavigateToRecord(rec.id)}
                >
                  {getRecordName(rec)}
                </span>
                {isStreakValid(rec) && getStreak(rec) > 0 && (
                  <div className="flex items-center gap-1 text-accent-orange">
                    <Icon name="fire" size={14} />
                    <span className="text-sm font-medium">{getStreak(rec)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onNavigateToRecord(rec.id)}
                    className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                    title="Open"
                  >
                    <Icon name="arrow-out" size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Completed habits */}
            {completedToday.map(rec => (
              <div
                key={rec.id}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors bg-success-subtle",
                  canDragRecords && "cursor-grab active:cursor-grabbing",
                  draggedRecordId === rec.id && "opacity-50"
                )}
                draggable={canDragRecords}
                onDragStart={e => onDragStart(e, rec.id)}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={e => onDrop(e, rec.id)}
              >
                {canDragRecords && (
                  <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                )}
                <Checkbox
                  checked={true}
                  onChange={() => toggleHabit(rec)}
                />
                <span
                  className="flex-1 cursor-pointer text-tertiary"
                  onClick={() => onNavigateToRecord(rec.id)}
                >
                  {getRecordName(rec)}
                </span>
                <div className="flex items-center gap-1 text-success">
                  <Icon name="fire" size={14} />
                  <span className="text-sm font-medium">{getStreak(rec)}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onNavigateToRecord(rec.id)}
                    className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                    title="Open"
                  >
                    <Icon name="arrow-out" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="text-sm text-tertiary">
        {filteredRecords.length} daily habits
        {activeView?.filters.length ? ` (filtered)` : ''}
        {canDragRecords && filteredRecords.length > 1 && (
          <span className="ml-2 text-tertiary/60">• Drag to reorder</span>
        )}
      </div>
    </div>
  )
}
