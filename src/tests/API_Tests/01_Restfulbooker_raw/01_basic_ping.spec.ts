import { test, expect } from "@playwright/test";

//  Ping Request.
// Ping request help you to test if the server is up.
// Client -> Server to check if all well.

// HTTP GET -> https://restful-booker.herokuapp.com/ping

test("ping request-GET", async ({ request }) => {

    const baseUrl = process.env.API_BASE_URL || "https://restful-booker.herokuapp.com";

    const responseData = await request.get(`${baseUrl}/ping`);
    console.log(responseData);
    expect(responseData.status()).toBe(201);

});