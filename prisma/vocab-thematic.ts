/**
 * VOCABOLARIO TEMATICO — 15 categorie × 6 lingue
 * ===============================================
 * Le 15 categorie "della vita quotidiana" richieste dall'utente,
 * disponibili in tutte le lingue del gioco (it, en, es, fr, de, pt).
 *
 * Regole per le parole: MAIUSCOLO, solo A-Z (senza accenti),
 * senza spazi/apostrofi, lunghezza 3-12 lettere.
 * I `names` e `descriptions` sono etichette UI: accenti ammessi.
 */

export type LangCode = 'it' | 'en' | 'es' | 'fr' | 'de' | 'pt'

export const LANGUAGES: { code: LangCode; name: string; emoji: string }[] = [
  { code: 'it', name: 'Italiano', emoji: '🇮🇹' },
  { code: 'en', name: 'English', emoji: '🇬🇧' },
  { code: 'es', name: 'Español', emoji: '🇪🇸' },
  { code: 'fr', name: 'Français', emoji: '🇫🇷' },
  { code: 'de', name: 'Deutsch', emoji: '🇩🇪' },
  { code: 'pt', name: 'Português', emoji: '🇵🇹' },
]

export interface ThematicCategory {
  slug: string
  emoji: string
  color: string
  names: Record<LangCode, string>
  descriptions: Record<LangCode, string>
  words: Record<LangCode, string[]>
}

/** Slug delle 15 categorie tematiche, nell'ordine richiesto dall'utente */
export const THEMATIC_SLUGS = [
  'persone',
  'aspetto-abbigliamento',
  'salute',
  'casa',
  'servizi',
  'shopping',
  'food',
  'mangiare-fuori',
  'studio',
  'lavoro',
  'trasporti',
  'sport',
  'tempo-libero',
  'ambiente',
  'altro',
] as const

export const THEMATIC_CATEGORIES: ThematicCategory[] = [
  {
    slug: 'persone',
    emoji: '👥',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    names: { it: 'Persone', en: 'People', es: 'Personas', fr: 'Personnes', de: 'Personen', pt: 'Pessoas' },
    descriptions: {
      it: 'Le persone della tua vita',
      en: 'People in your life',
      es: 'Personas de tu vida',
      fr: 'Les gens de votre vie',
      de: 'Menschen in deinem Leben',
      pt: 'Pessoas da sua vida',
    },
    words: {
      it: ['MADRE', 'PADRE', 'FIGLIO', 'FIGLIA', 'FRATELLO', 'SORELLA', 'NONNO', 'NONNA', 'ZIO', 'ZIA', 'CUGINO', 'CUGINA', 'AMICO', 'AMICA', 'VICINO', 'BAMBINO', 'BAMBINA', 'SPOSO', 'SPOSA', 'PERSONA'],
      en: ['MOTHER', 'FATHER', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT', 'COUSIN', 'FRIEND', 'NEIGHBOR', 'BOY', 'GIRL', 'HUSBAND', 'WIFE', 'BABY', 'PERSON', 'PEOPLE'],
      es: ['MADRE', 'PADRE', 'HIJO', 'HIJA', 'HERMANO', 'HERMANA', 'ABUELO', 'ABUELA', 'TIO', 'TIA', 'PRIMO', 'PRIMA', 'AMIGO', 'AMIGA', 'VECINO', 'NINO', 'NINA', 'ESPOSO', 'ESPOSA', 'PERSONA'],
      fr: ['MERE', 'PERE', 'FILS', 'FILLE', 'FRERE', 'SOEUR', 'ONCLE', 'TANTE', 'COUSIN', 'COUSINE', 'AMI', 'AMIE', 'VOISIN', 'GARCON', 'MARI', 'FEMME', 'BEBE', 'ENFANT', 'PERSONNE', 'GENS'],
      de: ['MUTTER', 'VATER', 'SOHN', 'TOCHTER', 'BRUDER', 'SCHWESTER', 'ONKEL', 'TANTE', 'COUSIN', 'FREUND', 'FREUNDIN', 'NACHBAR', 'JUNGE', 'MAEDCHEN', 'EHEMANN', 'EHEFRAU', 'OPA', 'OMA', 'KIND', 'LEUTE'],
      pt: ['MAE', 'PAI', 'FILHO', 'FILHA', 'IRMAO', 'IRMA', 'AVO', 'TIO', 'TIA', 'PRIMO', 'PRIMA', 'AMIGO', 'AMIGA', 'VIZINHO', 'MENINO', 'MENINA', 'MARIDO', 'ESPOSA', 'CRIANCA', 'PESSOA'],
    },
  },
  {
    slug: 'aspetto-abbigliamento',
    emoji: '👕',
    color: 'bg-pink-100 text-pink-900 border-pink-300',
    names: { it: 'Aspetto & Abbigliamento', en: 'Looks & Clothing', es: 'Aspecto y Ropa', fr: 'Apparence & Vêtements', de: 'Aussehen & Kleidung', pt: 'Aparência & Roupas' },
    descriptions: {
      it: 'Stile e guardaroba',
      en: 'Style and wardrobe',
      es: 'Estilo y armario',
      fr: 'Style et garde-robe',
      de: 'Stil und Garderobe',
      pt: 'Estilo e guarda-roupa',
    },
    words: {
      it: ['VESTITO', 'CAMICIA', 'PANTALONI', 'GONNA', 'MAGLIA', 'GIACCA', 'CAPPOTTO', 'SCARPE', 'STIVALI', 'CAPPELLO', 'SCIARPA', 'GUANTI', 'CINTURA', 'CALZE', 'PIGIAMA', 'COSTUME', 'JEANS', 'FELPA', 'OCCHIALI', 'BORSA'],
      en: ['DRESS', 'SHIRT', 'PANTS', 'SKIRT', 'SWEATER', 'JACKET', 'COAT', 'SHOES', 'BOOTS', 'HAT', 'SCARF', 'GLOVES', 'BELT', 'SOCKS', 'PAJAMAS', 'COSTUME', 'JEANS', 'HOODIE', 'GLASSES', 'SANDALS', 'TSHIRT'],
      es: ['VESTIDO', 'CAMISA', 'PANTALONES', 'FALDA', 'CHAQUETA', 'ABRIGO', 'ZAPATOS', 'BOTAS', 'SOMBRERO', 'BUFANDA', 'GUANTES', 'CINTURON', 'CALCETINES', 'PIJAMA', 'JEANS', 'GAFAS', 'BOLSO', 'SANDALIAS', 'CORBATA', 'CAMISETA'],
      fr: ['ROBE', 'CHEMISE', 'PANTALON', 'JUPE', 'PULL', 'VESTE', 'MANTEAU', 'CHAUSSURES', 'BOTTES', 'CHAPEAU', 'ECHARPE', 'GANTS', 'CEINTURE', 'CHAUSSETTES', 'PYJAMA', 'COSTUME', 'JEANS', 'SWEAT', 'LUNETTES', 'SANDALES'],
      de: ['KLEID', 'HEMD', 'HOSE', 'ROCK', 'PULLOVER', 'JACKE', 'MANTEL', 'SCHUHE', 'STIEFEL', 'HUT', 'SCHAL', 'HANDSCHUHE', 'GUERTEL', 'SOCKEN', 'PYJAMA', 'KOSTUM', 'JEANS', 'HOODIE', 'BRILLE', 'TASCHE'],
      pt: ['VESTIDO', 'CAMISA', 'CALCAS', 'SAIA', 'BLUSA', 'CASACO', 'ABRIGO', 'SAPATOS', 'BOTAS', 'CHAPEU', 'LENCO', 'LUVAS', 'CINTO', 'MEIAS', 'PIJAMA', 'ROUPA', 'JEANS', 'MOLETOM', 'OCULOS', 'BOLSA'],
    },
  },
  {
    slug: 'salute',
    emoji: '🩺',
    color: 'bg-green-100 text-green-900 border-green-300',
    names: { it: 'Salute', en: 'Health', es: 'Salud', fr: 'Santé', de: 'Gesundheit', pt: 'Saúde' },
    descriptions: {
      it: 'Benessere e cure',
      en: 'Wellness and cures',
      es: 'Bienestar y curas',
      fr: 'Bien-être et soins',
      de: 'Wohlbefinden und Heilung',
      pt: 'Bem-estar e curas',
    },
    words: {
      it: ['MEDICO', 'FEBBRE', 'TOSSE', 'RAFFREDDORE', 'DOLORE', 'CURA', 'PILLOLA', 'OSPEDALE', 'INFERMIERE', 'VACCINO', 'DIETA', 'RIPOSO', 'FERITA', 'GESSO', 'TERMOMETRO', 'VITAMINE', 'FARMACIA', 'MALATO', 'BENDAGGIO', 'AMBULATORIO'],
      en: ['DOCTOR', 'FEVER', 'COUGH', 'COLD', 'PAIN', 'CURE', 'PILL', 'HOSPITAL', 'NURSE', 'VACCINE', 'DIET', 'REST', 'WOUND', 'CAST', 'THERMOMETER', 'VITAMINS', 'PHARMACY', 'HEALTH', 'SICK', 'BANDAGE'],
      es: ['MEDICO', 'FIEBRE', 'TOS', 'RESFRIADO', 'DOLOR', 'CURA', 'PASTILLA', 'HOSPITAL', 'ENFERMERO', 'VACUNA', 'DIETA', 'DESCANSO', 'HERIDA', 'ESCAYOLA', 'TERMOMETRO', 'VITAMINAS', 'FARMACIA', 'SALUD', 'ENFERMO', 'VENDAJE'],
      fr: ['MEDECIN', 'FIEVRE', 'TOUX', 'RHUME', 'DOULEUR', 'REMEDE', 'COMPRIME', 'HOPITAL', 'INFIRMIER', 'VACCIN', 'REGIME', 'REPOS', 'BLESSURE', 'PLATRE', 'THERMOMETRE', 'VITAMINES', 'PHARMACIE', 'SANTE', 'MALADE', 'PANSEMENT'],
      de: ['ARZT', 'FIEBER', 'HUSTEN', 'ERKAELTUNG', 'SCHMERZ', 'KUR', 'PILLE', 'KRANKENHAUS', 'PFLEGER', 'IMPFUNG', 'DIAET', 'RUHE', 'WUNDE', 'GIPS', 'THERMOMETER', 'VITAMINE', 'APOTHEKE', 'GESUNDHEIT', 'KRANK', 'VERBAND'],
      pt: ['MEDICO', 'FEBRE', 'TOSSE', 'RESFRIADO', 'DOR', 'CURA', 'REMEDIO', 'HOSPITAL', 'ENFERMEIRO', 'VACINA', 'DIETA', 'DESCANSO', 'FERIDA', 'GESSO', 'TERMOMETRO', 'VITAMINAS', 'FARMACIA', 'SAUDE', 'DOENTE', 'ATADURA'],
    },
  },
  {
    slug: 'casa',
    emoji: '🏠',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    names: { it: 'Casa', en: 'Home', es: 'Hogar', fr: 'Maison', de: 'Zuhause', pt: 'Casa' },
    descriptions: {
      it: 'Stanze e oggetti di casa',
      en: 'Rooms and home things',
      es: 'Habitaciones y cosas',
      fr: 'Les pièces de la maison',
      de: 'Zimmer und Wohnen',
      pt: 'Cômodos e coisas de casa',
    },
    words: {
      // it: la categoria Casa esiste già nel seed classico (arricchita lì)
      it: [],
      en: ['DOOR', 'WINDOW', 'TABLE', 'CHAIR', 'SOFA', 'BED', 'KITCHEN', 'BATHROOM', 'MIRROR', 'WARDROBE', 'LAMP', 'CARPET', 'PILLOW', 'GARDEN', 'BALCONY', 'ATTIC', 'BASEMENT', 'STAIRS', 'ROOF', 'WALL', 'FLOOR', 'HALLWAY', 'GARAGE', 'DESK'],
      es: ['PUERTA', 'VENTANA', 'MESA', 'SILLA', 'SOFA', 'CAMA', 'COCINA', 'BANO', 'ESPEJO', 'ARMARIO', 'LAMPARA', 'ALFOMBRA', 'ALMOHADA', 'JARDIN', 'BALCON', 'DESVAN', 'SOTANO', 'ESCALERA', 'TECHO', 'PARED', 'SUELO', 'PASILLO', 'GARAJE', 'ESCRITORIO'],
      fr: ['PORTE', 'FENETRE', 'TABLE', 'CHAISE', 'CANAPE', 'LIT', 'CUISINE', 'MIROIR', 'ARMOIRE', 'LAMPE', 'TAPIS', 'COUSSIN', 'JARDIN', 'BALCON', 'GRENIER', 'CAVE', 'ESCALIER', 'TOIT', 'MUR', 'SOL', 'COULOIR', 'GARAGE', 'DOUCHE', 'PLACARD'],
      de: ['TUER', 'FENSTER', 'TISCH', 'STUHL', 'SOFA', 'BETT', 'KUECHE', 'BAD', 'SPIEGEL', 'SCHRANK', 'LAMPE', 'TEPPICH', 'KISSEN', 'GARTEN', 'BALKON', 'DACHBODEN', 'KELLER', 'TREPPE', 'DACH', 'WAND', 'BODEN', 'FLUR', 'GARAGE', 'DUSCHE'],
      pt: ['PORTA', 'JANELA', 'MESA', 'CADEIRA', 'SOFA', 'CAMA', 'COZINHA', 'BANHEIRO', 'ESPELHO', 'ARMARIO', 'LAMPADA', 'TAPETE', 'ALMOFADA', 'JARDIM', 'VARANDA', 'QUARTO', 'PORAO', 'ESCADA', 'TELHADO', 'PAREDE', 'CHAO', 'CORREDOR', 'GARAGEM', 'CHUVEIRO'],
    },
  },
  {
    slug: 'servizi',
    emoji: '🏤',
    color: 'bg-slate-100 text-slate-900 border-slate-300',
    names: { it: 'Servizi', en: 'Services', es: 'Servicios', fr: 'Services', de: 'Dienstleistungen', pt: 'Serviços' },
    descriptions: {
      it: 'Servizi utili della città',
      en: 'Useful town services',
      es: 'Servicios de la ciudad',
      fr: 'Services de la ville',
      de: 'Dienste der Stadt',
      pt: 'Serviços da cidade',
    },
    words: {
      it: ['POSTA', 'BANCA', 'BIBLIOTECA', 'POLIZIA', 'PARRUCCHIERE', 'BARBIERE', 'IDRAULICO', 'ELETTRICISTA', 'LAVANDERIA', 'OFFICINA', 'AMBULANZA', 'MUNICIPIO', 'VETERINARIO', 'COMUNE', 'TIMBRO', 'PACCO', 'SPEDIZIONE', 'INDIRIZZO', 'SERVIZIO', 'VIGILI'],
      en: ['POST', 'BANK', 'LIBRARY', 'POLICE', 'HAIRDRESSER', 'BARBER', 'PLUMBER', 'ELECTRICIAN', 'LAUNDRY', 'WORKSHOP', 'AMBULANCE', 'TOWNHALL', 'VETERINARIAN', 'MAIL', 'PACKAGE', 'SHIPPING', 'SERVICE', 'CLINIC', 'FIREFIGHTERS', 'AGENCY'],
      es: ['CORREOS', 'BANCO', 'BIBLIOTECA', 'POLICIA', 'PELUQUERO', 'BARBERO', 'FONTANERO', 'ELECTRICISTA', 'LAVANDERIA', 'TALLER', 'AMBULANCIA', 'AYUNTAMIENTO', 'VETERINARIO', 'CARTA', 'PAQUETE', 'ENVIO', 'SERVICIO', 'CLINICA', 'BOMBEROS', 'AGENCIA'],
      fr: ['POSTE', 'BANQUE', 'BIBLIOTHEQUE', 'POLICE', 'COIFFEUR', 'BARBIER', 'PLOMBIER', 'ELECTRICIEN', 'LAVERIE', 'ATELIER', 'AMBULANCE', 'MAIRIE', 'VETERINAIRE', 'COURRIER', 'COLIS', 'ENVOI', 'SERVICE', 'CLINIQUE', 'POMPIERS', 'AGENCE'],
      de: ['POST', 'BANK', 'BIBLIOTHEK', 'POLIZEI', 'FRISEUR', 'KLEMPNER', 'ELEKTRIKER', 'WASCHSALON', 'WERKSTATT', 'KRANKENWAGEN', 'RATHAUS', 'TIERARZT', 'BRIEF', 'PAKET', 'VERSAND', 'DIENST', 'KLINIK', 'FEUERWEHR', 'AMT', 'AGENTUR'],
      pt: ['CORREIO', 'BANCO', 'BIBLIOTECA', 'POLICIA', 'CABELEIREIRO', 'BARBEIRO', 'ENCANADOR', 'ELETRICISTA', 'LAVANDERIA', 'OFICINA', 'AMBULANCIA', 'PREFEITURA', 'VETERINARIO', 'CARTA', 'PACOTE', 'ENVIO', 'SERVICO', 'CLINICA', 'BOMBEIROS', 'CARTORIO'],
    },
  },
  {
    slug: 'shopping',
    emoji: '🛍️',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
    names: { it: 'Shopping', en: 'Shopping', es: 'Compras', fr: 'Shopping', de: 'Shopping', pt: 'Compras' },
    descriptions: {
      it: 'Casse, carrelli e offerte',
      en: 'Checkout carts and deals',
      es: 'Cajas, carritos y ofertas',
      fr: 'Caisses et bonnes affaires',
      de: 'Kassen und Angebote',
      pt: 'Caixas, carrinhos e ofertas',
    },
    words: {
      it: ['MERCATO', 'NEGOZIO', 'CENTRO', 'SCONTO', 'PREZZO', 'CASSA', 'CARRELLO', 'BUSTA', 'CLIENTE', 'VENDITORE', 'OFFERTA', 'SALDO', 'REGALO', 'ACQUISTO', 'MONETA', 'BANCONOTA', 'CARTA', 'VETRINA', 'SPESA', 'BUDGET'],
      en: ['MARKET', 'SHOP', 'MALL', 'DISCOUNT', 'PRICE', 'CHECKOUT', 'CART', 'BAG', 'CUSTOMER', 'SELLER', 'OFFER', 'SALE', 'GIFT', 'PURCHASE', 'COIN', 'BANKNOTE', 'CARD', 'RECEIPT', 'BUDGET', 'COUPON'],
      es: ['MERCADO', 'TIENDA', 'CENTRO', 'DESCUENTO', 'PRECIO', 'CAJA', 'CARRITO', 'BOLSA', 'CLIENTE', 'VENDEDOR', 'OFERTA', 'REBAJA', 'REGALO', 'COMPRA', 'MONEDA', 'BILLETE', 'TARJETA', 'ESCAPARATE', 'RECIBO', 'CUPON'],
      fr: ['MARCHE', 'BOUTIQUE', 'CENTRE', 'REMISE', 'PRIX', 'CAISSE', 'PANIER', 'SAC', 'CLIENT', 'VENDEUR', 'OFFRE', 'SOLDE', 'CADEAU', 'ACHAT', 'PIECE', 'BILLET', 'CARTE', 'VITRINE', 'RECU', 'RABAIS'],
      de: ['MARKT', 'LADEN', 'EINKAUF', 'RABATT', 'PREIS', 'KASSE', 'WAGEN', 'TUETE', 'KUNDE', 'VERKAEUFER', 'ANGEBOT', 'AUSVERKAUF', 'GESCHENK', 'KAUF', 'MUENZE', 'GELDSCHEIN', 'KARTE', 'SCHAUFENSTER', 'KASSENBON', 'GUTSCHEIN'],
      pt: ['MERCADO', 'LOJA', 'SHOPPING', 'DESCONTO', 'PRECO', 'CAIXA', 'CARRINHO', 'SACOLA', 'CLIENTE', 'VENDEDOR', 'OFERTA', 'LIQUIDACAO', 'PRESENTE', 'COMPRA', 'MOEDA', 'NOTA', 'CARTAO', 'VITRINE', 'RECIBO', 'CUPOM'],
    },
  },
  {
    slug: 'food',
    emoji: '🍔',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
    names: { it: 'Food', en: 'Food', es: 'Comida', fr: 'Nourriture', de: 'Essen', pt: 'Comida' },
    descriptions: {
      it: 'Street food e sapori globali',
      en: 'Street food and global flavors',
      es: 'Comida rápida mundial',
      fr: 'Saveurs du monde entier',
      de: 'Snacks aus aller Welt',
      pt: 'Sabores do mundo',
    },
    words: {
      // en: la categoria Food esiste già nel seed classico (arricchita lì);
      // it: "Food" è nuova (internazionale/street food), il classico "Cibo" resta a parte
      it: ['HAMBURGER', 'HOTDOG', 'SUSHI', 'KEBAB', 'TACOS', 'BURRITO', 'NOODLES', 'CURRY', 'SANDWICH', 'PANINO', 'WRAP', 'PATATINE', 'POPCORN', 'KETCHUP', 'MAIONESE', 'SENAPE', 'PIADINA', 'CREPES', 'WAFFLE', 'BAGEL', 'PRETZEL', 'TOAST'],
      en: [],
      es: ['HAMBURGUESA', 'HOTDOG', 'SUSHI', 'KEBAB', 'TACOS', 'BURRITO', 'NOODLES', 'CURRY', 'SANDWICH', 'BOCADILLO', 'WRAP', 'PATATAS', 'PALOMITAS', 'KETCHUP', 'MAYONESA', 'MOSTAZA', 'CREPES', 'GOFRAS', 'BAGEL', 'CHURROS', 'TORTILLA', 'TAPAS'],
      fr: ['HAMBURGER', 'HOTDOG', 'SUSHI', 'KEBAB', 'TACOS', 'BURRITO', 'NOUILLES', 'CURRY', 'SANDWICH', 'GALETTE', 'WRAP', 'FRITES', 'POPCORN', 'KETCHUP', 'MAYONNAISE', 'MOUTARDE', 'CREPES', 'GAUFRES', 'BAGEL', 'CROISSANT'],
      de: ['HAMBURGER', 'HOTDOG', 'SUSHI', 'KEBAB', 'DOENER', 'TACOS', 'BURRITO', 'NUDELN', 'CURRY', 'SANDWICH', 'BREZEL', 'WRAP', 'POMMES', 'POPCORN', 'KETCHUP', 'MAYO', 'SENF', 'CREPES', 'WAFFELN', 'BAGEL', 'CROISSANT', 'BRATWURST'],
      pt: ['HAMBURGUER', 'HOTDOG', 'SUSHI', 'KEBAB', 'TACOS', 'BURRITO', 'NOODLES', 'CURRY', 'SANDUICHE', 'WRAP', 'BATATAS', 'PIPOCA', 'KETCHUP', 'MAIONESE', 'MOSTARDA', 'CREPES', 'WAFFLES', 'BAGEL', 'PRETZEL', 'CHURROS', 'PASTEL', 'COXINHA'],
    },
  },
  {
    slug: 'mangiare-fuori',
    emoji: '🍽️',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
    names: { it: 'Mangiare Fuori', en: 'Eating Out', es: 'Comer Fuera', fr: 'Au Restaurant', de: 'Essen Gehen', pt: 'Comer Fora' },
    descriptions: {
      it: 'Dal menù al conto',
      en: 'From menu to bill',
      es: 'Del menú a la cuenta',
      fr: 'La table est mise',
      de: 'Im Restaurant',
      pt: 'Do menu à conta',
    },
    words: {
      it: ['RISTORANTE', 'PIZZERIA', 'TRATTORIA', 'MENU', 'CAMERIERE', 'CONTO', 'MANCIA', 'PRENOTAZIONE', 'APERITIVO', 'ANTIPASTO', 'PRIMO', 'SECONDO', 'DOLCE', 'GELATERIA', 'BIRRERIA', 'ENOTECA', 'CHIOSCO', 'BANCONE', 'COLAZIONE', 'MERENDA'],
      en: ['RESTAURANT', 'PIZZERIA', 'DINER', 'MENU', 'WAITER', 'BILL', 'TIP', 'RESERVATION', 'APERITIF', 'STARTER', 'MAIN', 'DESSERT', 'CAFE', 'FORK', 'KNIFE', 'SPOON', 'NAPKIN', 'BREAKFAST', 'SNACK', 'BUFFET'],
      es: ['RESTAURANTE', 'PIZZERIA', 'CAFETERIA', 'MENU', 'CAMARERO', 'CUENTA', 'PROPINA', 'RESERVA', 'APERITIVO', 'ENTRANTE', 'PRIMERO', 'SEGUNDO', 'POSTRE', 'HELADERIA', 'TENEDOR', 'CUCHILLO', 'CUCHARA', 'SERVILLETA', 'DESAYUNO', 'BUFFET'],
      fr: ['RESTAURANT', 'PIZZERIA', 'BRASSERIE', 'MENU', 'SERVEUR', 'ADDITION', 'POURBOIRE', 'RESERVATION', 'APERITIF', 'ENTREE', 'PLAT', 'DESSERT', 'GLACIER', 'FOURCHETTE', 'COUTEAU', 'CUILLERE', 'SERVIETTE', 'DEJEUNER', 'DINER', 'BUFFET'],
      de: ['RESTAURANT', 'PIZZERIA', 'KNEIPE', 'MENUE', 'KELLNER', 'RECHNUNG', 'TRINKGELD', 'RESERVIERUNG', 'APERITIF', 'VORSPEISE', 'HAUPTGERICHT', 'NACHTISCH', 'EISDIELE', 'GAEBEL', 'MESSER', 'LOEFFEL', 'SERVIETTE', 'FRUEHSTUECK', 'IMBISS', 'BUFFET'],
      pt: ['RESTAURANTE', 'PIZZARIA', 'LANCHONETE', 'MENU', 'GARCOM', 'CONTA', 'GORJETA', 'RESERVA', 'APERITIVO', 'ENTRADA', 'PRATO', 'SOBREMESA', 'SORVETERIA', 'GARFO', 'FACA', 'COLHER', 'GUARDANAPO', 'ALMOCO', 'JANTAR', 'BUFFET'],
    },
  },
  {
    slug: 'studio',
    emoji: '📚',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    names: { it: 'Studio', en: 'Study', es: 'Estudios', fr: 'Études', de: 'Studium', pt: 'Estudo' },
    descriptions: {
      it: 'Zaino, libri e verifiche',
      en: 'Backpack, books and tests',
      es: 'Mochila y exámenes',
      fr: 'Cartable et examens',
      de: 'Ranzen und Prüfungen',
      pt: 'Mochila e provas',
    },
    words: {
      it: ['SCUOLA', 'UNIVERSITA', 'ESAME', 'COMPITI', 'LEZIONE', 'PROFESSORE', 'STUDENTE', 'LIBRO', 'QUADERNO', 'PENNA', 'MATITA', 'GOMMA', 'ZAINO', 'CLASSE', 'RICERCA', 'LAUREA', 'ORARIO', 'TEMA', 'DIPLOMA', 'RIPETIZIONE'],
      en: ['SCHOOL', 'UNIVERSITY', 'EXAM', 'HOMEWORK', 'LESSON', 'TEACHER', 'STUDENT', 'BOOK', 'NOTEBOOK', 'PEN', 'PENCIL', 'ERASER', 'BACKPACK', 'CLASS', 'ESSAY', 'DEGREE', 'SCHEDULE', 'QUIZ', 'DIPLOMA', 'LIBRARY'],
      es: ['ESCUELA', 'UNIVERSIDAD', 'EXAMEN', 'DEBERES', 'LECCION', 'PROFESOR', 'ESTUDIANTE', 'LIBRO', 'CUADERNO', 'BOLIGRAFO', 'LAPIZ', 'GOMA', 'MOCHILA', 'CLASE', 'APUNTES', 'TITULO', 'HORARIO', 'REDACCION', 'DIPLOMA', 'TESIS'],
      fr: ['ECOLE', 'UNIVERSITE', 'EXAMEN', 'DEVOIRS', 'LECON', 'PROFESSEUR', 'ELEVE', 'LIVRE', 'CAHIER', 'STYLO', 'CRAYON', 'GOMME', 'CARTABLE', 'CLASSE', 'RECHERCHE', 'DIPLOME', 'AGENDA', 'REDACTION', 'INTERRO', 'BAC'],
      de: ['SCHULE', 'UNIVERSITAET', 'PRUEFUNG', 'HAUSAUFGABEN', 'UNTERRICHT', 'LEHRER', 'SCHUELER', 'BUCH', 'HEFT', 'STIFT', 'BLEISTIFT', 'RADIERGUMMI', 'RANZEN', 'KLASSE', 'REFERAT', 'ABSCHLUSS', 'STUNDENPLAN', 'AUFSATZ', 'DIPLOM', 'ZEUGNIS'],
      pt: ['ESCOLA', 'UNIVERSIDADE', 'PROVA', 'TAREFA', 'LICAO', 'PROFESSOR', 'ALUNO', 'LIVRO', 'CADERNO', 'CANETA', 'LAPIS', 'BORRACHA', 'MOCHILA', 'TURMA', 'PESQUISA', 'DIPLOMA', 'HORARIO', 'REDACAO', 'MATRICULA', 'AULA'],
    },
  },
  {
    slug: 'lavoro',
    emoji: '💼',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    names: { it: 'Lavoro', en: 'Work', es: 'Trabajo', fr: 'Travail', de: 'Arbeit', pt: 'Trabalho' },
    descriptions: {
      it: 'Ufficio, contratti e carriera',
      en: 'Office, contracts and career',
      es: 'Oficina y carrera',
      fr: 'Bureau et carrière',
      de: 'Büro und Karriere',
      pt: 'Escritório e carreira',
    },
    words: {
      it: ['UFFICIO', 'RIUNIONE', 'CAPO', 'STIPENDIO', 'CONTRATTO', 'COLLOQUIO', 'CARRIERA', 'COLLEGA', 'TURNO', 'DITTA', 'AZIENDA', 'FABBRICA', 'MESTIERE', 'CURRICULUM', 'PAUSA', 'ASSENZA', 'FERIE', 'PROMOZIONE', 'CANDIDATO'],
      en: ['OFFICE', 'MEETING', 'BOSS', 'SALARY', 'CONTRACT', 'INTERVIEW', 'CAREER', 'COLLEAGUE', 'SHIFT', 'COMPANY', 'BUSINESS', 'FACTORY', 'TRADE', 'RESUME', 'BREAK', 'OVERTIME', 'PROMOTION', 'EMPLOYEE', 'HIRING', 'RETIREMENT'],
      es: ['OFICINA', 'REUNION', 'JEFE', 'SUELDO', 'CONTRATO', 'ENTREVISTA', 'CARRERA', 'COMPANERO', 'TURNO', 'EMPRESA', 'NEGOCIO', 'FABRICA', 'OFICIO', 'CURRICULUM', 'PAUSA', 'VACACIONES', 'ASCENSO', 'NOMINA', 'CANDIDATO'],
      fr: ['BUREAU', 'REUNION', 'CHEF', 'SALAIRE', 'CONTRAT', 'ENTRETIEN', 'CARRIERE', 'COLLEGUE', 'ENTREPRISE', 'USINE', 'METIER', 'CURRICULUM', 'PAUSE', 'VACANCES', 'PROMOTION', 'EMPLOI', 'STAGE', 'PATRON', 'MISSION', 'CANDIDAT'],
      de: ['BUERO', 'BESPRECHUNG', 'CHEF', 'GEHALT', 'VERTRAG', 'BEWERBUNG', 'KARRIERE', 'KOLLEGE', 'SCHICHT', 'FIRMA', 'BETRIEB', 'FABRIK', 'BERUF', 'LEBENSLAUF', 'PAUSE', 'URLAUB', 'BEFOERDERUNG', 'STELLE', 'PRAKTIKUM', 'MITARBEITER'],
      pt: ['ESCRITORIO', 'REUNIAO', 'CHEFE', 'SALARIO', 'CONTRATO', 'ENTREVISTA', 'CARREIRA', 'COLEGA', 'TURNO', 'EMPRESA', 'NEGOCIO', 'FABRICA', 'PROFISSAO', 'CURRICULO', 'PAUSA', 'FERIAS', 'PROMOCAO', 'EMPREGO', 'ESTAGIO', 'CANDIDATO'],
    },
  },
  {
    slug: 'trasporti',
    emoji: '🚌',
    color: 'bg-teal-100 text-teal-900 border-teal-300',
    names: { it: 'Trasporti', en: 'Transport', es: 'Transportes', fr: 'Transports', de: 'Verkehr', pt: 'Transporte' },
    descriptions: {
      it: 'In viaggio tra le celle',
      en: 'Traveling through the grid',
      es: 'Viajando por la cuadrícula',
      fr: 'Voyager dans la grille',
      de: 'Reisen durchs Gitter',
      pt: 'Viajando pela grade',
    },
    words: {
      it: ['TRENO', 'AUTOBUS', 'METRO', 'AEREO', 'NAVE', 'BICI', 'MOTORINO', 'MACCHINA', 'TAXI', 'STAZIONE', 'BINARIO', 'BIGLIETTO', 'AEROPORTO', 'VALIGIA', 'TRAFFICO', 'STRADA', 'PONTE', 'VIAGGIO', 'AUTOPISTA', 'TRAM', 'TRAGHETTO'],
      en: ['TRAIN', 'BUS', 'SUBWAY', 'PLANE', 'SHIP', 'BIKE', 'SCOOTER', 'CAR', 'TAXI', 'STATION', 'TRACK', 'TICKET', 'AIRPORT', 'SUITCASE', 'TRAFFIC', 'ROAD', 'BRIDGE', 'TRIP', 'HIGHWAY', 'TRAM', 'FERRY'],
      es: ['TREN', 'AUTOBUS', 'METRO', 'AVION', 'BARCO', 'BICI', 'MOTO', 'COCHE', 'TAXI', 'ESTACION', 'ANDEN', 'BILLETE', 'AEROPUERTO', 'MALETA', 'TRANSITO', 'CARRETERA', 'PUENTE', 'VIAJE', 'AUTOPISTA', 'TRANVIA', 'FERRY'],
      fr: ['TRAIN', 'BUS', 'METRO', 'AVION', 'BATEAU', 'VELO', 'SCOOTER', 'VOITURE', 'TAXI', 'GARE', 'VOIE', 'TICKET', 'AEROPORT', 'VALISE', 'TRAFIC', 'ROUTE', 'PONT', 'VOYAGE', 'AUTOROUTE', 'TRAMWAY', 'FERRY'],
      de: ['ZUG', 'BUS', 'UBAHN', 'FLUGZEUG', 'SCHIFF', 'FAHRRAD', 'ROLLER', 'AUTO', 'TAXI', 'BAHNHOF', 'GLEIS', 'TICKET', 'FLUGHAFEN', 'KOFFER', 'VERKEHR', 'STRASSE', 'BRUECKE', 'REISE', 'AUTOBAHN', 'BAHN', 'FAEHRE'],
      pt: ['TREM', 'ONIBUS', 'METRO', 'AVIAO', 'NAVIO', 'BICICLETA', 'MOTO', 'CARRO', 'TAXI', 'ESTACAO', 'PLATAFORMA', 'PASSAGEM', 'AEROPORTO', 'MALA', 'TRANSITO', 'ESTRADA', 'PONTE', 'VIAGEM', 'RODOVIA', 'BONDE', 'BALSA'],
    },
  },
  {
    slug: 'sport',
    emoji: '🏆',
    color: 'bg-teal-100 text-teal-900 border-teal-300',
    names: { it: 'Sport', en: 'Sport', es: 'Deporte', fr: 'Sport', de: 'Sport', pt: 'Esporte' },
    descriptions: {
      it: 'Podio, record e sudore',
      en: 'Podiums, records and sweat',
      es: 'Podio, récords y sudor',
      fr: 'Podium, records et sueur',
      de: 'Podium, Rekorde und Schweiß',
      pt: 'Pódio, recordes e suor',
    },
    words: {
      // it: la categoria Sport esiste già nel seed classico (arricchita lì)
      it: [],
      en: ['SOCCER', 'BALL', 'TENNIS', 'SWIMMING', 'BOXING', 'FENCING', 'CYCLING', 'RUNNING', 'MARATHON', 'SKIING', 'GOLF', 'RUGBY', 'BASEBALL', 'VOLLEYBALL', 'BASKETBALL', 'GYMNASTICS', 'HOCKEY', 'SKATING', 'CLIMBING', 'KARATE', 'JUDO', 'SURFING', 'SNOWBOARD', 'TOURNAMENT', 'COACH', 'REFEREE', 'TEAM', 'MEDAL'],
      es: ['FUTBOL', 'BALON', 'TENIS', 'NATACION', 'BOXEO', 'ESGRIMA', 'CICLISMO', 'CARRERA', 'MARATON', 'ESQUI', 'GOLF', 'RUGBY', 'BEISBOL', 'VOLEIBOL', 'BALONCESTO', 'GINASIA', 'HOQUEI', 'PATINAJE', 'ESCALADA', 'KARATE', 'JUDO', 'SURF', 'SNOWBOARD', 'TORNEO', 'ENTRENADOR', 'ARBITRO', 'EQUIPO', 'MEDALLA'],
      fr: ['FOOT', 'BALLON', 'TENNIS', 'NATATION', 'BOXE', 'ESCRIME', 'CYCLISME', 'COURSE', 'MARATHON', 'SKI', 'GOLF', 'RUGBY', 'BASEBALL', 'VOLLEY', 'BASKET', 'GYMNASTIQUE', 'HOCKEY', 'PATINAGE', 'ESCALADE', 'KARATE', 'JUDO', 'SURF', 'SNOWBOARD', 'TOURNOI', 'ENTRAINEUR', 'ARBITRE', 'EQUIPE'],
      de: ['FUSSBALL', 'BALL', 'TENNIS', 'SCHWIMMEN', 'BOXEN', 'FECHTEN', 'RADFAHREN', 'LAUFEN', 'MARATHON', 'SKIFAHREN', 'GOLF', 'RUGBY', 'BASEBALL', 'VOLLEYBALL', 'BASKETBALL', 'TURNEN', 'HOCKEY', 'EISLAUFEN', 'KLETTERN', 'KARATE', 'JUDO', 'SURFEN', 'SNOWBOARD', 'TURNIER', 'TRAINER', 'MANNSCHAFT', 'MEDAILLE'],
      pt: ['FUTEBOL', 'BOLA', 'TENIS', 'NATACAO', 'BOXE', 'ESGRIMA', 'CICLISMO', 'CORRIDA', 'MARATONA', 'ESQUI', 'ACADEMIA', 'GOLF', 'RUGBY', 'BEISEBOL', 'VOLEI', 'BASQUETE', 'GINASTICA', 'HOQUEI', 'PATINACAO', 'ESCALADA', 'KARATE', 'JUDO', 'SURFE', 'SNOWBOARD', 'TORNEIO', 'TREINADOR', 'ARBITRO', 'MEDALHA'],
    },
  },
  {
    slug: 'tempo-libero',
    emoji: '🎲',
    color: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    names: { it: 'Tempo Libero', en: 'Free Time', es: 'Tiempo Libre', fr: 'Temps Libre', de: 'Freizeit', pt: 'Tempo Livre' },
    descriptions: {
      it: 'Relax e passatempi',
      en: 'Relax and pastimes',
      es: 'Ocio y pasatiempos',
      fr: 'Détente et loisirs',
      de: 'Entspannung und Hobbys',
      pt: 'Relax e passatempos',
    },
    words: {
      it: ['CINEMA', 'TEATRO', 'MUSEO', 'CONCERTO', 'LETTURA', 'VIDEOGIOCO', 'PUZZLE', 'PESCA', 'CAMPEGGIO', 'GITA', 'FOTOGRAFIA', 'DANZA', 'GIOCO', 'HOBBY', 'VACANZA', 'WEEKEND', 'BARBECUE', 'BILIARDO', 'BOWLING', 'PASSEGGIATA'],
      en: ['CINEMA', 'THEATER', 'MUSEUM', 'CONCERT', 'READING', 'GAMES', 'PUZZLE', 'FISHING', 'CAMPING', 'TOUR', 'PHOTOGRAPHY', 'DANCING', 'GAME', 'HOBBY', 'VACATION', 'WEEKEND', 'BARBECUE', 'BILLIARDS', 'BOWLING', 'WALK'],
      es: ['CINE', 'TEATRO', 'MUSEO', 'CONCIERTO', 'LECTURA', 'VIDEOJUEGO', 'ROMPECABEZAS', 'PESCA', 'CAMPING', 'EXCURSION', 'FOTOGRAFIA', 'BAILE', 'JUEGO', 'AFICION', 'BARBACOA', 'BILLAR', 'BOWLING', 'PASEO', 'DIBUJO', 'BRICOLAJE'],
      fr: ['CINEMA', 'THEATRE', 'MUSEE', 'CONCERT', 'LECTURE', 'CONSOLE', 'PASSETEMPS', 'PUZZLE', 'PECHE', 'CAMPING', 'EXCURSION', 'PHOTOGRAPHIE', 'DANSE', 'LOISIR', 'WEEKEND', 'BARBECUE', 'BILLARD', 'BOWLING', 'PROMENADE', 'BRICOLAGE'],
      de: ['KINO', 'THEATER', 'MUSEUM', 'KONZERT', 'LESEN', 'VIDEOSPIEL', 'RAETSEL', 'ANGELN', 'CAMPING', 'AUSFLUG', 'FOTOGRAFIE', 'TANZEN', 'SPIEL', 'HOBBY', 'WOCHENENDE', 'GRILLEN', 'BILLARD', 'BOWLING', 'SPAZIERGANG', 'BASTELN'],
      pt: ['CINEMA', 'TEATRO', 'MUSEU', 'SHOW', 'LEITURA', 'VIDEOGAME', 'PASSATEMPO', 'PESCA', 'ACAMPAMENTO', 'PASSEIO', 'FOTOGRAFIA', 'DANCA', 'JOGO', 'HOBBY', 'CHURRASCO', 'SINUCA', 'BOWLING', 'CAMINHADA', 'DESENHO', 'ARTESANATO'],
    },
  },
  {
    slug: 'ambiente',
    emoji: '🌱',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    names: { it: 'Ambiente', en: 'Environment', es: 'Medio Ambiente', fr: 'Environnement', de: 'Umwelt', pt: 'Meio Ambiente' },
    descriptions: {
      it: 'Natura da proteggere',
      en: 'Nature to protect',
      es: 'Naturaleza por proteger',
      fr: 'La nature à protéger',
      de: 'Natur schützen',
      pt: 'Natureza para proteger',
    },
    words: {
      it: ['ALBERO', 'FIORE', 'FORESTA', 'FIUME', 'LAGO', 'CIELO', 'NUVOLA', 'TERRA', 'CLIMA', 'RICICLO', 'PIANTA', 'ANIMALE', 'SEME', 'RADICE', 'FOGLIA', 'ERBA', 'ARIA', 'ACQUA', 'ENERGIA', 'SOLARE', 'RIFIUTI', 'PLASTICA', 'EOLICO'],
      en: ['TREE', 'FLOWER', 'FOREST', 'RIVER', 'LAKE', 'SKY', 'CLOUD', 'EARTH', 'CLIMATE', 'RECYCLING', 'PLANT', 'ANIMAL', 'SEED', 'ROOT', 'LEAF', 'GRASS', 'AIR', 'WATER', 'ENERGY', 'SOLAR', 'WASTE', 'PLASTIC', 'WIND'],
      es: ['ARBOL', 'FLOR', 'BOSQUE', 'RIO', 'LAGO', 'CIELO', 'NUBE', 'TIERRA', 'CLIMA', 'RECICLAJE', 'PLANTA', 'ANIMAL', 'SEMILLA', 'RAIZ', 'HOJA', 'HIERBA', 'AIRE', 'AGUA', 'ENERGIA', 'SOLAR', 'RESIDUOS', 'PLASTICO', 'VIENTO'],
      fr: ['ARBRE', 'FLEUR', 'FORET', 'RIVIERE', 'LAC', 'CIEL', 'NUAGE', 'TERRE', 'CLIMAT', 'RECYCLAGE', 'PLANTE', 'ANIMAL', 'GRAINE', 'RACINE', 'FEUILLE', 'HERBE', 'AIR', 'EAU', 'ENERGIE', 'SOLAIRE', 'DECHETS', 'PLASTIQUE', 'VENT'],
      de: ['BAUM', 'BLUME', 'WALD', 'FLUSS', 'SEE', 'HIMMEL', 'WOLKE', 'ERDE', 'KLIMA', 'RECYCLING', 'PFLANZE', 'TIER', 'SAMEN', 'WURZEL', 'BLATT', 'GRAS', 'LUFT', 'WASSER', 'ENERGIE', 'SOLAR', 'ABFALL', 'PLASTIK', 'WIND'],
      pt: ['ARVORE', 'FLOR', 'FLORESTA', 'RIO', 'LAGO', 'CEU', 'NUVEM', 'TERRA', 'CLIMA', 'RECICLAGEM', 'PLANTA', 'ANIMAL', 'SEMENTE', 'RAIZ', 'FOLHA', 'GRAMA', 'AR', 'AGUA', 'ENERGIA', 'SOLAR', 'LIXO', 'PLASTICO', 'VENTO'],
    },
  },
  {
    slug: 'altro',
    emoji: '✨',
    color: 'bg-violet-100 text-violet-900 border-violet-300',
    names: { it: 'Altro', en: 'Other', es: 'Otros', fr: 'Autres', de: 'Sonstiges', pt: 'Outros' },
    descriptions: {
      it: 'Di tutto e di più',
      en: 'This and that',
      es: 'De todo un poco',
      fr: 'Un peu de tout',
      de: 'Dies und das',
      pt: 'De tudo um pouco',
    },
    words: {
      it: ['SOGNO', 'IDEA', 'FORTUNA', 'DESTINO', 'SILENZIO', 'RUMORE', 'LUCE', 'OMBRA', 'MOMENTO', 'RICORDO', 'SEGRETO', 'FANTASIA', 'AVVENTURA', 'MISTERO', 'MAGIA', 'FUTURO', 'PASSATO', 'PRESENTE', 'VERITA', 'CORAGGIO', 'PAURA', 'GIOIA', 'TRISTEZZA', 'SORPRESA'],
      en: ['DREAM', 'IDEA', 'LUCK', 'DESTINY', 'SILENCE', 'NOISE', 'LIGHT', 'SHADOW', 'MOMENT', 'MEMORY', 'SECRET', 'FANTASY', 'ADVENTURE', 'MYSTERY', 'MAGIC', 'FUTURE', 'PAST', 'PRESENT', 'TRUTH', 'COURAGE', 'FEAR', 'JOY', 'SURPRISE'],
      es: ['SUENO', 'IDEA', 'SUERTE', 'DESTINO', 'SILENCIO', 'RUIDO', 'LUZ', 'SOMBRA', 'MOMENTO', 'RECUERDO', 'SECRETO', 'FANTASIA', 'AVENTURA', 'MISTERIO', 'MAGIA', 'PASADO', 'PRESENTE', 'VERDAD', 'VALOR', 'MIEDO', 'ALEGRIA', 'SORPRESA'],
      fr: ['REVE', 'IDEE', 'CHANCE', 'DESTIN', 'SILENCE', 'BRUIT', 'LUMIERE', 'OMBRE', 'MOMENT', 'SOUVENIR', 'SECRET', 'IMAGINATION', 'AVENTURE', 'MYSTERE', 'MAGIE', 'PASSE', 'PRESENT', 'VERITE', 'COURAGE', 'PEUR', 'JOIE', 'SURPRISE', 'AVENIR'],
      de: ['TRAUM', 'IDEE', 'GLUECK', 'SCHICKSAL', 'STILLE', 'GERAUSCH', 'LICHT', 'SCHATTEN', 'MOMENT', 'ERINNERUNG', 'GEHEIMNIS', 'PHANTASIE', 'ABENTEUER', 'WUNDER', 'MAGIE', 'GEGENWART', 'WAHRHEIT', 'MUT', 'ANGST', 'FREUDE', 'UEBERRASCHUNG'],
      pt: ['SONHO', 'IDEIA', 'SORTE', 'DESTINO', 'SILENCIO', 'RUIDO', 'LUZ', 'SOMBRA', 'MOMENTO', 'MEMORIA', 'SEGREDO', 'FANTASIA', 'AVENTURA', 'MISTERIO', 'MAGIA', 'PASSADO', 'PRESENTE', 'VERDADE', 'CORAGEM', 'MEDO', 'ALEGRIA', 'SORPRESA'],
    },
  },
]
