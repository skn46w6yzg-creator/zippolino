import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BUSINESS, MENU } from './menuConfig.js';
import './styles.css';

const money = value => `€${Number(value).toFixed(2)}`;
const track = (name, data = {}) => window.dataLayer?.push({ event: name, ...data });
const slug = value => value.toLowerCase().replaceAll(' ', '-');
const totalCart = cart => cart.reduce((sum, item) => sum + item.unit * item.qty, 0);

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('zippolino-cart') || '[]'));
  const [product, setProduct] = useState(null);
  const [choice, setChoice] = useState({ size: 1, sauces: [], extras: [], qty: 1, note: '' });
  const [coffee, setCoffee] = useState(null);
  const [coffeeChoice, setCoffeeChoice] = useState({ sugar: 0, milk: 0, extras: [], qty: 1 });
  const [upsell, setUpsell] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [admin, setAdmin] = useState(location.hash === '#orders');

  useEffect(() => localStorage.setItem('zippolino-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => {
    const update = () => setAdmin(location.hash === '#orders');
    addEventListener('hashchange', update);
    return () => removeEventListener('hashchange', update);
  }, []);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = totalCart(cart);
  const mergeItem = item => setCart(current => {
    const match = current.find(existing => existing.id === item.id && existing.signature === item.signature);
    return match
      ? current.map(existing => existing.key === match.key ? { ...existing, qty: existing.qty + item.qty } : existing)
      : [...current, item];
  });
  const openProduct = item => {
    setProduct(item);
    setChoice({ size: 1, sauces: [], extras: [], qty: 1, note: '' });
    track('view_item', { item_id: item.id });
  };
  const openCoffee = item => {
    setCoffee(item);
    setCoffeeChoice({ sugar: 0, milk: 0, extras: [], qty: 1 });
    setUpsell(false);
  };
  const toggle = (field, index, setter) => setter(current => ({
    ...current,
    [field]: current[field].includes(index) ? current[field].filter(value => value !== index) : [...current[field], index],
  }));
  const addPancakes = () => {
    const size = MENU.pancakeSizes[choice.size];
    const sauces = choice.sauces.map(index => MENU.pancakeSauces[index]);
    const extras = choice.extras.map(index => MENU.pancakeExtras[index]);
    const modifiers = [...sauces, ...extras];
    const unit = product.price + size.price + modifiers.reduce((sum, option) => sum + option.price, 0);
    const details = [`${size.name} — ${size.detail}`, sauces.length ? `Sauces: ${sauces.map(x => x.name).join(', ')}` : 'Sauces: As described', extras.length ? `Extras: ${extras.map(x => x.name).join(', ')}` : 'Extras: No extra'];
    const breakdown = [{ label: product.name, price: product.price }, { label: size.name, price: size.price }, ...modifiers];
    mergeItem({ key: crypto.randomUUID(), id: product.id, signature: JSON.stringify({ size: choice.size, sauces: choice.sauces, extras: choice.extras, note: choice.note }), name: product.name, type: 'pancake', details, breakdown, note: choice.note, qty: choice.qty, unit });
    track('add_to_cart', { item_id: product.id, value: unit * choice.qty });
    setProduct(null);
    setUpsell(true);
  };
  const addCoffee = () => {
    const milk = coffee.allowsMilk ? MENU.milk[coffeeChoice.milk] : null;
    const extras = coffeeChoice.extras.map(index => MENU.coffeeExtras[index]);
    const unit = coffee.price + (milk?.price || 0) + extras.reduce((sum, option) => sum + option.price, 0);
    const details = [`Sugar: ${MENU.sugar[coffeeChoice.sugar]}`, ...(milk ? [`Milk: ${milk.name}`] : []), ...(extras.length ? [`Extras: ${extras.map(x => x.name).join(', ')}`] : ['Extras: None'])];
    const breakdown = [{ label: coffee.name, price: coffee.price }, ...(milk ? [milk] : []), ...extras];
    mergeItem({ key: crypto.randomUUID(), id: coffee.id, signature: JSON.stringify({ sugar: coffeeChoice.sugar, milk: milk?.name, extras: coffeeChoice.extras }), name: coffee.name, type: 'coffee', details, breakdown, note: '', qty: coffeeChoice.qty, unit });
    track('add_to_cart', { item_id: coffee.id, value: unit * coffeeChoice.qty });
    setCoffee(null);
    setCartOpen(true);
  };
  const addColdDrink = drink => {
    mergeItem({ key: crypto.randomUUID(), id: drink.id, signature: 'standard', name: drink.name, type: 'cold-drink', details: ['Cold drink'], breakdown: [{ label: drink.name, price: drink.price }], note: '', qty: 1, unit: drink.price });
    track('add_to_cart', { item_id: drink.id, value: drink.price });
  };
  const changeQty = (key, amount) => setCart(current => current.flatMap(item => item.key !== key ? [item] : item.qty + amount > 0 ? [{ ...item, qty: item.qty + amount }] : []));
  const finishUpsell = () => { setUpsell(false); setCartOpen(true); };
  const submitOrder = async event => {
    event.preventDefault();
    const customer = Object.fromEntries(new FormData(event.currentTarget));
    const order = { id: `ZIP-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), status: 'New', items: cart, total: subtotal, customer, pickupAddress: BUSINESS.address };
    const orders = JSON.parse(localStorage.getItem('zippolino-orders') || '[]');
    localStorage.setItem('zippolino-orders', JSON.stringify([order, ...orders]));
    track('purchase', { transaction_id: order.id, value: subtotal, currency: 'EUR' });
    const api = import.meta.env.VITE_ORDER_API_URL;
    if (api) { try { await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }); } catch {} }
    const payment = import.meta.env.VITE_PAYMENT_URL;
    if (payment) { location.href = `${payment}?reference=${order.id}&amount=${subtotal.toFixed(2)}`; return; }
    setConfirmation(order); setCart([]); setCheckout(false); setCartOpen(false);
  };

  if (admin) return <Orders />;
  return <>
    <header><a className="brand" href="#top"><span>Z</span>ZIPPOLINO</a><nav><a href="#pancakes">Pancakes</a><a href="#coffee">Coffee</a><a href="#cold-drinks">Cold drinks</a></nav><button className="cart-btn" onClick={() => setCartOpen(true)}>Bag <b>{count}</b></button></header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><p className="eyebrow">DUTCH MINI PANCAKES · PAPHOS</p><h1>Little pancakes.<br/><em>Big happiness.</em></h1><p className="intro">Made fresh. Dressed lavishly. Devoured happily. Meet Cyprus' most irresistible little luxury.</p><a className="primary" href="#pancakes">Explore the menu <span>↘</span></a><div className="proof"><span>MADE TO ORDER</span><span>PREMIUM INGREDIENTS</span><span>ONLINE ONLY</span></div></div><div className="hero-art"><div className="plate"><div className="pancakes">{Array.from({ length: 12 }, (_, i) => <i key={i}/>)}</div><div className="drizzle"/></div><div className="stamp">FRESH<br/>DAILY</div><p className="art-label">Soft. Golden. Generously topped.</p></div></section>
      <section className="marquee"><div>POFFERTJES ✦ MADE FRESH ✦ SWEET MOMENTS ✦ POFFERTJES ✦ MADE FRESH ✦ SWEET MOMENTS ✦</div></section>
      <div className="category-nav"><a href="#pancakes">Dutch Mini Pancakes</a><a href="#coffee">Coffee</a><a href="#cold-drinks">Cold Drinks</a></div>
      <section id="pancakes" className="menu"><div className="section-head"><div><p className="eyebrow">DUTCH MINI PANCAKES</p><h2>Pick your pleasure.</h2></div><p>Every box starts with warm Dutch mini pancakes. Regular includes 12 and is our most popular size.</p></div><div className="grid">{MENU.pancakeProducts.map((item, index) => <article className={`product ${item.tone}`} key={item.id} onClick={() => openProduct(item)}><div className="food"><span>{item.icon}</span><div className="mini-stack">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</div></div><div className="product-info"><small>0{index + 1}</small><h3>{item.name}</h3><p>{item.note}</p><div><b>from {money(item.price)}</b><button aria-label={`Customise ${item.name}`}>+</button></div></div></article>)}</div></section>
      <section className="builder"><div><p className="eyebrow">YOUR RULES</p><h2>Build your own<br/><em>little masterpiece.</em></h2><p>Choose the size, sauces and finishing crunch. There are no wrong answers here.</p><button className="primary" onClick={() => openProduct({ id: 'custom', name: 'Build Your Own', note: 'Your pancakes. Your rules.', price: 5.5 })}>Start building <span>+</span></button></div><div className="steps">{[['01','PICK A SIZE','8, 12, 18 or 30 mini pancakes.'],['02','CHOOSE SAUCES','Chocolate, pistachio, Lotus & more.'],['03','MAKE IT YOURS','Fruit, crunch and premium extras.']].map(step => <div key={step[0]}><b>{step[0]}</b><h3>{step[1]}</h3><p>{step[2]}</p></div>)}</div></section>
      <section id="coffee" className="drink-category"><div className="section-head"><div><p className="eyebrow">COFFEE</p><h2>Your perfect cup.</h2></div><p>Choose your sugar, milk and optional coffee extras.</p></div><div className="coffee-grid">{MENU.coffee.map(item => <article className="coffee-card" key={item.id}><div><p className="eyebrow">MADE TO ORDER</p><h3>{item.name}</h3><b>{money(item.price)}</b></div><button onClick={() => openCoffee(item)} aria-label={`Customise ${item.name}`}>Customise +</button></article>)}</div></section>
      <section id="cold-drinks" className="drink-category cold-section"><div className="section-head"><div><p className="eyebrow">COLD DRINKS</p><h2>Keep it cool.</h2></div><p>Add any cold drink directly. Adjust the quantity in your bag.</p></div><div className="cold-list">{MENU.coldDrinks.map(item => <div className="cold-row" key={item.id}><span>{item.name}</span><b>{money(item.price)}</b><button onClick={() => addColdDrink(item)} aria-label={`Add ${item.name}`}>Add +</button></div>)}</div></section>
      <section id="story" className="story"><div className="story-art"><div className="gold-orb">Z</div></div><div><p className="eyebrow">A TINY DUTCH CLASSIC</p><h2>Small by nature.<br/>Unforgettable by design.</h2><p>Poffertjes are soft, airy mini pancakes with a golden edge. At ZIPPOLINO, we make every batch fresh and turn it into something joyful, generous and unmistakably ours.</p><div className="values"><span><b>01</b>Freshly cooked</span><span><b>02</b>Quality toppings</span><span><b>03</b>Made for sharing</span></div></div></section>
      <section className="how"><p className="eyebrow">THREE SIMPLE STEPS</p><h2>Tap. Top. Collect.</h2><div>{[['01','Choose','Pick pancakes, coffee or a cold drink.'],['02','Customise','Make every order exactly yours.'],['03','Collect','We’ll prepare it fresh for pickup.']].map(step => <article key={step[0]}><b>{step[0]}</b><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div></section>
      <section id="visit" className="visit"><div><p className="eyebrow">PICKUP ADDRESS</p><h2>Your next sweet moment starts here.</h2><p>{BUSINESS.address}</p></div><a className="primary" href="#pancakes">Order for pickup <span>→</span></a></section>
    </main>
    <footer><a className="brand" href="#top"><span>Z</span>ZIPPOLINO</a><div><a href="#pancakes">Menu</a><a href="#story">About</a><a href="mailto:hello@zippolino.com">Email</a></div><p>© {new Date().getFullYear()} ZIPPOLINO · ONLINE ORDERS ONLY · {BUSINESS.address}</p></footer>
    {count > 0 && <button className="mobile-bag" onClick={() => setCartOpen(true)}>View bag · {count} {count === 1 ? 'item' : 'items'} <b>{money(subtotal)}</b></button>}

    {product && <div className="overlay" onMouseDown={event => event.target === event.currentTarget && setProduct(null)}><div className="modal product-modal"><button className="close" onClick={() => setProduct(null)}>×</button><p className="eyebrow">MAKE IT YOURS</p><h2>{product.name}</h2><p>{product.note}</p><fieldset><legend>Choose size</legend>{MENU.pancakeSizes.map((option, index) => <label key={option.name}><input type="radio" name="size" checked={choice.size === index} onChange={() => setChoice(current => ({ ...current, size: index }))}/><span><strong>{option.name}</strong> — {option.detail}{option.badge && <em className="badge">{option.badge}</em>}</span><b>{option.price ? `+${money(option.price)}` : 'Included'}</b></label>)}</fieldset><fieldset><legend>Choose sauces</legend>{MENU.pancakeSauces.map((option, index) => <label key={option.name}><input type="checkbox" checked={index === 0 ? choice.sauces.length === 0 : choice.sauces.includes(index)} onChange={() => index === 0 ? setChoice(current => ({ ...current, sauces: [] })) : toggle('sauces', index, setChoice)}/><span>{option.name}</span><b>{option.price ? `+${money(option.price)}` : 'Included'}</b></label>)}</fieldset><fieldset><legend>Finish with extras</legend>{MENU.pancakeExtras.map((option, index) => <label key={option.name}><input type="checkbox" checked={index === 0 ? choice.extras.length === 0 : choice.extras.includes(index)} onChange={() => index === 0 ? setChoice(current => ({ ...current, extras: [] })) : toggle('extras', index, setChoice)}/><span>{option.name}</span><b>{option.price ? `+${money(option.price)}` : 'Included'}</b></label>)}</fieldset><label className="note">Special instructions<textarea value={choice.note} onChange={event => setChoice(current => ({ ...current, note: event.target.value }))} placeholder="Allergies or requests?"/></label><div className="add-row"><Quantity value={choice.qty} setValue={qty => setChoice(current => ({ ...current, qty }))}/><button className="primary" onClick={addPancakes}>Add to bag</button></div></div></div>}

    {coffee && <div className="overlay" onMouseDown={event => event.target === event.currentTarget && setCoffee(null)}><div className="modal coffee-modal"><button className="close" onClick={() => setCoffee(null)}>×</button><p className="eyebrow">COFFEE YOUR WAY</p><h2>{coffee.name}</h2><p>Starting at {money(coffee.price)}</p><fieldset><legend>Sugar</legend>{MENU.sugar.map((name, index) => <label key={name}><input type="radio" name="sugar" checked={coffeeChoice.sugar === index} onChange={() => setCoffeeChoice(current => ({ ...current, sugar: index }))}/><span>{name}</span><b>{index === 0 ? 'Default' : 'Included'}</b></label>)}</fieldset>{coffee.allowsMilk && <fieldset><legend>Milk</legend>{MENU.milk.map((option, index) => <label key={option.name}><input type="radio" name="milk" checked={coffeeChoice.milk === index} onChange={() => setCoffeeChoice(current => ({ ...current, milk: index }))}/><span>{option.name}</span><b>{option.price ? `+${money(option.price)}` : 'Included'}</b></label>)}</fieldset>}<fieldset><legend>Coffee extras</legend>{MENU.coffeeExtras.map((option, index) => <label key={option.name}><input type="checkbox" checked={coffeeChoice.extras.includes(index)} onChange={() => toggle('extras', index, setCoffeeChoice)}/><span>{option.name}</span><b>+{money(option.price)}</b></label>)}</fieldset><div className="add-row"><Quantity value={coffeeChoice.qty} setValue={qty => setCoffeeChoice(current => ({ ...current, qty }))}/><button className="primary" onClick={addCoffee}>Add to bag</button></div></div></div>}

    {upsell && <div className="overlay"><div className="modal upsell-modal"><button className="close" onClick={finishUpsell}>×</button><p className="eyebrow">ONE MORE THING</p><h2>Would you like to add a drink?</h2><p>Optional — your pancakes are already safely in your bag.</p><div className="upsell-list"><button onClick={() => openCoffee(MENU.coffee.find(item => item.id === 'iced-latte'))}><span>Iced Latte</span><b>{money(3.5)}</b><em>Add drink</em></button>{MENU.coldDrinks.filter(item => ['coca-cola','water-500ml'].includes(item.id)).map(item => <button key={item.id} onClick={() => { addColdDrink(item); finishUpsell(); }}><span>{item.name}</span><b>{money(item.price)}</b><em>Add drink</em></button>)}</div><button className="back full" onClick={finishUpsell}>No thanks</button></div></div>}

    {cartOpen && <div className="overlay" onMouseDown={event => event.target === event.currentTarget && setCartOpen(false)}><aside className="drawer"><button className="close" onClick={() => setCartOpen(false)}>×</button><p className="eyebrow">YOUR ORDER</p><h2>{checkout ? 'Checkout' : 'The good stuff.'}</h2>{!checkout ? <>{cart.length === 0 ? <div className="empty"><p>Your bag is waiting for something delicious.</p><button className="primary" onClick={() => setCartOpen(false)}>Browse menu</button></div> : <><div className="cart-list">{cart.map(item => <div key={item.key}><div><h3>{item.name}</h3>{item.details?.map(detail => <p key={detail}>{detail}</p>)}{item.note && <p>Note: {item.note}</p>}<div className="line-breakdown">{item.breakdown?.filter(line => line.price > 0).map(line => <small key={line.label || line.name}>{line.label || line.name}: {money(line.price)}</small>)}</div><Quantity value={item.qty} setValue={qty => changeQty(item.key, qty - item.qty)}/></div><b>{money(item.unit * item.qty)}</b><button onClick={() => setCart(current => current.filter(existing => existing.key !== item.key))}>Remove</button></div>)}</div><div className="total"><span>Total</span><b>{money(subtotal)}</b></div><button className="primary full" onClick={() => { setCheckout(true); track('begin_checkout', { value: subtotal }); }}>Secure checkout →</button></>}</> : <form className="checkout" onSubmit={submitOrder}><label>Full name<input name="name" required autoComplete="name"/></label><label>Email<input name="email" required type="email" autoComplete="email"/></label><label>Pickup time<select name="pickup"><option>As soon as possible</option><option>In 30 minutes</option><option>In 45 minutes</option><option>In 60 minutes</option></select></label><div className="pickup-box"><b>Pickup from</b><span>{BUSINESS.address}</span></div><label>Order notes<textarea name="notes" placeholder="Optional"/></label><div className="payment-note">🔒 Online payment is prepared for connection. Until payment credentials are added, this creates a test order without charging.</div><div className="total"><span>To pay</span><b>{money(subtotal)}</b></div><button className="primary full" type="submit">Place test order →</button><button className="back" type="button" onClick={() => setCheckout(false)}>← Back to bag</button></form>}</aside></div>}
    {confirmation && <div className="overlay"><div className="modal confirmation"><div className="check">✓</div><p className="eyebrow">ORDER RECEIVED</p><h2>Sweet choice.</h2><p>Your order <b>{confirmation.id}</b> is in the queue.</p><div className="pickup-box"><b>Pickup from</b><span>{confirmation.pickupAddress}</span></div><button className="primary" onClick={() => setConfirmation(null)}>Done</button></div></div>}
  </>;
}

function Quantity({ value, setValue }) {
  return <div className="qty"><button type="button" onClick={() => setValue(Math.max(1, value - 1))}>−</button><b>{value}</b><button type="button" onClick={() => setValue(value + 1)}>+</button></div>;
}

function Orders() {
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('zippolino-orders') || '[]'));
  const update = (id, status) => { const next = orders.map(order => order.id === id ? { ...order, status } : order); setOrders(next); localStorage.setItem('zippolino-orders', JSON.stringify(next)); };
  return <div className="admin"><header><a className="brand" href="#top"><span>Z</span>ZIPPOLINO</a><b>ORDER DESK</b><a href="#top">← Storefront</a></header><main><div className="section-head"><div><p className="eyebrow">KITCHEN VIEW</p><h1>Orders</h1></div><p>{orders.length} total · This device only until the live database is connected.</p></div>{orders.length === 0 ? <div className="empty-admin"><h2>No orders yet.</h2><p>Place a test order from the storefront and it will appear here.</p><a className="primary" href="#top">Open storefront</a></div> : <div className="orders">{orders.map(order => <article key={order.id}><div><small>{new Date(order.createdAt).toLocaleString()}</small><h2>{order.id}</h2><p>{order.customer.name} · {order.customer.pickup}</p><p>{order.pickupAddress}</p></div><b className={`status ${order.status.toLowerCase()}`}>{order.status}</b><ul>{order.items.map(item => <li key={item.key}>{item.qty} × {item.name}{item.details?.map(detail => <span key={detail}>{detail}</span>)}{item.breakdown?.filter(line => line.price > 0).map(line => <span key={line.label || line.name}>{line.label || line.name}: {money(line.price)}</span>)}{item.note && <span>Note: {item.note}</span>}</li>)}</ul><strong>{money(order.total)}</strong><div className="actions">{['Accepted','Preparing','Ready','Completed'].map(status => <button onClick={() => update(order.id, status)} key={status}>{status}</button>)}</div></article>)}</div>}</main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
