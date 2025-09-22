
import { BackgroundContainer } from './style.js'
import { useNavigate} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/slices/authSlice'
import FormAuth from '@/components/FormAuth/FormAuth'
import * as Message from '@/components/Message/Message'
import { AuthService } from '@/services/AuthService'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
const AuthPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const mutationAuth = useMutation({
        mutationFn: async (data) => {
            if (isRegister) {
                return await AuthService.register(data);
            }
            return await AuthService.login(data);
        },
        onSuccess: (data) => {
            if (data.status === "success") {
                Message.success(data.message);
                if (!isRegister) {
                    const { user, accessToken } = data.data;
                    // lưu thông tin đăng nhập vào redux
                    const newUser = {
                        ...user,
                        accessToken
                    };
                    dispatch(setUser(newUser));
                    navigate('/admin');
                } else {
                    setIsRegister(!isRegister);
                }
            } else {
                Message.error(data.message);
            }
        },
        onError: (error) => {
            Message.error(error.response.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
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