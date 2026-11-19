
import { test, expect } from "@playwright/test";
import logger from "@utils/Logger";

// PUT - Negative
// No token / invalid token  -> 403
// Booking id does not exist -> 405 (this API returns 405 here, not 404)
// Required field missing    -> 400

test.describe("Restful Booker booking API - PUT negative scenarios", () => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
    const Postpayload = {
        firstname: 'Jim',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
            checkin: '2018-01-01',
            checkout: '2019-01-01',
        },
        additionalneeds: 'Breakfast',
    };
    const payload = {
        firstname: 'Pramod',
        lastname: 'Dutta',
        totalprice: 114,
        depositpaid: true,
        bookingdates: {
            checkin: '2018-01-01',
            checkout: '2018-01-05',
        },
        additionalneeds: 'Breakfast, Dinner',
    };
    test("TC#3 @p1 - PUT : Verify that update without a token is rejected.", async ({ request }) => {

        let bookingid = 0;

        await test.step("Step 1 - Create booking to update", async () => {
            const responseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: Postpayload,
            });
            expect(responseData.status()).toBe(200);
            const data = await responseData.json();
            bookingid = data.bookingid;
            expect(bookingid).toBeTruthy();
            logger.info(`Created booking id for update: ${bookingid}`);
        });

        await test.step("Step 2 - Update booking without a token", async () => {
            const responseData = await request.put(`${baseUrl}/booking/${bookingid}`, {
                headers,
                data: payload,
            });
            expect(responseData.status()).toBe(403);
        });
    });

    test("TC#4 @p1 - PUT : Verify that update with an invalid token is rejected.", async ({ request }) => {
        let bookingId = 0;

        await test.step("Step 1 - Create booking to update", async () => {

            const responseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: Postpayload,
            });
            expect(responseData.status()).toBe(200);

            const data = await responseData.json();
            bookingId = data.bookingid;
            expect(bookingId).toBeTruthy();
            logger.info(`Created booking id for update: ${bookingId}`);
        });

        await test.step("Step 2 - Update booking with an invalid token", async () => {

            const responseData = await request.put(`${baseUrl}/booking/${bookingId}`, {
                headers: {
                    ...headers,
                    Cookie: "token=invalidToken123",
                },
                data: payload
            });
            expect(responseData.status()).toBe(403);

        });
    });

    test("TC#5 @p1 - PUT : Verify that update of a non-existent booking is rejected.", async ({ request }) => {

        let token = "";

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
            logger.info('Created auth token for PUT booking flow');
        });

        await test.step("Step 2 - Update a booking id that does not exist", async () => {
            const responseData = await request.put(`${baseUrl}/booking/999999`, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`,
                },
                data: payload,
            });
            expect(responseData.status()).toBe(405);
        });
    });

    test('TC#6 @p1 - PUT : Verify that update with a missing required field is rejected.', async ({ request }) => {

        let token = '';
        let bookingId = 0;

        await test.step('Step 1 - Create auth token', async () => {

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
            logger.info('Created auth token for PUT booking flow');
        });

        await test.step('Step 2 - Create booking to update', async () => {

            const responseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: payload,
            });
            expect(responseData.status()).toBe(200);

            const data = await responseData.json();
            bookingId = data.bookingid;
            expect(bookingId).toBeTruthy();
            logger.info(`Created booking id for update: ${bookingId}`);
        });

        await test.step('Step 3 - Update booking without firstname', async () => {

            const responseData = await request.put(`${baseUrl}/booking/${bookingId}`, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`,
                },
                data: {
                    lastname: 'Dutta',
                    totalprice: 111,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2018-01-01',
                        checkout: '2019-01-01',
                    },
                    additionalneeds: 'Breakfast',
                },
            });
            expect(responseData.status()).toBe(400);
        });
    });

});
