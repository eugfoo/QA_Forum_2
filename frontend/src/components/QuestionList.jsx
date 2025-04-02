// src/components/QuestionList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchQuestions, voteQuestion, editQuestion, lockQuestion, unlockQuestion, deleteQuestion } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Loader from './Loader';
import { toast } from 'react-toastify';
import QuestionCard from './QuestionCard';

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
        const getQuestions = async (retryCount = 0) => {
            try {
                setFade(false);
                setLoading(true);
                console.log(`Fetching questions with filter=${filter}, view=${view} (attempt ${retryCount + 1})`);
                const response = await fetchQuestions(filter, view);
                console.log('Questions fetched successfully:', response.data.questions.length);
                setQuestions(response.data.questions);
            } catch (err) {
                console.error('Error fetching questions:', err);
                
                // Add retry logic for network errors
                if (err.code === 'ERR_NETWORK' && retryCount < 2) {
                    console.log(`Network error detected. Retrying in ${(retryCount + 1) * 1000}ms (attempt ${retryCount + 1}/3)`);
                    toast.info(`Connection issue. Retrying... (${retryCount + 1}/3)`);
                    
                    setTimeout(() => {
                        getQuestions(retryCount + 1);
                    }, (retryCount + 1) * 1000);
                    return;
                }
                
                // Show appropriate error based on error type
                if (err.code === 'ERR_NETWORK') {
                    toast.error('Network error: Could not connect to the server. Please check your connection.');
                } else if (err.response?.status === 401) {
                    toast.error('Authentication required. Please log in again.');
                } else {
                    toast.error(`Failed to fetch questions: ${err.message || 'Unknown error'}`);
                }
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

    const handleVote = async (questionId, voteType, e) => {
        e.stopPropagation();
        try {
            const response = await voteQuestion(questionId, voteType);
            toast.success(response.data.message || 'Vote recorded successfully');
            const updatedQuestions = await fetchQuestions(filter, view);
            setQuestions(updatedQuestions.data.questions);
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
            {questions.map((question) => (
                <QuestionCard
                    key={question._id}
                    question={question}
                    currentUser={currentUser}
                    onCardClick={() => navigate(`/questions/${question._id}`)}
                    onVote={handleVote}
                    onEdit={(editedData) => handleEdit(question._id, editedData)}
                    onLock={() => handleLock(question._id, question.locked)}
                    onDelete={() => handleDelete(question._id)}
                />
            ))}
        </div>
    );
};

export default QuestionList;
