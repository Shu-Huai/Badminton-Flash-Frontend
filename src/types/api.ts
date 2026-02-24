export type UserRole = 'USER' | 'ADMIN';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PENDING_PAYMENT';
export type ReserveResultStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PayOrderStatus = 'PAYING' | 'SUCCESS' | 'REFUNDED' | 'CLOSED' | 'FAILED';
export type PayChannel = 'WECHAT';
export type ConfigKey =
    | 'WARMUP_MINUTE'
    | 'PAY_TIMEOUT_MINUTE'
    | 'PAY_AMOUNT'
    | 'GENERATE_TIME_SLOT_TIME'
    | 'COURT_COUNT'
    | 'COURT_NAME_FORMAT';

export interface ApiResponse<T> {
    code: number;
    enumCode: string;
    message: string;
    data: T;
}

export interface UserDTO {
    studentId: string;
    password: string;
}

export interface UserSelfUpdateDTO {
    studentId?: string;
    oldPassword?: string;
    newPassword?: string;
}

export interface AdminUserDTO {
    studentId?: string;
    password?: string;
    userRole?: UserRole;
}

export interface ReserveDTO {
    slotId: number;
    sessionId: number;
}

export interface FlashSessionDTO {
    flashTime?: string;
    beginTime?: string;
    endTime?: string;
    slotInterval?: number;
}

export interface ConfigItemDTO {
    configKey: ConfigKey;
    value: string;
}

export interface ConfigDTO {
    configItems: ConfigItemDTO[];
}

export interface UserAccountVO {
    id: number;
    studentId: string;
    createTime: string;
    updateTime: string;
    userRole: UserRole;
    isActive: boolean;
}

export interface ReserveResultVO {
    traceId: string;
    status: ReserveResultStatus;
    reservationId: number | null;
    reservationStatus: ReservationStatus | null;
}

export interface PayOrderResultVO {
    reservationId: number;
    outTradeNo: string | null;
    payChannel: PayChannel | null;
    payStatus: PayOrderStatus | null;
    reservationStatus: ReservationStatus;
    amount: string | null;
    expireTime: string | null;
    updateTime: string | null;
}

export interface WechatPayCreateVO {
    reservationId: number;
    outTradeNo: string;
    prepayId: string;
    nonceStr: string;
    timeStamp: string;
    packageValue: string;
    signType: string;
    paySign: string;
}

export interface FlashSession {
    id: number;
    flashTime: string;
    beginTime: string;
    endTime: string;
    slotInterval: number;
    createTime: string;
    updateTime: string;
    isActive: number;
}

export interface Court {
    id: number;
    courtName: string;
    createTime: string;
    updateTime: string;
    isActive: boolean;
}

export interface TimeSlot {
    id: number;
    slotDate: string;
    startTime: string;
    endTime: string;
    courtId: number;
    sessionId: number;
    createTime: string;
    updateTime: string;
    isActive: boolean;
}

export interface Reservation {
    id: number;
    userId: number;
    slotId: number;
    traceId: string;
    status: ReservationStatus;
    activeSlotId: number | null;
    createTime: string;
    updateTime: string;
    isActive: boolean;
}
