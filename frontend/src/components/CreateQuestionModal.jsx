import React, { useState } from 'react';
import { createQuestion } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateQuestionModal = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createQuestion({ title, body, tags });
            toast.success('Question posted successfully!');
            onClose();
            onSuccess(); // 👈 trigger refresh
        } catch (err) {
            toast.error('Failed to post question.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative z-50">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full mb-3 p-2 border rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Body"
                        className="w-full mb-3 p-2 border rounded"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        className="w-full mb-3 p-2 border rounded"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    >
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestionModal;
