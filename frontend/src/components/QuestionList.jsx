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
