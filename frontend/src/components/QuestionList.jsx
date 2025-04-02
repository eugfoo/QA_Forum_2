// src/components/QuestionList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchQuestions, editQuestion, lockQuestion, unlockQuestion, deleteQuestion } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Loader from './Loader';
import MoreActions from './MoreActions';
import { toast } from 'react-toastify';

const QuestionList = ({ refreshKey }) => {
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const filter = searchParams.get('filter') || 'latest';
    const view = searchParams.get('view') || 'general';

    const [fade, setFade] = useState(false);

    useEffect(() => {
        const getQuestions = async () => {
            try {
                setFade(false);
                setLoading(true);
                const response = await fetchQuestions(filter, view);
                setQuestions(response.data.questions);
            } catch (err) {
                console.error('Error fetching questions:', err);
                toast.error('Failed to fetch questions');
            } finally {
                setLoading(false);
                setTimeout(() => setFade(true), 50);
            }
        };

        getQuestions();
    }, [filter, view, refreshKey]);

    const handleEdit = (questionId) => {
        navigate(`/questions/${questionId}/edit`);
    };

    const handleLock = async (questionId, isLocked) => {
        try {
            if (isLocked) {
                await unlockQuestion(questionId);
                toast.success('Question unlocked successfully');
            } else {
                await lockQuestion(questionId);
                toast.success('Question locked successfully');
            }
            // Refresh the questions list
            const response = await fetchQuestions(filter, view);
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Error toggling question lock:', error);
            toast.error('Failed to update question lock status');
        }
    };

    const handleDelete = async (questionId) => {
        try {
            const response = await deleteQuestion(questionId);
            if (response.status === 200) {
                toast.success('Question deleted successfully');
                const updatedQuestions = await fetchQuestions(filter, view);
                setQuestions(updatedQuestions.data.questions);
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error(error.response?.data?.error || 'Failed to delete question');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={`space-y-4 ${fade ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            {questions.map((question) => (
                <div key={question._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <Link to={`/questions/${question._id}`} className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                                {question.title}
                            </Link>
                            <p className="text-gray-600 mt-1">{question.body}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span>Posted by {question.user.username}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                                {question.isLocked && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <span className="text-red-500">Locked</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {currentUser && (currentUser._id === question.user._id || currentUser.isAdmin) && (
                            <MoreActions
                                questionId={question._id}
                                isLocked={question.isLocked}
                                onEdit={() => handleEdit(question._id)}
                                onLock={() => handleLock(question._id, question.isLocked)}
                                onDelete={() => handleDelete(question._id)}
                                questionTitle={question.title}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionList;
