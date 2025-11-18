// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    if (!user) {
        return <Navigate to="/" state={{
            message: "bạn cần đăng nhập để truy cập trang này",
            status: "warning",
            from: location
        }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate 
            to="/unauthorized" 
                state={{
                message: "bạn cần không có quyền truy cập trang này",
                status: "warning",
                from: location
            }}
            replace 
        />;
    }

    return children;
};

export default ProtectedRoute;