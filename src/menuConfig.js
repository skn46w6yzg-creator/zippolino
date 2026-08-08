export const BUSINESS = {
  name: 'ZIPPOLINO',
  address: 'Leontiou 24, 8010 Paphos, Cyprus',
};

// Temporary launch prices live here so they can be changed once without editing the UI.
export const MENU = {
  pancakeProducts: [
    { id: 'classic', name: 'Classic Zippolino', note: 'Butter & icing sugar.', price: 5, tone: 'vanilla', icon: '✦' },
    { id: 'nutella', name: 'Nutella Dream', note: 'Nutella & icing sugar.', price: 7, tone: 'cocoa', icon: 'N' },
    { id: 'lotus', name: 'Lotus Heaven', note: 'Lotus Biscoff spread & biscuit crumbs.', price: 7.5, tone: 'caramel', icon: 'L' },
    { id: 'pistachio', name: 'Pistachio Royale', note: 'Premium pistachio cream & crushed pistachios.', price: 9, tone: 'pistachio', icon: 'P' },
    { id: 'strawberry', name: 'Strawberry Kiss', note: 'Fresh strawberries & chocolate drizzle.', price: 7.5, tone: 'berry', icon: 'S' },
    { id: 'banana', name: 'Banana Bliss', note: 'Fresh banana & chocolate drizzle.', price: 7.5, tone: 'hazel', icon: 'B' },
    { id: 'oreo', name: 'Oreo Explosion', note: 'Oreo crumbs & chocolate sauce.', price: 7.5, tone: 'oreo', icon: 'O' },
    { id: 'dubai', name: 'Dubai Delight', note: 'Pistachio cream, crispy kunafa & chocolate drizzle.', price: 9.5, tone: 'dubai', icon: 'D' },
  ],
  pancakeSizes: [
    { name: 'Mini Treat', detail: '8 mini pancakes', price: 0 },
    { name: 'Regular', detail: '12 mini pancakes', price: 2, badge: 'Most Popular' },
    { name: 'Large', detail: '18 mini pancakes', price: 5 },
    { name: 'Sharing Box', detail: '30 mini pancakes', price: 10 },
  ],
  pancakeSauces: [
    { name: 'Nutella', price: 1 },
    { name: 'White chocolate', price: 1 },
    { name: 'Pistachio', price: 2 },
    { name: 'Lotus Biscoff', price: 1 },
    { name: 'Caramel', price: 0.75 },
  ],
  pancakeExtras: [
    { name: 'No extra', price: 0 },
    { name: 'Strawberries', price: 1.5 },
    { name: 'Banana', price: 1 },
    { name: 'Oreo crunch', price: 1 },
    { name: 'Lotus crumb', price: 1 },
    { name: 'Bueno pieces', price: 1.5 },
    { name: 'Kunafa crunch', price: 1.5 },
  ],
  coffee: [
    { id: 'espresso', name: 'Espresso', price: 2, allowsMilk: false },
    { id: 'americano', name: 'Americano', price: 2.5, allowsMilk: true },
    { id: 'cappuccino', name: 'Cappuccino', price: 3, allowsMilk: true },
    { id: 'latte', name: 'Latte', price: 3, allowsMilk: true },
    { id: 'iced-latte', name: 'Iced Latte', price: 3.5, allowsMilk: true },
  ],
  sugar: ['No sugar', '1 sugar', '2 sugars', '3 sugars', 'Sweetener'],
  milk: [
    { name: 'Regular milk', price: 0 },
    { name: 'Lactose-free milk', price: 0.5 },
    { name: 'Oat milk', price: 0.5 },
  ],
  coffeeExtras: [
    { name: 'Extra espresso shot', price: 1 },
    { name: 'Vanilla syrup', price: 0.5 },
    { name: 'Caramel syrup', price: 0.5 },
    { name: 'Hazelnut syrup', price: 0.5 },
  ],
  coldDrinks: [
    { id: 'coca-cola', name: 'Coca-Cola', price: 2 },
    { id: 'coca-cola-zero', name: 'Coca-Cola Zero', price: 2 },
    { id: 'sprite', name: 'Sprite', price: 2 },
    { id: 'sprite-zero', name: 'Sprite Zero', price: 2 },
    { id: 'fanta-orange', name: 'Fanta Orange', price: 2 },
    { id: 'fanta-zero', name: 'Fanta Zero', price: 2 },
    { id: 'water-500ml', name: '500ml Water', price: 1 },
    { id: 'perrier', name: 'Perrier Water', price: 2 },
  ],
};

export const REMOVED_PRODUCTS = [
  'ice cream', 'whipped cream', 'milkshake', 'smoothie', 'frappé',
  'bubble tea', 'waffle', 'crepe',
];
