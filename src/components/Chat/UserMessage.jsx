import React from 'react';

export const UserMessage = ({ content }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-indigo-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-xl shadow-sm">
        <p className="text-sm sm:text-base">{content}</p>
      </div>
    </div>
  );
};
