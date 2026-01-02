import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Health', 'Language'];

export default function CreateCourseForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    price: '',
    thumbnail: '',
    video_platform: 'youtube',
    preview_video: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/courses`, {
        ...formData,
        price: parseFloat(formData.price)
      });
      
      toast.success('Course created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const generateWithAI = async () => {
    if (!formData.title) {
      toast.error('Please enter a course title first');
      return;
    }

    setAiGenerating(true);
    try {
      const prompt = `Generate a compelling course description for a course titled "${formData.title}" in the ${formData.category} category. Make it professional, engaging, and highlight key learning outcomes. Keep it to 2-3 sentences.`;
      
      const response = await axios.post(`${API}/ai/course-assistant?prompt=${encodeURIComponent(prompt)}`);
      
      setFormData(prev => ({
        ...prev,
        description: response.data.response
      }));
      
      toast.success('AI description generated!');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="create-course-form">
      <div className="modal-content course-form-modal">
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              data-testid="course-title-input"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Complete Python Programming"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateWithAI}
                disabled={aiGenerating}
                data-testid="ai-generate-btn"
              >
                <Sparkles size={16} className="mr-1" />
                {aiGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="description"
              data-testid="course-description-input"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Learn Python from scratch to advanced..."
              rows={4}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger data-testid="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                data-testid="course-price-input"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="49.99"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              data-testid="thumbnail-input"
              value={formData.thumbnail}
              onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <Label htmlFor="video_platform">Video Platform</Label>
              <Select 
                value={formData.video_platform}
                onValueChange={(value) => setFormData({...formData, video_platform: value})}
              >
                <SelectTrigger data-testid="platform-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="preview_video">Preview Video URL</Label>
              <Input
                id="preview_video"
                data-testid="preview-video-input"
                value={formData.preview_video}
                onChange={(e) => setFormData({...formData, preview_video: e.target.value})}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="submit-course-btn">
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}