import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/site-shell';
import { ENGRAVING_PRICE, EXPRESS_SHIPPING, TAX_RATE, getProduct, metalLabel } from '@/lib/products';
import { useShop, type BagItem } from '@/lib/shop';
import { productDescriptions } from '@/lib/viewer-accessibility';

export const Route = createFileRoute('/checkout')({
  head: () => ({ meta: [
    { title: 'Checkout — Perspective Jewellers' },
    { name: 'description', content: 'Demo checkout for the Perspective Jewellers concept storefront. No real payment is taken.' },
    { property: 'og:title', content: 'Checkout — Perspective Jewellers' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: Checkout,
});

type Fields = {
  email: string; name: string; address: string; city: string; region: string; postal: string; country: string;
  card: string; expiry: string; cvc: string;
};
type Errors = Partial<Record<keyof Fields, string>>;
type Shipping = 'standard' | 'express';
type Order = { number: string; items: BagItem[]; subtotal: number; shipping: number; tax: number; total: number; email: string; shippingMethod: Shipping };

const empty: Fields = { email: '', name: '', address: '', city: '', region: '', postal: '', country: 'Canada', card: '', expiry: '', cvc: '' };
const money = (n: number) => `$${n.toFixed(2)}`;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (f.address.trim().length < 4) e.address = 'Enter your street address.';
  if (f.city.trim().length < 2) e.city = 'Enter your city.';
  if (f.region.trim().length < 2) e.region = 'Enter your province or state.';
  if (f.postal.trim().length < 3) e.postal = 'Enter your postal or ZIP code.';
  if (f.country.trim().length < 2) e.country = 'Enter your country.';
  if (f.card.replace(/\s/g, '').length !== 16) e.card = 'Enter a 16-digit card number (try 4242 4242 4242 4242).';
  const match = /^(\d{2})\/(\d{2})$/.exec(f.expiry);
  if (!match) e.expiry = 'Use MM/YY.';
  else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const now = new Date();
    if (month < 1 || month > 12) e.expiry = 'Month must be 01 to 12.';
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) e.expiry = 'This card has expired.';
  }
  if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3 or 4 digits.';
  return e;
}

function Field({ id, label, error, children }: { id: string; label: string; error: string | undefined; children: React.ReactNode }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}{error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}</div>;
}

function Checkout() {
  const { bag, subtotal, itemPrice, clearBag, user, setBagOpen } = useShop();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [shipping, setShipping] = useState<Shipping>('standard');
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Pre-fill the name from the demo login (only if the field is still empty).
  useEffect(() => { if (user) setFields(prev => prev.name ? prev : { ...prev, name: user }); }, [user]);

  const shippingCost = shipping === 'express' ? EXPRESS_SHIPPING : 0;
  const tax = Math.round((subtotal + shippingCost) * TAX_RATE * 100) / 100;
  const total = subtotal + shippingCost + tax;

  const set = (key: keyof Fields) => (value: string) => { setFields(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined })); };
  const bind = (key: keyof Fields) => ({
    id: `co-${key}`,
    className: 'field-input',
    value: fields[key],
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `co-${key}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key)(e.target.value),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (processing || bag.length === 0) return;
    const found = validate(fields);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`co-${first}`)?.focus(); return; }
    setProcessing(true);
    timer.current = window.setTimeout(() => {
      setOrder({ number: `PJ-${Math.floor(100000 + Math.random() * 900000)}`, items: bag, subtotal, shipping: shippingCost, tax, total, email: fields.email.trim(), shippingMethod: shipping });
      clearBag();
      setFields(prev => ({ ...prev, card: '', expiry: '', cvc: '' }));
      setProcessing(false);
      window.scrollTo({ top: 0 });
    }, 1400);
  };

  if (order) {
    return (
      <SiteShell>
        <main className="section checkout-page">
          <div className="confirmation">
            <CheckCircle2 className="confirmation-icon" strokeWidth={1.2} />
            <div className="eyebrow text-primary">Order placed (demo)</div>
            <h1 className="page-title">Thank you{user ? `, ${user}` : ''}.</h1>
            <p className="lead">Order <strong>{order.number}</strong> is confirmed. A confirmation would be sent to {order.email}. This is a mock checkout, so nothing was charged and nothing will ship.</p>
            <div className="summary-card">
              {order.items.map(item => {
                const p = getProduct(item.productId);
                return <div className="summary-row" key={item.uid}><span>{p.name} · {metalLabel[item.metal]}{item.engraving ? ` · engraved “${item.engraving}”` : ''}</span><span>{money(p.price + (item.engraving ? ENGRAVING_PRICE : 0))}</span></div>;
              })}
              <div className="summary-row muted"><span>Shipping ({order.shippingMethod})</span><span>{order.shipping ? money(order.shipping) : 'Free'}</span></div>
              <div className="summary-row muted"><span>Estimated tax</span><span>{money(order.tax)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{money(order.total)}</span></div>
            </div>
            <Button variant="editorial" asChild><Link to="/">Back to the collection <ArrowRight /></Link></Button>
          </div>
        </main>
      </SiteShell>
    );
  }

  if (bag.length === 0) {
    return (
      <SiteShell>
        <main className="section checkout-page">
          <div className="confirmation">
            <ShoppingBag className="confirmation-icon" strokeWidth={1.2} />
            <h1 className="page-title">Your bag is empty.</h1>
            <p className="lead">Add a piece to your bag and it will appear here.</p>
            <Button variant="editorial" asChild><Link to="/" hash="collection">Explore the collection <ArrowRight /></Link></Button>
          </div>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main className="section checkout-page">
        <div className="eyebrow text-primary">Secure checkout (demo)</div>
        <h1 className="page-title">Almost yours.</h1>
        <p className="demo-banner"><Lock size={14} /> Demo only. No real payment is taken. Please do not enter a real card number.</p>
        <div className="checkout-grid">
          <form onSubmit={submit} noValidate className="checkout-form" aria-label="Checkout form">
            <fieldset>
              <legend>Contact</legend>
              {user && <p className="muted-note">Checking out as {user}.</p>}
              <Field id="co-email" label="Email" error={errors.email}><input {...bind('email')} type="email" autoComplete="email" /></Field>
            </fieldset>
            <fieldset>
              <legend>Delivery</legend>
              <Field id="co-name" label="Full name" error={errors.name}><input {...bind('name')} autoComplete="name" /></Field>
              <Field id="co-address" label="Address" error={errors.address}><input {...bind('address')} autoComplete="street-address" /></Field>
              <div className="field-row">
                <Field id="co-city" label="City" error={errors.city}><input {...bind('city')} autoComplete="address-level2" /></Field>
                <Field id="co-region" label="Province / State" error={errors.region}><input {...bind('region')} autoComplete="address-level1" /></Field>
              </div>
              <div className="field-row">
                <Field id="co-postal" label="Postal / ZIP code" error={errors.postal}><input {...bind('postal')} autoComplete="postal-code" /></Field>
                <Field id="co-country" label="Country" error={errors.country}><input {...bind('country')} autoComplete="country-name" /></Field>
              </div>
              <div className="shipping-options" role="radiogroup" aria-label="Shipping method">
                <label className={shipping === 'standard' ? 'selected' : undefined}><input type="radio" name="shipping" checked={shipping === 'standard'} onChange={() => setShipping('standard')} /><span>Standard, 5 to 7 days</span><strong>Free</strong></label>
                <label className={shipping === 'express' ? 'selected' : undefined}><input type="radio" name="shipping" checked={shipping === 'express'} onChange={() => setShipping('express')} /><span>Express, 1 to 2 days</span><strong>{money(EXPRESS_SHIPPING)}</strong></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Payment</legend>
              <Field id="co-card" label="Card number" error={errors.card}>
                <input {...bind('card')} inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" maxLength={19} onChange={e => set('card')(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} />
              </Field>
              <div className="field-row">
                <Field id="co-expiry" label="Expiry (MM/YY)" error={errors.expiry}>
                  <input {...bind('expiry')} inputMode="numeric" autoComplete="off" placeholder="08/29" maxLength={5} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); set('expiry')(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d); }} />
                </Field>
                <Field id="co-cvc" label="CVC" error={errors.cvc}>
                  <input {...bind('cvc')} inputMode="numeric" autoComplete="off" placeholder="123" maxLength={4} onChange={e => set('cvc')(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                </Field>
              </div>
              <p className="muted-note">Card details are never saved or sent anywhere.</p>
            </fieldset>
            <Button type="submit" variant="editorial" className="place-order" disabled={processing}>{processing ? 'Processing…' : `Place order · ${money(total)}`}</Button>
          </form>

          <aside className="summary-card" aria-label="Order summary">
            <h2>Order summary</h2>
            {bag.map(item => {
              const p = getProduct(item.productId);
              return (
                <div className="summary-item" key={item.uid}>
                  <img src={p.image} alt={productDescriptions[p.id]} />
                  <div><h3>{p.name}</h3><p>{metalLabel[item.metal]} finish</p>{item.engraving && <p>Engraving: “{item.engraving}” (+${ENGRAVING_PRICE})</p>}</div>
                  <span>{money(itemPrice(item))}</span>
                </div>
              );
            })}
            <div className="summary-row muted"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="summary-row muted"><span>Shipping</span><span>{shippingCost ? money(shippingCost) : 'Free'}</span></div>
            <div className="summary-row muted"><span>Estimated tax ({Math.round(TAX_RATE * 100)}%)</span><span>{money(tax)}</span></div>
            <div className="summary-row total"><span>Total</span><span>{money(total)}</span></div>
            <Button variant="ghost" className="edit-bag" onClick={() => setBagOpen(true)}>Edit bag</Button>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}
