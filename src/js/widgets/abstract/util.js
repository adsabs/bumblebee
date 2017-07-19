define([
  'underscore',
  'js/mixins/papers_utils',
  'js/mixins/link_generator_mixin'
],
function (_, PapersUtils, LinkGeneratorMixin) {

  var exports = {
    parseDocs: function (doc, maxAuthors) {
      maxAuthors = maxAuthors || 25;

      //add doi link
      if (doc.doi){
        doc.doi = {
          doi: doc.doi,
          href: LinkGeneratorMixin.adsUrlRedirect("doi", doc.doi)
        }
      }
      //"aff" is the name of the affiliations array that comes from solr
      doc.aff = doc.aff || [];

      if (doc.aff.length) {
        doc.hasAffiliation = _.without(doc.aff, '-').length;
        // joining author and aff
        doc.authorAff = _.zip(doc.author, doc.aff);
      }
      else if (doc.author) {
        doc.hasAffiliation = false;
        doc.authorAff = _.zip(doc.author, _.range(doc.author.length));
      }

      if (doc.page && doc.page.length) {
        doc.page = doc.page[0];
      }

      //only true if there was an author array
      //now add urls
      if (doc.authorAff){

        _.each(doc.authorAff, function(el, index){
          doc.authorAff[index][2] =
            encodeURIComponent('"' +  el[0] + '"').replace(/%20/g, "+");
        });

        if (doc.authorAff.length > maxAuthors) {
          doc.authorAffExtra = doc.authorAff.slice(maxAuthors,
            doc.authorAff.length);
          doc.authorAff = doc.authorAff.slice(0, maxAuthors);
        }

        doc.hasMoreAuthors = !!(doc.authorAffExtra && doc.authorAffExtra.length);
      }

      if (doc.pubdate){
        doc.formattedDate =  PapersUtils.formatDate(doc.pubdate, {
          format: 'MM d yy',
          missing: {day: 'MM yy', month: 'yy'}});
      }

      doc.title = doc.title instanceof Array ? doc.title[0] : doc.title;

      // Find any links that are buried in the text of the title
      // Parse it out and convert to BBB hash links, if necessary
      var docTitleLink = doc.title.match(/<a.*href="(.*?)".*?>(.*)<\/a>/i);
      if (docTitleLink) {
        doc.title = doc.title.replace(docTitleLink[0], "").trim();
        doc.titleLink = {
          href: docTitleLink[1],
          text: docTitleLink[2]
        };

        if (doc.titleLink.href.match(/^\/abs/)) {
          doc.titleLink.href = "#" + doc.titleLink.href.slice(1);
        }
      }

      return doc;
    }
  };

  return exports;
});
