// src/components/QuestionList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchQuestions, editQuestion, lockQuestion, unlockQuestion, deleteQuestion } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Loader from './Loader';
import MoreActions from './MoreActions';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as faThumbsUpSolid, faThumbsDown as faThumbsDownSolid } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as faThumbsUpRegular, faThumbsDown as faThumbsDownRegular, faComment } from '@fortawesome/free-regular-svg-icons';

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

    const handleEdit = async (questionId, editedData) => {
        try {
            const response = await editQuestion(questionId, editedData);
            if (response.status === 200) {
                toast.success('Question updated successfully');
                const updatedQuestions = await fetchQuestions(filter, view);
                setQuestions(updatedQuestions.data.questions);
            }
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error(error.response?.data?.error || 'Failed to update question');
        }
    };

    const handleLock = async (questionId, isLocked) => {
        try {
            const response = await (isLocked ? unlockQuestion(questionId) : lockQuestion(questionId));
            if (response.status === 200) {
                toast.success(isLocked ? 'Question unlocked successfully' : 'Question locked successfully');
                const updatedQuestions = await fetchQuestions(filter, view);
                setQuestions(updatedQuestions.data.questions);
            }
        } catch (error) {
            console.error('Error toggling question lock:', error);
            toast.error('Failed to update question lock status');
        }
    };

    const handleDelete = async (questionId) => {
        try {
            await deleteQuestion(questionId);
            toast.success('Question deleted successfully');
            const response = await fetchQuestions(filter, view);
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error('Failed to delete question');
        }
    };

    const handleVote = async (questionId, voteType) => {
        try {
            const response = await fetch(`/api/questions/${questionId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voteType }),
                credentials: 'include'
            });

            if (response.ok) {
                const updatedQuestions = await fetchQuestions(filter, view);
                setQuestions(updatedQuestions.data.questions);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to vote');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={`space-y-4 ${fade ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            {questions.map((question) => {
                const isUpvoted = currentUser && question.votes.up.some(uid => uid.toString() === currentUser._id.toString());
                const isDownvoted = currentUser && question.votes.down.some(uid => uid.toString() === currentUser._id.toString());
                const canVote = currentUser && !question.locked && currentUser._id.toString() !== question.user._id.toString();

                return (
                    <div key={question._id} className="bg-white p-4 rounded-lg shadow relative">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Link to={`/questions/${question._id}`} className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                                        {question.title}
                                    </Link>
                                    {question.locked && (
                                        <span className="text-gray-500" title="Question is locked">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mt-1">{question.body}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <span>Posted by {question.user.username}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                                    {question.locked && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <span className="text-red-500">Locked</span>
                                        </>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {question.tags && question.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {currentUser && (currentUser._id === question.user._id || currentUser.isAdmin) && (
                                <MoreActions
                                    questionId={question._id}
                                    isLocked={question.locked}
                                    onEdit={(editedData) => handleEdit(question._id, editedData)}
                                    onLock={() => handleLock(question._id, question.locked)}
                                    onDelete={() => handleDelete(question._id)}
                                    questionTitle={question.title}
                                    question={question}
                                />
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-4">
                            {canVote ? (
                                <>
                                    <button
                                        onClick={() => handleVote(question._id, 'up')}
                                        className="vote-btn flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon
                                            icon={isUpvoted ? faThumbsUpSolid : faThumbsUpRegular}
                                            className={isUpvoted ? 'text-blue-500' : 'text-gray-500'}
                                        />
                                        <span className="vote-count">{question.votes.up.length}</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote(question._id, 'down')}
                                        className="vote-btn flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon
                                            icon={isDownvoted ? faThumbsDownSolid : faThumbsDownRegular}
                                            className={isDownvoted ? 'text-red-500' : 'text-gray-500'}
                                        />
                                        <span className="vote-count">{question.votes.down.length}</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                                        <FontAwesomeIcon icon={faThumbsUpRegular} />
                                        <span className="vote-count">{question.votes.up.length}</span>
                                    </button>
                                    <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                                        <FontAwesomeIcon icon={faThumbsDownRegular} />
                                        <span className="vote-count">{question.votes.down.length}</span>
                                    </button>
                                </>
                            )}
                            <Link
                                to={`/questions/${question._id}`}
                                className="comment-link flex items-center gap-1 text-sm text-gray-600"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FontAwesomeIcon icon={faComment} />
                                <span>{question.answers ? question.answers.length : 0}</span>
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default QuestionList;
