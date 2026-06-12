'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
  summary: string;
}

interface Resume {
  id: string;
  file_name: string;
  score: number;
  ai_feedback: string;
  parsed_data?: { skills?: string[] } | null;
  uploaded_at: string;
}

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/resume')
      .then((res) => {
        setResume(res.data);
        if (res.data.ai_feedback) {
          try {
            setFeedback(typeof res.data.ai_feedback === 'string'
              ? JSON.parse(res.data.ai_feedback)
              : res.data.ai_feedback);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(res.data.resume);
      setFeedback(res.data.feedback);
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-red-500';

  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-orange-100' : 'bg-red-100';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
        <p className="text-gray-500 mt-1">Upload your CV for AI-powered feedback and scoring</p>
      </div>

      {/* Upload zone */}
      <div
        className="card border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer text-center"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        {uploading ? (
          <div className="py-8">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Analyzing your resume with AI...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
          </div>
        ) : (
          <div className="py-8">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              {resume ? 'Re-upload resume' : 'Upload your resume'}
            </p>
            <p className="text-gray-400 text-sm mt-1">PDF only, max 5MB</p>
          </div>
        )}
      </div>

      {/* Current resume info */}
      {resume && (
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{resume.file_name}</p>
            <p className="text-sm text-gray-500">
              Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          {typeof resume.score === 'number' && (
            <div className={`px-3 py-1 rounded-full font-bold text-lg ${scoreBg(resume.score)} ${scoreColor(resume.score)}`}>
              {resume.score}/100
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {(() => {
        const skills = resume?.parsed_data?.skills ?? [];
        return skills.length > 0 ? (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Detected Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="badge bg-blue-100 text-blue-700">{skill}</span>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* AI Feedback */}
      {feedback && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="card bg-blue-50 border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">AI Summary</h2>
            <p className="text-blue-800 text-sm leading-relaxed">{feedback.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Strengths
              </h2>
              <ul className="space-y-2">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Improvements
              </h2>
              <ul className="space-y-2">
                {feedback.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing keywords */}
          {feedback.keywords_missing?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">Missing Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {feedback.keywords_missing.map((k) => (
                  <span key={k} className="badge bg-red-100 text-red-700">{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
