import React, { useState, useEffect } from 'react';

function SearchBar({ placeholder, value, setValue }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setValue(localValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue, setValue]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className="search-container mb-4">
      <input
        type="text"
        className="w-full p-3 rounded-md border-2 border-red-200 bg-white text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
}

export default SearchBar;
