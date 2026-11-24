
import { useState, useEffect } from 'react'
import './App.css'

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
    }
  }, [key, value])

  return [value, setValue]
}

const missions = [
  { id: 1, title: 'La nascita dell’impresa', subtitle: 'Costituzione e prime operazioni', icon: '🏢' },
  { id: 2, title: 'I primi acquisti', subtitle: 'Merci, materiali e servizi', icon: '📦' },
  { id: 3, title: 'Gestire gli imprevisti', subtitle: 'Resi, ribassi e abbuoni', icon: '🔄' },
  { id: 4, title: 'Le spese accessorie', subtitle: 'Trasporti e clausole di consegna', icon: '🚚' },
  { id: 5, title: 'Contabilità sotto controllo', subtitle: 'Riepilogo delle registrazioni', icon: '📊' },
]

const accountOptions = [
  'Cassa',
  'Assegni bancari',
  'Mobili e arredi',
  'Attrezzature informatiche',
  'Capitale netto',
  'Banca c/c',
  'Merci c/acquisti',
  'Trasporti su acquisti',
  'IVA ns/credito',
  'Materiale di consumo c/acquisti',
  'Debiti v/fornitori',
]

const makeRows = number =>
  Array.from({ length: number }, () => ({
    account: '',
    debit: '',
    credit: '',
  }))

function formatEuro(value) {
  return Number(value || 0).toLocaleString('it-IT')
}

function DocumentCard({ date, label, title, description, rows, number }) {
  return (
    <div className="document">
      <div className="document-top">
        <span>📄 {label}</span>
        <span>{date} · ANNO N</span>
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="document-table">
        {rows.map((row, index) => (
          <div className={row.total ? 'document-total' : ''} key={index}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
      <div className="document-stamp">DOCUMENTO N. {number}</div>
    </div>
  )
}

function JournalEditor({ date, entries, setEntries, onCheck, feedback, success, onContinue, document }) {
  const [shuffledAccounts] = useState(() =>
    [...accountOptions].sort(() => Math.random() - 0.5)
  )

  function updateRow(index, field, value) {
    setEntries(previous =>
      previous.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  const totalDebit = entries.reduce((sum, row) => sum + (Number(row.debit) || 0), 0)
  const totalCredit = entries.reduce((sum, row) => sum + (Number(row.credit) || 0), 0)

  return (
    <div
      className="journal-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      <div>{document}</div>

      <section className="entry-card">
        <span className="eyebrow">LIBRO GIORNALE · {date} · ANNO N</span>
        <h2>Inserisci la scrittura contabile</h2>
        <p>Per ogni riga seleziona il conto e inserisci l'importo in Dare oppure in Avere.</p>

        <div className="journal">
          <div className="journal-head">
            <span>CONTO</span>
            <span>DARE (€)</span>
            <span>AVERE (€)</span>
          </div>

          {entries.map((row, index) => (
            <div className="journal-row" key={index}>
              <select
                value={row.account}
                onChange={e => updateRow(index, 'account', e.target.value)}
                aria-label={`Conto riga ${index + 1}`}
                style={{ width: '100%', minWidth: 0, padding: '10px', border: '1px solid #d8dee8', borderRadius: '7px', background: '#fff' }}
              >
                <option value="">Seleziona conto...</option>
                {shuffledAccounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                placeholder="0"
                value={row.debit}
                onChange={e => updateRow(index, 'debit', e.target.value)}
                aria-label={`Dare riga ${index + 1}`}
                style={{ width: '100%', minWidth: 0, padding: '10px', border: '1px solid #d8dee8', borderRadius: '7px' }}
              />

              <input
                type="number"
                min="0"
                placeholder="0"
                value={row.credit}
                onChange={e => updateRow(index, 'credit', e.target.value)}
                aria-label={`Avere riga ${index + 1}`}
                style={{ width: '100%', minWidth: 0, padding: '10px', border: '1px solid #d8dee8', borderRadius: '7px' }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', padding: '16px', marginTop: '12px', background: '#f3f6fa', borderRadius: '10px' }}>
          <strong>Totale Dare: € {formatEuro(totalDebit)}</strong>
          <strong>Totale Avere: € {formatEuro(totalCredit)}</strong>
        </div>

        <div className="hint">
          <strong>💡 Ricorda</strong>
          <p>Una scrittura contabile è corretta quando il totale Dare coincide con il totale Avere.</p>
        </div>

        <button className="primary-button" onClick={onCheck} disabled={success}>
          VERIFICA LA REGISTRAZIONE
        </button>

        {feedback && (
          <div className="feedback" style={{ marginTop: '16px' }}>
            {feedback}
          </div>
        )}

        {success && (
          <button className="primary-button" onClick={onContinue} style={{ marginTop: '16px' }}>
            CONTINUA →
          </button>
        )}
      </section>
    </div>
  )
}

function TaskCard({ title, description, hint, buttonText, onClick }) {
  return (
    <div className="task-card">
      <span className="eyebrow">IL TUO INCARICO</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="hint">
        <strong>💡 Suggerimento</strong>
        <p>{hint}</p>
      </div>
      <button className="primary-button" onClick={onClick}>
        {buttonText} →
      </button>
    </div>
  )
}

function App() {
  const [student, setStudent] = usePersistentState('nova-tech-student', {
    name: '',
    surname: '',
    className: '',
  })

  const [started, setStarted] = usePersistentState('nova-tech-started', false)
  const [activeMission, setActiveMission] = usePersistentState('nova-tech-active-mission', 0)
  const [step, setStep] = usePersistentState('nova-tech-step', 0)

  const [completed, setCompleted] = usePersistentState('nova-tech-completed', false)
  const [mission2Completed, setMission2Completed] = usePersistentState('nova-tech-mission2-completed', false)

  const [entry15, setEntry15] = usePersistentState('nova-tech-entry-15', makeRows(5))
  const [entry16, setEntry16] = usePersistentState('nova-tech-entry-16', makeRows(3))
  const [entry20, setEntry20] = usePersistentState('nova-tech-entry-20', makeRows(4))
  const [entry22, setEntry22] = usePersistentState('nova-tech-entry-22', makeRows(3))

  const [feedback15, setFeedback15] = usePersistentState('nova-tech-feedback-15', '')
  const [feedback16, setFeedback16] = usePersistentState('nova-tech-feedback-16', '')
  const [feedback20, setFeedback20] = usePersistentState('nova-tech-feedback-20', '')
  const [feedback22, setFeedback22] = usePersistentState('nova-tech-feedback-22', '')

  const [success15, setSuccess15] = usePersistentState('nova-tech-success-15', false)
  const [success16, setSuccess16] = usePersistentState('nova-tech-success-16', false)
  const [success20, setSuccess20] = usePersistentState('nova-tech-success-20', false)
  const [success22, setSuccess22] = usePersistentState('nova-tech-success-22', false)

  function checkEntry(entries, expected, setFeedback, setSuccess, message) {
    const filled = entries.filter(row =>
      row.account || row.debit || row.credit
    )

    const valid =
      filled.length === expected.length &&
      expected.every(item =>
        filled.some(row =>
          row.account === item.account &&
          Number(row.debit || 0) === item.debit &&
          Number(row.credit || 0) === item.credit
        )
      )

    if (valid) {
      setFeedback(message)
      setSuccess(true)
    } else {
      setFeedback('La registrazione non è ancora corretta. Controlla i conti, gli importi e la collocazione in Dare e Avere.')
    }
  }

  function checkEntry15() {
    checkEntry(entry15, [
      { account: 'Cassa', debit: 25000, credit: 0 },
      { account: 'Assegni bancari', debit: 45000, credit: 0 },
      { account: 'Mobili e arredi', debit: 12000, credit: 0 },
      { account: 'Attrezzature informatiche', debit: 8000, credit: 0 },
      { account: 'Capitale netto', debit: 0, credit: 90000 },
    ], setFeedback15, setSuccess15,
    'Ottimo! La registrazione della costituzione di NOVA TECH è corretta.')
  }

  function checkEntry16() {
    const expected = [
      { account: 'Banca c/c', debit: 45000, credit: 0 },
      { account: 'Assegni bancari', debit: 0, credit: 45000 },
    ]

    const filled = entry16.filter(row => row.account || row.debit || row.credit)

    const valid =
      filled.length === expected.length &&
      expected.every(item =>
        filled.some(row =>
          row.account === item.account &&
          Number(row.debit || 0) === item.debit &&
          Number(row.credit || 0) === item.credit
        )
      )

    if (valid) {
      setFeedback16('Perfetto! Anche la registrazione del versamento è corretta.')
      setSuccess16(true)
      setCompleted(true)
    } else {
      setFeedback16('Non è ancora corretta. Ricorda: gli assegni vengono versati sul conto corrente bancario.')
    }
  }

  function checkEntry20() {
    checkEntry(entry20, [
      { account: 'Merci c/acquisti', debit: 14000, credit: 0 },
      { account: 'Trasporti su acquisti', debit: 400, credit: 0 },
      { account: 'IVA ns/credito', debit: 3168, credit: 0 },
      { account: 'Debiti v/fornitori', debit: 0, credit: 17568 },
    ], setFeedback20, setSuccess20,
    'Ben fatto! Hai registrato correttamente l’acquisto di merci e il trasporto.')
  }

  function checkEntry22() {
    checkEntry(entry22, [
      { account: 'Materiale di consumo c/acquisti', debit: 600, credit: 0 },
      { account: 'IVA ns/credito', debit: 132, credit: 0 },
      { account: 'Cassa', debit: 0, credit: 732 },
    ], setFeedback22, setSuccess22,
    'Perfetto! Anche l’acquisto del materiale di consumo è corretto.')

    const expected = [
      { account: 'Materiale di consumo c/acquisti', debit: 600, credit: 0 },
      { account: 'IVA ns/credito', debit: 132, credit: 0 },
      { account: 'Cassa', debit: 0, credit: 732 },
    ]

    const filled = entry22.filter(row => row.account || row.debit || row.credit)

    const valid =
      filled.length === expected.length &&
      expected.every(item =>
        filled.some(row =>
          row.account === item.account &&
          Number(row.debit || 0) === item.debit &&
          Number(row.credit || 0) === item.credit
        )
      )

    if (valid) setMission2Completed(true)
  }

  const completedCount = Number(completed) + Number(mission2Completed)

  const document15 = (
    <DocumentCard
      date="15 SETTEMBRE"
      label="DOCUMENTO AZIENDALE"
      title="Atto di costituzione"
      description="Il signor Andrea Moretti costituisce l'impresa individuale NOVA TECH, apportando i seguenti beni e valori:"
      number="001"
      rows={[
        { label: 'Denaro in cassa', value: '€ 25.000,00' },
        { label: 'Assegni bancari', value: '€ 45.000,00' },
        { label: 'Mobili e arredi', value: '€ 12.000,00' },
        { label: 'Attrezzature informatiche', value: '€ 8.000,00' },
        { label: 'Totale conferimenti', value: '€ 90.000,00', total: true },
      ]}
    />
  )

  const document16 = (
    <DocumentCard
      date="16 SETTEMBRE"
      label="OPERAZIONE BANCARIA"
      title="Versamento degli assegni"
      description="Il giorno successivo alla costituzione, Andrea Moretti versa gli assegni bancari ricevuti sul conto corrente bancario dell'azienda."
      number="002"
      rows={[
        { label: 'Operazione', value: 'Versamento in banca' },
        { label: 'Importo', value: '€ 45.000,00' },
        { label: 'Modalità', value: 'Versamento assegni' },
      ]}
    />
  )

  const document20 = (
    <DocumentCard
      date="20 SETTEMBRE"
      label="FATTURA DI ACQUISTO"
      title="Acquisto di merci"
      description="NOVA TECH acquista merci per la rivendita per € 14.000. Il fornitore addebita in fattura anche € 400 per il trasporto. Entrambi gli importi sono soggetti a IVA al 22%. Il pagamento avverrà tramite bonifico bancario."
      number="003"
      rows={[
        { label: 'Merci', value: '€ 14.000,00' },
        { label: 'Trasporto', value: '€ 400,00' },
        { label: 'Imponibile', value: '€ 14.400,00' },
        { label: 'IVA 22%', value: '€ 3.168,00' },
        { label: 'Totale fattura', value: '€ 17.568,00', total: true },
      ]}
    />
  )

  const document22 = (
    <DocumentCard
      date="22 SETTEMBRE"
      label="FATTURA DI ACQUISTO"
      title="Acquisto di materiale di consumo"
      description="NOVA TECH acquista materiale di consumo per € 600, oltre IVA al 22%. L'importo complessivo viene pagato immediatamente in contanti."
      number="004"
      rows={[
        { label: 'Materiale di consumo', value: '€ 600,00' },
        { label: 'IVA 22%', value: '€ 132,00' },
        { label: 'Totale pagato', value: '€ 732,00', total: true },
      ]}
    />
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <div>
            <strong>NOVA TECH</strong>
            <span>GESTIONE AZIENDALE</span>
          </div>
        </div>
        <span className="top-label">AREA STUDENTI</span>
      </header>

      {!started ? (
        <main className="welcome">
          <div className="welcome-content">
            <span className="eyebrow">SIMULAZIONE AZIENDALE · ECONOMIA AZIENDALE</span>
            <h1>Benvenuto in<br /><span>NOVA TECH.</span></h1>
            <p>La tua carriera da contabile inizia qui. Gestisci i documenti, registra le operazioni e accompagna l'azienda verso il successo.</p>

            <div className="login-card">
              <h2>Identificati per iniziare</h2>
              <label>Nome</label>
              <input value={student.name} onChange={e => setStudent({ ...student, name: e.target.value })} placeholder="Il tuo nome" />
              <label>Cognome</label>
              <input value={student.surname} onChange={e => setStudent({ ...student, surname: e.target.value })} placeholder="Il tuo cognome" />
              <label>Classe</label>
              <input value={student.className} onChange={e => setStudent({ ...student, className: e.target.value })} placeholder="Es. 3A SIA" />
              <button disabled={!student.name.trim() || !student.surname.trim() || !student.className.trim()} onClick={() => setStarted(true)}>
                ENTRA IN AZIENDA <span>→</span>
              </button>
            </div>
          </div>

          <div className="welcome-decoration">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>
            <div className="floating-card">
              <span>IL TUO NUOVO INCARICO</span>
              <strong>Responsabile<br />amministrativo</strong>
              <div className="floating-icon">📈</div>
            </div>
            <div className="decoration-caption">PRECISIONE · STRATEGIA · RISULTATI</div>
          </div>
        </main>
      ) : activeMission === 0 ? (
        <main className="dashboard">
          <div className="welcome-student">
            <div>
              <span className="eyebrow">AREA PERSONALE · {student.className.toUpperCase()}</span>
              <h1>Benvenuto, {student.name}!</h1>
              <p>Sei pronto a gestire la contabilità di NOVA TECH?</p>
            </div>
            <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
          </div>

          <section className="company-banner">
            <div>
              <span>LA TUA AZIENDA</span>
              <h2>NOVA TECH</h2>
              <p>Un'impresa commerciale. Una nuova sfida. La tua contabilità.</p>
            </div>
            <div className="company-symbol">N</div>
          </section>

          <section className="stats">
            <div><span>MISSIONI COMPLETATE</span><strong>{completedCount} / 5</strong></div>
            <div><span>PUNTEGGIO</span><strong>{completedCount * 100} pt</strong></div>
            <div><span>STATO</span><strong className="active">{completedCount > 0 ? 'In attività' : 'In formazione'}</strong></div>
          </section>

          <section className="missions-section">
            <div className="section-heading">
              <div><span className="eyebrow">IL TUO PERCORSO</span><h2>Le missioni</h2></div>
              <span className="mission-count">01 — 05</span>
            </div>

            <div className="missions-grid">
              {missions.map(mission => {
                const isCompleted =
                  mission.id === 1 ? completed :
                  mission.id === 2 ? mission2Completed : false

                const isAvailable =
                  mission.id === 1 ||
                  (mission.id === 2 && completed)

                return (
                  <article
                    className={`mission-card ${isAvailable ? 'available' : 'locked'}`}
                    key={mission.id}
                  >
                    <div className="mission-top">
                      <span className="mission-icon">{mission.icon}</span>
                      <span className="mission-number">MISSIONE 0{mission.id}</span>
                    </div>
                    <h3>{mission.title}</h3>
                    <p>{mission.subtitle}</p>
                    <div className="mission-bottom">
                      <span>
                        {isCompleted ? 'Completata' : isAvailable ? 'Disponibile' : 'Bloccata'}
                      </span>
                      {isAvailable
                        ? <button onClick={() => {
                            setStep(0)
                            setActiveMission(mission.id)
                          }}>
                            {isCompleted ? 'RIVEDI →' : 'ENTRA →'}
                          </button>
                        : <span>🔒</span>}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </main>
      ) : activeMission === 1 ? (
        <main className="mission-page">
          <button className="back-button" onClick={() => setActiveMission(0)}>← TORNA ALLE MISSIONI</button>

          <div className="mission-header">
            <span className="eyebrow">MISSIONE 01 · NOVA TECH</span>
            <h1>La nascita dell'impresa</h1>
            <p>Avvia l'attività e registra correttamente le prime operazioni contabili.</p>
          </div>

          {step === 0 && (
            <section className="mission-content">
              {document15}
              <TaskCard
                title="Registra la costituzione"
                description="Devi registrare l'apporto iniziale del titolare. Individua i valori conferiti e il conto che rappresenta il capitale di proprietà."
                hint="I beni e i valori conferiti si registrano in Dare. Il capitale netto si registra in Avere."
                buttonText="INIZIA LA REGISTRAZIONE"
                onClick={() => setStep(1)}
              />
            </section>
          )}

          {step === 1 && (
            <JournalEditor
              date="15 SETTEMBRE"
              document={document15}
              entries={entry15}
              setEntries={setEntry15}
              onCheck={checkEntry15}
              feedback={feedback15}
              success={success15}
              onContinue={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <section className="mission-content">
              {document16}
              <TaskCard
                title="Registra il versamento"
                description="Gli assegni bancari vengono versati sul conto corrente aziendale. Devi registrare l'aumento della disponibilità bancaria e la diminuzione degli assegni in portafoglio."
                hint="La Banca c/c aumenta e si registra in Dare. Gli assegni bancari diminuiscono e si registrano in Avere."
                buttonText="REGISTRA L'OPERAZIONE"
                onClick={() => setStep(3)}
              />
            </section>
          )}

          {step === 3 && (
            <JournalEditor
              date="16 SETTEMBRE"
              document={document16}
              entries={entry16}
              setEntries={setEntry16}
              onCheck={checkEntry16}
              feedback={feedback16}
              success={success16}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <section className="entry-card">
              <span className="eyebrow">MISSIONE COMPLETATA</span>
              <h2>Ottimo lavoro!</h2>
              <p>Hai registrato correttamente le prime due operazioni di NOVA TECH.</p>
              <div className="hint">
                <strong>Riepilogo delle registrazioni</strong>
                <p>15 settembre: costituzione dell'impresa per € 90.000.</p>
                <p>16 settembre: versamento degli assegni bancari per € 45.000.</p>
              </div>
              <button className="primary-button" onClick={() => {
                setStep(0)
                setActiveMission(0)
              }}>
                TORNA ALLE MISSIONI →
              </button>
            </section>
          )}
        </main>
      ) : activeMission === 2 ? (
        <main className="mission-page">
          <button className="back-button" onClick={() => setActiveMission(0)}>← TORNA ALLE MISSIONI</button>

          <div className="mission-header">
            <span className="eyebrow">MISSIONE 02 · NOVA TECH</span>
            <h1>I primi acquisti</h1>
            <p>L'azienda è operativa: registra i primi acquisti e gestisci correttamente l'IVA.</p>
          </div>

          {step === 0 && (
            <section className="mission-content">
              {document20}
              <TaskCard
                title="Registra la fattura"
                description="Devi rilevare il costo delle merci, il costo del trasporto, l'IVA a credito e il debito verso il fornitore."
                hint="Il trasporto addebitato dal fornitore concorre alla base imponibile IVA. Il debito verso il fornitore comprende l'intero importo della fattura."
                buttonText="INIZIA LA REGISTRAZIONE"
                onClick={() => setStep(1)}
              />
            </section>
          )}

          {step === 1 && (
            <JournalEditor
              date="20 SETTEMBRE"
              document={document20}
              entries={entry20}
              setEntries={setEntry20}
              onCheck={checkEntry20}
              feedback={feedback20}
              success={success20}
              onContinue={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <section className="mission-content">
              {document22}
              <TaskCard
                title="Registra il pagamento"
                description="Rileva il costo del materiale di consumo, l'IVA a credito e l'uscita di denaro dalla cassa."
                hint="Il costo e l'IVA a credito si registrano in Dare. La diminuzione della cassa si registra in Avere."
                buttonText="INIZIA LA REGISTRAZIONE"
                onClick={() => setStep(3)}
              />
            </section>
          )}

          {step === 3 && (
            <JournalEditor
              date="22 SETTEMBRE"
              document={document22}
              entries={entry22}
              setEntries={setEntry22}
              onCheck={checkEntry22}
              feedback={feedback22}
              success={success22}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <section className="entry-card">
              <span className="eyebrow">MISSIONE COMPLETATA</span>
              <h2>Complimenti!</h2>
              <p>Hai registrato correttamente i primi acquisti di NOVA TECH.</p>
              <div className="hint">
                <strong>Riepilogo delle registrazioni</strong>
                <p>20 settembre: acquisto merci e trasporto per un imponibile di € 14.400, IVA € 3.168, totale € 17.568.</p>
                <p>22 settembre: acquisto materiale di consumo per € 600, IVA € 132, totale pagato € 732.</p>
              </div>
              <button className="primary-button" onClick={() => {
                setStep(0)
                setActiveMission(0)
              }}>
                TORNA ALLE MISSIONI →
              </button>
            </section>
          )}
        </main>
      ) : (
        <main className="mission-page">
          <button className="back-button" onClick={() => setActiveMission(0)}>← TORNA ALLE MISSIONI</button>
          <div className="mission-header">
            <h1>Missione non ancora disponibile</h1>
            <p>Completa le missioni precedenti per proseguire.</p>
          </div>
        </main>
      )}

      <footer>NOVA TECH <span>·</span> LABORATORIO DI ECONOMIA AZIENDALE</footer>
    </div>
  )
}

export default App
