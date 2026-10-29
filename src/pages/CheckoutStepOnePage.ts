
import { Page, Locator, Expect, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CheckoutCustomer as GuestUser } from "@utils/DataGenerator";


/**
 * Checkout step 1 - guest details form (firstName / lastName / postalCode).
 *
 * problem_user quirk: the first valid submit clears `firstName` and shows
 * an inline error. Specs that exercise problem_user just submit twice; this
 * POM does NOT hide the quirk because the lesson uses it to demonstrate
 * dealing with flaky UIs.
 */

export class CheckoutStepOnePage extends BasePage {

    static readonly PATH = "/playwright/ttacart/checkout-step-one";

    private readonly title: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly postalCode: Locator;
    private readonly linkCancel: Locator;
    private readonly buttonContinue: Locator;
    private readonly errorBox: Locator;


    constructor(page: Page) {
        super(page, "CheckoutStepOnePage");
        this.title = page.getByTestId("title").or(page.getByText("Checkout: Your Information"));
        this.firstNameInput = page.locator("#first-name").or(page.getByTestId("firstName"));
        this.lastNameInput = page.locator("#last-name").or(page.getByTestId("lastName"));
        this.postalCode = page.locator("#postal-code").or(page.getByTestId("postalCode"));
        this.linkCancel = page.getByRole("link", { name: "Cancel" });
        this.buttonContinue = page.getByRole("button", { name: "Continue" });
        this.errorBox = page.locator('[data-test="error"]');

    }

    async open(): Promise<void> {
        await this.goto(CheckoutStepOnePage.PATH);
        await this.assertLoad();
    }

    async assertLoad(): Promise<void> {
        await expect(this.title).toContainText("Checkout");
        await expect(this.firstNameInput).toBeVisible();
    }

    async fillGuest(g: GuestUser): Promise<void> {
        await this.el.fill(this.firstNameInput, g.firstName);
        await this.el.fill(this.lastNameInput, g.lastName);
        await this.el.fill(this.postalCode, g.postalCode);

    }

    async continue(): Promise<void> {
        await this.el.click(this.buttonContinue);
        // For valid input the page navigates to step 2; for invalid it stays.
        // Don't blindly assert here - let the spec verify post-state.
    }

    async cancel(): Promise<void> {
        await this.el.click(this.linkCancel);
        await this.page.waitForLoadState("domcontentloaded");
    }

    async expectErrorContains(text: string): Promise<void> {
        await expect(this.errorBox).toBeVisible();
        await expect(this.errorBox).toContainText(text);
    }

    /**
     * Read-only access to the firstName value. Used by tests that check the
     * problem_user "auto-clear on continue" behaviour.
     */

    async firstNameValue(): Promise<void> {
        this.el.getValue(this.firstNameInput);
    }
}
