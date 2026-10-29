
import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TTACart "Checkout: Complete!" page — the order confirmation screen.
 *
 *   const complete = new CheckoutCompletePage(page);
 *   await complete.assertOrderComplete();
 *   await complete.backHome();
 */

export class CheckoutCompletePage extends BasePage {

    static readonly PATH = "/playwright/ttacart/checkout-complete";
    private readonly title: Locator;
    private readonly completeHeader: Locator;
    private readonly completeText: Locator;
    private readonly backHomeButton: Locator;

    constructor(page: Page) {

        super(page, "CheckoutCompletePage");
        this.title = page.getByTestId("title").or(page.getByText("Checkout: Complete!"));
        this.completeHeader = page.getByTestId("complete-header").or(page.getByRole("heading", { name: "Thank you for your order!" }));
        this.completeText = page.getByTestId("complete-text");
        this.backHomeButton = page.getByTestId("back-to-products").or(page.getByRole("link", { name: "Back Home" }));

    }

    async assertLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/checkout-complete(\.html)?$/);
        await expect(this.title).toContainText('Checkout: Complete!');
    }

    /** The order succeeded: confirmation header is shown. */
    async assertOrderComplete(): Promise<void> {
        await this.assertLoaded();
        await expect(this.completeHeader).toContainText('Thank you for your order!');
    }

    async confirmationText(): Promise<string> {
        return this.el.getText(this.completeText);
    }

    async backHome(): Promise<void> {
        await this.el.click(this.backHomeButton);
        await this.page.waitForLoadState('domcontentloaded');
    }
}
