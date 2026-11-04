import { ClientOnly, Link } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useId, useState, type ReactNode } from 'react';
import { ArrowRight, Menu, Moon, Search, Shuffle, ShoppingBag, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { productDescriptions } from '@/lib/viewer-accessibility';
import {
  ENGRAVING_MAX, ENGRAVING_PRICE, engravingColor, engravingFonts, getFontFamily, getProduct, metalLabel, products,
  type FontId, type Metal, type ProductId,
} from '@/lib/products';
import { useShop } from '@/lib/shop';

const JewelryViewer = lazy(() => import('@/components/jewelry-viewer'));

function Wordmark({ label = 'Perspective Jewellers home' }: { label?: string }) {
  return <Link to="/" className="wordmark" aria-label={label}><span>perspective</span><small>jewellers</small></Link>;
}

function Header() {
  const { theme, toggleTheme, user, bag, setBagOpen, setSearchOpen, setLoginOpen, setMenuOpen } = useShop();
  const dark = theme === 'dark';
  return (
    <header className="site-header">
      <Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link to="/" hash="collection">The collection</Link>
        <Link to="/" hash="learn">Learn</Link>
        <Link to="/" hash="ethos">Our philosophy</Link>
        <Link to="/" hash="experience">Explore in 360°</Link>
        <Link to="/business" className="nav-business">For business</Link>
      </nav>
      <div className="nav-actions">
        <Button variant="ghost" size="icon" aria-label="Search jewellery" title="Search jewellery" onClick={() => setSearchOpen(true)}><Search strokeWidth={1.4} /></Button>
        <Button variant="ghost" className={user ? 'account-button' : undefined} size={user ? 'default' : 'icon'} aria-label={user ? `Account: ${user}` : 'Log in'} title={user ? `Logged in as ${user}` : 'Log in'} onClick={() => setLoginOpen(true)}><User strokeWidth={1.4} />{user && <span className="account-name">{user}</span>}</Button>
        <Button variant="ghost" size="icon" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} title={dark ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}><Moon strokeWidth={1.4} className={dark ? 'fill-current' : undefined} /></Button>
        <Button variant="ghost" size="icon" aria-label={`Shopping bag, ${bag.length} items`} title="Shopping bag" onClick={() => setBagOpen(true)}><ShoppingBag strokeWidth={1.4} />{bag.length > 0 && <span className="text-xs">{bag.length}</span>}</Button>
        <Button className="mobile-menu-button" variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div><Wordmark label="Perspective Jewellers" /><p className="footer-tagline">For the everyday. For the earth.</p></div>
        <div className="footer-links"><Link to="/" hash="collection">The collection</Link><Link to="/" hash="learn">Learn</Link><Link to="/" hash="ethos">Our philosophy</Link><Link to="/" hash="experience">A closer look</Link><Link to="/business">For business</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Perspective Jewellers. Thoughtfully imagined.</span><span>Concept storefront · School project · Sample products, prices and checkout · Material and impact claims pending verification</span></div>
    </footer>
  );
}

function EngravingText({ text, metal, font }: { text: string; metal: Metal; font: FontId }) {
  return <span className="engraving-text" style={{ fontFamily: getFontFamily(font), color: engravingColor[metal] }}>{text}</span>;
}

function ProductBody({ id, startMetal }: { id: ProductId; startMetal: Metal }) {
  const { addToBag, closeProduct, setBagOpen } = useShop();
  const product = getProduct(id);
  const [metal, setMetal] = useState<Metal>(startMetal);
  const [engraving, setEngraving] = useState('');
  const [font, setFont] = useState<FontId>('script');
  const inputId = useId();
  const text = engraving.trim();
  const price = product.price + (text ? ENGRAVING_PRICE : 0);
  return <>
    <DialogTitle className="viewer-title">{product.name}</DialogTitle>
    <DialogDescription>Explore the sculptural form. Illustrative 3D model; not a manufacturing specification.</DialogDescription>
    <ClientOnly fallback={<div className="viewer-loading">Preparing your piece…</div>}>
      <Suspense fallback={<div className="viewer-loading">Preparing your piece…</div>}>
        <JewelryViewer key={id} kind={id} metal={metal} onMetalChange={setMetal} />
      </Suspense>
    </ClientOnly>
    <div className="engrave">
      <div className="engrave-head">
        <label htmlFor={inputId}>Engraving <span>(optional, +${ENGRAVING_PRICE})</span></label>
        <span className="engrave-count" aria-live="polite">{engraving.length}/{ENGRAVING_MAX}</span>
      </div>
      <input id={inputId} className="field-input" type="text" maxLength={ENGRAVING_MAX} placeholder="A name, a date, a few words…" value={engraving} onChange={e => setEngraving(e.target.value)} autoComplete="off" />
      <div className="engrave-fonts" role="group" aria-label="Engraving font">
        {engravingFonts.map(f => <Button key={f.id} type="button" variant="ghost" className="font-chip" style={{ fontFamily: f.family }} aria-pressed={font === f.id} onClick={() => setFont(f.id)}>{f.label}</Button>)}
      </div>
      <div className="engrave-plate" aria-label={text ? `Engraving preview: ${text}, in ${metalLabel[metal]}` : 'Engraving preview'}>
        {text ? <EngravingText text={text} metal={metal} font={font} /> : <span className="engrave-empty" style={{ fontFamily: getFontFamily(font) }}>Your words here</span>}
        <small>{metalLabel[metal]} finish</small>
      </div>
    </div>
    <div className="viewer-bottom">
      <span className="text-sm">${price} <span className="text-xs text-muted-foreground">· Sample price{text ? ' incl. engraving' : ''}</span></span>
      <Button variant="editorial" onClick={() => { addToBag({ productId: id, metal, engraving: text, font }); toast.success(`${product.name} added to your bag`); closeProduct(); setBagOpen(true); }}><ShoppingBag />Add to bag</Button>
    </div>
  </>;
}

function ProductDialog() {
  const { viewing, closeProduct } = useShop();
  return (
    <Dialog open={!!viewing} onOpenChange={open => { if (!open) closeProduct(); }}>
      <DialogContent className="viewer-dialog">
        {viewing && <ProductBody key={`${viewing.id}-${viewing.metal}`} id={viewing.id} startMetal={viewing.metal} />}
      </DialogContent>
    </Dialog>
  );
}

function BagDialog() {
  const { bagOpen, setBagOpen, bag, removeFromBag, itemPrice, subtotal } = useShop();
  const explore = () => { setBagOpen(false); window.setTimeout(() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }), 50); };
  return (
    <Dialog open={bagOpen} onOpenChange={setBagOpen}>
      <DialogContent>
        <DialogTitle className="viewer-title">Your bag</DialogTitle>
        <DialogDescription>Concept collection. Checkout is a demo, so no real payment is taken.</DialogDescription>
        {bag.length === 0 ? (
          <div className="py-8 text-center"><ShoppingBag className="mx-auto mb-4 text-primary" strokeWidth={1.2} /><p className="text-sm text-muted-foreground mb-6">A little space for something beautiful.</p><Button variant="editorial" asChild><Link to="/" hash="collection" onClick={() => setBagOpen(false)}>Explore the collection <ArrowRight /></Link></Button></div>
        ) : <>
          <div>{bag.map(item => {
            const p = getProduct(item.productId);
            return (
              <div className="bag-row" key={item.uid}>
                <img src={p.image} alt={productDescriptions[p.id]} />
                <div>
                  <h3>{p.name}</h3>
                  <p>{metalLabel[item.metal]} finish · ${p.price}</p>
                  {item.engraving && <p className="bag-engraving">Engraved: <EngravingText text={item.engraving} metal={item.metal} font={item.font} /> <span>+${ENGRAVING_PRICE}</span></p>}
                </div>
                <Button variant="ghost" size="icon" aria-label={`Remove ${p.name}`} onClick={() => removeFromBag(item.uid)}><Trash2 /></Button>
              </div>
            );
          })}</div>
          <div className="flex justify-between py-4 text-sm"><span>Subtotal</span><span>${subtotal}</span></div>
          <div className="bag-actions">
            <Button variant="editorial" asChild><Link to="/checkout" onClick={() => setBagOpen(false)}>Checkout <ArrowRight /></Link></Button>
            <Button variant="editorialOutline" onClick={explore}>Continue exploring</Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}

function SearchDialog() {
  const { searchOpen, setSearchOpen, openProduct } = useShop();
  const [query, setQuery] = useState('');
  const results = products.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Dialog open={searchOpen} onOpenChange={open => { setSearchOpen(open); if (!open) setQuery(''); }}>
      <DialogContent>
        <DialogTitle className="viewer-title">Find your everyday.</DialogTitle>
        <DialogDescription>Discover the concept collection.</DialogDescription>
        <div className="flex items-center border-b border-border py-3 gap-3"><Search size={18} /><input autoFocus aria-label="Search collection" placeholder="Search rings, hoops, necklaces…" className="w-full bg-transparent text-sm outline-none" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button variant="ghost" size="icon" aria-label="Clear search" onClick={() => setQuery('')}><X /></Button>}</div>
        {results.map(p => <div className="bag-row" key={p.id}><img src={p.image} alt={productDescriptions[p.id]} /><div><h3>{p.name}</h3><p>${p.price}</p></div><Button variant="ghost" size="icon" aria-label={`Explore ${p.name}`} onClick={() => { setSearchOpen(false); openProduct(p.id); }}><ArrowRight /></Button></div>)}
        {results.length === 0 && <p className="py-8 text-sm text-muted-foreground">No pieces found. Try “ring”, “hoops”, or “necklace”.</p>}
      </DialogContent>
    </Dialog>
  );
}

function LoginDialog() {
  const { loginOpen, setLoginOpen, user, login, logout } = useShop();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2) { setError('Please enter at least 2 characters.'); return; }
    if (!/^[\p{L}\p{N} ._-]+$/u.test(clean)) { setError('Use letters, numbers, spaces, dots, dashes or underscores.'); return; }
    login(clean);
    setName(''); setError(''); setLoginOpen(false);
    toast.success(`Welcome back, ${clean}!`);
  };
  return (
    <Dialog open={loginOpen} onOpenChange={open => { setLoginOpen(open); if (!open) setError(''); }}>
      <DialogContent>
        {user ? <>
          <DialogTitle className="viewer-title">Welcome back, {user}.</DialogTitle>
          <DialogDescription>You&rsquo;re logged in on this device. This is a demo login, so there is no password and no account is created.</DialogDescription>
          <div className="bag-actions">
            <Button variant="editorialOutline" onClick={() => { logout(); setLoginOpen(false); toast('You have been logged out'); }}>Log out</Button>
            <Button variant="editorial" onClick={() => setLoginOpen(false)}>Keep browsing</Button>
          </div>
        </> : <>
          <DialogTitle className="viewer-title">Log in</DialogTitle>
          <DialogDescription>Demo login: just pick a username. No password and nothing is sent anywhere.</DialogDescription>
          <form onSubmit={submit} noValidate className="form-stack">
            <div className="field">
              <label htmlFor={inputId}>Username</label>
              <input id={inputId} className="field-input" autoFocus autoComplete="username" value={name} maxLength={24} onChange={e => { setName(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} placeholder="e.g. Maya" />
              {error && <p id={`${inputId}-error`} className="field-error" role="alert">{error}</p>}
            </div>
            <Button type="submit" variant="editorial">Log in <ArrowRight /></Button>
          </form>
        </>}
      </DialogContent>
    </Dialog>
  );
}

function SuggestDialog() {
  const { suggestOpen, setSuggestOpen, openProduct } = useShop();
  const [pick, setPick] = useState<{ id: ProductId; metal: Metal } | null>(null);
  const shuffle = () => setPick(prev => {
    const pool = products.filter(p => p.id !== prev?.id);
    const next = pool[Math.floor(Math.random() * pool.length)] ?? products[0]!;
    return { id: next.id, metal: Math.random() < 0.5 ? 'gold' : 'silver' };
  });
  useEffect(() => { if (suggestOpen) shuffle(); }, [suggestOpen]);
  const product = pick ? getProduct(pick.id) : null;
  return (
    <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
      <DialogContent>
        <DialogTitle className="viewer-title">Not sure? Let us pick.</DialogTitle>
        <DialogDescription>A random suggestion from the concept collection.</DialogDescription>
        {product && pick && (
          <div className="suggest-card">
            <img src={product.image} alt={productDescriptions[product.id]} />
            <div>
              <div className="eyebrow text-primary">We suggest</div>
              <h3>{product.name}</h3>
              <p>{product.pitch}</p>
              <p className="suggest-meta">{metalLabel[pick.metal]} finish · ${product.price} · sample price</p>
            </div>
          </div>
        )}
        <div className="bag-actions">
          <Button variant="editorialOutline" onClick={shuffle}><Shuffle />Surprise me again</Button>
          <Button variant="editorial" onClick={() => { if (pick) { setSuggestOpen(false); openProduct(pick.id, pick.metal); } }}>View in 360° <ArrowRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MenuDialog() {
  const { menuOpen, setMenuOpen, setLoginOpen, setSuggestOpen, user } = useShop();
  const close = () => setMenuOpen(false);
  return (
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
      <DialogContent>
        <DialogTitle className="viewer-title">perspective jewellers</DialogTitle>
        <DialogDescription>For the everyday. For the earth.</DialogDescription>
        <nav className="mobile-nav">
          <Link to="/" hash="collection" onClick={close}>The collection</Link>
          <Link to="/" hash="learn" onClick={close}>Learn about materials</Link>
          <Link to="/" hash="ethos" onClick={close}>Our philosophy</Link>
          <Link to="/" hash="experience" onClick={close}>Explore in 360°</Link>
          <Link to="/business" onClick={close}>For business</Link>
          <button type="button" onClick={() => { close(); setSuggestOpen(true); }}>Suggest me a piece</button>
          <button type="button" onClick={() => { close(); setLoginOpen(true); }}>{user ? `Account (${user})` : 'Log in'}</button>
        </nav>
      </DialogContent>
    </Dialog>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { user } = useShop();
  return <>
    <div className="announcement">{user ? `Welcome back, ${user}. ` : ''}Rooted in nature. Made with intention.</div>
    <Header />
    {children}
    <Footer />
    <ProductDialog />
    <BagDialog />
    <SearchDialog />
    <LoginDialog />
    <SuggestDialog />
    <MenuDialog />
  </>;
}

