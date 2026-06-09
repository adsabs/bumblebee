/**
 * Build a Schema.org ScholarlyArticle JSON-LD object for an ADS record.
 * This is a lean implementation emitted for all doctypes; it uses only
 * fields already fetched on the abstract page (identifier/UAT/encoding
 * enrichment is deferred to a follow-up).
 *
 * Must be called with the raw record, before the meta_tags widget reshapes
 * `author` and flattens `doi`.
 */
define(['underscore'], function(_) {
  function firstString(v) {
    if (_.isArray(v)) {
      return v.length ? String(v[0]) : '';
    }
    return v == null ? '' : String(v);
  }

  function stripHtml(s) {
    return String(s == null ? '' : s)
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  function toArray(v) {
    if (_.isArray(v)) {
      return v;
    }
    return v == null ? [] : [v];
  }

  // Pass through ADS pubdate-like strings (YYYY, YYYY-MM, YYYY-MM-DD, and
  // "-00" placeholder forms); reject anything without a 4-digit year.
  function normalizePubdate(d) {
    const raw = (d == null ? '' : String(d)).trim();
    return /^\d{4}/.test(raw) ? raw : undefined;
  }

  // Remove undefined/null, empty strings, and empty arrays; keep booleans.
  function prune(obj) {
    const out = {};
    _.each(obj, function(v, k) {
      if (v === undefined || v === null) {
        return;
      }
      if (typeof v === 'string' && v.trim() === '') {
        return;
      }
      if (_.isArray(v) && v.length === 0) {
        return;
      }
      out[k] = v;
    });
    return out;
  }

  // Accept either a raw author string or an already-reshaped { name, aff }
  // object (the meta_tags widget rewrites `author` in place before render).
  function authorName(entry) {
    if (entry == null) {
      return '';
    }
    if (typeof entry === 'object') {
      return String(entry.name == null ? '' : entry.name).trim();
    }
    return String(entry).trim();
  }

  function buildAuthors(doc) {
    return _.map(toArray(doc.author), function(entry) {
      return { '@type': 'Person', name: authorName(entry) };
    });
  }

  function buildKeywords(doc) {
    return _.filter(
      _.map(toArray(doc.keyword), function(k) {
        return String(k == null ? '' : k).trim();
      }),
      function(k) {
        return k.length > 0;
      }
    );
  }

  function buildIsPartOf(doc) {
    const pub = (doc.pub == null ? '' : String(doc.pub)).trim();
    if (!pub) {
      return undefined;
    }
    const periodical = { '@type': 'Periodical', name: pub };
    const volume = (doc.volume == null ? '' : String(doc.volume)).trim();
    if (!volume) {
      return periodical;
    }
    return {
      '@type': 'PublicationVolume',
      volumeNumber: volume,
      isPartOf: periodical,
    };
  }

  function buildJsonLd(doc, canonicalUrl) {
    doc = doc || {};
    const title = stripHtml(firstString(doc.title));
    const name = title || firstString(doc.bibcode) || 'Untitled';
    const abstract = stripHtml(firstString(doc.abstract));
    const url = canonicalUrl || undefined;

    return prune({
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      '@id': url,
      url: url,
      name: name,
      headline: name,
      abstract: abstract || undefined,
      inLanguage: 'en',
      isAccessibleForFree: true,
      datePublished: normalizePubdate(doc.pubdate),
      author: buildAuthors(doc),
      keywords: buildKeywords(doc),
      isPartOf: buildIsPartOf(doc),
    });
  }

  return { buildJsonLd: buildJsonLd };
});
