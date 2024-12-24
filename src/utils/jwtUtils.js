import { jwtDecode } from 'jwt-decode'; // Corrected import

export const getCompanyID = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token); // Decode the token
        return decoded.company_id; // Retrieve company_id from the decoded payload
    }
    return null; // Return null if no token exists
};

export const getPermissionLevel = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token); // Decode the token
        return decoded.permission_level; // Retrieve permission_level from the decoded payload
    }
    return null; // Return null if no token exists
};

export const getRoleID = () => {
    const token = localStorage.getItem('token')  ;
    if(token){
        const decoded = jwtDecode(token);
        return decoded.role_id;
    }
    return null;
};

export const getEmployeeID = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        return decoded.employee_id; // Access employee_id from the decoded token
    }
    return null;
};