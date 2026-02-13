import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import {
  getDatabase,
  updateDatabase,
  deleteDatabase,
  addField,
  updateField,
  deleteField,
  addRecord,
  updateRecord,
  deleteRecord,
  reorderRecords,
  addView,
  updateView,
  deleteView,
} from '@/app/admin/cortex/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const database = await getDatabase(id)

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: database })
  } catch (error) {
    console.error('Error fetching database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch database' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    await updateDatabase(id, body)
    const updated = await getDatabase(id)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update database' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    await deleteDatabase(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete database' },
      { status: 500 }
    )
  }
}

// Special actions via POST
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const action = body.action

    // Add record
    if (action === 'addRecord') {
      const record = await addRecord(id, body.values || {})
      return NextResponse.json({ success: true, data: record })
    }

    // Update record
    if (action === 'updateRecord') {
      const record = await updateRecord(id, body.recordId, body.values)
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: record })
    }

    // Delete record
    if (action === 'deleteRecord') {
      await deleteRecord(id, body.recordId)
      return NextResponse.json({ success: true })
    }

    // Reorder records
    if (action === 'reorderRecords') {
      await reorderRecords(id, body.orderedIds || [])
      return NextResponse.json({ success: true })
    }

    // Add view
    if (action === 'addView') {
      const view = await addView(id, {
        name: body.name,
        type: body.type,
        filters: body.filters,
        sorts: body.sorts,
        visibleFields: body.visibleFields,
        cardsConfig: body.cardsConfig,
        todoConfig: body.todoConfig,
        myDayConfig: body.myDayConfig,
        galleryConfig: body.galleryConfig,
      })
      return NextResponse.json({ success: true, data: view })
    }

    // Update view
    if (action === 'updateView') {
      const view = await updateView(id, body.viewId, body.updates)
      if (!view) {
        return NextResponse.json(
          { success: false, error: 'View not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: view })
    }

    // Delete view
    if (action === 'deleteView') {
      const deleted = await deleteView(id, body.viewId)
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last view' },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true })
    }

    // Add field
    if (action === 'addField') {
      const field = await addField(id, {
        name: body.name,
        type: body.type,
        options: body.options,
        relationConfig: body.relationConfig,
        required: body.required,
      })
      return NextResponse.json({ success: true, data: field })
    }

    // Update field
    if (action === 'updateField') {
      const field = await updateField(id, body.fieldId, body.updates)
      if (!field) {
        return NextResponse.json(
          { success: false, error: 'Field not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: field })
    }

    // Delete field
    if (action === 'deleteField') {
      await deleteField(id, body.fieldId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error performing database action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
