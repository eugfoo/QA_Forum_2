// src/pages/QuestionDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { voteQuestion, deleteQuestion, getQuestion, unlockQuestion, lockQuestion } from '../services/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import AnswerList from '../components/AnswerList';
import AnswerForm from '../components/AnswerForm';
import EditQuestionModal from '../components/EditQuestionModal';
import QuestionCard from '../components/QuestionCard';
import { AuthContext } from '../contexts/AuthContext';

const QuestionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [answersRefresh, setAnswersRefresh] = useState(0);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await getQuestion(id);
            setQuestion(response.data);
        } catch (error) {
            console.error('Error fetching question:', error);
            toast.error('Failed to load question');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (voteType, e) => {
        e.stopPropagation();
        try {
            const response = await voteQuestion(id, voteType);
            if (response.status === 200) {
                toast.success('Vote recorded successfully');
                fetchQuestion();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to record vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to record vote');
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (editedData) => {
        try {
            const response = await fetch(`/api/questions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData),
            });
            if (response.ok) {
                toast.success('Question updated successfully');
                setIsEditModalOpen(false);
                fetchQuestion();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error('Failed to update question');
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
            console.error('Error deleting question:', error);
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
            console.error('Error locking/unlocking question:', error);
            toast.error(`Failed to ${isLocked ? 'unlock' : 'lock'} question`);
        }
    };

    // Callback to refresh AnswerList when a new answer is submitted
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
                    onVote={handleVote}
                    onEdit={(editedData) => handleEdit(question._id, editedData)}
                    onLock={() => handleLock(question.locked)}
                    onDelete={handleDelete}
                />
                <AnswerList questionId={id} isQuestionLocked={question.locked} refreshKey={answersRefresh} />
            </div>

            {/* Fixed Answer Form - Don't show if user is the question owner or if question is locked */}
            {currentUser && question && currentUser._id !== question.user._id && !question.locked && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md">
                    <div className="max-w-4xl mx-auto">
                        <AnswerForm questionId={id} onAnswerSubmitted={refreshAnswers} />
                    </div>
                </div>
            )}
            
            {/* Message when user can't answer */}
            {currentUser && question && currentUser._id === question.user._id && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
                            You cannot answer your own question
                        </div>
                    </div>
                </div>
            )}

            {/* Message when question is locked */}
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

            {/* Edit Modal */}
            <EditQuestionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
                question={question}
            />
        </>
    );
};

export default QuestionDetails;
