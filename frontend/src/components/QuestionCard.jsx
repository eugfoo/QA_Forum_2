// src/components/QuestionCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MoreActions from './MoreActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as faThumbsUpSolid, faThumbsDown as faThumbsDownSolid, faLock } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as faThumbsUpRegular, faThumbsDown as faThumbsDownRegular, faComment } from '@fortawesome/free-regular-svg-icons';
import { format } from 'date-fns';

const QuestionCard = ({
    question,
    currentUser,
    onCardClick,
    onVote,
    onEdit = () => { },
    onLock = () => { },
    onDelete = () => { },
    // You can also pass additional props if needed
}) => {
    const isUpvoted =
        currentUser && question.votes.up.some(uid => uid.toString() === currentUser._id.toString());
    const isDownvoted =
        currentUser && question.votes.down.some(uid => uid.toString() === currentUser._id.toString());
    const canVote =
        currentUser && !question.locked && currentUser._id.toString() !== question.user._id.toString();

    return (
        <div className="bg-white p-4 rounded-lg shadow relative cursor-pointer" onClick={onCardClick}>
            {/* Header: Title and MoreActions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-blue-900">{question.title}</h1>
                    {question.locked && (
                        <div className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-1 flex items-center text-sm">
                            <FontAwesomeIcon icon={faLock} className="mr-1" />
                            <span>Locked</span>
                        </div>
                    )}
                </div>
                {currentUser && (currentUser._id === question.user._id || currentUser.isAdmin) && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <MoreActions
                            questionId={question._id}
                            isLocked={question.locked}
                            onEdit={onEdit}
                            onLock={onLock}
                            onDelete={onDelete}
                            questionTitle={question.title}
                            question={question} // indicates it's a question
                        />

                    </div>
                )}
            </div>

            {/* Content: Body, Tags, Metadata */}
            <div className="mt-4">
                <p className="text-gray-800 whitespace-pre-wrap">{question.body}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {question.tags && question.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                    <span>Asked by</span>
                    <Link to={`/users/${question.user._id}`} className="text-blue-600 hover:underline ml-1">
                        {question.user.username}
                    </Link>
                    <span className="mx-1">•</span>
                    <span>{format(new Date(question.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
            </div>

            {/* Voting Panel at Bottom Right */}
            <div className="absolute bottom-2 right-2 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                {canVote ? (
                    <>
                        <button
                            onClick={(e) => onVote(question._id, 'up', e)}
                            className="vote-btn flex items-center gap-1 focus:outline-none"
                        >
                            <FontAwesomeIcon
                                icon={isUpvoted ? faThumbsUpSolid : faThumbsUpRegular}
                                className={isUpvoted ? 'text-blue-500' : 'text-gray-500'}
                            />
                            <span className="vote-count">{question.votes.up.length}</span>
                        </button>
                        <button
                            onClick={(e) => onVote(question._id, 'down', e)}
                            className="vote-btn flex items-center gap-1 focus:outline-none"
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
};

export default QuestionCard;
