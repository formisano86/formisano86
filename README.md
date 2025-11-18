# E-Commerce Platform

Una piattaforma e-commerce completa costruita con Node.js, Express, PostgreSQL, Next.js e React.

## Caratteristiche

### Backend
- **API RESTful** completa con Node.js ed Express
- **Database PostgreSQL** con Prisma ORM
- **Autenticazione JWT** con ruoli utente (Admin, Manager, Customer)
- **Gestione prodotti** con categorie, immagini, inventario
- **Sistema ordini** completo con tracking
- **Gestione fornitori** (Suppliers)
- **Gestione corrieri** con tracking spedizioni
- **Sistema CMS** per pagine personalizzate
- **Marketing**: Newsletter e codici sconto
- **Pagamenti multipli**: Stripe, PayPal, Klarna

### Frontend
- **Next.js 14** con App Router
- **React 18** e TypeScript
- **Tailwind CSS** per lo styling
- **Zustand** per state management
- **Checkout rapido** senza restrizioni
- **Design responsive** e moderno
- **Integrazioni pagamento** complete
- **Pannello admin** (in sviluppo)

## Requisiti

- Node.js 20+
- Docker e Docker Compose (consigliato)
- PostgreSQL 16+ (se non usi Docker)

## Installazione Rapida con Docker

1. **Clona il repository**
```bash
git clone <repository-url>
cd formisano86
```

2. **Avvia tutti i servizi**
```bash
docker-compose up -d
```

3. **Configura il database**
```bash
# Accedi al container backend
docker exec -it ecommerce-backend sh

# Esegui le migrazioni Prisma
npx prisma migrate dev --name init

# (Opzionale) Popola il database con dati di test
npx prisma db seed
```

4. **Accedi all'applicazione**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Installazione Manuale

### Backend

1. **Installa le dipendenze**
```bash
cd backend
npm install
```

2. **Configura le variabili d'ambiente**
```bash
cp .env.example .env
# Modifica .env con le tue configurazioni
```

3. **Configura il database**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Avvia il server**
```bash
npm run dev
```

### Frontend

1. **Installa le dipendenze**
```bash
cd frontend
npm install
```

2. **Configura le variabili d'ambiente**
```bash
cp .env.local.example .env.local
# Modifica .env.local con le tue configurazioni
```

3. **Avvia il server di sviluppo**
```bash
npm run dev
```

## Struttura del Progetto

```
formisano86/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controller delle API
│   │   ├── routes/          # Route delle API
│   │   ├── middleware/      # Middleware (auth, errors)
│   │   ├── config/          # Configurazioni
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   └── schema.prisma    # Schema del database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Pagine Next.js (App Router)
│   │   ├── components/      # Componenti React
│   │   ├── lib/             # API client e store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `GET /api/auth/profile` - Profilo utente (protetto)

### Prodotti
- `GET /api/products` - Lista prodotti (con filtri)
- `GET /api/products/:id` - Dettaglio prodotto
- `POST /api/products` - Crea prodotto (admin)
- `PUT /api/products/:id` - Aggiorna prodotto (admin)
- `DELETE /api/products/:id` - Elimina prodotto (admin)

### Categorie
- `GET /api/categories` - Lista categorie
- `GET /api/categories/:id` - Dettaglio categoria
- `POST /api/categories` - Crea categoria (admin)
- `PUT /api/categories/:id` - Aggiorna categoria (admin)
- `DELETE /api/categories/:id` - Elimina categoria (admin)

### Carrello
- `GET /api/cart` - Visualizza carrello
- `POST /api/cart/items` - Aggiungi al carrello
- `PUT /api/cart/items/:id` - Aggiorna quantità
- `DELETE /api/cart/items/:id` - Rimuovi dal carrello
- `DELETE /api/cart` - Svuota carrello

### Ordini
- `GET /api/orders` - Lista ordini
- `GET /api/orders/:id` - Dettaglio ordine
- `POST /api/orders` - Crea ordine
- `PATCH /api/orders/:id/status` - Aggiorna stato (admin)

### Pagamenti
- `POST /api/payments/stripe/create-payment-intent` - Crea pagamento Stripe
- `POST /api/payments/stripe/confirm` - Conferma pagamento Stripe
- `POST /api/payments/paypal/create-order` - Crea ordine PayPal
- `POST /api/payments/paypal/capture` - Cattura pagamento PayPal
- `POST /api/payments/klarna/create-session` - Crea sessione Klarna
- `POST /api/payments/klarna/confirm` - Conferma pagamento Klarna

### Marketing
- `POST /api/marketing/newsletter/subscribe` - Iscrizione newsletter
- `GET /api/marketing/discounts/:code` - Valida codice sconto
- `GET /api/marketing/discounts` - Lista sconti (admin)
- `POST /api/marketing/discounts` - Crea sconto (admin)

### CMS
- `GET /api/cms/pages` - Lista pagine
- `GET /api/cms/pages/:slug` - Dettaglio pagina
- `POST /api/cms/pages` - Crea pagina (admin)
- `PUT /api/cms/pages/:id` - Aggiorna pagina (admin)

### Fornitori
- `GET /api/suppliers` - Lista fornitori (admin)
- `POST /api/suppliers` - Crea fornitore (admin)

### Corrieri
- `GET /api/carriers` - Lista corrieri
- `POST /api/carriers` - Crea corriere (admin)

## Configurazione Pagamenti

### Stripe
1. Crea un account su [Stripe](https://stripe.com)
2. Ottieni le chiavi API dalla dashboard
3. Aggiungi le chiavi a `.env` (backend) e `.env.local` (frontend)

### PayPal
1. Crea un account business su [PayPal](https://paypal.com)
2. Vai su [Developer Dashboard](https://developer.paypal.com)
3. Crea un'app e ottieni Client ID e Secret
4. Aggiungi le credenziali a `.env` (backend) e `.env.local` (frontend)

### Klarna
1. Registrati su [Klarna](https://www.klarna.com/us/business/)
2. Ottieni le credenziali API
3. Aggiungi le credenziali a `.env`

## Deployment

### Produzione con Docker

```bash
# Build delle immagini
docker-compose build

# Avvia in produzione
docker-compose up -d

# Verifica lo stato
docker-compose ps
```

### Database Migrations

```bash
# Crea una nuova migrazione
npx prisma migrate dev --name migration_name

# Applica migrazioni in produzione
npx prisma migrate deploy
```

## Sicurezza

- Autenticazione JWT con token sicuri
- Password hashate con bcrypt
- Validazione input con express-validator
- CORS configurato
- Variabili d'ambiente per dati sensibili
- Rate limiting (da implementare)
- HTTPS in produzione (consigliato)

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Contribuire

1. Fork il progetto
2. Crea un feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Roadmap

- [ ] Pannello amministratore completo
- [ ] Sistema di recensioni prodotti
- [ ] Gestione wishlist
- [ ] Notifiche email transazionali
- [ ] Dashboard analytics
- [ ] Multi-lingua
- [ ] Progressive Web App (PWA)
- [ ] Test automatizzati
- [ ] Sistema di raccomandazioni

## Licenza

MIT

## Supporto

Per domande e supporto, apri una issue su GitHub.
