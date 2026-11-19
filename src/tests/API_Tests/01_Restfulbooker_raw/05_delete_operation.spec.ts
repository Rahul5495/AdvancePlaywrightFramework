
import { test, expect } from "@playwright/test";
import logger from "@utils/Logger";

// Delete
// Create Token -> Post Auth -> token
// Create Booking -> Post Booking -> bookng ID
// by using this token and bookingid
// we can make the delete request.

test.describe("Restful Booker booking API", () => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";
    test("TC#1 @p0 - DELETE : Verify that deleted the existing booking is working fine.", async ({ request }) => {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
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
            logger.info('Created auth token for Delete booking flow');
        });

        await test.step("Step 2 - Create booking", async () => {

            const reponseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: Postpayload,
            });
            expect(reponseData.status()).toBe(200);
            const data = await reponseData.json();
            bookingid = data.bookingid;
            expect(bookingid).toBeTruthy();
            logger.info(`Created booking id for delete: ${bookingid}`);

        });

        await test.step("Step 3 - Delete booking", async () => {
            const responseData = await request.delete(`${baseUrl}/booking/${bookingid}`, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`
                },
            });
            expect(responseData.status()).toBe(201);
            logger.info(`Deleted booking id ${bookingid}`);
        });

        await test.step("Step 4 - Get deleted booking", async () => {
            const responseData = await request.get(`${baseUrl}/booking/${bookingid}`, {
                headers: {
                    ...headers,
                },
            });
            expect(responseData.status()).toBe(404);
            logger.info(`Deleted booking id is not found ${bookingid}`);
        });

    });

});