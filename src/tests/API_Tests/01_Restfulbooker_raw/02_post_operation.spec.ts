import { test, expect } from "@playwright/test";
import logger from "@utils/Logger";

// HTTP -> POST 
// URL => https://restful-booker.herokuapp.com/booking
// PAYLOAD / request body /. Body / data -> json file or js object
// headers  - content-type json
// auth ? 

test("TC#1 @p0 - POST : Verify that create booking is working fine", async ({ request }) => {

    const payload = {
        firstname: "Jim",
        lastname: "Brown",
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
            checkin: "2018-01-01",
            checkout: "2019-01-01",
        },
        additionalneeds: "Breakfast",
    };
    logger.info(`Payload is set: ${JSON.stringify(payload)}`);

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    };
    logger.info(`Header is set: ${JSON.stringify(headers)}`);

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";

    const responseData = await request.post(`${baseUrl}/booking`, {
        headers,
        data: payload,
    });
    expect(responseData.status()).toBe(200);
    const data = await responseData.json();
    logger.info(`Response is set: ${JSON.stringify(data)}`);
    expect(data.bookingid).toBeTruthy();
    expect(data.booking.firstname).toBe(payload.firstname);
    expect(data.booking.lastname).toBe(payload.lastname);
    expect(data.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    logger.info(`Created booking id: ${data.bookingid}`);

});