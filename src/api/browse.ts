import http from './http';
import type {Court, FlashSession, Reservation, ReservationStatus, TimeSlot,} from '../types/api';
import {appendArrayIfPresent, appendIfPresent, toQueryString} from '../utils/query';

export interface SessionQuery {
    flashTimeLowerBound?: string;
    flashTimeUpperBound?: string;
    beginTimeLowerBound?: string;
    beginTimeUpperBound?: string;
    endTimeLowerBound?: string;
    endTimeUpperBound?: string;
    slotIntervalLowerBound?: number;
    slotIntervalUpperBound?: number;
}

export interface SlotQuery {
    sessionId: number;
    dateLowerBound?: string;
    dateUpperBound?: string;
    courtIds?: number[];
    startTimeLowerBound?: string;
    startTimeUpperBound?: string;
    endTimeLowerBound?: string;
    endTimeUpperBound?: string;
}

export interface ReservationQuery {
    sessionId?: number;
    slotId?: number;
    statuses?: ReservationStatus[];
    dateLowerBound?: string;
    dateUpperBound?: string;
}

export async function getSessions(query: SessionQuery = {}): Promise<FlashSession[]> {
    const params = new URLSearchParams();
    appendIfPresent(params, 'flashTimeLowerBound', query.flashTimeLowerBound);
    appendIfPresent(params, 'flashTimeUpperBound', query.flashTimeUpperBound);
    appendIfPresent(params, 'beginTimeLowerBound', query.beginTimeLowerBound);
    appendIfPresent(params, 'beginTimeUpperBound', query.beginTimeUpperBound);
    appendIfPresent(params, 'endTimeLowerBound', query.endTimeLowerBound);
    appendIfPresent(params, 'endTimeUpperBound', query.endTimeUpperBound);
    appendIfPresent(params, 'slotIntervalLowerBound', query.slotIntervalLowerBound);
    appendIfPresent(params, 'slotIntervalUpperBound', query.slotIntervalUpperBound);
    return http.get(`/browse/session${toQueryString(params)}`);
}

export async function getSession(id: number): Promise<FlashSession> {
    return http.get(`/browse/session/${id}`);
}

export async function isSessionOpen(sessionId: number): Promise<boolean> {
    return http.get(`/browse/open/${sessionId}`);
}

export async function getCourts(courtNameLike?: string): Promise<Court[]> {
    const params = new URLSearchParams();
    appendIfPresent(params, 'courtNameLike', courtNameLike);
    return http.get(`/browse/court${toQueryString(params)}`);
}

export async function getCourt(id: number): Promise<Court> {
    return http.get(`/browse/court/${id}`);
}

export async function getSlot(id: number): Promise<TimeSlot> {
    return http.get(`/browse/slot/${id}`);
}

export async function getSlots(query: SlotQuery): Promise<TimeSlot[]> {
    const params = new URLSearchParams();
    appendIfPresent(params, 'sessionId', query.sessionId);
    appendIfPresent(params, 'dateLowerBound', query.dateLowerBound);
    appendIfPresent(params, 'dateUpperBound', query.dateUpperBound);
    appendArrayIfPresent(params, 'courtIds', query.courtIds);
    appendIfPresent(params, 'startTimeLowerBound', query.startTimeLowerBound);
    appendIfPresent(params, 'startTimeUpperBound', query.startTimeUpperBound);
    appendIfPresent(params, 'endTimeLowerBound', query.endTimeLowerBound);
    appendIfPresent(params, 'endTimeUpperBound', query.endTimeUpperBound);
    return http.get(`/browse/slot${toQueryString(params)}`);
}

export async function getReservations(query: ReservationQuery = {}): Promise<Reservation[]> {
    const params = new URLSearchParams();
    appendIfPresent(params, 'sessionId', query.sessionId);
    appendIfPresent(params, 'slotId', query.slotId);
    appendArrayIfPresent(params, 'statuses', query.statuses);
    appendIfPresent(params, 'dateLowerBound', query.dateLowerBound);
    appendIfPresent(params, 'dateUpperBound', query.dateUpperBound);
    return http.get(`/browse/reservation${toQueryString(params)}`);
}
