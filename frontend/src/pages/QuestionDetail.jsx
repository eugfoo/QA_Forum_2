const QuestionDetail = () => {
    // ... existing state and other code ...

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : question ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                                {question.isLocked && (
                                    <span className="text-gray-500" title="Question is locked">
                                        <svg
                                            className="w-6 h-6"
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
                            <div className="mt-4 text-gray-600">{question.body}</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {question.tags.map((tag, index) => (
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
                                isLocked={question.isLocked}
                                onEdit={(editedData) => handleEdit(question._id, editedData)}
                                onLock={() => handleLock(question._id, question.isLocked)}
                                onDelete={() => handleDelete(question._id)}
                                questionTitle={question.title}
                                question={question}
                            />
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span>Posted by {question.user.username}</span>
                            <span>•</span>
                            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>{question.answers.length} answers</span>
                            <span>•</span>
                            <span>{question.votes.up.length - question.votes.down.length} votes</span>
                        </div>
                    </div>

                    {/* Voting buttons */}
                    <div className="mt-6 flex items-center space-x-4">
                        <button
                            onClick={() => handleVote('up')}
                            disabled={question.isLocked}
                            className={`p-2 rounded-full ${
                                question.isLocked
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <span className="text-lg font-semibold">{question.votes.up.length - question.votes.down.length}</span>
                        <button
                            onClick={() => handleVote('down')}
                            disabled={question.isLocked}
                            className={`p-2 rounded-full ${
                                question.isLocked
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-red-600'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Answers section */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Answers</h2>
                        {question.isLocked ? (
                            <div className="text-gray-500 text-center py-4">
                                This question is locked. No new answers can be added.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitAnswer} className="mb-8">
                                <textarea
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.target.value)}
                                    placeholder="Write your answer..."
                                    className="w-full p-2 border rounded-md"
                                    rows="4"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Post Answer
                                </button>
                            </form>
                        )}
                        {/* ... rest of the answers section ... */}
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500">Question not found.</div>
            )}
        </div>
    );
};

export default QuestionDetail; 