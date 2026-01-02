import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AddLessonForm({ courseId, sectionId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    content_url: '',
    content_text: '',
    duration: '',
    order: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        section_id: sectionId || null,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      await axios.post(`${API}/courses/${courseId}/lessons`, payload);
      
      toast.success('Lesson added successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="add-lesson-form">
      <div className="modal-content lesson-form-modal">
        <div className="modal-header">
          <h2>Add New Lesson</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-group">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              data-testid="lesson-title-input"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Introduction to Variables"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <Label htmlFor="type">Content Type *</Label>
              <Select 
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger data-testid="lesson-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                data-testid="lesson-duration-input"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="15"
              />
            </div>
          </div>

          {(formData.type === 'video' || formData.type === 'pdf') && (
            <div className="form-group">
              <Label htmlFor="content_url">
                {formData.type === 'video' ? 'Video URL (YouTube/Vimeo)' : 'PDF URL'} *
              </Label>
              <Input
                id="content_url"
                data-testid="content-url-input"
                value={formData.content_url}
                onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                placeholder={formData.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/file.pdf'}
                required
              />
            </div>
          )}

          {formData.type === 'text' && (
            <div className="form-group">
              <Label htmlFor="content_text">Lesson Content (HTML) *</Label>
              <Textarea
                id="content_text"
                data-testid="content-text-input"
                value={formData.content_text}
                onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                placeholder="<h2>Introduction</h2><p>Content here...</p>"
                rows={10}
                required
              />
              <p className="text-sm text-gray-500 mt-1">You can use HTML tags for formatting</p>
            </div>
          )}

          <div className="form-group">
            <Label htmlFor="order">Lesson Order *</Label>
            <Input
              id="order"
              data-testid="lesson-order-input"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="submit-lesson-btn">
              {loading ? 'Adding...' : 'Add Lesson'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}