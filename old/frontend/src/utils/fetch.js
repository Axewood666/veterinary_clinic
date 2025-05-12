const fetchWithAuth = async (url, token, options = {}) => {
    const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

module.exports = { fetchWithAuth };
