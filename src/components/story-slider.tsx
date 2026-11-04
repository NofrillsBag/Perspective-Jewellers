import { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/brand';
import { manifesto, MANIFESTO_PDF } from '@/lib/manifesto';


const panels = ['Our story', 'Business manifesto'];

export function StorySlider() {
  const [slide, setSlide] = useState(0);
  return (
    <div className="story-slider" role="region" aria-roledescription="carousel" aria-label="Our story and business manifesto">
      <div className="slider-head">
        <div className="slider-tabs" role="group" aria-label="Choose a panel">
          {panels.map((label, i) => (
            <button key={label} type="button" aria-pressed={slide === i} onClick={() => setSlide(i)}>{label}</button>
          ))}
        </div>
        <div className="slider-arrows">
          <Button variant="ghost" size="icon" className="slider-arrow" aria-label="Previous panel: Our story" disabled={slide === 0} onClick={() => setSlide(0)}><ArrowLeft strokeWidth={1.4} /></Button>
          <Button variant="ghost" size="icon" className="slider-arrow" aria-label="Next panel: Business manifesto" disabled={slide === 1} onClick={() => setSlide(1)}><ArrowRight strokeWidth={1.4} /></Button>
        </div>
      </div>

      <div className="slider-window">
        <div className="slider-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {/* Slide 1: story, mission, model */}
          <div className="slide" inert={slide !== 0}>
            <div className="ethos-story">
              <div className="ethos-story-main">
                <div className="eyebrow text-primary">Our story</div>
                <h3>{brand.story.heading}</h3>
                {brand.story.paragraphs.map(p => <p key={p}>{p}</p>)}
              </div>
              <div className="ethos-story-side">
                <div className="ethos-panel"><div className="eyebrow text-primary">Our mission</div><p>{brand.mission}</p></div>
                <div className="ethos-panel"><div className="eyebrow text-primary">Our model</div><ul>{brand.model.map(m => <li key={m}>{m}</li>)}</ul></div>
              </div>
            </div>
          </div>

          {/* Slide 2: business manifesto box */}
          <div className="slide" inert={slide !== 1}>
            <div className="manifesto-box">
              <div className="manifesto-top">
                <div>
                  <div className="eyebrow text-primary">Business manifesto</div>
                  <h3>{manifesto.headline}</h3>
                </div>
                <Button variant="editorial" asChild>
                  <a href={MANIFESTO_PDF} target="_blank" rel="noopener noreferrer"><FileText />Open the PDF</a>
                </Button>
              </div>
              <div className="manifesto-tags">{manifesto.tags.map(t => <span key={t}>{t}</span>)}</div>
              <div className="manifesto-grid">
                {manifesto.parts.map((p, i) => (
                  <div className="manifesto-part" key={p.title}>
                    <span className="manifesto-num">{i + 1}</span>
                    <h4>{p.title}</h4>
                    <p>{p.summary}</p>
                  </div>
                ))}
              </div>
              <div className="manifesto-chips">
                <div><span className="eyebrow text-primary">Revenue streams</span><div>{manifesto.revenue.map(r => <span key={r}>{r}</span>)}</div></div>
                <div><span className="eyebrow text-primary">Threats</span><div>{manifesto.threats.map(t => <span key={t}>{t}</span>)}</div></div>
              </div>
              <a className="manifesto-download" href={MANIFESTO_PDF} download>Download the full manifesto (PDF, 4 pages)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}