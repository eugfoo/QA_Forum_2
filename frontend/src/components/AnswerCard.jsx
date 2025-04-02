// src/components/AnswerCard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faThumbsUp as faThumbsUpSolid,
    faThumbsDown as faThumbsDownSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
    faThumbsUp as faThumbsUpRegular,
    faThumbsDown as faThumbsDownRegular,
    faComment,
} from '@fortawesome/free-regular-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import MoreActions from './MoreActions';

const AnswerCard = ({ answer, isQuestionLocked, onVote, onDelete, onEdit }) => {
    const { currentUser } = useContext(AuthContext);

    const isUpvoted =
        currentUser && answer.votes.up.some(uid => uid.toString() === currentUser._id.toString());
    const isDownvoted =
        currentUser && answer.votes.down.some(uid => uid.toString() === currentUser._id.toString());
    const canVote =
        currentUser && 
        !isQuestionLocked && 
        currentUser._id.toString() !== answer.user._id.toString();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
            {/* MoreActions for answer (only if current user is the answer owner or if user is admin) */}
            {currentUser && 
                (currentUser._id === answer.user._id || currentUser.isAdmin) && (
                <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                    <MoreActions
                        type="answer"
                        answer={answer} // ✅ pass the actual answer
                        onEdit={(editedData) => onEdit(answer._id, editedData)}
                        onDelete={() => onDelete(answer._id)}
                    />
                </div>
            )}

            {/* Answer Content */}
            <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{answer.body}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                <div className="flex items-center space-x-2">
                    <span>Answered by</span>
                    {answer.anonymous ? (
                        <span className="text-gray-600">Anonymous</span>
                    ) : (
                        <Link to={`/users/${answer.user._id}`} className="text-blue-600 hover:underline">
                            {answer.user.username}
                        </Link>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                </div>
            </div>
            {/* Voting Panel at Bottom Right */}
            <div
                className="absolute bottom-2 right-2 flex items-center gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {canVote ? (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote(answer._id, 'up');
                            }}
                            className="vote-btn flex items-center gap-1 focus:outline-none"
                        >
                            <FontAwesomeIcon
                                icon={isUpvoted ? faThumbsUpSolid : faThumbsUpRegular}
                                className={isUpvoted ? 'text-blue-500' : 'text-gray-500'}
                            />
                            <span className="vote-count">{answer.votes.up.length}</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote(answer._id, 'down');
                            }}
                            className="vote-btn flex items-center gap-1 focus:outline-none"
                        >
                            <FontAwesomeIcon
                                icon={isDownvoted ? faThumbsDownSolid : faThumbsDownRegular}
                                className={isDownvoted ? 'text-red-500' : 'text-gray-500'}
                            />
                            <span className="vote-count">{answer.votes.down.length}</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                            <FontAwesomeIcon icon={faThumbsUpRegular} />
                            <span className="vote-count">{answer.votes.up.length}</span>
                        </button>
                        <button type="button" className="vote-btn flex items-center gap-1 text-gray-400" disabled>
                            <FontAwesomeIcon icon={faThumbsDownRegular} />
                            <span className="vote-count">{answer.votes.down.length}</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnswerCard;
