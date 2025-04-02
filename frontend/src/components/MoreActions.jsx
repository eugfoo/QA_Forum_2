// src/components/MoreActions.jsx
import React, { useState, useRef, useEffect } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditQuestionModal from './EditQuestionModal';
import EditAnswerModal from './EditAnswerModal'; // Make sure you have this component

const MoreActions = ({
    type = "question", // "question" or "answer"
    question, 
    answer,          // Provided for questions; for answers, this can be omitted
    questionId,        // For questions; for answers, you might pass answerId
    isLocked,
    onEdit,            // Callback for editing
    onLock,            // Callback for locking (only used for questions)
    onDelete,          // Callback for deleting
    questionTitle,     // Optional, for questions
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = () => {
        setIsOpen(false);
        setShowEditModal(true);
    };

    const handleLock = () => {
        setIsOpen(false);
        onLock();
    };

    const handleDeleteClick = () => {
        setIsOpen(false);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDelete();
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleEditSave = async (editedData) => {
        try {
            await onEdit(editedData);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error saving edits:', error);
        }
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <button
                            onClick={handleEdit}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit
                        </button>
                        {type === "question" && (
                            <button
                                onClick={handleLock}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                            isLocked
                                                ? "M13 10V3L4 14h7v7l9-11h-7z"
                                                : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        }
                                    />
                                </svg>
                                {isLocked ? 'Unlock' : 'Lock'}
                            </button>
                        )}
                        <button
                            onClick={handleDeleteClick}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Conditionally render modals based on type */}
            {type === "question" ? (
                <>
                    <EditQuestionModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSave={handleEditSave}
                        question={question}
                    />
                </>
            ) : (
                <>
                    <EditAnswerModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSave={handleEditSave} // Your callback for saving the answer
                        answer={answer}   // Make sure selectedAnswer contains the answer data
                    />
                </>
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title={questionTitle}
            />
        </>
    );
};

export default MoreActions;
