import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useId, useState } from 'react';
import { ArrowRight, BadgeCheck, BarChart3, Boxes, Check, FileText, Mail, MapPin, Phone, RefreshCcw, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/site-shell';

const ShirtViewer = lazy(() => import('@/components/shirt-viewer'));

export const Route = createFileRoute('/business')({
  head: () => ({ meta: [
    { title: 'Perspective 360° for Business — Perspective Jewellers' },
    { name: 'description', content: 'Sell every angle. Perspective Jewellers builds interactive 360° product views for brands. See a live shirt demo, sample pricing, contract terms, guarantees and contacts.' },
    { property: 'og:title', content: 'Perspective 360° for Business' },
    { property: 'og:description', content: 'Interactive panoramic product views for your online store. Sample pricing, terms and guarantees.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Business,
});

const fabrics = [
  { id: 'chalk', name: 'Chalk', token: '--fabric-chalk' },
  { id: 'olive', name: 'Olive', token: '--fabric-olive' },
  { id: 'clay', name: 'Clay', token: '--fabric-clay' },
  { id: 'charcoal', name: 'Charcoal', token: '--fabric-charcoal' },
  { id: 'navy', name: 'Navy', token: '--fabric-navy' },
] as const;

const steps = [
  { icon: Boxes, title: '1. Send us the product', copy: 'Ship a sample or share photos and measurements. We build a clean 3D model of it.' },
  { icon: BadgeCheck, title: '2. Approve the model', copy: 'You review colours, finishes and details before anything goes live.' },
  { icon: BarChart3, title: '3. Embed and sell', copy: 'Paste one embed snippet into your store. Shoppers spin, zoom and switch colours.' },
];

const tiers = [
  { name: 'Starter', price: '$29', unit: 'per product', note: 'Minimum 10 products', features: ['360° spin, zoom and pause', 'One colour or finish option', 'Embed snippet for any website', '2 rounds of revisions'], featured: false },
  { name: 'Studio', price: '$24', unit: 'per product + $99/mo hosting', note: 'Up to 100 products', features: ['Everything in Starter', 'Colour and finish switcher', 'Custom text or logo preview', 'Monthly view analytics'], featured: true },
  { name: 'Enterprise', price: 'Custom', unit: 'volume pricing', note: '100+ products', features: ['Everything in Studio', 'Store platform integration', 'Dedicated account manager', 'Priority turnaround'], featured: false },
];

const contract = [
  '12-month agreement, billed monthly',
  'Cancel any time with 30 days written notice',
  'You own the 3D models made for you',
  'We host them for as long as your plan is active',
  'Prices fixed for the first 12 months',
  'Rush delivery (48 hours): +40% per product',
];

const guarantees = [
  { icon: Timer, title: '5-day turnaround', copy: 'Models delivered within 5 business days of receiving your product details.' },
  { icon: RefreshCcw, title: 'Free revisions', copy: 'Two rounds of changes are included. We do not publish until you approve.' },
  { icon: ShieldCheck, title: '30-day money back', copy: 'Not happy with the first batch? Cancel within 30 days for a full refund.' },
  { icon: BadgeCheck, title: '99.5% uptime', copy: 'Hosted views are monitored. Missed targets earn you a service credit.' },
];

function Business() {
  const [fabric, setFabric] = useState<typeof fabrics[number]>(fabrics[1]);
  const [logo, setLogo] = useState('YOUR BRAND');
  const logoId = useId();
  const contactId = useId();
  const [sent, setSent] = useState(false);
  const [contact, setContact] = useState({ name: '', company: '', email: '', message: '' });
  const [contactError, setContactError] = useState('');

  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (contact.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setContactError('Please add your name and a valid email.');
      return;
    }
    setContactError('');
    setSent(true);
    toast.success('Thanks! (Demo: nothing was actually sent.)');
  };

  return <SiteShell>
    <main className="business">
      <section className="business-hero">
        <div className="business-hero-copy">
          <div className="eyebrow text-primary">Perspective 360° for business</div>
          <h1 className="page-title">Sell every angle.</h1>
          <p className="lead">Shoppers buy what they can see. Our panoramic viewer lets customers turn, zoom and customise your product on your own website. Try it on the sample shirt.</p>
          <div className="hero-buttons"><Button variant="editorial" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>See pricing <ArrowRight strokeWidth={1.4} /></Button><a href="#contact" className="text-link">Talk to us</a></div>
        </div>
        <div className="business-demo">
          <ClientOnly fallback={<div className="viewer-loading">Preparing the shirt…</div>}>
            <Suspense fallback={<div className="viewer-loading">Preparing the shirt…</div>}>
              <ShirtViewer fabricToken={fabric.token} fabricName={fabric.name} logo={logo} />
            </Suspense>
          </ClientOnly>
          <div className="demo-controls">
            <div className="metal-options"><span className="text-xs text-muted-foreground mr-3">Fabric</span>{fabrics.map(f => <Button key={f.id} type="button" className="metal-swatch" style={{ background: `var(${f.token})` }} aria-label={`${f.name} fabric`} title={f.name} aria-pressed={fabric.id === f.id} onClick={() => setFabric(f)} />)}</div>
            <div className="demo-logo"><label htmlFor={logoId}>Print a logo</label><input id={logoId} className="field-input" maxLength={14} value={logo} onChange={e => setLogo(e.target.value)} placeholder="YOUR BRAND" /></div>
          </div>
          <p className="demo-note">Illustrative sample model. Your product would be modelled from your own photos and measurements.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="eyebrow text-primary">How it works</div><h2>From product to<br />panorama in a week.</h2></div></div>
        <div className="ethos-grid">{steps.map(s => <div className="ethos-item" key={s.title}><s.icon /><h3>{s.title}</h3><p>{s.copy}</p></div>)}</div>
      </section>

      <section id="pricing" className="section pricing">
        <div className="section-heading"><div><div className="eyebrow text-primary">Sample pricing</div><h2>Simple, per product.</h2></div><p className="learn-intro">Example figures for this school project. Prices in CAD, before tax.</p></div>
        <div className="tier-grid">{tiers.map(t => (
          <article className={`tier ${t.featured ? 'featured' : ''}`} key={t.name}>
            {t.featured && <span className="tier-flag">Most popular</span>}
            <h3>{t.name}</h3>
            <p className="tier-price">{t.price}</p>
            <p className="tier-unit">{t.unit}</p>
            <p className="tier-note">{t.note}</p>
            <ul>{t.features.map(f => <li key={f}><Check size={14} />{f}</li>)}</ul>
            <Button variant={t.featured ? 'editorial' : 'editorialOutline'} onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Get a quote</Button>
          </article>
        ))}</div>
      </section>

      <section className="section terms">
        <div className="terms-grid">
          <div>
            <div className="eyebrow text-primary"><FileText size={14} className="inline mr-2" />Contract at a glance</div>
            <h2>Short and fair.</h2>
            <ul className="tick-list">{contract.map(c => <li key={c}><Check size={14} />{c}</li>)}</ul>
            <p className="demo-note">Sample terms for a class project. Not a legal agreement or legal advice.</p>
          </div>
          <div>
            <div className="eyebrow text-primary"><ShieldCheck size={14} className="inline mr-2" />Our guarantees</div>
            <h2>Backed by promises.</h2>
            <div className="guarantee-grid">{guarantees.map(g => <div key={g.title}><g.icon /><h3>{g.title}</h3><p>{g.copy}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="contact-grid">
          <div>
            <div className="eyebrow text-primary">Contact</div>
            <h2>Let&rsquo;s build yours.</h2>
            <ul className="contact-list">
              <li><Mail size={16} /><span><strong>Partnerships</strong><br /><a href="mailto:business@perspectivejewellers.example">business@perspectivejewellers.example</a></span></li>
              <li><Mail size={16} /><span><strong>Support</strong><br /><a href="mailto:support@perspectivejewellers.example">support@perspectivejewellers.example</a></span></li>
              <li><Phone size={16} /><span><strong>Phone</strong><br />+1 (555) 010-0123 · Mon to Fri, 9 to 5 ET</span></li>
              <li><MapPin size={16} /><span><strong>Studio</strong><br />Toronto, Ontario (concept studio)</span></li>
            </ul>
            <p className="demo-note">Placeholder contact details for a school project.</p>
          </div>
          {sent ? (
            <div className="confirmation" role="status"><Check className="confirmation-icon" strokeWidth={1.2} /><h3 className="page-title small">Message received.</h3><p className="lead">Demo only: nothing was sent, but a real team would reply within one business day.</p><Button variant="editorialOutline" onClick={() => { setSent(false); setContact({ name: '', company: '', email: '', message: '' }); }}>Send another</Button></div>
          ) : (
            <form className="form-stack" onSubmit={submitContact} noValidate aria-label="Business enquiry">
              <div className="field"><label htmlFor={`${contactId}-name`}>Your name</label><input id={`${contactId}-name`} className="field-input" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} autoComplete="name" /></div>
              <div className="field"><label htmlFor={`${contactId}-company`}>Company</label><input id={`${contactId}-company`} className="field-input" value={contact.company} onChange={e => setContact(c => ({ ...c, company: e.target.value }))} autoComplete="organization" /></div>
              <div className="field"><label htmlFor={`${contactId}-email`}>Work email</label><input id={`${contactId}-email`} type="email" className="field-input" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} autoComplete="email" /></div>
              <div className="field"><label htmlFor={`${contactId}-message`}>What would you like to show in 360°?</label><textarea id={`${contactId}-message`} className="field-input" rows={4} value={contact.message} onChange={e => setContact(c => ({ ...c, message: e.target.value }))} /></div>
              {contactError && <p className="field-error" role="alert">{contactError}</p>}
              <Button type="submit" variant="editorial">Request a quote <ArrowRight /></Button>
            </form>
          )}
        </div>
      </section>
    </main>
  </SiteShell>;
}
