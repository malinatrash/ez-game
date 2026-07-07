export interface ElementTransform {
  x: number
  y: number
  w: number
  h: number
  rotation: number
  zIndex: number
}

export type TextAlign = 'left' | 'center' | 'right'

export interface TextStyle {
  fontSize: number
  color: string
  align: TextAlign
  fontWeight?: 'normal' | 'bold'
}

export interface MediaPlaybackOptions {
  autoplay: boolean
  loop: boolean
  muted: boolean
}

export type ShapeType = 'rectangle' | 'circle'

export type CanvasElement =
  | ({ id: string; type: 'text'; value: string; style: TextStyle } & ElementTransform)
  | ({ id: string; type: 'image'; assetId: string } & ElementTransform)
  | ({ id: string; type: 'video'; assetId: string; playback: MediaPlaybackOptions; label?: string } & ElementTransform)
  | ({ id: string; type: 'audio'; assetId: string; playback: MediaPlaybackOptions; label?: string } & ElementTransform)
  | ({ id: string; type: 'shape'; shapeType: ShapeType; fill: string } & ElementTransform)

export interface QuestionSettings {
  timeLimitSec: number | null
  showTimer: boolean
  autoReveal: boolean
  hideCostAfterReveal: boolean
  isBonus: boolean
  catInTheBag: boolean
}

export interface SideBackground {
  assetId: string
  opacity: number
}

export interface Question {
  id: string
  cost: number
  text: string
  hostNotes: string
  content: CanvasElement[]
  answer: CanvasElement[]
  contentBackground?: SideBackground | null
  answerBackground?: SideBackground | null
  settings: QuestionSettings
  answered: boolean
}

export interface Category {
  id: string
  title: string
  questions: Question[]
}

export interface GameMeta {
  title: string
  wallpaperAssetId?: string
  backgroundMusicAssetId?: string
  resultsMusicAssetId?: string
  createdAt: string
  updatedAt: string
}

export interface Game {
  id: string
  meta: GameMeta
  categories: Category[]
}
