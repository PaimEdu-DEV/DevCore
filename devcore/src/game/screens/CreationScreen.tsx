import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../assets/sprites';
import { SpritePreview } from '../ui/SpritePreview';
import { DialogBox } from '../ui/DialogBox';
import { checkName, MAX_NAME } from '../data/blocklist';
import { game } from '../state/store';
import { newSave, type Gender, type HeroClass } from '../state/save';
import { audio } from '../audio/AudioManager';
import { isCancel, useKeys } from '../ui/hooks';
import { warmupPython } from '../../runner';
import './creation.css';

type Step = 'name' | 'gender' | 'class' | 'confirm';

const CLASS_INFO: Record<HeroClass, { title: string; lang: string; text: string; icon: string }> = {
  alchemist: {
    title: 'Alquimista',
    lang: 'Python',
    text: 'Mistura ingredientes até a fórmula dar certo. Python é limpo e legível, ótimo para começar e muito usado em dados, automação e IA.',
    icon: 'assets/icons/flask.png',
  },
  mage: {
    title: 'Mago',
    lang: 'JavaScript',
    text: 'Conjura com precisão de gestos. JavaScript é a língua da web: roda em todo navegador e dá vida a sites e aplicativos.',
    icon: 'assets/icons/bolt.png',
  },
};

export function CreationScreen() {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('m');
  const [heroClass, setHeroClass] = useState<HeroClass>('alchemist');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'name') inputRef.current?.focus();
  }, [step]);

  const back = () => {
    audio.play('cancel');
    if (step === 'gender') setStep('name');
    else if (step === 'class') setStep('gender');
    else if (step === 'confirm') setStep('class');
  };

  useKeys((e, type) => {
    if (type !== 'down') return;
    if (isCancel(e) && step !== 'name' && e.key !== 'Backspace') {
      e.preventDefault();
      back();
    }
    if (step === 'gender' || step === 'class') {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
        audio.play('select');
        if (step === 'gender') setGender((g) => (g === 'm' ? 'f' : 'm'));
        else setHeroClass((c) => (c === 'alchemist' ? 'mage' : 'alchemist'));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        audio.play('confirm');
        if (step === 'class' && heroClass === 'alchemist') warmupPython();
        setStep(step === 'gender' ? 'class' : 'confirm');
      }
    }
  });

  const submitName = () => {
    const r = checkName(name);
    if (!r.ok) {
      setError(r.reason);
      audio.play('error');
      return;
    }
    setName(r.name);
    setError(null);
    audio.play('confirm');
    setStep('gender');
  };

  const finish = () => {
    const save = newSave({ name, gender, heroClass });
    game.setSave(save);
    if (heroClass === 'alchemist') warmupPython();
    game.navigate({ name: 'cutscene', id: 'arrival', next: { name: 'village' } });
  };

  const stepIndex = ['name', 'gender', 'class', 'confirm'].indexOf(step);

  return (
    <main className="screen creation" aria-labelledby="creation-title">
      <div className="creation-inner">
        <header className="creation-head">
          <img src={assetUrl('assets/portraits/orwin.png')} alt="" className="px creation-orwin" />
          <div>
            <h1 id="creation-title">Quem é você, herói?</h1>
            <ol className="creation-steps" aria-label="Etapas">
              {['Nome', 'Gênero', 'Classe', 'Confirmar'].map((l, i) => (
                <li key={l} aria-current={i === stepIndex ? 'step' : undefined} className={i < stepIndex ? 'done' : ''}>{l}</li>
              ))}
            </ol>
          </div>
        </header>

        {step === 'name' ? (
          <section className="frame-panel creation-card">
            <label htmlFor="hero-name" className="creation-label">Como devo registrar você no Arquivo?</label>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                submitName();
              }}
            >
              <input
                id="hero-name"
                ref={inputRef}
                className="creation-input"
                value={name}
                maxLength={MAX_NAME}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!error}
                aria-describedby="name-help"
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
              <button className="btn primary" type="submit">Confirmar ▶</button>
            </form>
            <p id="name-help" className={error ? 'creation-error' : 'muted'} role={error ? 'alert' : undefined}>
              {error ?? `${name.length}/${MAX_NAME} caracteres`}
            </p>
          </section>
        ) : null}

        {step === 'gender' ? (
          <section className="creation-choices" aria-label="Escolha o gênero">
            {(['m', 'f'] as const).map((g) => (
              <button
                key={g}
                className={`frame-panel creation-option ${gender === g ? 'selected' : ''}`}
                aria-pressed={gender === g}
                onClick={() => {
                  if (gender === g) {
                    audio.play('confirm');
                    setStep('class');
                  } else {
                    audio.play('select');
                    setGender(g);
                  }
                }}
              >
                <SpritePreview hero={{ gender: g, heroClass }} anim={gender === g ? 'walk' : 'idle'} scale={3} headroom={8} />
                <span className="creation-option-title">{g === 'm' ? 'Masculino' : 'Feminino'}</span>
              </button>
            ))}
            <p className="creation-tip muted">← → para escolher · Enter para confirmar · Esc para voltar</p>
          </section>
        ) : null}

        {step === 'class' ? (
          <section className="creation-choices" aria-label="Escolha a classe">
            {(['alchemist', 'mage'] as const).map((c) => (
              <button
                key={c}
                className={`frame-panel creation-option ${heroClass === c ? 'selected' : ''}`}
                aria-pressed={heroClass === c}
                onClick={() => {
                  if (heroClass === c) {
                    audio.play('confirm');
                    if (c === 'alchemist') warmupPython();
                    setStep('confirm');
                  } else {
                    audio.play('select');
                    setHeroClass(c);
                  }
                }}
              >
                <SpritePreview hero={{ gender, heroClass: c }} anim={heroClass === c ? 'attack' : 'idle'} scale={3} headroom={8} />
                <span className="creation-option-title">
                  <img src={assetUrl(CLASS_INFO[c].icon)} alt="" className="icon px" /> {CLASS_INFO[c].title}
                </span>
                <span className="creation-lang">{CLASS_INFO[c].lang}</span>
                <span className="creation-desc">{CLASS_INFO[c].text}</span>
              </button>
            ))}
            <p className="creation-tip muted">← → para escolher · Enter para confirmar · Esc para voltar</p>
          </section>
        ) : null}

        {step === 'confirm' ? (
          <section className="creation-confirm">
            <div className="frame-panel creation-summary">
              <SpritePreview hero={{ gender, heroClass }} anim="victory" scale={4} headroom={8} />
              <div className="col">
                <strong className="creation-name">{name}</strong>
                <span>{gender === 'm' ? 'Masculino' : 'Feminino'} · {CLASS_INFO[heroClass].title}</span>
                <span className="creation-lang">Linguagem: {CLASS_INFO[heroClass].lang}</span>
              </div>
            </div>
            <DialogBox
              variant="panel"
              speaker="Orwin"
              portrait="assets/portraits/orwin.png"
              text={`${name}, ${CLASS_INFO[heroClass].title.toLowerCase()} de ${CLASS_INFO[heroClass].lang}. Posso escrever isso a tinta, ou ainda é a lápis?`}
              choices={[{ label: 'A tinta! Vamos.' }, { label: 'Quero mudar algo' }]}
              onChoose={(i) => (i === 0 ? finish() : setStep('name'))}
            />
          </section>
        ) : null}

        {step !== 'name' && step !== 'confirm' ? (
          <div className="row creation-nav">
            <button className="btn" onClick={back}>◀ Voltar</button>
            <button
              className="btn primary"
              onClick={() => {
                audio.play('confirm');
                if (step === 'class' && heroClass === 'alchemist') warmupPython();
                setStep(step === 'gender' ? 'class' : 'confirm');
              }}
            >
              Avançar ▶
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
