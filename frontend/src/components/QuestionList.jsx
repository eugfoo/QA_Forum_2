// src/components/QuestionList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { fetchQuestions } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Loader from './Loader';

const QuestionList = ({ refreshKey }) => {
    const [loading, setLoading] = useState(true);
    const {currentUser, setCurrentUser } = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const filter = searchParams.get('filter') || 'latest';
    const view = searchParams.get('view') || 'general';

    const [fade, setFade] = useState(false);

    useEffect(() => {
        const getQuestions = async () => {
            try {
                setFade(false); // Reset fade before fetching
                setLoading(true);
                const response = await fetchQuestions(filter, view);
                setQuestions(response.data.questions);
            } catch (err) {
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
                setTimeout(() => setFade(true), 50); // Trigger fade after mount
            }
        };

        getQuestions();
    }, [filter, view, refreshKey]);

    return (
        <div className={`transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader />
                </div>
            ) : (
                <div
                    className={`transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {questions && questions.length > 0 ? (
                        questions.map((question, index) => (
                            <article
                                key={question._id}
                                className="question bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 relative animate-fadeInUp cursor-pointer"
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onClick={() => navigate(`/questions/${question._id}`)}
                            >

                                <h3 className="text-lg font-semibold">
                                    <span className="text-blue-600 hover:underline">
                                        {question.title}
                                    </span>
                                    {question.locked && (
                                        <span className="ml-2 inline-flex items-center bg-gray-300 text-gray-800 px-2 py-1 text-xs rounded">
                                            <i className="fa-solid fa-lock mr-1"></i> Locked
                                        </span>
                                    )}
                                </h3>
                                <p className="mt-2">{question.body}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Posted by {question.user.username} on {new Date(question.createdAt).toLocaleString()}
                                </div>
                                {question.tags && question.tags.length > 0 && (
                                    <div className="mt-2">
                                        <span className="font-medium text-gray-600 mr-1">Tags:</span>
                                        {question.tags.map((tag, i) => (
                                            <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-sm mr-1">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 flex items-center gap-4 text-sm text-gray-500">
                                    {currentUser && !question.locked && currentUser._id !== question.user._id ? (
                                        <>
                                            <form
                                                action={`/questions/${question._id}/vote`}
                                                method="POST"
                                                style={{ display: 'inline' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input type="hidden" name="voteType" value="up" />
                                                <button type="submit" className="vote-btn flex items-center gap-1">
                                                    <i className={question.votes.up.includes(currentUser._id) ? 'fa-solid fa-thumbs-up text-blue-500' : 'fa-regular fa-thumbs-up text-gray-500'}></i>
                                                    <span className="vote-count">{question.votes.up.length}</span>
                                                </button>
                                            </form>
                                            <form
                                                action={`/questions/${question._id}/vote`}
                                                method="POST"
                                                style={{ display: 'inline' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input type="hidden" name="voteType" value="down" />
                                                <button type="submit" className="vote-btn flex items-center gap-1">
                                                    <i className={question.votes.down.includes(currentUser._id) ? 'fa-solid fa-thumbs-down text-red-500' : 'fa-regular fa-thumbs-down text-gray-500'}></i>
                                                    <span className="vote-count">{question.votes.down.length}</span>
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                                                <i className="fa-regular fa-thumbs-up"></i>
                                                <span className="vote-count">{question.votes.up.length}</span>
                                            </button>
                                            <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                                                <i className="fa-regular fa-thumbs-down"></i>
                                                <span className="vote-count">{question.votes.down.length}</span>
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        to={`/questions/${question._id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="comment-link"
                                    >
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <i className="fa-regular fa-comment"></i>
                                            <span>{question.answers ? question.answers.length : 0}</span>
                                        </div>
                                    </Link>
                                </div>                    </article>
                        ))
                    ) : (
                        <p>No questions have been posted yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionList;
