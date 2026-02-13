'use client'

import { ComponentType } from 'react'
import { IconProps as PhosphorIconProps } from '@phosphor-icons/react'

// Import all icons we need from Phosphor
import {
  House,
  Globe,
  Folder,
  Palette,
  SignOut,
  Plus,
  PencilSimple,
  Trash,
  MagnifyingGlass,
  Check,
  X,
  CaretDown,
  CaretRight,
  ArrowLeft,
  ArrowSquareIn,
  ArrowSquareOut,
  CheckSquare,
  CheckCircle,
  Info,
  Warning,
  TrendUp,
  Pulse,
  Clock,
  Calendar,
  Cursor,
  TextT,
  ToggleLeft,
  SquaresFour,
  Stack,
  Lock,
  Star,
  Heart,
  Bell,
  Gear,
  DotsSixVertical,
  // Sports & Fitness
  Barbell,
  Basketball,
  SoccerBall,
  Football,
  Trophy,
  Medal,
  Target,
  Timer,
  Fire,
  Bicycle,
  Sneaker,
  // Health
  Heartbeat,
  Pill,
  Syringe,
  Thermometer,
  // Work & Business
  Briefcase,
  Buildings,
  Bank,
  CurrencyDollar,
  CurrencyEur,
  Wallet,
  CreditCard,
  ChartLine,
  ChartPie,
  Calculator,
  // Food & Drink
  Pizza,
  Coffee,
  ForkKnife,
  Cake,
  Martini,
  AppleLogo,
  Hamburger,
  Cookie,
  // Creative & Art
  Camera,
  VideoCamera,
  Waveform,
  Microphone,
  Headphones,
  PaintBrush,
  Pencil,
  FilmSlate,
  MusicNotes,
  // Technology
  Code,
  Terminal,
  Desktop,
  Laptop,
  DeviceMobile,
  GameController,
  Robot,
  HardDrive,
  Cloud,
  WifiHigh,
  Bug,
  // Education
  Book,
  GraduationCap,
  Brain,
  Lightbulb,
  Notebook,
  Books,
  // Travel
  Airplane,
  Car,
  Bus,
  Rocket,
  GlobeSimple,
  MapTrifold,
  MapPin,
  Compass,
  Backpack,
  Suitcase,
  // Home
  Bed,
  Couch,
  Armchair,
  Tree,
  Flower,
  Sun,
  Moon,
  Rainbow,
  // Social
  Users,
  User,
  UserCircle,
  ChatCircle,
  Envelope,
  ShareNetwork,
  ThumbsUp,
  // Time
  Hourglass,
  Watch,
  ClockCounterClockwise,
  // Goals
  Sparkle,
  Crown,
  Diamond,
  Lightning,
  Gift,
  Confetti,
  // Tools
  SlidersHorizontal,
  Hammer,
  Key,
  LockOpen,
  Shield,
  ShieldCheck,
  // Interface
  Tag,
  BookmarkSimple,
  Archive,
  Funnel,
  GridFour,
  List,
  FileText,
  // Database
  NumberSquareOne,
  SortAscending,
  SortDescending,
  Link,
  Rows,
  TagSimple,
} from '@phosphor-icons/react'

type PhosphorIcon = ComponentType<PhosphorIconProps>

// Map simple names to Phosphor components (all lowercase keys)
const icons: Record<string, PhosphorIcon> = {
  // Navigation
  'home': House,
  'house': House,
  'housesimple': House,
  'world': Globe,
  'folder': Folder,
  'color-palette': Palette,
  'colorpalette': Palette,
  'palette': Palette,
  'door': SignOut,
  'signout': SignOut,

  // Actions
  'plus': Plus,
  'pluslarge': Plus,
  'edit': PencilSimple,
  'pencilsimple': PencilSimple,
  'trash': Trash,
  'trashcan': Trash,
  'search': MagnifyingGlass,
  'magnifyingglass': MagnifyingGlass,
  'check': Check,
  'checkmark': Check,
  'close': X,
  'x': X,
  'cross': X,
  'chevron-down': CaretDown,
  'chevrondown': CaretDown,
  'caretdown': CaretDown,
  'caret-down': CaretDown,
  'caret-right': CaretRight,
  'caretright': CaretRight,
  'chevron-right': CaretRight,
  'arrow-left': ArrowLeft,
  'arrowleft': ArrowLeft,
  'arrow-in': ArrowSquareIn,
  'arrowin': ArrowSquareIn,
  'arrow-out': ArrowSquareOut,
  'arrowout': ArrowSquareOut,

  // Status
  'check-square': CheckSquare,
  'checksquare': CheckSquare,
  'squarecheck': CheckSquare,
  'check-circle': CheckCircle,
  'checkcircle': CheckCircle,
  'circlecheck': CheckCircle,
  'info': Info,
  'circleinfo': Info,
  'warning': Warning,
  'exclamationtriangle': Warning,

  // Dashboard
  'trending': TrendUp,
  'trendup': TrendUp,
  'activity': Pulse,
  'pulse': Pulse,
  'electrocardiogram': Pulse,
  'clock': Clock,
  'calendar': Calendar,

  // Design System
  'cursor': Cursor,
  'text': TextT,
  'toggle': ToggleLeft,
  'layout': SquaresFour,
  'layers': Stack,
  'stack': Stack,

  // Common
  'lock': Lock,
  'star': Star,
  'heart': Heart,
  'bell': Bell,
  'settings': Gear,
  'gear': Gear,
  'grip': DotsSixVertical,
  'settingsgear': Gear,

  // Sports & Fitness
  'barbell': Barbell,
  'dumbell': Barbell,
  'basketball': Basketball,
  'soccer': SoccerBall,
  'soccerball': SoccerBall,
  'football': Football,
  'americanfootball': Football,
  'trophy': Trophy,
  'medal': Medal,
  'goldmedal': Medal,
  'target': Target,
  'timer': Timer,
  'stopwatch': Timer,
  'fire': Fire,
  'bike': Bicycle,
  'bicycle': Bicycle,
  'footsteps': Sneaker,
  'sneaker': Sneaker,

  // Health
  'heartbeat': Heartbeat,
  'pill': Pill,
  'medicinepill': Pill,
  'syringe': Syringe,
  'injection': Syringe,
  'thermometer': Thermometer,
  'thermostat': Thermometer,

  // Work & Business
  'briefcase': Briefcase,
  'suitcasework': Briefcase,
  'buildings': Buildings,
  'bank': Bank,
  'dollar': CurrencyDollar,
  'currencydollar': CurrencyDollar,
  'euro': CurrencyEur,
  'currencyeur': CurrencyEur,
  'wallet': Wallet,
  'credit-card': CreditCard,
  'creditcard': CreditCard,
  'chart': ChartLine,
  'chartline': ChartLine,
  'pie-chart': ChartPie,
  'piechart': ChartPie,
  'chartpie': ChartPie,
  'calculator': Calculator,

  // Food & Drink
  'pizza': Pizza,
  'coffee': Coffee,
  'cuphot': Coffee,
  'fork-knife': ForkKnife,
  'forkknife': ForkKnife,
  'cake': Cake,
  'birthdaycake': Cake,
  'cocktail': Martini,
  'martini': Martini,
  'apple': AppleLogo,
  'applelogo': AppleLogo,
  'apples': AppleLogo,
  'burger': Hamburger,
  'hamburger': Hamburger,
  'cookie': Cookie,
  'donut': Cookie,

  // Creative & Art
  'camera': Camera,
  'video': VideoCamera,
  'videocamera': VideoCamera,
  'audio': Waveform,
  'waveform': Waveform,
  'microphone': Microphone,
  'headphones': Headphones,
  'brush': PaintBrush,
  'paintbrush': PaintBrush,
  'pencil': Pencil,
  'clapboard': FilmSlate,
  'filmslate': FilmSlate,
  'keyboard': MusicNotes,
  'musicnotes': MusicNotes,
  'piano': MusicNotes,

  // Technology
  'code': Code,
  'console': Terminal,
  'terminal': Terminal,
  'desktop': Desktop,
  'imac': Desktop,
  'laptop': Laptop,
  'macbook': Laptop,
  'phone': DeviceMobile,
  'devicemobile': DeviceMobile,
  'gamepad': GameController,
  'gamecontroller': GameController,
  'robot': Robot,
  'server': HardDrive,
  'harddrive': HardDrive,
  'cloud': Cloud,
  'cloudsimple': Cloud,
  'wifi': WifiHigh,
  'wififull': WifiHigh,
  'bug': Bug,

  // Education
  'book': Book,
  'graduation': GraduationCap,
  'graduationcap': GraduationCap,
  'graduatecap': GraduationCap,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'notebook': Notebook,
  'books': Books,

  // Travel
  'airplane': Airplane,
  'car': Car,
  'bus': Bus,
  'rocket': Rocket,
  'globe': GlobeSimple,
  'globesimple': GlobeSimple,
  'map': MapTrifold,
  'maptrifold': MapTrifold,
  'map-pin': MapPin,
  'mappin': MapPin,
  'compass': Compass,
  'compassround': Compass,
  'backpack': Backpack,
  'suitcase': Suitcase,

  // Home
  'bed': Bed,
  'sofa': Couch,
  'couch': Couch,
  'armchair': Armchair,
  'tree': Tree,
  'flower': Flower,
  'blossom': Flower,
  'sun': Sun,
  'moon': Moon,
  'rainbow': Rainbow,

  // Social
  'users': Users,
  'group': Users,
  'people': Users,
  'peoplecircle': Users,
  'user': User,
  'user-circle': UserCircle,
  'usercircle': UserCircle,
  'chat': ChatCircle,
  'chatcircle': ChatCircle,
  'bubble': ChatCircle,
  'email': Envelope,
  'envelope': Envelope,
  'share': ShareNetwork,
  'sharenetwork': ShareNetwork,
  'shareos': ShareNetwork,
  'thumbs-up': ThumbsUp,
  'thumbsup': ThumbsUp,

  // Time
  'hourglass': Hourglass,
  'watch': Watch,
  'smartwatch': Watch,
  'history': ClockCounterClockwise,
  'clockcounterclockwise': ClockCounterClockwise,

  // Goals
  'sparkle': Sparkle,
  'crown': Crown,
  'diamond': Diamond,
  'lightning': Lightning,
  'zap': Lightning,
  'gift': Gift,
  'confetti': Confetti,
  'celebrate': Confetti,

  // Tools
  'sliders': SlidersHorizontal,
  'slidershorizontal': SlidersHorizontal,
  'settingssliderthree': SlidersHorizontal,
  'hammer': Hammer,
  'key': Key,
  'unlock': LockOpen,
  'unlocked': LockOpen,
  'lockopen': LockOpen,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'shieldcheck': ShieldCheck,

  // Interface
  'tag': Tag,
  'bookmark': BookmarkSimple,
  'bookmarksimple': BookmarkSimple,
  'archive': Archive,
  'filter': Funnel,
  'funnel': Funnel,
  'grid': GridFour,
  'gridfour': GridFour,
  'layoutgrid': GridFour,
  'list': List,
  'listbullets': List,
  'file': FileText,
  'filetext': FileText,

  // Database
  'numbers': NumberSquareOne,
  'number': NumberSquareOne,
  'numbersquareone': NumberSquareOne,
  'sort-ascending': SortAscending,
  'sortascending': SortAscending,
  'sort-descending': SortDescending,
  'sortdescending': SortDescending,
  'link': Link,
  'url': Link,
  'rows': Rows,
  'tags': TagSimple,
  'tagsimple': TagSimple,
}

export interface IconProps {
  name: string
  className?: string
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  color?: string
}

export function Icon({
  name,
  className,
  size = 20,
  weight = 'regular',
  color
}: IconProps) {
  // Normalize: lowercase and remove hyphens/underscores for lookup
  const normalizedName = name.toLowerCase().replace(/[-_]/g, '')
  const IconComponent = icons[normalizedName] || icons[name.toLowerCase()]

  if (!IconComponent) {
    // Don't spam console - just render fallback silently
    return <span className={className} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
  }

  return (
    <IconComponent
      className={className}
      size={size}
      weight={weight}
      color={color}
    />
  )
}

// Export icon names for IconPicker
export const AVAILABLE_ICONS = Object.keys(icons)
