// src/components/AnswerForm.jsx
import React, { useState } from 'react';
import { createAnswer } from '../services/api';
import { toast } from 'react-toastify';

const AnswerForm = ({ questionId, onAnswerSubmitted }) => {
    const [body, setBody] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await createAnswer(questionId, { body, anonymous });
            toast.success(response.data.message || 'Answer submitted successfully.');
            setBody('');
            setAnonymous(false);
            if (onAnswerSubmitted) {
                onAnswerSubmitted();
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            toast.error(error.response?.data?.error || 'Error submitting answer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-2 border border-gray-300 rounded"
                rows={5}
                required
            ></textarea>
            <div className="flex items-center mt-2">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer focus:outline-none"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700
            peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
            peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px]
            after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
            dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Post anonymously
                    </span>
                </label>
                <button
                    type="submit"
                    className="ml-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
            </div>
        </form>
    );
};

export default AnswerForm;
