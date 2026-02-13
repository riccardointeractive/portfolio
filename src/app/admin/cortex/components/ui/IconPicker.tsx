'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Icon, AVAILABLE_ICONS } from './Icon'

// Icon categories with keywords for search
const ICON_DATA: { name: string; keywords: string[] }[] = [
  // Sports & Fitness
  { name: 'barbell', keywords: ['gym', 'fitness', 'workout', 'exercise', 'weights'] },
  { name: 'basketball', keywords: ['sport', 'ball', 'game', 'nba'] },
  { name: 'soccer', keywords: ['sport', 'ball', 'football', 'calcio'] },
  { name: 'football', keywords: ['sport', 'american', 'nfl'] },
  { name: 'trophy', keywords: ['winner', 'award', 'prize', 'competition'] },
  { name: 'medal', keywords: ['award', 'winner', 'achievement'] },
  { name: 'target', keywords: ['goal', 'aim', 'focus'] },
  { name: 'timer', keywords: ['time', 'race', 'stopwatch'] },
  { name: 'fire', keywords: ['flame', 'hot', 'calories', 'energy', 'streak'] },
  { name: 'bike', keywords: ['cycling', 'exercise', 'bicycle'] },
  { name: 'footsteps', keywords: ['walking', 'steps', 'running', 'sneaker'] },
  // Health
  { name: 'heart', keywords: ['love', 'health', 'favorite', 'like'] },
  { name: 'heartbeat', keywords: ['health', 'fitness', 'cardio', 'pulse'] },
  { name: 'pill', keywords: ['medicine', 'health', 'pharmacy'] },
  { name: 'syringe', keywords: ['medicine', 'health', 'vaccine'] },
  { name: 'thermometer', keywords: ['temperature', 'health', 'fever'] },
  // Work & Business
  { name: 'briefcase', keywords: ['work', 'job', 'business', 'office'] },
  { name: 'buildings', keywords: ['office', 'company', 'city'] },
  { name: 'bank', keywords: ['finance', 'money', 'business'] },
  { name: 'dollar', keywords: ['money', 'finance', 'salary', 'currency'] },
  { name: 'euro', keywords: ['money', 'finance', 'currency'] },
  { name: 'wallet', keywords: ['money', 'finance', 'payment'] },
  { name: 'credit-card', keywords: ['money', 'finance', 'payment'] },
  { name: 'chart', keywords: ['business', 'analytics', 'growth', 'stats'] },
  { name: 'pie-chart', keywords: ['business', 'analytics', 'data'] },
  { name: 'calculator', keywords: ['math', 'finance', 'accounting'] },
  // Food & Drink
  { name: 'pizza', keywords: ['food', 'meal', 'italian'] },
  { name: 'coffee', keywords: ['drink', 'morning', 'cafe', 'cup'] },
  { name: 'fork-knife', keywords: ['food', 'eating', 'restaurant', 'dining'] },
  { name: 'cake', keywords: ['food', 'dessert', 'birthday', 'sweet'] },
  { name: 'cocktail', keywords: ['drink', 'alcohol', 'party'] },
  { name: 'apple', keywords: ['food', 'fruit', 'healthy'] },
  { name: 'burger', keywords: ['food', 'meal', 'fast food'] },
  { name: 'cookie', keywords: ['food', 'dessert', 'sweet', 'snack'] },
  // Creative & Art
  { name: 'color-palette', keywords: ['art', 'creative', 'painting', 'design'] },
  { name: 'camera', keywords: ['photo', 'photography', 'picture'] },
  { name: 'video', keywords: ['video', 'film', 'recording', 'movie'] },
  { name: 'audio', keywords: ['music', 'sound', 'wave'] },
  { name: 'microphone', keywords: ['music', 'audio', 'podcast', 'voice'] },
  { name: 'headphones', keywords: ['music', 'audio', 'listening'] },
  { name: 'brush', keywords: ['art', 'creative', 'painting'] },
  { name: 'pencil', keywords: ['write', 'draw', 'creative', 'art'] },
  { name: 'clapboard', keywords: ['movie', 'film', 'cinema'] },
  { name: 'keyboard', keywords: ['music', 'piano', 'instrument'] },
  // Technology
  { name: 'code', keywords: ['programming', 'developer', 'software'] },
  { name: 'console', keywords: ['programming', 'terminal', 'command'] },
  { name: 'desktop', keywords: ['computer', 'screen', 'imac'] },
  { name: 'laptop', keywords: ['computer', 'macbook', 'work'] },
  { name: 'phone', keywords: ['mobile', 'smartphone', 'device'] },
  { name: 'gamepad', keywords: ['gaming', 'game', 'play', 'controller'] },
  { name: 'robot', keywords: ['ai', 'tech', 'automation', 'bot'] },
  { name: 'server', keywords: ['data', 'storage', 'database'] },
  { name: 'cloud', keywords: ['storage', 'internet', 'online'] },
  { name: 'wifi', keywords: ['internet', 'connection', 'wireless'] },
  { name: 'bug', keywords: ['programming', 'debug', 'error'] },
  // Education
  { name: 'book', keywords: ['reading', 'education', 'learning', 'study'] },
  { name: 'graduation', keywords: ['education', 'school', 'university'] },
  { name: 'brain', keywords: ['thinking', 'mind', 'intelligence', 'knowledge'] },
  { name: 'lightbulb', keywords: ['idea', 'creative', 'thinking', 'innovation'] },
  { name: 'notebook', keywords: ['notes', 'writing', 'journal'] },
  { name: 'books', keywords: ['reading', 'library', 'study'] },
  // Travel
  { name: 'airplane', keywords: ['travel', 'flight', 'vacation'] },
  { name: 'car', keywords: ['travel', 'driving', 'vehicle'] },
  { name: 'bus', keywords: ['travel', 'transport', 'public'] },
  { name: 'rocket', keywords: ['launch', 'startup', 'fast', 'space'] },
  { name: 'world', keywords: ['earth', 'travel', 'international'] },
  { name: 'globe', keywords: ['earth', 'travel', 'international'] },
  { name: 'map', keywords: ['travel', 'navigation', 'location'] },
  { name: 'map-pin', keywords: ['location', 'travel', 'place'] },
  { name: 'compass', keywords: ['navigation', 'travel', 'direction'] },
  { name: 'backpack', keywords: ['travel', 'hiking', 'adventure'] },
  { name: 'suitcase', keywords: ['travel', 'vacation', 'luggage'] },
  // Home
  { name: 'home', keywords: ['house', 'living', 'family'] },
  { name: 'bed', keywords: ['sleep', 'rest', 'bedroom'] },
  { name: 'sofa', keywords: ['living room', 'furniture', 'couch'] },
  { name: 'armchair', keywords: ['furniture', 'relax', 'seat'] },
  { name: 'tree', keywords: ['nature', 'outdoor', 'forest', 'garden'] },
  { name: 'flower', keywords: ['nature', 'garden', 'plant'] },
  { name: 'sun', keywords: ['weather', 'day', 'sunny', 'bright'] },
  { name: 'moon', keywords: ['night', 'sleep', 'dark'] },
  { name: 'rainbow', keywords: ['weather', 'colors', 'nature'] },
  // Social
  { name: 'users', keywords: ['people', 'team', 'group', 'community'] },
  { name: 'user', keywords: ['person', 'profile', 'account'] },
  { name: 'user-circle', keywords: ['person', 'profile', 'avatar'] },
  { name: 'chat', keywords: ['message', 'conversation', 'bubble'] },
  { name: 'email', keywords: ['mail', 'message', 'inbox'] },
  { name: 'share', keywords: ['social', 'network', 'send'] },
  { name: 'thumbs-up', keywords: ['like', 'approve', 'good'] },
  // Time
  { name: 'calendar', keywords: ['date', 'schedule', 'planning', 'event'] },
  { name: 'clock', keywords: ['time', 'schedule', 'hour'] },
  { name: 'hourglass', keywords: ['time', 'waiting', 'countdown'] },
  { name: 'watch', keywords: ['time', 'wearable'] },
  { name: 'history', keywords: ['time', 'back', 'past'] },
  // Goals
  { name: 'star', keywords: ['favorite', 'rating', 'achievement'] },
  { name: 'sparkle', keywords: ['special', 'new', 'magic', 'ai'] },
  { name: 'crown', keywords: ['king', 'winner', 'premium', 'vip'] },
  { name: 'diamond', keywords: ['premium', 'valuable', 'gem'] },
  { name: 'lightning', keywords: ['fast', 'energy', 'power'] },
  { name: 'gift', keywords: ['present', 'surprise', 'birthday'] },
  { name: 'confetti', keywords: ['celebration', 'party'] },
  // Tools & Settings
  { name: 'settings', keywords: ['config', 'options', 'gear'] },
  { name: 'sliders', keywords: ['settings', 'adjust', 'controls'] },
  { name: 'hammer', keywords: ['tools', 'build', 'construction'] },
  { name: 'key', keywords: ['access', 'security', 'unlock'] },
  { name: 'lock', keywords: ['security', 'private', 'protected'] },
  { name: 'unlock', keywords: ['open', 'access'] },
  { name: 'shield', keywords: ['security', 'protection', 'safe'] },
  { name: 'shield-check', keywords: ['verified', 'security', 'safe'] },
  // Interface
  { name: 'folder', keywords: ['files', 'organize', 'directory'] },
  { name: 'tag', keywords: ['label', 'category', 'organize'] },
  { name: 'bookmark', keywords: ['save', 'favorite', 'read later'] },
  { name: 'archive', keywords: ['storage', 'old', 'backup'] },
  { name: 'trash', keywords: ['delete', 'remove', 'bin'] },
  { name: 'search', keywords: ['find', 'look', 'magnifying glass'] },
  { name: 'filter', keywords: ['sort', 'organize'] },
  { name: 'grid', keywords: ['layout', 'view'] },
  { name: 'list', keywords: ['items', 'tasks'] },
  { name: 'layers', keywords: ['stack', 'organize'] },
  { name: 'plus', keywords: ['add', 'new', 'create'] },
  { name: 'bell', keywords: ['notification', 'alert', 'reminder'] },
  { name: 'info', keywords: ['information', 'help', 'about'] },
  { name: 'warning', keywords: ['alert', 'caution', 'error'] },
  { name: 'edit', keywords: ['modify', 'change', 'pencil'] },
  { name: 'file', keywords: ['document', 'text'] },
]

export const SPHERE_ICONS = ICON_DATA.map(i => i.name)

export interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  color?: string
  label?: string
}

export function IconPicker({ value, onChange, color = '#3b82f6', label }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)

  const filteredIcons = ICON_DATA.filter(icon => {
    const searchLower = search.toLowerCase()
    if (icon.name.includes(searchLower)) return true
    if (icon.keywords.some(kw => kw.includes(searchLower))) return true
    return false
  })

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full px-4 py-2.5 bg-surface text-primary rounded-lg border border-border-default placeholder-tertiary focus:outline-none focus:border-info focus:ring-1 focus:ring-info transition-all duration-150 pl-9 py-2 text-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1">
        {filteredIcons.map(icon => {
          const isSelected = value === icon.name
          const isHovered = hoveredIcon === icon.name

          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => onChange(icon.name)}
              onMouseEnter={() => setHoveredIcon(icon.name)}
              onMouseLeave={() => setHoveredIcon(null)}
              className={cn(
                'p-2.5 rounded-lg flex items-center justify-center transition-all duration-150',
                'hover:bg-elevated focus:outline-none',
                isSelected
                  ? 'bg-elevated border-2'
                  : 'border border-border-default hover:border-hover'
              )}
              style={isSelected ? { borderColor: color } : {}}
              title={icon.name}
            >
              <Icon
                name={icon.name}
                size={20}
                weight={(isHovered || isSelected) ? 'fill' : 'regular'}
                color={(isHovered || isSelected) ? color : undefined}
              />
            </button>
          )
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-full text-center py-4 text-tertiary text-sm">
            No icons found
          </div>
        )}
      </div>

      {value && (
        <div className="mt-2 text-xs text-tertiary">
          Selected: <span className="text-primary font-medium">{value}</span>
        </div>
      )}
    </div>
  )
}
