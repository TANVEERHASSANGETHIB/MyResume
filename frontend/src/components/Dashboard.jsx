import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, getCurrentUser } from '../services/supabase'
import { generateBoth } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [optimizedResume, setOptimizedResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    await signOut()
  }

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please fill in both resume and job description')
      return
    }

    setError('')
    setLoading(true)
    setOptimizedResume('')
    setCoverLetter('')

    try {
      const user = await getCurrentUser()
      const result = await generateBoth(resumeText, jobDescription, user.id)
      
      setOptimizedResume(result.optimized_resume)
      setCoverLetter(result.cover_letter)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-600">
              Job Application Assistant
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/history')}
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                View History
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
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Resume
            </h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="input-field min-h-[300px] font-mono text-sm"
              placeholder="Paste your resume text here..."
            />
          </div>

          {/* Job Description Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="input-field min-h-[300px] font-mono text-sm"
              placeholder="Paste the job description here..."
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary text-lg px-12 py-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating... (this may take up to 3 minutes)
              </span>
            ) : (
              'Generate Resume & Cover Letter'
            )}
          </button>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg inline-block">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {(optimizedResume || coverLetter) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Optimized Resume */}
            {optimizedResume && (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Optimized Resume
                  </h2>
                  <button
                    onClick={() => handleDownload(optimizedResume, 'optimized_resume.txt')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Download
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {optimizedResume}
                  </pre>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {coverLetter && (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cover Letter
                  </h2>
                  <button
                    onClick={() => handleDownload(coverLetter, 'cover_letter.txt')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Download
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {coverLetter}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}