
import { BackgroundContainer } from './style.js'
import { useNavigate, useLocation} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/slices/authSlice'
import FormAuth from '@/components/FormAuth/FormAuth'
import * as Message from '@/components/Message/Message'
import { AuthService } from '@/services/AuthService'
import { useMutation } from '@tanstack/react-query'
import { useState,useEffect } from 'react'
const AuthPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    // lấy state từ location để kiểm tra nếu có chuyển từ trang khác đến
    const state = location.state || {};
    useEffect(() => {
        if (state.message) {
            Message.info(state.message);
        }
    }, [state.message]);
    const mutationAuth = useMutation({
        mutationFn: async (data) => {
            if (isRegister) {
                return await AuthService.register(data);
            }
            return await AuthService.login(data);
        },
        onSuccess: (data) => {
            if (data.status === "success") {
                if (!isRegister) {
                    const { account, accessToken } = data.data;
                    // lưu thông tin đăng nhập vào redux
                    const newAccount = {
                        ...account,
                        accessToken
                    };
                    dispatch(setUser(newAccount));
                    console.log('account.role',account.role);
                    if(account.role =='admin'){
                        navigate("/admin/dashboard");
                        return;
                    }
                    navigate("/doctor/dashboard");
                } else {
                    setIsRegister(!isRegister);
                }
                Message.success(data.message);
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error?.response?.data?.message || error.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
        },
    });
    const isPending = mutationAuth.isPending;
    const handleOnSubmit = (data) => {
        mutationAuth.mutate(data);
    };
    const handleOnChangeForm = () => {
        setIsRegister(!isRegister);
    };
    return (
        <BackgroundContainer>
            <FormAuth
                isRegister={isRegister}
                onSubmit={handleOnSubmit}
                onChangeForm={handleOnChangeForm}
                isPending={isPending}
            />
        </BackgroundContainer>
    )
}

export default AuthPage