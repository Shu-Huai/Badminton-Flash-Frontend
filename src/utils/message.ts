interface MessageApiLike {
    error: (
        content: string,
        options?: {
            duration?: number;
            keepAliveOnHover?: boolean;
        },
    ) => void;
}

let messageApi: MessageApiLike | null = null;

export function setMessageApi(api: MessageApiLike): void {
    messageApi = api;
}

export function clearMessageApi(): void {
    messageApi = null;
}

export function showErrorMessage(content: string): void {
    if (!messageApi) {
        return;
    }
    messageApi.error(content, {
        duration: 3000,
        keepAliveOnHover: true,
    });
}
