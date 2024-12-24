import { jwtDecode } from 'jwt-decode'; // Corrected import

export const getCompanyID = () => {
    if (typeof window !== 'undefined') { // Check if window is defined
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token); // Decode the token
            return decoded.company_id; // Retrieve company_id from the decoded payload
        }
    }
    return null; // Return null if no token exists or window is not defined
};

export const getPermissionLevel = () => {
    if (typeof window !== 'undefined') { // Check if window is defined
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token); // Decode the token
            return decoded.permission_level; // Retrieve permission_level from the decoded payload
        }
    }
    return null; // Return null if no token exists or window is not defined
};

export const getRoleID = () => {
    if (typeof window !== 'undefined') { // Check if window is defined
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            return decoded.role_id; // Retrieve role_id from the decoded payload
        }
    }
    return null; // Return null if no token exists or window is not defined
};

export const getEmployeeID = () => {
    if (typeof window !== 'undefined') { // Check if window is defined
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token); // Decode the token
            return decoded.employee_id; // Access employee_id from the decoded token
        }
    }
    return null; // Return null if no token exists or window is not defined
};
