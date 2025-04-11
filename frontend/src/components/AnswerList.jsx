// src/components/AnswerList.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAnswers, voteAnswer, deleteAnswer, editAnswer } from '../services/api';
import AnswerCard from './AnswerCard';

const AnswerList = ({ questionId, isQuestionLocked, refreshKey }) => {
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('latest');

    useEffect(() => {
        fetchAnswers();
    }, [questionId, refreshKey]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('sort-dropdown');
            const button = document.getElementById('sort-menu');
            
            if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (answers.length > 0) {
            const sortedAnswers = [...answers];
            sortAnswers(sortedAnswers);
            setAnswers(sortedAnswers);
        }
    }, [sortBy]);

    const fetchAnswers = async () => {
        try {
            const response = await getAnswers(questionId);
            let sortedAnswers = [...response.data];
            sortAnswers(sortedAnswers);
            setAnswers(sortedAnswers);
        } catch (error) {
            toast.error('Failed to load answers');
        } finally {
            setLoading(false);
        }
    };

    const sortAnswers = (answersToSort) => {
        const sortingMethods = {
            popular: (a, b) => (b.votes?.up?.length || 0) - (a.votes?.up?.length || 0),
            unpopular: (a, b) => (b.votes?.down?.length || 0) - (a.votes?.down?.length || 0),
            oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            latest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        };
        
        answersToSort.sort(sortingMethods[sortBy] || sortingMethods.latest);
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        let sortedAnswers = [...answers];
        sortAnswers(sortedAnswers);
        setAnswers(sortedAnswers);
    };

    const handleVote = async (answerId, voteType) => {
        try {
            await voteAnswer(answerId, voteType);
            toast.success('Vote recorded successfully');
            fetchAnswers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to record vote');
        }
    };

    const handleDelete = async (answerId) => {
        try {
            await deleteAnswer(answerId);
            toast.success('Answer deleted successfully');
            fetchAnswers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete answer');
        }
    };

    const handleEdit = async (answerId, editedData) => {
        try {
            await editAnswer(answerId, editedData);
            toast.success('Answer updated successfully');
            fetchAnswers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update answer');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const sortOptions = [
        { key: 'latest', label: 'Latest', icon: 'fa-clock' },
        { key: 'oldest', label: 'Oldest', icon: 'fa-hourglass-end' },
        { key: 'popular', label: 'Popular', icon: 'fa-fire' },
        { key: 'unpopular', label: 'Unpopular', icon: 'fa-thumbs-down' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mt-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Answers</h2>
                <div className="relative inline-block text-left">
                    <div>
                        <button 
                            type="button" 
                            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                            id="sort-menu" 
                            aria-expanded="true" 
                            aria-haspopup="true"
                            onClick={() => document.getElementById('sort-dropdown').classList.toggle('hidden')}
                        >
                            <i className={`fas ${sortOptions.find(o => o.key === sortBy)?.icon} mr-2 mt-0.5`}></i>
                            {sortOptions.find(o => o.key === sortBy)?.label}
                            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div 
                        className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10" 
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="sort-menu"
                        id="sort-dropdown"
                    >
                        <div className="py-1" role="none">
                            {sortOptions.map(option => (
                                <button
                                    key={option.key}
                                    className={`${sortBy === option.key ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full px-4 py-2 text-sm hover:bg-gray-100`}
                                    role="menuitem"
                                    onClick={() => {
                                        handleSortChange(option.key);
                                        document.getElementById('sort-dropdown').classList.add('hidden');
                                    }}
                                >
                                    <i className={`fas ${option.icon} mr-2 mt-0.5`}></i>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
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
                        onEdit={handleEdit}
                    />
                ))
            )}
        </div>
    );
};

export default AnswerList;
