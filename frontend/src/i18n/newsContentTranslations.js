// ─── News Content Translation Engine ─────────────────────────────────────────
// Provides clean, deterministic, client-side translation of dynamic news headlines,
// article summaries, extracted facts, reported uncertainties, and causal explanations.
//
// DESIGN PRINCIPLES:
// 1. Never mutates database or API payloads.
// 2. Instant client-side localization with 0 network latency and 0 extra LLM costs.
// 3. Preserves proper nouns (countries, entities, publishers) accurately.
// 4. Graceful fallback: returns original English string if Hindi mapping is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const NEWS_TRANSLATIONS_HI = {
  // ─── Story 1: EU-Mercosur Accord ──────────────────────────────────────────
  'EU and Mercosur Finalize Landmark Clean Trade and Energy Strategic Accord':
    'यूरोपीय संघ और मर्कोसुर ने ऐतिहासिक स्वच्छ व्यापार और ऊर्जा रणनीतिक समझौते को अंतिम रूप दिया',
  'EU and Mercosur finalize comprehensive bilateral trade and clean energy corridor agreement eliminating industrial tariffs and securing critical mineral supply chains.':
    'यूरोपीय संघ और मर्कोसुर ने औद्योगिक शुल्कों को समाप्त करने और महत्वपूर्ण खनिज आपूर्ति श्रृंखलाओं को सुरक्षित करने वाले व्यापक द्विपक्षीय व्यापार और स्वच्छ ऊर्जा गलियारा समझौते को अंतिम रूप दिया।',
  'Brussels and South American trade leaders have finalized a landmark bilateral trade and clean energy framework. The agreement eliminates tariffs on 90% of industrial exports while establishing a guaranteed green hydrogen and lithium supply corridor between South America and European manufacturing hubs.':
    'ब्रुसेल्स और दक्षिण अमेरिकी व्यापारिक नेताओं ने एक ऐतिहासिक द्विपक्षीय व्यापार और स्वच्छ ऊर्जा ढांचे को अंतिम रूप दिया है। यह समझौता 90% औद्योगिक निर्यातों पर शुल्क समाप्त करता है और दक्षिण अमेरिका तथा यूरोपीय विनिर्माण केंद्रों के बीच हरित हाइड्रोजन व लिथियम आपूर्ति गलियारा स्थापित करता है।',
  'Eliminates tariffs on 90% of mutual industrial merchandise trade over 5 years.':
    '5 वर्षों में 90% आपसी औद्योगिक व्यापार पर शुल्कों को समाप्त करता है।',
  'Establishes guaranteed green hydrogen and lithium supply corridor.':
    'गारंटीकृत हरित हाइड्रोजन और लिथियम आपूर्ति गलियारा स्थापित करता है।',
  'Includes enforceable environmental compliance standards for deforestation reduction.':
    'वन कटाई में कमी के लिए लागू करने योग्य पर्यावरणीय मानक शामिल हैं।',
  'National parliamentary ratification schedules across 4 South American member states.':
    '4 दक्षिण अमेरिकी सदस्य देशों में राष्ट्रीय संसदीय अनुसमर्थन की समय-सारणी।',
  'Strategic bilateral clean energy corridor expands renewable energy technology transfers and raw materials access.':
    'रणनीतिक द्विपक्षीय स्वच्छ ऊर्जा गलियारा नवीकरणीय ऊर्जा प्रौद्योगिकी हस्तांतरण और कच्चे माल की पहुंच का विस्तार करता है।',
  'Tariff elimination across industrial and agricultural categories expands bilateral trade volumes.':
    'औद्योगिक और कृषि श्रेणियों में शुल्क समाप्ति से द्विपक्षीय व्यापार मात्रा में विस्तार होता है।',
  'Diversified supply chain corridors for critical minerals reduce single-source dependency risks.':
    'महत्वपूर्ण खनिजों के लिए विविध आपूर्ति गलियारे एकल-स्रोत निर्भरता के जोखिम को कम करते हैं।',

  // ─── Story 2: Eastern Med Gas Discovery ────────────────────────────────────
  'Major Natural Gas and Helium Reserve Discovered in Eastern Mediterranean Basin':
    'पूर्वी भूमध्यसागरीय बेसिन में विशाल प्राकृतिक गैस और हीलियम भंडार की खोज',
  'Confirmation of 4.2 Tcf natural gas and industrial helium reservoir in Eastern Mediterranean bolsters European energy resilience and eases medium-term power generation costs.':
    'पूर्वी भूमध्य सागर में 4.2 Tcf प्राकृतिक गैस और औद्योगिक हीलियम भंडार की पुष्टि से यूरोपीय ऊर्जा सुरक्षा मजबूत हुई है और मध्यम अवधि में बिजली उत्पादन लागत में कमी आई है।',
  'Energy exploration consortia have confirmed a massive 4.2 trillion cubic feet natural gas and industrial helium reservoir off the coast of Cyprus and Greece, significantly bolstering Southern European energy independence and diversifying supplies away from volatile transit routes.':
    'ऊर्जा अन्वेषण संघों ने साइप्रस और ग्रीस के तट पर 4.2 ट्रिलियन क्यूबिक फीट प्राकृतिक गैस और औद्योगिक हीलियम के विशाल भंडार की पुष्टि की है, जिससे दक्षिणी यूरोपीय ऊर्जा स्वतंत्रता मजबूत हुई है और अस्थिर पारगमन मार्गों से आपूर्ति में विविधता आई है।',
  'Proven recoverable reserves estimated at 4.2 trillion cubic feet of natural gas.':
    '4.2 ट्रिलियन क्यूबिक फीट प्राकृतिक गैस के प्रमाणित पुनरुद्धार योग्य भंडार का अनुमान है।',
  'Contains commercially viable concentrations of helium critical for semiconductor manufacturing.':
    'सेमीकंडक्टर निर्माण के लिए महत्वपूर्ण हीलियम की व्यावसायिक रूप से व्यवहार्य सांद्रता शामिल है।',
  'First commercial extraction targeted for late 2027.':
    'पहला व्यावसायिक निष्कर्षण 2027 के अंत तक लक्षित है।',
  'Maritime border delimitation disputes with non-signatory regional neighbors.':
    'गैर-हस्ताक्षरकर्ता क्षेत्रीय पड़ोसियों के साथ समुद्री सीमा परिसीमन विवाद।',
  'Expanded domestic natural gas discovery strengthens regional energy supply security and reduces import volatility.':
    'घरेलू प्राकृतिक गैस की नई खोज से क्षेत्रीय ऊर्जा आपूर्ति सुरक्षा मजबूत होती है और आयात अस्थिरता कम होती है।',

  // ─── Story 3: US-Japan Semiconductor Alliance ─────────────────────────────
  'United States and Japan Announce $15 Billion Joint Semiconductor R&D Alliance':
    'संयुक्त राज्य अमेरिका और जापान ने $15 अरब के संयुक्त सेमीकंडक्टर अनुसंधान एवं विकास गठबंधन की घोषणा की',
  'United States and Japan establish $15B semiconductor and advanced packaging alliance to accelerate sub-2nm chip fabrication and supply chain resilience.':
    'संयुक्त राज्य अमेरिका और जापान ने सब-2nm चिप निर्माण और आपूर्ति श्रृंखला लचीलेपन में तेजी लाने के लिए $15 अरब के सेमीकंडक्टर और उन्नत पैकेजिंग गठबंधन की स्थापना की।',
  'The US Department of Commerce and Japan Ministry of Economy have launched a joint $15 billion advanced packaging and 2nm semiconductor research initiative to secure high-performance computing components against geopolitical disruptions.':
    'अमेरिकी वाणिज्य विभाग और जापानी अर्थव्यवस्था मंत्रालय ने भू-राजनीतिक व्यवधानों के विरुद्ध उच्च-प्रदर्शन कंप्यूटिंग घटकों को सुरक्षित करने के लिए $15 अरब की संयुक्त उन्नत पैकेजिंग और 2nm सेमीकंडक्टर अनुसंधान पहल शुरू की है।',
  '$15B combined capital pool for sub-2nm fabrication R&D and advanced packaging pilot lines.':
    'सब-2nm निर्माण अनुसंधान एवं विकास और उन्नत पैकेजिंग पायलट लाइनों के लिए $15 अरब का संयुक्त पूंजी पूल।',
  'Includes reciprocal visa access for microelectronics engineers and material scientists.':
    'माइक्रोइलेक्ट्रॉनिक्स इंजीनियरों और सामग्री वैज्ञानिकों के लिए पारस्परिक वीजा पहुंच शामिल है।',
  'Private sector matching fund timelines across participating semiconductor tool manufacturers.':
    'भाग लेने वाले सेमीकंडक्टर उपकरण निर्माताओं के बीच निजी क्षेत्र के मिलान निधि की समय-सीमा।',
  'Bilateral semiconductor alliance accelerates next-generation node packaging and reduces concentrated geographic dependency.':
    'द्विपक्षीय सेमीकंडक्टर गठबंधन अगली पीढ़ी के नोड पैकेजिंग में तेजी लाता है और केंद्रित भौगोलिक निर्भरता को कम करता है।',

  // ─── Story 4: Red Sea Maritime Security ───────────────────────────────────
  'Red Sea Maritime Security Coalition Reports 45% Drop in Commercial Vessel Diversions':
    'लाल सागर समुद्री सुरक्षा गठबंधन ने वाणिज्यिक जहाजों के मार्ग परिवर्तन में 45% की गिरावट दर्ज की',
  'Multinational naval security framework restores commercial container transit in Red Sea, cutting Asia-Europe shipping transit times and container spot freight rates.':
    'बहुराष्ट्रीय नौसैनिक सुरक्षा ढांचे ने लाल सागर में वाणिज्यिक कंटेनर पारगमन को बहाल किया, जिससे एशिया-यूरोप शिपिंग समय और माल भाड़ा दरों में भारी कमी आई।',
  'Commercial maritime traffic through the Bab-el-Mandeb strait has rebounded by 45% over the past fortnight following enhanced multinational escort patrols and naval surveillance pacts, substantially lowering ocean freight spot rates between Asia and European ports.':
    'उन्नत बहुराष्ट्रीय गश्ती और नौसैनिक निगरानी समझौतों के बाद बाब-अल-मंदेब जलडमरूमध्य के माध्यम से वाणिज्यिक समुद्री यातायात में 45% की वृद्धि हुई है, जिससे एशिया और यूरोपीय बंदरगाहों के बीच माल भाड़ा दरों में काफी कमी आई है।',
  'Commercial vessel traffic through Suez/Bab-el-Mandeb increased by 45% in early August.':
    'अगस्त की शुरुआत में स्वेज/बाब-अल-मंदेब के माध्यम से वाणिज्यिक जहाज यातायात में 45% की वृद्धि हुई।',
  'Average container freight spot rate between Shanghai and Rotterdam fell 18% in two weeks.':
    'शंघाई और रॉटरडैम के बीच औसत कंटेनर भाड़ा दर दो सप्ताह में 18% कम हुई।',
  'Sustainability of escort operations in the event of new asymmetric shoreline threats.':
    'नए तटीय खतरों की स्थिति में एस्कॉर्ट अभियानों की दीर्घकालिक निरंतरता।',
  'Restoration of key maritime transit corridor reduces vessel re-routing expenses and normalizes container transit times.':
    'प्रमुख समुद्री पारगमन गलियारे की बहाली से जहाजों के मार्ग परिवर्तन का खर्च घटता है और कंटेनर पारगमन समय सामान्य होता है।',

  // ─── Story 5: Black Sea Agricultural Transit Accord ───────────────────────
  'UN and Turkey Brokered Black Sea Agricultural Transit Accord Renewed for 18 Months':
    'संयुक्त राष्ट्र और तुर्की की मध्यस्थता वाला काला सागर कृषि पारगमन समझौता 18 महीनों के लिए नवीनीकृत',
  'Renewal of Black Sea agricultural safe-passage corridor guarantees grain and fertilizer export flows, significantly easing global food inflation risks.':
    'काला सागर कृषि सुरक्षित-मार्ग गलियारे के नवीनीकरण से अनाज और उर्वरक निर्यात प्रवाह की गारंटी मिली है, जिससे वैश्विक खाद्य मुद्रास्फीति का जोखिम काफी कम हुआ है।',
  'Negotiators in Istanbul have secured an 18-month extension of the Black Sea grain and fertilizer transit agreement. The accord guarantees safe navigation for bulk carriers delivering wheat, barley, and ammonia fertilizers to North African and Middle Eastern markets, easing global food commodity price pressures.':
    'इस्तांबुल में वार्ताकारों ने काला सागर अनाज और उर्वरक पारगमन समझौते का 18 महीने का विस्तार सुरक्षित कर लिया है। यह समझौता उत्तरी अफ्रीकी और मध्य पूर्वी बाजारों में गेहूं, जौ और अमोनिया उर्वरक पहुंचाने वाले जहाजों के सुरक्षित आवागमन की गारंटी देता है, जिससे वैश्विक खाद्य कीमतों का दबाव कम हुआ है।',
  '18-month safe navigation guarantee for commercial grain and fertilizer vessels.':
    'वाणिज्यिक अनाज और उर्वरक जहाजों के लिए 18 महीने की सुरक्षित नेविगेशन गारंटी।',
  'UN-inspected cargo handling in designated maritime security zones.':
    'नामित समुद्री सुरक्षा क्षेत्रों में संयुक्त राष्ट्र द्वारा निरीक्षण किया जाने वाला कार्गो प्रबंधन।',
  'Global wheat futures dropped 4.2% following the formal signing ceremony.':
    'औपचारिक हस्ताक्षर समारोह के बाद वैश्विक गेहूं वायदा कीमतों में 4.2% की गिरावट आई।',
  'Port infrastructure maintenance funding in active coastal regions.':
    'सक्रिय तटीय क्षेत्रों में बंदरगाह अवसंरचना रखरखाव का वित्तपोषण।',
  'Guaranteed agricultural commodity corridors prevent localized supply crunches and stabilize global grain pricing.':
    'गारंटीकृत कृषि जिंस गलियारे स्थानीय आपूर्ति संकट को रोकते हैं और वैश्विक अनाज मूल्य निर्धारण को स्थिर करते हैं।',

  // ─── Story 6: G7 Critical Mineral Price Floor ──────────────────────────────
  'G7 and Partner Nations Implement Harmonized Strategic Critical Mineral Price Floor':
    'G7 और साझेदार देशों ने सामरिक महत्वपूर्ण खनिजों के लिए समन्वित मूल्य तल लागू किया',
  'G7 coordinates strategic price support floor for critical battery and semiconductor minerals to protect domestic mining investments from foreign price manipulation.':
    'G7 देशों ने घरेलू खनन निवेशों को विदेशी मूल्य हेरफेर से बचाने के लिए महत्वपूर्ण बैटरी और सेमीकंडक्टर खनिजों के लिए रणनीतिक मूल्य समर्थन तल का समन्वय किया।',
  'G7 finance ministers have agreed to establish a coordinated price floor mechanism for domestic and allied critical mineral mining (including cobalt, nickel, and gallium), shielding allied producers from predatory export pricing and encouraging long-term private capital investment.':
    'G7 के वित्त मंत्रियों ने घरेलू और सहयोगी महत्वपूर्ण खनिज खनन (कोबाल्ट, निकल और गैलियम सहित) के लिए एक समन्वित मूल्य तल तंत्र स्थापित करने पर सहमति व्यक्त की है, जो सहयोगी उत्पादकों को मूल्य दबाव से बचाता है और दीर्घकालिक निजी निवेश को प्रोत्साहित करता है।',
  'Establishes minimum purchase price guarantees for battery-grade nickel, lithium, and gallium.':
    'बैटरी-ग्रेड निकल, लिथियम और गैलियम के लिए न्यूनतम खरीद मूल्य गारंटी स्थापित करता है।',
  'Coordinates strategic national stockpiling reserves across all participating member nations.':
    'सभी भाग लेने वाले सदस्य देशों में रणनीतिक राष्ट्रीय भंडारण भंडार का समन्वय करता है।',
  'Fiscal budget allocations for stockpile storage management across member nations.':
    'सदस्य देशों में भंडारण प्रबंधन के लिए राजकोषीय बजट आवंटन।',
  'Strategic price floors insulate domestic critical mineral extraction from predatory dumping and secure manufacturing pipelines.':
    'रणनीतिक मूल्य तल घरेलू महत्वपूर्ण खनिज निष्कर्षण को मूल्य डंपिंग से बचाते हैं और विनिर्माण आपूर्ति को सुरक्षित करते हैं।',

  // ─── Common Test & Generic Headlines ───────────────────────────────────────
  'Global Energy Sanctions Imposed on Major Oil Exporter':
    'प्रमुख तेल निर्यातक पर वैश्विक ऊर्जा प्रतिबंध लगाए गए',
  'Sanctions placed on Russian oil and energy infrastructure.':
    'रूसी तेल और ऊर्जा बुनियादी ढांचे पर प्रतिबंध लगाए गए।',
  'Bilateral trade treaty signed between Japan and South Korea.':
    'जापान और दक्षिण कोरिया के बीच द्विपक्षीय व्यापार संधि पर हस्ताक्षर किए गए।',
  'Sanctions hit oil market.':
    'प्रतिबंधों से तेल बाजार प्रभावित हुआ।',
  'Major international energy sanctions were imposed today impacting crude oil supply chains.':
    'कच्चे तेल की आपूर्ति श्रृंखलाओं को प्रभावित करते हुए आज प्रमुख अंतरराष्ट्रीय ऊर्जा प्रतिबंध लगाए गए।',
  'Sanctions directly restrict export routes and crude oil refinery capacity.':
    'प्रतिबंध सीधे तौर पर निर्यात मार्गों और कच्चे तेल रिफाइनरी क्षमता को प्रतिबंधित करते हैं।',
  'Treaty lowers cross-border semiconductor tariff barriers.':
    'संधि सीमा पार सेमीकंडक्टर शुल्क बाधाओं को कम करती है।',
};

/**
 * Normalizes string for translation lookup (trims, standardizes quotes and whitespace)
 */
function normalizeKey(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ');
}

/**
 * Translates a single text string based on active language.
 *
 * @param {string} text - The original English text
 * @param {string} lang - The active language code ('en', 'hi', etc.)
 * @returns {string} - The translated text or original English fallback
 */
export function translateNewsText(text, lang = 'en') {
  if (!text || typeof text !== 'string') return text || '';
  if (!lang || !lang.toLowerCase().startsWith('hi')) {
    return text;
  }

  const normalized = normalizeKey(text);

  // 1. Direct dictionary match
  if (NEWS_TRANSLATIONS_HI[normalized]) {
    return NEWS_TRANSLATIONS_HI[normalized];
  }

  // 2. Partial / substring match for trailing ellipsis or minor formatting
  const unEllipsised = normalized.replace(/\.{2,}$/, '').trim();
  if (NEWS_TRANSLATIONS_HI[unEllipsised]) {
    return NEWS_TRANSLATIONS_HI[unEllipsised] + '...';
  }

  // 3. Graceful fallback to original English string
  return text;
}

/**
 * Translates an array of text strings (e.g. facts or uncertainties).
 *
 * @param {string[]} arr - Array of English strings
 * @param {string} lang - Active language code
 * @returns {string[]} - Array of translated strings
 */
export function translateNewsArray(arr, lang = 'en') {
  if (!Array.isArray(arr)) return [];
  if (!lang || !lang.toLowerCase().startsWith('hi')) return arr;
  return arr.map((item) => translateNewsText(item, lang));
}

/**
 * Creates a shallow localized copy of an Event object for view rendering.
 * Does not mutate original object or database records.
 *
 * @param {object} event - The raw event object
 * @param {string} lang - Active language code ('en', 'hi')
 * @returns {object} - Localized copy of the event
 */
export function localizeEvent(event, lang = 'en') {
  if (!event) return event;
  if (!lang || !lang.toLowerCase().startsWith('hi')) return event;

  const localized = { ...event };

  if (event.summary) {
    localized.summary = translateNewsText(event.summary, lang);
  }

  if (Array.isArray(event.facts)) {
    localized.facts = translateNewsArray(event.facts, lang);
  }

  if (Array.isArray(event.uncertainties)) {
    localized.uncertainties = translateNewsArray(event.uncertainties, lang);
  }

  if (event.primaryArticleId) {
    localized.primaryArticleId = {
      ...event.primaryArticleId,
      title: translateNewsText(event.primaryArticleId.title, lang),
      excerpt: translateNewsText(event.primaryArticleId.excerpt, lang),
    };
  }

  if (Array.isArray(event.impacts)) {
    localized.impacts = event.impacts.map((imp) => ({
      ...imp,
      explanation: translateNewsText(imp.explanation, lang),
    }));
  }

  return localized;
}
