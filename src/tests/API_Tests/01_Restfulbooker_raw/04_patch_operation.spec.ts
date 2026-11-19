
import { test, expect } from "@playwright/test";
import logger from "@utils/Logger";

// PATCH
// Create Token -> Post Auth -> token
// Create Booking -> Post Booking -> bookng ID
// by using this token and bookingid
// we can make the PATCH request.

test.describe("Restful Booker booking API", () => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";
    test("TC#1 @p0 - PATCH : Verify that partial update the existing booking is working fine.", async ({ request }) => {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const payload = {
            firstname: 'Seema',
            lastname: 'Mangate',
        };
        const Postpayload = {
            firstname: 'Rahul',
            lastname: 'Mangate',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        };

        let token = "";
        let bookingid = 0;

        await test.step("Step 1 - Create auth token", async () => {

            const responseData = await request.post(`${baseUrl}/auth`, {
                headers,
                data: {
                    username: 'admin',
                    password: 'password123',
                },
            });
            expect(responseData.status()).toBe(200);
            const data = await responseData.json();
            token = data.token;
            expect(token).toBeTruthy();
            logger.info('Created auth token for PATCH booking flow');
        });

        await test.step("Step 2 - Create booking to partially update", async () => {

            const reponseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: Postpayload,
            });
            expect(reponseData.status()).toBe(200);
            const data = await reponseData.json();
            bookingid = data.bookingid;
            expect(bookingid).toBeTruthy();
            logger.info(`Created booking id for partial update: ${bookingid}`);

        });

        await test.step("Step 3 - Partial Update booking", async () => {
            const responseData = await request.patch(`${baseUrl}/booking/${bookingid}`, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`
                },
                data: payload,
            });
            expect(responseData.status()).toBe(200);
            const data = await responseData.json();
            console.log(data);
            expect(data.firstname).toBe(payload.firstname);
            expect(data.lastname).toBe(payload.lastname);
            logger.info(`Partially updated booking id ${bookingid}: ${data.firstname} ${data.lastname}`);
        });

    });

});