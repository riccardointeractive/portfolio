import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { getDatabases, createDatabase } from '@/app/admin/cortex/lib/db'

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const databases = await getDatabases()
    return NextResponse.json({ success: true, data: databases })
  } catch (error) {
    console.error('Error fetching databases:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch databases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const database = await createDatabase({
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
      fields: body.fields,
    })
    return NextResponse.json({ success: true, data: database })
  } catch (error) {
    console.error('Error creating database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create database' },
      { status: 500 }
    )
  }
}
