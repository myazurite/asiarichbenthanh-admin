import React, { createContext, useState } from 'react';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [selectedCategoryID, setSelectedCategoryID] = useState('');

    return (
        <CategoryContext.Provider value={{ selectedCategoryID, setSelectedCategoryID }}>
            {children}
        </CategoryContext.Provider>
    );
};
