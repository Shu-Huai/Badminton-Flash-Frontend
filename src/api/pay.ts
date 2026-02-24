import http from './http';
import type {PayOrderResultVO, WechatPayCreateVO} from '../types/api';

export async function createWechatPay(reservationId: number): Promise<WechatPayCreateVO> {
    return http.post(`/pay/wechat/${reservationId}`);
}

export async function mockWechatPaySuccess(outTradeNo: string): Promise<void> {
    return http.post(`/pay/wechat/mock-success/${outTradeNo}`);
}

export async function refund(reservationId: number): Promise<void> {
    return http.post(`/pay/refund/${reservationId}`);
}

export async function getPayResult(reservationId: number): Promise<PayOrderResultVO> {
    return http.get(`/pay/reservation/${reservationId}`);
}
