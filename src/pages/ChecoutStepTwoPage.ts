

import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Checkout step 2 - the overview page with subtotal / tax / total.
 *
 * The markup renders each total as a full sentence inside one node, e.g.
 *   `<div data-test="subtotal-label">Item total: $29.99</div>`
 * so we parse the trailing dollar amount with a small regex helper.
 */


export class CheckoutStepTwoPage extends BasePage {

    static readonly PATH = "/playwright/ttacart/checkout-step-two";
    private readonly title: Locator;
    private readonly subtotalLabel: Locator;
    private readonly taxLabel: Locator;
    private readonly totalLabel: Locator;
    private readonly finishButton: Locator;
    private readonly cancelButton: Locator;

    constructor(page: Page) {

        super(page, "CheckoutStepTwoPage");
        this.title = page.getByTestId("title").or(page.getByText("Checkout: Overview"));
        this.subtotalLabel = page.getByTestId("subtotal-label").or(page.getByText("Item total: $15.99"));
        this.taxLabel = page.getByTestId("tax-label").or(page.getByText("Tax: $1.28"));
        this.totalLabel = page.locator('[data-test="total-label"]');
        this.finishButton = page.getByTestId("finish").or(page.getByRole("button", { name: "Finish" })).or(page.locator("#finish-btn"));
        this.cancelButton = page.getByTestId("cancel").or(page.getByRole("link", { name: "Cancel" })).or(page.getByText("Cancel"));

    }

    async assertLoad(): Promise<void> {

        await expect(this.title).toContainText("Overview");
        await expect(this.subtotalLabel).toBeVisible();
    }

    private async parseMoney(loc: Locator): Promise<number> {
        const raw = (await loc.textContent()) ?? '';
        const match = raw.match(/\$([0-9]+\.[0-9]{2})/);
        if (!match) throw new Error(`Could not parse money from "${raw}"`);
        return Number(match[1]);
    }

    async subTotal(): Promise<number> {
        return this.parseMoney(this.subtotalLabel);
    }

    async tax(): Promise<number> {
        return this.parseMoney(this.taxLabel);
    }

    async total(): Promise<number> {
        return this.parseMoney(this.totalLabel);
    }

    async finish(): Promise<void> {
        await this.el.click(this.finishButton);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async cancel(): Promise<void> {
        await this.el.click(this.cancelButton);
        await this.page.waitForLoadState('domcontentloaded');
    }
}
