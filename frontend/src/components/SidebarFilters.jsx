import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const SidebarFilters = ({ currentUser }) => {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'latest';
    const view = searchParams.get('view') || 'general';
    const search = searchParams.get('search') || '';

    // Create URL with preserved search parameter
    const createUrl = (view, filter) => {
        let url = `/?view=${view}&filter=${filter}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return url;
    };

    const getLinkStyle = (isActive) =>
        `block px-4 py-2 rounded-md transition duration-200 font-medium ${isActive
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow'
            : 'text-gray-800 bg-gray-100 hover:bg-gray-200'
        }`;

    return (
        <aside className="w-52 bg-white p-5 rounded-lg shadow h-fit space-y-8 sticky top-4">
            {/* Views */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Question Views</h3>
                <ul className="space-y-2">
                    <li>
                        <Link
                            to={createUrl('general', filter)}
                            className={getLinkStyle(view === 'general')}
                        >
                            <i className="fa-solid fa-globe mr-2"></i>
                            General
                        </Link>
                    </li>
                    {currentUser && (
                        <li>
                            <Link
                                to={createUrl('myProfile', filter)}
                                className={getLinkStyle(view === 'myProfile')}
                            >
                                <i className="fa-solid fa-user mr-2"></i>
                                Personal
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            {/* Sort By */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Sort By</h3>
                <ul className="space-y-2">
                    {[
                        { key: 'trending', label: 'Trending', icon: 'fa-chart-line' },
                        { key: 'popular', label: 'Popular', icon: 'fa-fire' },
                        { key: 'unpopular', label: 'Unpopular', icon: 'fa-thumbs-down' },
                        { key: 'latest', label: 'Latest', icon: 'fa-clock' },
                        { key: 'oldest', label: 'Oldest', icon: 'fa-hourglass-end' }
                    ].map(({ key, label, icon }) => (
                        <li key={key}>
                            <Link
                                to={createUrl(view, key)}
                                className={getLinkStyle(filter === key)}
                            >
                                <i className={`fa-solid ${icon} mr-2`}></i>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default SidebarFilters;
