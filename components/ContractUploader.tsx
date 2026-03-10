'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContractUploader() {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const router = useRouter()

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.error) {
        alert('Upload failed: ' + data.error)
        return
      }

      // Redirect to analysis page
      router.push(`/contract/${data.contractId}`)

    } catch (err) {
      alert('Something went wrong. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        handleFile(file)
      }}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
    >
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        id="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <label htmlFor="file-input" className="cursor-pointer">
        {uploading ? (
          <div className="space-y-3">
            <div className="text-4xl">⏳</div>
            <p className="text-gray-600 font-medium">Uploading & extracting text...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📄</div>
            <p className="text-gray-700 font-medium text-lg">
              Drop your contract PDF here
            </p>
            <p className="text-gray-400 text-sm">or click to browse</p>
          </div>
        )}
      </label>
    </div>
  )
}