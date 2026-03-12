import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    // Get logged in user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the uploaded file
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(buffer)
    const rawText = parsed.text

    // Save to Supabase
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: null, // we'll link properly in Phase 3 polish
        filename: file.name,
        raw_text: rawText,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      contractId: data.id,
      filename: file.name,
      textLength: rawText.length
    })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
