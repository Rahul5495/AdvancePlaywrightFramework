
import { test, expect } from "@fixtures/test-base";
import { DataGenerator } from "@utils/DataGenerator";
import { createLogger } from "@utils/Logger";
import { visualStep } from "@utils/visualSteps";


// First product card on the TTACart inventory page.
const FIRST_ITEM_ID = "test-allthethings-tshirt-red";
const log = createLogger("e2e-checkout_Validfixtures");

test.describe("@P0 @Regression E2E @Checkout Checkout Feature", () => {
    test("should complete checkout successfully", async ({
        page,
        validLogin,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        void validLogin;
        const customer = DataGenerator.checkoutCustomer();

        // validLogin already lands on inventory, so assert it instead of reloading.
        await visualStep(page, "Inventory page: add first item to cart", async () => {
            await inventoryPage.assertLoaded();
            await inventoryPage.addToCart(FIRST_ITEM_ID);
        });

        // visualStep screenshots when its body ends, so each step opens its own
        // page first and leaves the click to the next page for the following step.
        await visualStep(page, "Cart page: verify one item in cart", async () => {
            await cartPage.open();
            expect(await cartPage.rowCount()).toBe(1);
        });

        await visualStep(page, "Checkout step one: enter customer details", async () => {
            await cartPage.checkout();
            await checkoutStepOnePage.assertLoad();
            await checkoutStepOnePage.fillGuest(customer);
        });

        await visualStep(page, "Checkout step two: review order overview", async () => {
            await checkoutStepOnePage.continue();
            await checkoutStepTwoPage.assertLoaded();
        });

        await visualStep(page, "Checkout complete: finish and verify confirmation", async () => {
            await checkoutStepTwoPage.finish();
            await checkoutCompletePage.assertOrderComplete();
        });
    });

    // invalidLogin submits locked_out_user and waits for the error box, so the
    // test only has to check what the user sees and that they never got in.
    test("should reject login for a locked-out user", async ({ page, invalidLogin }) => {
        const { loginPage, username } = invalidLogin;

        await visualStep(page, `Login Page: ${username} sees locked-out error`, async () => {
            await loginPage.expectErrorContains("locked out");
            await expect(page).not.toHaveURL(/inventory/);

        });
    });
});
