import http from './http';
import type {UserDTO} from '../types/api';

export async function register(payload: UserDTO): Promise<string> {
    return http.post('/auth/register', payload);
}

export async function login(payload: UserDTO): Promise<string> {
    return http.post('/auth/login', payload);
}
