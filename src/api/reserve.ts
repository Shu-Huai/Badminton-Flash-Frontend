import http from './http';
import type {ReserveDTO, ReserveResultVO} from '../types/api';

export async function reserve(payload: ReserveDTO): Promise<string> {
    return http.post('/reserve', payload);
}

export async function getReserveResult(traceId: string): Promise<ReserveResultVO> {
    return http.get(`/reserve/result/${traceId}`);
}

export async function cancelReservation(reservationId: number): Promise<void> {
    return http.delete(`/reserve/${reservationId}`);
}
