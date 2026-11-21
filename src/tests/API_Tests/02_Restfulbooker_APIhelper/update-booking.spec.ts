
import { test, expect } from "@playwright/test";
import { APIHelper } from "@utils/APIHelper";


interface BookingPayload {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: BookingDates;
    additionalneeds: string;
}
interface BookingDates {
    checkin: string;
    checkout: string;
}


test.describe("@P0 @regression Level 2 (ApiHelper) - PUT update booking", () => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";

    test("PUT /booking/{id} replaces the booking with a Cookie token", async ({ request }) => {
        const api = new APIHelper(request);

        // 1. Token.
        const authRes = await api.post(`${baseUrl}/auth`, {
            username: process.env.BOOKER_USERNAME,
            password: process.env.BOOKER_PASSWORD
        });

        const { token } = await api.parseJsonResponse<{ token: string }>(authRes);
        expect(token).toBeTruthy();

        // 2. Create something to update.

        const payload: BookingPayload = {
            firstname: 'Helper',
            lastname: 'Creator',
            totalprice: 640,
            depositpaid: false,
            bookingdates: { checkin: '2026-04-01', checkout: '2026-04-10' },
            additionalneeds: 'Breakfast',
        };
        const created = await api.post(`${baseUrl}/booking`, payload);
        const { bookingid } = await api.parseJsonResponse<{ bookingid: number }>(created);

        // 3. PUT with the Cookie header.
        const response = await api.put(`${baseUrl}/booking/${bookingid}`, {
            firstname: 'After',
            lastname: 'Helper',
            totalprice: 880,
            depositpaid: true,
            bookingdates: { checkin: '2026-05-02', checkout: '2026-05-09' },
            additionalneeds: 'Extra bed',
        },
            {
                headers: { Cookie: `token=${token}` },
            });

        expect(api.isSuccess(response)).toBe(true);
        const updated = await api.parseJsonResponse<{ firstname: string; totalprice: number }>(response);
        expect(updated.firstname).toBe("After");
        expect(updated.totalprice).toBe(880);

    });
});