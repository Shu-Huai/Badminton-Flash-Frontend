import axios, {AxiosError} from 'axios';
import type {ApiResponse} from '../types/api';
import {clearToken, getToken, setToken} from '../utils/authToken';
import {showErrorMessage} from '../utils/message';

export class ApiError extends Error {
    code: number;
    enumCode?: string;

    constructor(message: string, code: number, enumCode?: string) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.enumCode = enumCode;
    }
}

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
    timeout: 15000,
});

http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (response) => {
        const authHeader =
            (response.headers.authorization as string | undefined) ??
            (response.headers.Authorization as string | undefined);

        if (authHeader?.startsWith('Bearer ')) {
            setToken(authHeader.slice(7).trim());
        }

        const payload = response.data as ApiResponse<unknown>;
        if (typeof payload?.code !== 'number') {
            return response.data;
        }

        if (payload.code !== 200) {
            if (payload.enumCode === 'TOKEN_EXPIRED' || payload.enumCode === 'TOKEN_INVALID') {
                clearToken();
            }
            showErrorMessage(payload.message || '请求失败');
            throw new ApiError(payload.message || '请求失败', payload.code, payload.enumCode);
        }
        return payload.data;
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.data && typeof error.response.data.code === 'number') {
            const payload = error.response.data;
            if (payload.enumCode === 'TOKEN_EXPIRED' || payload.enumCode === 'TOKEN_INVALID') {
                clearToken();
            }
            showErrorMessage(payload.message || '请求失败');
            throw new ApiError(payload.message || '请求失败', payload.code, payload.enumCode);
        }
        if (error.code === 'ECONNABORTED') {
            showErrorMessage('请求超时');
            throw new ApiError('请求超时', -1);
        }
        if (error.message) {
            showErrorMessage(error.message);
            throw new ApiError(error.message, -1);
        }
        showErrorMessage('网络错误');
        throw new ApiError('网络错误', -1);
    },
);

export default http;
