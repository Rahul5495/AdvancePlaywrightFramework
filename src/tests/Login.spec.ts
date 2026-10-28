
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("POM with Login Page Simple", () => {

    test("Login with valid credentials", async ({ page }) => {

        // This is without the POM
        // await page.goto('https://app.thetestingacademy.com/playwright/ttacart/');
        // await page.getByRole("textbox", { name: "Username" }).fill;
        // With POM
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.loginAs("standard_user", "tta_secret");
    
    });
});