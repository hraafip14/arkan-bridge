import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles}) => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{display: 'flex', alignItems: 'center',
                justifyContent: 'center', height: '100vh'}}>
                <img src="/assets/loading.png" alt="" />
                <p>Loading...</p>
                </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;