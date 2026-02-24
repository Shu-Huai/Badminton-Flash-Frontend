import {defineStore} from 'pinia';

export const useLegacyBookingStore = defineStore('legacy-booking', {
    state: () => ({
        note: 'legacy-stub',
    }),
});
