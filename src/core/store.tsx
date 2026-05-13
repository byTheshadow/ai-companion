import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { local } from '@/core/storage/local'
import type { CharacterCard, UserCard, AppSettings, AppPromptTemplate, LorebookEntry } from '@/data/types'
import { defaultSettings, defaultPromptTemplates } from '@/data/defaults'

// ===== State =====
interface AppState {
  // 当前打开的App
  currentApp: string | null
  // 角色卡列表
  characters: CharacterCard[]
  // 用户卡列表
  users: UserCard[]
  // 全局设置
  settings: AppSettings
  // App Prompt 模板
  promptTemplates: AppPromptTemplate[]// 全局世界书
  globalLorebook: LorebookEntry[]
  // 锁屏状态
  isLocked: boolean
  // 通知
  notifications: NotificationItem[]
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  app_id: string
  timestamp: number
  read: boolean
}

type Action =
  | { type: 'OPEN_APP'; app: string | null }
  | { type: 'SET_CHARACTERS'; characters: CharacterCard[] }
  | { type: 'ADD_CHARACTER'; character: CharacterCard }
  | { type: 'UPDATE_CHARACTER'; character: CharacterCard }
  | { type: 'DELETE_CHARACTER'; id: string }
  | { type: 'SET_USERS'; users: UserCard[] }
  | { type: 'ADD_USER'; user: UserCard }
  | { type: 'UPDATE_USER'; user: UserCard }
  | { type: 'DELETE_USER'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'SET_PROMPT_TEMPLATES'; templates: AppPromptTemplate[] }
  | { type: 'UPDATE_PROMPT_TEMPLATE'; template: AppPromptTemplate }
  | { type: 'SET_GLOBAL_LOREBOOK'; entries: LorebookEntry[] }
  | { type: 'SET_LOCKED'; locked: boolean }
  | { type: 'ADD_NOTIFICATION'; notification: NotificationItem }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'LOAD_ALL'; state: Partial<AppState> }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'OPEN_APP':
      return { ...state, currentApp: action.app }
    case 'SET_CHARACTERS':
      return { ...state, characters: action.characters }
    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.character] }
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(c =>
          c.id === action.character.id ? action.character : c
        ),
      }
    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c.id !== action.id),
        settings: state.settings.active_character_id === action.id
          ? { ...state.settings, active_character_id: null }
          : state.settings,
      }
    case 'SET_USERS':
      return { ...state, users: action.users }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.user.id ? action.user : u),
      }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.id),
        settings: state.settings.active_user_id === action.id
          ? { ...state.settings, active_user_id: null }
          : state.settings,
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'SET_PROMPT_TEMPLATES':
      return { ...state, promptTemplates: action.templates }
    case 'UPDATE_PROMPT_TEMPLATE':
      return {
        ...state,
        promptTemplates: state.promptTemplates.map(t =>
          t.app_id === action.template.app_id ? action.template : t
        ),
      }
    case 'SET_GLOBAL_LOREBOOK':
      return { ...state, globalLorebook: action.entries }
    case 'SET_LOCKED':
      return { ...state, isLocked: action.locked }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) }
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }
    case 'LOAD_ALL':
      return { ...state, ...action.state }
    default:
      return state
  }
}

const initialState: AppState = {
  currentApp: null,
  characters: [],
  users: [],
  settings: defaultSettings,
  promptTemplates: defaultPromptTemplates,
  globalLorebook: [],
  isLocked: false,
  notifications: [],
}

const StoreContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
}>({ state: initialState, dispatch: () => {} })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  //启动时从localStorage 加载
  useEffect(() => {
    const characters = local.get<CharacterCard[]>('characters', [])
    const users = local.get<UserCard[]>('users', [])
    const settings = local.get<AppSettings>('settings', defaultSettings)
    const promptTemplates = local.get<AppPromptTemplate[]>('prompt_templates', defaultPromptTemplates)
    const globalLorebook = local.get<LorebookEntry[]>('global_lorebook', [])

    dispatch({
      type: 'LOAD_ALL',
      state: { characters, users, settings, promptTemplates, globalLorebook },
    })
  }, [])

  // 状态变化时自动保存
  useEffect(() => {
    local.set('characters', state.characters)
  }, [state.characters])

  useEffect(() => {
    local.set('users', state.users)
  }, [state.users])

  useEffect(() => {
    local.set('settings', state.settings)
  }, [state.settings])

  useEffect(() => {
    local.set('prompt_templates', state.promptTemplates)
  }, [state.promptTemplates])

  useEffect(() => {
    local.set('global_lorebook', state.globalLorebook)
  }, [state.globalLorebook])

  // 注入自定义CSS
  useEffect(() => {
    let styleEl = document.getElementById('user-custom-css') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'user-custom-css'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = state.settings.custom_css || ''
  }, [state.settings.custom_css])

  // 深色模式
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark')
  }, [state.settings.theme])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}

// 便捷 hooks
export function useActiveCharacter(): CharacterCard | null {
  const { state } = useStore()
  if (!state.settings.active_character_id) return null
  return state.characters.find(c => c.id === state.settings.active_character_id) || null
}

export function useActiveUser(): UserCard | null {
  const { state } = useStore()
  if (!state.settings.active_user_id) return null
  return state.users.find(u => u.id === state.settings.active_user_id) || null
}
