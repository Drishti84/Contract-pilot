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
    // Import parser implementation directly to avoid pdf-parse debug entrypoint side effects.
    // @ts-expect-error pdf-parse internal path does not ship declaration files.
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js')
    const pdfParse = (pdfParseModule as { default?: (buffer: Buffer) => Promise<{ text: string }> }).default ?? (pdfParseModule as unknown as (buffer: Buffer) => Promise<{ text: string }>)
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
