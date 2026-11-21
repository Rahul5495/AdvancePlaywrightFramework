
import { test, expect } from "@playwright/test";
import logger from "@utils/Logger";


interface Bookingpayload {
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

interface AuthTokenResponse {
    token: string;
}

interface CreateBookingResponse {
    bookingid: number;
    booking: Bookingpayload;
}

interface BookingFlowState {
    token?: string;
    bookingId?: number;
}

test.describe.serial("Restful Booker CRUD API", () => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const payload: Bookingpayload = {
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

    const Updatedpayload: Bookingpayload = {
        firstname: 'Pramod',
        lastname: 'Mangate',
        totalprice: 115,
        depositpaid: true,
        bookingdates: {
            checkin: '2019-01-01',
            checkout: '2019-01-02',
        },
        additionalneeds: 'Breakfast, Dinner',
    };

    const bookingFlowState: BookingFlowState = {};

    test("TC#1 @p0 - Create token", async ({ request }) => {
        await test.step("Create token", async () => {
            const responseData = await request.post(`${baseUrl}/auth`, {
                headers,
                data: {
                    username: process.env.BOOKER_USERNAME,
                    password: process.env.BOOKER_PASSWORD,
                },
            });

            expect(responseData.status()).toBe(200);
            const Data = await responseData.json() as AuthTokenResponse;
            expect(Data.token).toBeTruthy();
            bookingFlowState.token = Data.token;
        });
    });

    test("TC#2 @p0 - Create booking", async ({ request }) => {

        await test.step("Create booking", async () => {
            const responseData = await request.post(`${baseUrl}/booking`, {
                headers,
                data: payload,
            });

            expect(responseData.status()).toBe(200);
            const data = await responseData.json() as CreateBookingResponse;
            expect(data.bookingid).toBeTruthy();
            expect(data.booking.firstname).toBe(payload.firstname);
            expect(data.booking.lastname).toBe(payload.lastname);
            bookingFlowState.bookingId = data.bookingid;
            logger.info(`Created booking id for CRUD flow: ${bookingFlowState.bookingId}`);
        });
    });

    test("TC#3 @p0 - Update booking", async ({ request }) => {

        await test.step("Update booking", async () => {
            const token = bookingFlowState.token;
            const bookingId = bookingFlowState.bookingId;

            if (!token || !bookingId) {
                throw new Error("Create token and create booking tests must pass before update booking.");
            };

            const responseData = await request.put(`${baseUrl}/booking/${bookingId}`, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`
                },
                data: Updatedpayload,
            });

            expect(responseData.status()).toBe(200);
            const data = await responseData.json() as Bookingpayload;
            expect(data.firstname).toBe(Updatedpayload.firstname);
            expect(data.lastname).toBe(Updatedpayload.lastname);
            logger.info(`Updated booking id ${bookingId}: ${data.firstname} ${data.lastname}`);
        });
    });

});