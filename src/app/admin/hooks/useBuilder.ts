'use client'

import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { Project, ProjectBlock, BlockContent, BlockType } from '@/types/content'

interface BuilderState {
  project: Project | null
  blocks: ProjectBlock[]
  isDirty: boolean
  isSaving: boolean
  isLoading: boolean
  error: string | null
}

type BuilderAction =
  | { type: 'SET_PROJECT'; project: Project }
  | { type: 'SET_BLOCKS'; blocks: ProjectBlock[] }
  | { type: 'ADD_BLOCK'; block: ProjectBlock }
  | { type: 'UPDATE_BLOCK'; id: string; content: BlockContent }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'REORDER_BLOCKS'; blockIds: string[] }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'MARK_CLEAN' }

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.project }
    case 'SET_BLOCKS':
      return { ...state, blocks: action.blocks, isLoading: false }
    case 'ADD_BLOCK':
      return { ...state, blocks: [...state.blocks, action.block], isDirty: true }
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id ? { ...b, content: action.content } : b
        ),
        isDirty: true,
      }
    case 'DELETE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.filter((b) => b.id !== action.id),
        isDirty: true,
      }
    case 'REORDER_BLOCKS': {
      const ordered = action.blockIds
        .map((id) => state.blocks.find((b) => b.id === id))
        .filter((b): b is ProjectBlock => b !== undefined)
      return { ...state, blocks: ordered, isDirty: true }
    }
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'MARK_CLEAN':
      return { ...state, isDirty: false }
    default:
      return state
  }
}

const initialState: BuilderState = {
  project: null,
  blocks: [],
  isDirty: false,
  isSaving: false,
  isLoading: true,
  error: null,
}

export function useBuilder(projectId: string) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Load project and blocks
  const load = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true })
    try {
      const [projectRes, blocksRes] = await Promise.all([
        fetch(`/api/admin/projects/${projectId}`),
        fetch(`/api/admin/projects/${projectId}/blocks`),
      ])

      if (projectRes.ok) {
        dispatch({ type: 'SET_PROJECT', project: await projectRes.json() })
      }
      if (blocksRes.ok) {
        const data = await blocksRes.json()
        dispatch({ type: 'SET_BLOCKS', blocks: data.items ?? [] })
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to load project' })
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [state.isDirty])

  // Add block
  const addBlock = useCallback(
    async (type: BlockType, content: BlockContent) => {
      const res = await fetch(`/api/admin/projects/${projectId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      })

      if (res.ok) {
        const block = await res.json()
        dispatch({ type: 'ADD_BLOCK', block })
        dispatch({ type: 'MARK_CLEAN' })
      }
    },
    [projectId]
  )

  // Update block content (debounced auto-save)
  const updateBlock = useCallback(
    (blockId: string, content: BlockContent) => {
      dispatch({ type: 'UPDATE_BLOCK', id: blockId, content })

      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(async () => {
        dispatch({ type: 'SET_SAVING', isSaving: true })
        try {
          await fetch(`/api/admin/projects/${projectId}/blocks/${blockId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          dispatch({ type: 'MARK_CLEAN' })
        } finally {
          dispatch({ type: 'SET_SAVING', isSaving: false })
        }
      }, 2000)
    },
    [projectId]
  )

  // Delete block
  const deleteBlock = useCallback(
    async (blockId: string) => {
      const res = await fetch(`/api/admin/projects/${projectId}/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        dispatch({ type: 'DELETE_BLOCK', id: blockId })
        dispatch({ type: 'MARK_CLEAN' })
      }
    },
    [projectId]
  )

  // Reorder blocks
  const reorderBlocks = useCallback(
    async (blockIds: string[]) => {
      dispatch({ type: 'REORDER_BLOCKS', blockIds })

      await fetch(`/api/admin/projects/${projectId}/blocks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds }),
      })
      dispatch({ type: 'MARK_CLEAN' })
    },
    [projectId]
  )

  // Update project metadata
  const updateProject = useCallback(
    async (updates: Partial<Project>) => {
      dispatch({ type: 'SET_SAVING', isSaving: true })
      try {
        const res = await fetch(`/api/admin/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        if (res.ok) {
          dispatch({ type: 'SET_PROJECT', project: await res.json() })
        }
      } finally {
        dispatch({ type: 'SET_SAVING', isSaving: false })
      }
    },
    [projectId]
  )

  return {
    ...state,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    updateProject,
    reload: load,
  }
}
