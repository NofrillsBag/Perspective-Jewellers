import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, Heart, Leaf, MoveUpRight, Recycle, Scan, Shuffle, ShieldCheck, Sparkles, Sprout, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteShell } from '@/components/site-shell';
import { certificates, materials, type LearnCard } from '@/lib/education';
import { products } from '@/lib/products';
import { useShop } from '@/lib/shop';
import { productDescriptions } from '@/lib/viewer-accessibility';
import { brand } from '@/lib/brand';
import { StorySlider } from '@/components/story-slider';
import hero from '@/assets/jewelry-hero.jpg';
import ring from '@/assets/orbit-ring.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Perspective Jewellers — Jewellery, naturally' },
    { name: 'description', content: 'Nature-inspired jewellery, thoughtful materials, and a more transparent story. Discover Perspective Jewellers and explore the collection in 360°.' },
    { property: 'og:title', content: 'Perspective Jewellers — Jewellery, naturally' },
    { property: 'og:description', content: 'Beautiful by nature. Considered by design. Explore the Perspective Jewellers collection from every angle.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});

const stories = [
  { icon: Recycle, title: 'Less taken. More treasured.', copy: 'Recycled metals, considered packaging, and pieces made to stay. A lighter footprint begins with what we choose to create.', detail: 'Our material philosophy', body: 'Our concept collection proposes recycled precious metals and plastic-free packaging. Before launch, each product will include supplier documentation, recycled-content details, and care guidance. Environmental certifications will be published only when verified.' },
  { icon: Users, title: 'Good hands. Good intentions.', copy: 'The people behind a piece are part of its beauty. Fair treatment, safe workplaces, and a story you can trace.', detail: 'Meet the makers', body: 'Transparency means knowing where jewellery is made and how its makers are treated. This concept prioritizes safe workplaces, fair pay, and open supplier relationships. Factory profiles, labor standards, and independent assessments will be added once verified partners are selected.' },
  { icon: Sprout, title: 'A little beauty. A little better.', copy: 'Reciprocity is at our heart. Supporting the communities that make our work possible, and sharing what we learn.', detail: 'Our approach to giving', body: 'Our proposed giving program will support maker communities and environmental education. Charity partners, contribution amounts, and impact reports will be disclosed before any donation claims or giving-linked purchases go live. No donation is represented by this demo.' },
];

function LearnGrid({ cards }: { cards: LearnCard[] }) {
  return (
    <div className="learn-grid">
      {cards.map(card => (
        <article className="learn-card" key={card.title}>
          <h3>{card.title}</h3>
          <p className="learn-tagline">{card.tagline}</p>
          <ul>{card.points.map(point => <li key={point}>{point}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

function Index() {
  const { openProduct, setSearchOpen, setSuggestOpen } = useShop();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [story, setStory] = useState<typeof stories[number] | null>(null);
  const explore = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  return <SiteShell>
    <main>
      <section className="hero">
        <img src={hero} alt="Sculptural gold rings and a delicate bracelet, worn in the warmth of natural sunlight" className="hero-photo" width={1920} height={1024} fetchPriority="high" />
        <div className="hero-content"><div className="eyebrow">Beautiful by nature. Considered by design.</div><h1>Jewellery,<br /><em>naturally.</em></h1><p className="hero-copy">Little pieces of the earth. Made to become<br className="hidden sm:block" /> a part of your everyday.</p><div className="hero-buttons"><Button variant="editorial" onClick={explore}>Discover the collection <ArrowRight strokeWidth={1.4} /></Button><a href="#ethos" className="text-link">Our story <MoveUpRight size={13} /></a></div></div>
        <div className="hero-caption"><Leaf strokeWidth={1.2} /> A more thoughtful kind of shine.</div>
      </section>
      <div className="values-strip"><div><Recycle />Circular materials</div><div><ShieldCheck />A transparent journey</div><div><Users />People come first</div><div><Sprout />Giving back, growing together</div></div>
      <section id="collection" className="section">
        <div className="section-heading"><div><div className="eyebrow text-primary">The everyday collection</div><h2>Grounded in beauty.</h2></div><div className="section-actions"><Button variant="editorialOutline" className="suggest-button" onClick={() => setSuggestOpen(true)}><Shuffle strokeWidth={1.4} />Suggest me a piece</Button><a className="text-link" href="#collection" onClick={e => { e.preventDefault(); setSearchOpen(true); }}>Explore all pieces <ArrowRight size={14} /></a></div></div>
        <div className="product-grid">{products.map(product => <article key={product.id}><div className="product-image"><img src={product.image} alt={productDescriptions[product.id]} width={1024} height={1024} loading="lazy" /><span className="product-tag">{product.tag}</span><Button variant="ghost" size="icon" className={`favorite ${favorites.includes(product.id) ? 'saved' : ''}`} aria-label={`${favorites.includes(product.id) ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={favorites.includes(product.id)} onClick={() => setFavorites(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id])}><Heart size={17} strokeWidth={1.4} /></Button><Button variant="ghost" className="product-view" onClick={() => openProduct(product.id)}><Scan strokeWidth={1.3} />View in 360°</Button></div><div className="product-meta"><h3>{product.name}</h3><span>${product.price}</span></div><p className="product-material">{product.material}</p><span className="material-dot" aria-label="Gold finish" /></article>)}</div>
      </section>
      <section id="experience" className="experience"><div className="experience-visual"><img src={ring} width={1024} height={1024} loading="lazy" alt={productDescriptions.ring} /><span className="experience-stamp"><Scan size={17} strokeWidth={1.2} /> A CLOSER CONNECTION</span></div><div className="experience-content"><div className="eyebrow text-primary">Meet your piece. From every angle.</div><h2>Nothing to hide.<br />Everything to love.</h2><p>Get a little closer. Discover the curves, the texture, the details that make a piece yours — before it ever reaches your hands.</p><Button variant="editorial" onClick={() => openProduct('ring')}>Take a 360° look <ArrowRight strokeWidth={1.4} /></Button><div className="detail-points"><span><Scan />Panoramic view</span><span><Sparkles />Every little detail</span><span><Heart />A more personal choice</span></div></div></section>
      <section id="learn" className="section learn">
        <div className="section-heading"><div><div className="eyebrow text-primary">Know what you&rsquo;re buying</div><h2>Materials &amp; certificates,<br />in plain words.</h2></div><p className="learn-intro">Quick bullet points on what each term means. We will only show a certificate on a piece once it is verified.</p></div>
        <Tabs defaultValue="materials">
          <TabsList className="learn-tabs" aria-label="Choose a topic">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="materials"><LearnGrid cards={materials} /></TabsContent>
          <TabsContent value="certificates"><LearnGrid cards={certificates} /></TabsContent>
        </Tabs>
      </section>
      <section id="ethos" className="ethos">
  <div className="ethos-intro"><div><div className="eyebrow text-primary">Our nature is to care</div><h2>Beautiful things.<br />Better beginnings.</h2></div><p>Jewellery should feel good in every sense. To wear. To give. To know where it came from. This is the future we&rsquo;re working toward.</p></div>
  <StorySlider />
  <div className="ethos-grid">{stories.map(item => <div className="ethos-item" key={item.title}><item.icon /><h3>{item.title}</h3><p>{item.copy}</p><Button variant="link" className="px-0 h-auto text-xs font-normal" onClick={() => setStory(item)}>{item.detail}<ArrowRight size={13} /></Button></div>)}</div>

  <div className="ethos-disclosures">
    <div className="eyebrow text-primary">Disclosures</div>
    <ul>{brand.disclosures.map(d => <li key={d}>{d}</li>)}</ul>
  </div>

  <div className="ethos-social">
    <span className="eyebrow text-primary">Follow along</span>
    <div>{brand.socials.map(s => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-link">{s.name} <MoveUpRight size={13} /></a>)}</div>
  </div>
      </section>


    </main>
    <ClientOnly>
      <Dialog open={!!story} onOpenChange={open => { if (!open) setStory(null); }}><DialogContent><DialogTitle className="viewer-title">{story?.title}</DialogTitle><DialogDescription className="leading-relaxed mt-3">{story?.body}</DialogDescription><div className="eyebrow text-primary pt-3">Thoughtful intentions. Transparent progress.</div></DialogContent></Dialog>
    </ClientOnly>
  </SiteShell>;
}
