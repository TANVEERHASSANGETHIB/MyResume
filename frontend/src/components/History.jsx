import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/supabase'
import { getHistory, deleteOptimization } from '../services/api'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const user = await getCurrentUser()
      const result = await getHistory(user.id)
      setHistory(result.history || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this optimization?')) {
      return
    }

    try {
      await deleteOptimization(id)
      setHistory(history.filter(item => item.id !== id))
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-600">
              Optimization History
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No history yet</h3>
            <p className="mt-2 text-gray-600">Generate your first resume optimization to see it here</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-6"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Past Optimizations ({history.length})
              </h2>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`card cursor-pointer transition-all hover:shadow-xl ${
                    selectedItem?.id === item.id
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {item.job_description?.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>

            {/* Details Panel */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="space-y-6">
                  {/* Job Description */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Job Description
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {selectedItem.job_description}
                      </pre>
                    </div>
                  </div>

                  {/* Optimized Resume */}
                  {selectedItem.optimized_resume && (
                    <div className="card">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Optimized Resume
                        </h3>
                        <button
                          onClick={() =>
                            handleDownload(
                              selectedItem.optimized_resume,
                              `resume_${selectedItem.id}.txt`
                            )
                          }
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Download
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                          {selectedItem.optimized_resume}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedItem.cover_letter && (
                    <div className="card">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Cover Letter
                        </h3>
                        <button
                          onClick={() =>
                            handleDownload(
                              selectedItem.cover_letter,
                              `cover_letter_${selectedItem.id}.txt`
                            )
                          }
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Download
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                          {selectedItem.cover_letter}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    <p className="mt-4">Select an item to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}