// src/components/AnswerList.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAnswers, voteAnswer, deleteAnswer } from '../services/api';
import AnswerCard from './AnswerCard';

const AnswerList = ({ questionId, isQuestionLocked, refreshKey }) => {
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnswers();
    }, [questionId, refreshKey]);

    const fetchAnswers = async () => {
        try {
            const response = await getAnswers(questionId);
            setAnswers(response.data);
        } catch (error) {
            console.error('Error fetching answers:', error);
            toast.error('Failed to load answers');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (answerId, voteType) => {
        try {
            await voteAnswer(answerId, voteType);
            toast.success('Vote recorded successfully');
            fetchAnswers();
        } catch (error) {
            console.error('Error voting:', error);
            toast.error(error.response?.data?.error || 'Failed to record vote');
        }
    };

    const handleDelete = async (answerId) => {
        try {
            await deleteAnswer(answerId);
            toast.success('Answer deleted successfully');
            fetchAnswers();
        } catch (error) {
            console.error('Error deleting answer:', error);
            toast.error(error.response?.data?.error || 'Failed to delete answer');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 mb-4">Answers</h2>
            {answers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No answers yet. Be the first to answer!</p>
            ) : (
                answers.map((answer) => (
                    <AnswerCard
                        key={answer._id}
                        answer={answer}
                        isQuestionLocked={isQuestionLocked}
                        onVote={handleVote}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
};

export default AnswerList;
