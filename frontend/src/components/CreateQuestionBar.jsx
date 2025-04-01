import React from 'react';

const CreateQuestionBar = ({ currentUser, onOpenModal }) => {
    if (!currentUser) return null;

    return (
        <div
            className="flex items-center bg-white p-4 mb-6 rounded shadow cursor-pointer"
            onClick={() => {
                console.log('Prompt box clicked!');
                onOpenModal();
            }}
        >
            <img
                className="w-12 h-12 rounded-full object-cover mr-4"
                src={currentUser.profilePic || '/images/default.png'}
                alt="User Avatar"
            />
            <input
                type="text"
                placeholder="What's on your mind?"
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded bg-gray-100 cursor-pointer"
            />
        </div>
    );
};

export default CreateQuestionBar;
