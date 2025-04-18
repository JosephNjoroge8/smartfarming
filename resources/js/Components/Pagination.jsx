import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-center py-4">
            <div className="flex flex-wrap -mb-1">
                {links.map((link, key) => (
                    <div key={key} className="mr-1 mb-1">
                        {link.url === null ? (
                            <span className="px-4 py-2 text-sm border rounded text-gray-400">
                                {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                            </span>
                        ) : (
                            <Link
                                href={link.url}
                                className={`px-4 py-2 text-sm border rounded ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}