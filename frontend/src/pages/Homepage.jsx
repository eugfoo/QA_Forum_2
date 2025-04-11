// src/components/HomePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import QuestionList from '../components/QuestionList';
import { useSearchParams } from 'react-router-dom';
import SidebarFilters from '../components/SidebarFilters';
import AskPromptBox from '../components/CreateQuestionBar';
import CreateQuestionModal from '../components/CreateQuestionModal';
import { AuthContext } from '../contexts/AuthContext';


const HomePage = () => {
    const { currentUser } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const [refreshKey, setRefreshKey] = useState(0);

    const [showModal, setShowModal] = useState(false);
    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex gap-8">
                <SidebarFilters currentUser={currentUser} />
                <div className="flex-1">
                    <AskPromptBox currentUser={currentUser} onOpenModal={() => setShowModal(true)} />
                    {showModal && (
                        <CreateQuestionModal onClose={() => setShowModal(false)} onSuccess={() => setRefreshKey(prev => prev + 1)} />
                    )}
                    <section className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Questions</h2>
                        <QuestionList refreshKey={refreshKey} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
