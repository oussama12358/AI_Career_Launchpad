'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Award, ThumbsUp, Loader2 } from 'lucide-react';

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: string;
  years_of_experience: number;
  endorsements_count: number;
  verified: boolean;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    proficiency_level: 'intermediate',
    years_of_experience: '',
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data);
    } catch (err: any) {
      console.warn('Error loading skills:', err?.response?.status || err?.message || err);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) {
      toast.error('Skill name required');
      return;
    }

    setAdding(true);
    try {
      await api.post('/skills', newSkill);
      toast.success('Skill added successfully');
      setNewSkill({ skill_name: '', proficiency_level: 'intermediate', years_of_experience: '' });
      await loadSkills();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add skill');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateSkill = async (skillId: string, proficiencyLevel: string) => {
    try {
      await api.put(`/skills/${skillId}`, { proficiency_level: proficiencyLevel });
      toast.success('Skill updated');
      await loadSkills();
    } catch (err) {
      toast.error('Failed to update skill');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Delete this skill?')) return;

    try {
      await api.delete(`/skills/${skillId}`);
      toast.success('Skill deleted');
      await loadSkills();
    } catch (err) {
      toast.error('Failed to delete skill');
    }
  };

  const handleEndorse = async (skillId: string) => {
    try {
      await api.post(`/skills/${skillId}/endorse`);
      toast.success('Skill endorsed');
      await loadSkills();
    } catch (err) {
      toast.error('Failed to endorse skill');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const proficiencyColors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-green-100 text-green-800',
    expert: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
        <p className="text-gray-500 mt-1">Build and verify your professional skills</p>
      </div>

      {/* Add Skill Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Skill</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Skill name (e.g., React)"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              className="input"
            />
            <select
              value={newSkill.proficiency_level}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
              className="input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <input
              type="number"
              placeholder="Years of experience"
              value={newSkill.years_of_experience}
              onChange={(e) =>
                setNewSkill({ ...newSkill, years_of_experience: e.target.value })
              }
              min="0"
              step="0.5"
              className="input"
            />
          </div>
          <button
            onClick={handleAddSkill}
            disabled={adding}
            className="btn-primary flex items-center gap-2"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Skill
          </button>
        </div>
      </div>

      {/* Skills List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="text-gray-500">No skills added yet. Add your first skill above!</p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{skill.skill_name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        proficiencyColors[skill.proficiency_level as keyof typeof proficiencyColors] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {skill.proficiency_level}
                    </span>
                    {skill.verified && (
                      <Award className="w-4 h-4 text-yellow-500" title="Verified skill" />
                    )}
                  </div>
                  {skill.years_of_experience && (
                    <p className="text-sm text-gray-600 mt-1">
                      {skill.years_of_experience} years of experience
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEndorse(skill.id)}
                    className="btn-secondary p-2 flex items-center gap-1 text-sm"
                    title="Endorse this skill"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {skill.endorsements_count}
                  </button>

                  <select
                    value={skill.proficiency_level}
                    onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                    className="input text-sm w-32"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>

                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="btn-danger p-2"
                    title="Delete skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
