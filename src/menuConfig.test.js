import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESS, MENU, REMOVED_PRODUCTS } from './menuConfig.js';

test('launch menu has the agreed products and default size', () => {
  assert.deepEqual(MENU.pancakeProducts.map(item => item.name), [
    'Classic Zippolino', 'Nutella Dream', 'Lotus Heaven', 'Pistachio Royale',
    'Strawberry Kiss', 'Banana Bliss', 'Oreo Explosion', 'Dubai Delight',
  ]);
  assert.deepEqual(MENU.pancakeSizes.map(item => item.detail), [
    '8 mini pancakes', '12 mini pancakes', '18 mini pancakes', '30 mini pancakes',
  ]);
  assert.equal(MENU.pancakeSizes[1].badge, 'Most Popular');
});

test('coffee and cold drinks match the streamlined menu', () => {
  assert.deepEqual(MENU.coffee.map(item => item.name), ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Iced Latte']);
  assert.deepEqual(MENU.coldDrinks.map(item => item.name), ['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Sprite Zero', 'Fanta Orange', 'Fanta Zero', '500ml Water', 'Perrier Water']);
  assert.equal(MENU.coffee[0].allowsMilk, false);
  assert.equal(MENU.sugar[0], 'No sugar');
});

test('prices are centralised and removed products are absent', () => {
  const allPriced = [MENU.pancakeProducts, MENU.pancakeSizes, MENU.pancakeSauces, MENU.pancakeExtras, MENU.coffee, MENU.milk, MENU.coffeeExtras, MENU.coldDrinks].flat();
  assert.ok(allPriced.every(item => Number.isFinite(item.price) && item.price >= 0));
  const visibleMenu = JSON.stringify(MENU).toLowerCase();
  REMOVED_PRODUCTS.forEach(product => assert.equal(visibleMenu.includes(product), false));
});

test('pickup address is configured once', () => {
  assert.equal(BUSINESS.address, 'Leontiou 24, 8010 Paphos, Cyprus');
});
