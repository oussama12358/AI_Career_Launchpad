'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Palette,
  Layout,
  Eye,
  Save,
  Loader2,
  Github,
  FileText,
  Briefcase,
  Zap,
} from 'lucide-react';

interface Customization {
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  layout_style: string;
  show_resume: boolean;
  show_github: boolean;
  show_projects: boolean;
  show_skills: boolean;
  font_family: string;
  custom_css: string;
}

interface Theme {
  id: string;
  name: string;
  label: string;
  description: string;
  preview_colors: Record<string, string>;
}

export default function CustomizePage() {
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portfolioId, setPortfolioId] = useState('');
  const [portfolioMissing, setPortfolioMissing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get portfolio first to get portfolio ID
        const portfolioRes = await api.get('/portfolio');
        // backend returns { portfolio, projects, assessment, aiAvailable }
        const pid = portfolioRes.data?.portfolio?.id ?? portfolioRes.data?.id ?? '';
        if (!pid) throw new Error('Portfolio ID not found');
        setPortfolioId(pid);

        // Load themes
        const themesRes = await api.get('/customization/themes');
        setThemes(themesRes.data);

        // Load current customization
        const customRes = await api.get(`/customization/${pid}`);
        setCustomization(customRes.data);
      } catch (err: any) {
        // Log a concise warning to avoid noisy error stacks in devtools
        console.warn('Error loading customization:', err?.response?.status || err?.message || err);
        // If portfolio isn't generated yet, backend returns 404 on /portfolio
        if (err?.response?.status === 404) {
          setPortfolioMissing(true);
        } else {
          toast.error('Failed to load customization settings');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!customization || !portfolioId) return;
    setSaving(true);

    try {
      await api.put(`/customization/${portfolioId}`, customization);
      toast.success('Portfolio customization saved!');
    } catch (err) {
      console.error('Error saving customization:', err);
      toast.error('Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    setLoading(true);
    try {
      await api.post('/portfolio/generate');
      toast.success('Portfolio generated — loading customization');
      setPortfolioMissing(false);
      // reload data
      const portfolioRes = await api.get('/portfolio');
      const pid = portfolioRes.data?.portfolio?.id ?? portfolioRes.data?.id ?? '';
      setPortfolioId(pid);
      const themesRes = await api.get('/customization/themes');
      setThemes(themesRes.data);
      const customRes = await api.get(`/customization/${pid}`);
      setCustomization(customRes.data);
    } catch (err) {
      console.error('Error generating portfolio:', err);
      toast.error('Failed to generate portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (themeName: string) => {
    if (customization) {
      setCustomization({ ...customization, theme_name: themeName });
    }
  };

  const handleColorChange = (field: string, value: string) => {
    if (customization) {
      setCustomization({ ...customization, [field]: value });
    }
  };

  const handleToggle = (field: string) => {
    if (customization) {
      setCustomization({
        ...customization,
        [field]: !customization[field as keyof Customization],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!loading && portfolioMissing) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">No portfolio found</h2>
        <p className="text-gray-600 mb-6">You need to generate your portfolio before customizing it.</p>
        <div className="flex justify-center">
          <button onClick={handleGeneratePortfolio} className="btn-primary">
            Generate Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customize Your Portfolio</h1>
        <p className="text-gray-500 mt-1">Make your portfolio uniquely yours with custom themes and styling</p>
      </div>

      {/* Theme Selection */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          Choose a Theme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.name)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                customization?.theme_name === theme.name
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{theme.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
              <div className="flex gap-2 mt-3">
                {Object.values(theme.preview_colors || {}).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Colors
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { key: 'primary_color', label: 'Primary Color' },
            { key: 'secondary_color', label: 'Secondary Color' },
            { key: 'accent_color', label: 'Accent Color' },
            { key: 'background_color', label: 'Background Color' },
            { key: 'text_color', label: 'Text Color' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={customization?.[key as keyof Customization] || '#000000'}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customization?.[key as keyof Customization] || '#000000'}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="input flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout & Typography */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5 text-purple-600" />
          Layout & Typography
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
            <select
              value={customization?.layout_style || 'modern'}
              onChange={(e) => handleColorChange('layout_style', e.target.value)}
              className="input w-full"
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={customization?.font_family || 'system-ui'}
              onChange={(e) => handleColorChange('font_family', e.target.value)}
              className="input w-full"
            >
              <option value="system-ui">System UI</option>
              <option value="'Segoe UI', sans-serif">Segoe UI</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Visibility */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          Show Sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'show_resume', label: 'Resume', icon: FileText },
            { key: 'show_github', label: 'GitHub', icon: Github },
            { key: 'show_projects', label: 'Projects', icon: Briefcase },
            { key: 'show_skills', label: 'Skills', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <label
              key={key}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={customization?.[key as keyof Customization] as boolean}
                onChange={() => handleToggle(key)}
                className="rounded w-4 h-4 text-blue-600"
              />
              <Icon className="w-4 h-4 text-gray-600 ml-3" />
              <span className="ml-2 text-gray-900">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 sticky bottom-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 flex-1"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Customization
        </button>
      </div>
    </div>
  );
}
