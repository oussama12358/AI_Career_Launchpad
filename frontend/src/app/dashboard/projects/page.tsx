'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, RefreshCw, ExternalLink, Github, Loader2, X, Star, Edit2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  ai_description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  demo_url: string;
  stars: number;
  language: string;
  source: string;
  image_url?: string;
  is_featured: boolean;
  featured_order?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', tech_stack: '', github_url: '', live_url: '', demo_url: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = () => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', {
        ...form,
        tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Project added with AI description!');
      setShowForm(false);
      setForm({ name: '', description: '', tech_stack: '', github_url: '', live_url: '', demo_url: '', image_url: '' });
      setEditingId(null);
      fetchProjects();
    } catch {
      toast.error('Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    toast.success('Project deleted');
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    try {
      const res = await api.post(`/projects/${id}/regenerate`);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      toast.success('Description regenerated!');
      fetchProjects();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || 'Failed to regenerate');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await api.put(`/projects/${project.id}/showcase`, {
        is_featured: !project.is_featured,
        image_url: project.image_url,
        demo_url: project.demo_url,
      });
      toast.success(project.is_featured ? 'Removed from featured' : 'Added to featured!');
      fetchProjects();
    } catch {
      toast.error('Failed to update project');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Project</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input className="input" placeholder="My Awesome App" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack (comma-separated)</label>
                <input className="input" placeholder="React, Node.js, PostgreSQL" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input className="input" placeholder="https://github.com/..." value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                <input className="input" placeholder="https://myapp.vercel.app" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demo Video URL</label>
                <input className="input" placeholder="https://youtube.com/..." value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Image URL</label>
                <input className="input" placeholder="https://example.com/image.jpg" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Generating...</> : 'Add with AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-4xl mb-3"></p>
          <p className="text-gray-600 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">Connect GitHub to import automatically, or add manually</p>
        </div>
      ) : (
        <>
          {/* Featured Projects */}
          {projects.filter((p) => p.is_featured).length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Featured Projects
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.filter((p) => p.is_featured).map((project) => (
                  <div key={project.id} className="card border-2 border-yellow-200 bg-yellow-50">
                    {project.image_url && (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <Star
                        className="w-5 h-5 text-yellow-500 fill-yellow-500 cursor-pointer flex-shrink-0"
                        onClick={() => handleToggleFeatured(project)}
                      />
                    </div>
                    {(project.ai_description || project.description) && (
                      <p className="text-sm text-gray-600 mb-2">{project.ai_description || project.description}</p>
                    )}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.tech_stack.map((t) => (
                          <span key={t} className="badge bg-purple-100 text-purple-700 text-xs">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">All Projects ({projects.length})</h2>
            {projects.map((project) => (
              <div key={project.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.source === 'github' && (
                        <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
                          <Github className="w-3 h-3" /> GitHub
                        </span>
                      )}
                      {project.language && (
                        <span className="badge bg-blue-100 text-blue-700">{project.language}</span>
                      )}
                      {project.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" title="Featured project" />
                      )}
                    </div>

                    {(project.ai_description || project.description) && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{project.ai_description || project.description}</p>
                    )}

                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.tech_stack.map((t) => (
                          <span key={t} className="badge bg-purple-100 text-purple-700">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Video
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(project)}
                      className={`p-2 rounded-lg transition-colors ${
                        project.is_featured
                          ? 'text-yellow-500 hover:bg-yellow-50'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                      title={project.is_featured ? 'Unfeature' : 'Feature this project'}
                    >
                      <Star className={`w-4 h-4 ${project.is_featured ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleRegenerate(project.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Regenerate AI description"
                      disabled={regeneratingId === project.id}
                    >
                      <RefreshCw className={`w-4 h-4 ${regeneratingId === project.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
