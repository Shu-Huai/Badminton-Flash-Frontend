import http from './http';
import type {AdminUserDTO, ConfigDTO, ConfigKey, FlashSessionDTO, UserAccountVO,} from '../types/api';

export async function getSystemConfig(): Promise<ConfigDTO> {
    return http.get('/admin/system');
}

export async function getSystemConfigValue(configKey: ConfigKey): Promise<string> {
    return http.get(`/admin/system/${configKey}`);
}

export async function updateSystemConfig(payload: ConfigDTO): Promise<void> {
    return http.patch('/admin/system', payload);
}

export async function updateSystemConfigValue(configKey: ConfigKey, value: string): Promise<void> {
    return http.patch(`/admin/system/${configKey}`, value, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}

export async function addSession(payload: FlashSessionDTO): Promise<void> {
    return http.post('/admin/session', payload);
}

export async function updateSession(id: number, payload: FlashSessionDTO): Promise<void> {
    return http.patch(`/admin/session/${id}`, payload);
}

export async function deleteSession(id: number): Promise<void> {
    return http.delete(`/admin/session/${id}`);
}

export async function warmupSession(sessionId: number): Promise<void> {
    return http.post(`/admin/warmup/${sessionId}`);
}

export async function openSession(sessionId: number): Promise<void> {
    return http.post(`/admin/open/${sessionId}`);
}

export async function generateSlot(sessionId: number): Promise<void> {
    return http.post(`/admin/slot-gen/${sessionId}`);
}

export async function listUsers(): Promise<UserAccountVO[]> {
    return http.get('/admin/users');
}

export async function getUser(id: number): Promise<UserAccountVO> {
    return http.get(`/admin/users/${id}`);
}

export async function createUser(payload: AdminUserDTO): Promise<void> {
    return http.post('/admin/users', payload);
}

export async function updateUser(id: number, payload: AdminUserDTO): Promise<void> {
    return http.patch(`/admin/users/${id}`, payload);
}

export async function deleteUser(id: number): Promise<void> {
    return http.delete(`/admin/users/${id}`);
}
