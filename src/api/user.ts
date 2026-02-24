import http from './http';
import type {UserAccountVO, UserSelfUpdateDTO} from '../types/api';

export async function getMe(): Promise<UserAccountVO> {
    return http.get('/user/me');
}

export async function updateMe(payload: UserSelfUpdateDTO): Promise<void> {
    return http.patch('/user/me', payload);
}

export async function deleteMe(): Promise<void> {
    return http.delete('/user/me');
}
