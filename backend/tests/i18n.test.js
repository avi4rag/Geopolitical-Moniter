import { describe, it, expect } from 'vitest';
import {
  translateNewsText,
  translateNewsArray,
  localizeEvent,
} from '../../frontend/src/i18n/newsContentTranslations.js';

describe('News Content Translation Engine & Localization', () => {
  it('translates known English news headlines into natural Hindi when language is "hi"', () => {
    const enHeadline = 'EU and Mercosur Finalize Landmark Clean Trade and Energy Strategic Accord';
    const hiHeadline = translateNewsText(enHeadline, 'hi');
    expect(hiHeadline).toBe('यूरोपीय संघ और मर्कोसुर ने ऐतिहासिक स्वच्छ व्यापार और ऊर्जा रणनीतिक समझौते को अंतिम रूप दिया');
  });

  it('preserves English news headlines when language is "en"', () => {
    const enHeadline = 'EU and Mercosur Finalize Landmark Clean Trade and Energy Strategic Accord';
    const result = translateNewsText(enHeadline, 'en');
    expect(result).toBe(enHeadline);
  });

  it('translates complex event summaries correctly into Hindi', () => {
    const enSummary = 'United States and Japan establish $15B semiconductor and advanced packaging alliance to accelerate sub-2nm chip fabrication and supply chain resilience.';
    const hiSummary = translateNewsText(enSummary, 'hi');
    expect(hiSummary).toBe('संयुक्त राज्य अमेरिका और जापान ने सब-2nm चिप निर्माण और आपूर्ति श्रृंखला लचीलेपन में तेजी लाने के लिए $15 अरब के सेमीकंडक्टर और उन्नत पैकेजिंग गठबंधन की स्थापना की।');
  });

  it('translates article summaries (excerpts) accurately for the Event Detail Modal', () => {
    const enExcerpt = 'Brussels and South American trade leaders have finalized a landmark bilateral trade and clean energy framework. The agreement eliminates tariffs on 90% of industrial exports while establishing a guaranteed green hydrogen and lithium supply corridor between South America and European manufacturing hubs.';
    const hiExcerpt = translateNewsText(enExcerpt, 'hi');
    expect(hiExcerpt).toContain('हरित हाइड्रोजन व लिथियम आपूर्ति गलियारा स्थापित करता है');
  });

  it('translates arrays of facts and uncertainties', () => {
    const facts = [
      'Eliminates tariffs on 90% of mutual industrial merchandise trade over 5 years.',
      'Establishes guaranteed green hydrogen and lithium supply corridor.',
    ];
    const translated = translateNewsArray(facts, 'hi');
    expect(translated[0]).toBe('5 वर्षों में 90% आपसी औद्योगिक व्यापार पर शुल्कों को समाप्त करता है।');
    expect(translated[1]).toBe('गारंटीकृत हरित हाइड्रोजन और लिथियम आपूर्ति गलियारा स्थापित करता है।');
  });

  it('gracefully falls back to the original English text for unknown strings without returning empty text or throwing errors', () => {
    const unknownText = 'Autonomous quantum compute cluster deployed in Tokyo research lab.';
    const hiFallback = translateNewsText(unknownText, 'hi');
    expect(hiFallback).toBe(unknownText);
  });

  it('creates an immutable localized copy of an event object with localizeEvent', () => {
    const rawEvent = {
      _id: 'evt_123',
      summary: 'Confirmation of 4.2 Tcf natural gas and industrial helium reservoir in Eastern Mediterranean bolsters European energy resilience and eases medium-term power generation costs.',
      facts: ['First commercial extraction targeted for late 2027.'],
      uncertainties: ['Maritime border delimitation disputes with non-signatory regional neighbors.'],
      primaryArticleId: {
        title: 'Major Natural Gas and Helium Reserve Discovered in Eastern Mediterranean Basin',
        excerpt: 'Energy exploration consortia have confirmed a massive 4.2 trillion cubic feet natural gas and industrial helium reservoir off the coast of Cyprus and Greece, significantly bolstering Southern European energy independence and diversifying supplies away from volatile transit routes.',
      },
      impacts: [
        {
          _id: 'imp_1',
          domain: 'ENERGY',
          explanation: 'Expanded domestic natural gas discovery strengthens regional energy supply security and reduces import volatility.',
        },
      ],
    };

    const localized = localizeEvent(rawEvent, 'hi');

    // Verify translations in the cloned copy
    expect(localized.summary).toBe('पूर्वी भूमध्य सागर में 4.2 Tcf प्राकृतिक गैस और औद्योगिक हीलियम भंडार की पुष्टि से यूरोपीय ऊर्जा सुरक्षा मजबूत हुई है और मध्यम अवधि में बिजली उत्पादन लागत में कमी आई है।');
    expect(localized.facts[0]).toBe('पहला व्यावसायिक निष्कर्षण 2027 के अंत तक लक्षित है।');
    expect(localized.uncertainties[0]).toBe('गैर-हस्ताक्षरकर्ता क्षेत्रीय पड़ोसियों के साथ समुद्री सीमा परिसीमन विवाद।');
    expect(localized.primaryArticleId.title).toBe('पूर्वी भूमध्यसागरीय बेसिन में विशाल प्राकृतिक गैस और हीलियम भंडार की खोज');
    expect(localized.impacts[0].explanation).toBe('घरेलू प्राकृतिक गैस की नई खोज से क्षेत्रीय ऊर्जा आपूर्ति सुरक्षा मजबूत होती है और आयात अस्थिरता कम होती है।');

    // Verify original object was NOT mutated
    expect(rawEvent.summary).toBe('Confirmation of 4.2 Tcf natural gas and industrial helium reservoir in Eastern Mediterranean bolsters European energy resilience and eases medium-term power generation costs.');
  });
});
