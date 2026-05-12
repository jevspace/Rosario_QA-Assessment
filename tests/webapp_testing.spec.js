import { test, expect } from '@playwright/test';

// Login
async function login(page) {
    await page.goto('https://www.saucedemo.com/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.locator('#login-button').click();
}

// TC-ATC-001
test('Add to Cart process', async ({ page }) => {

    // 1. Login and verify inventory page loads
    await login(page);
    await expect(page).toHaveURL(/inventory/);

    // 2. Verify products are displayed
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);

    // Capture product names before adding to cart fo "Verifying Part".
    const firstProductName = await page.locator('.inventory_item_name').first().innerText();
    const secondProductName = await page.locator('.inventory_item_name').nth(1).innerText();

    // 3. Add first product to cart
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // 4. Remove the product
    await page.locator('#remove-sauce-labs-backpack').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

    // 5. Add two products 
    await page.locator('#add-to-cart-sauce-labs-backpack').click();
    await page.locator('#add-to-cart-sauce-labs-bike-light').click();

    // 6. Verify cart badge updates
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // 7. Go to cart page
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // 7.1 VERIFY correct products are in cart
    const cartItems = page.locator('.cart_item .inventory_item_name');

    await expect(cartItems).toHaveCount(2);
    await expect(cartItems.nth(0)).toHaveText(firstProductName);
    await expect(cartItems.nth(1)).toHaveText(secondProductName);
});

// TC-ATC-002
test('Unauthorized Access to Inventory Page', async ({page}) => {
    await page.goto('https://www.saucedemo.com/inventory.html');
})


// TC-CHK-001				
test('Checkout process', async ({ page }) => {
    await login(page);

    // Setup: add product again
    await page.locator('#add-to-cart-sauce-labs-backpack').click();
    await page.locator('#add-to-cart-sauce-labs-bike-light').click();
    await page.locator('#add-to-cart-sauce-labs-bolt-t-shirt').click();
    await page.locator('#add-to-cart-sauce-labs-fleece-jacket').click();

    // 1. Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // Remove a product
    // await page.locator('.cart_item button').first().click();
    
    // 2. Checking out the products
    await page.locator('#checkout').click();
    await expect(page).toHaveURL(/checkout-step-one/);

    // 3. Enter valid inputs
    await page.locator('#first-name').fill('Jevelyn');
    await page.locator('#last-name').fill('Rosario');
    await page.locator('#postal-code').fill('0513'); 
    await page.locator('#continue').click();

    // 4. Display the Checkout: Overview page
    await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    await expect(page.locator('.summary_value_label').first()).toHaveText('SauceCard #31337');
    await expect(page.locator('.summary_value_label').nth(1)).toHaveText('Free Pony Express Delivery!');
    await expect(page.locator('[data-test="total-info-label"]')).toHaveText('Price Total');

    // 5. Finish order
    await page.locator('#finish').click();
    
    // 6. Back to inventory/home page
    await page.locator('#back-to-products').click();
});

// TC-CHK-002
test('Unauthorized Access to Cart Page', async ({page}) => {
    await page.goto('https://www.saucedemo.com/cart.html');
})

// TC-CHK-003
test('Empty Checkout', async ({page}) => {
    await login(page);

    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // Checking out the products
    await page.locator('#checkout').click();
    await expect(page).toHaveURL(/checkout-step-one/);
})

// TC-CHK-004
test('Checkout Form Validation', async ({page}) => {
    await login(page);
    
    // Setup: add product again
    await page.locator('#add-to-cart-sauce-labs-backpack').click();
    await page.locator('#add-to-cart-sauce-labs-bike-light').click();

    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // Checking out the products
    await page.locator('#checkout').click();
    await expect(page).toHaveURL(/checkout-step-one/);

    // 1. Continue while required fields empty.
    await page.locator('#continue').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    // 2. Enter numbers/symbols in First name
    await page.locator('#first-name').fill('123/@@@');

    // 3. Enter numbers/symbols in Last name
    await page.locator('#last-name').fill('Rosario');
    await page.locator('#postal-code').fill('0513'); 

    // 
    await page.locator('#continue').click();
})