import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AddQuizForm({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct_answer: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: 0 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/quizzes`, {
        course_id: courseId,
        title,
        questions
      });
      
      toast.success('Quiz added successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="add-quiz-form">
      <div className="modal-content quiz-modal">
        <div className="modal-header">
          <h2>Create Quiz</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quiz-form" style={{padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto'}}>
          <div className="form-group">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              data-testid="quiz-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module 1 Quiz"
              required
            />
          </div>

          <div className="questions-section">
            <div className="section-header">
              <h3>Questions</h3>
              <Button type="button" size="sm" onClick={addQuestion} data-testid="add-question-btn">
                <Plus size={16} className="mr-1" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-card" data-testid={`question-${qIndex}`}>
                <div className="question-header">
                  <h4>Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="remove-btn"
                      data-testid={`remove-question-${qIndex}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <Label>Question Text *</Label>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="What is...?"
                    required
                    data-testid={`question-text-${qIndex}`}
                  />
                </div>

                <div className="options-group">
                  <Label>Options *</Label>
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_answer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                        data-testid={`correct-answer-${qIndex}-${oIndex}`}
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                        data-testid={`option-${qIndex}-${oIndex}`}
                      />
                    </div>
                  ))}
                  <p className="help-text">Select the radio button for the correct answer</p>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="submit-quiz-btn">
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}