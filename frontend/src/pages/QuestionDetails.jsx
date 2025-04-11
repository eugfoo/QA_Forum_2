import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { voteQuestion, deleteQuestion, getQuestion, unlockQuestion, lockQuestion, editQuestion } from '../services/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import AnswerList from '../components/AnswerList';
import AnswerForm from '../components/AnswerForm';
import QuestionCard from '../components/QuestionCard';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

const QuestionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);
    const { refreshNotifications } = useContext(NotificationContext);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answersRefresh, setAnswersRefresh] = useState(0);

    useEffect(() => {
        if (currentUser) {
            refreshNotifications();
        }
    }, [currentUser, id]);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await getQuestion(id);
            setQuestion(response.data);
        } catch (error) {
            toast.error('Failed to load question');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (questionId, voteType, e) => {
        e.stopPropagation();
        try {
            const response = await voteQuestion(questionId, voteType);
            if (response.status === 200) {
                toast.success('Vote recorded successfully');
                fetchQuestion();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to record vote');
            }
        } catch (error) {
            toast.error('Failed to record vote');
        }
    };

    const handleEdit = async (editedData) => {
        try {
            const response = await editQuestion(id, editedData);
            if (response.data) {
                toast.success('Question updated successfully');
                fetchQuestion();
            } else {
                toast.error('Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error(error.response?.data?.error || 'Failed to update question');
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            const response = await deleteQuestion(id);
            if (response.status === 200) {
                toast.success('Question deleted successfully');
                navigate('/');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to delete question');
            }
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const handleLock = async (isLocked) => {
        try {
            const response = await (isLocked ? unlockQuestion(id) : lockQuestion(id));
            
            if (response.status === 200) {
                toast.success(`Question ${isLocked ? 'unlocked' : 'locked'} successfully`);
                fetchQuestion();
            } else {
                toast.error(`Failed to ${isLocked ? 'unlock' : 'lock'} question`);
            }
        } catch (error) {
            toast.error(`Failed to ${isLocked ? 'unlock' : 'lock'} question`);
        }
    };

    const refreshAnswers = () => setAnswersRefresh(prev => prev + 1);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-semibold text-gray-900">Question not found</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
                    Return to home
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8 pb-80">
                <QuestionCard
                    question={question}
                    currentUser={currentUser}
                    onCardClick={() => { }}
                    onVote={(questionId, voteType, e) => handleVote(questionId, voteType, e)}
                    onEdit={handleEdit}
                    onLock={() => handleLock(question.locked)}
                    onDelete={handleDelete}
                />
                <AnswerList questionId={id} isQuestionLocked={question.locked} refreshKey={answersRefresh} />
            </div>

            {currentUser && question && currentUser._id !== question.user._id && !question.locked && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md">
                    <div className="max-w-4xl mx-auto">
                        <AnswerForm questionId={id} onAnswerSubmitted={refreshAnswers} />
                    </div>
                </div>
            )}
            
            {currentUser && question && currentUser._id === question.user._id && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                            You cannot answer your own question
                        </div>
                    </div>
                </div>
            )}

            {currentUser && question && question.locked && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                            <FontAwesomeIcon icon={faLock} className="mr-2" />
                            This question is locked and no longer accepting answers
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionDetails;
