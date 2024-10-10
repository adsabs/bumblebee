define(['underscore', 'jquery'], function(_, $) {
  var getMock = function(name) {
    var mocks = {
      profile: {
        '2018CNSNS..56..270Q': {
          status: 'verified',
          pubyear: '2018',
          updated: '2018-08-03T11:46:06.081000',
          title:
            'A 2D multi-term time and space fractional Bloch-Torrey model based on bilinear rectangular finite elements',
          pubmonth: '03',
          putcode: 889362,
          source: ['NASA Astrophysics Data System'],
          identifier: '2018CNSNS..56..270Q',
        },
        '2018CNSNS..56..296S': {
          status: 'verified',
          pubyear: '2018',
          updated: '2018-08-03T11:46:06.081000',
          title:
            'Nonlinear surge motions of a ship in bi-chromatic following waves',
          pubmonth: '03',
          putcode: 878658,
          source: ['NASA Astrophysics Data System'],
          identifier: '2018CNSNS..56..296S',
        },
        'ext-id-1': {
          status: 'verified',
          pubyear: null,
          updated: '2018-08-03T11:46:06.081000',
          title: 'Work # 1',
          pubmonth: null,
          putcode: 880867,
          source: ['OTHER SYSTEM'],
          identifier: 'ext-id-1',
        },
      },
      work: {
        'created-date': { value: 1507674616577 },
        'last-modified-date': { value: 1507674616577 },
        source: {
          'source-orcid': null,
          'source-client-id': {
            uri: 'http://sandbox.orcid.org/client/APP-P5ANJTQRRTMA6GXZ',
            path: 'APP-P5ANJTQRRTMA6GXZ',
            host: 'sandbox.orcid.org',
          },
          'source-name': { value: 'NASA Astrophysics Data System' },
        },
        'put-code': 889362,
        path: '/0000-0001-9790-1275/work/889362',
        title: {
          title: {
            value:
              'A 2D multi-term time and space fractional Bloch-Torrey model based on bilinear rectangular finite elements',
          },
          subtitle: null,
          'translated-title': null,
        },
        'journal-title': {
          value:
            'Communications in Nonlinear Science and Numerical Simulations',
        },
        'short-description':
          'The consideration of diffusion processes in magnetic resonance imaging (MRI) signal attenuation is classically described by the Bloch-Torrey equation. However, many recent works highlight the distinct deviation in MRI signal decay due to anomalous diffusion, which motivates the fractional order generalization of the Bloch-Torrey equation. In this work, we study the two-dimensional multi-term time and space fractional diffusion equation generalized from the time and space fractional Bloch-Torrey equation. By using the Galerkin finite element method with a structured mesh consisting of rectangular elements to discretize in space and the L1 approximation of the Caputo fractional derivative in time, a fully discrete numerical scheme is derived. A rigorous analysis of stability and error estimation is provided. Numerical experiments in the square and L-shaped domains are performed to give an insight into the efficiency and reliability of our method. Then the scheme is applied to solve the multi-term time and space fractional Bloch-Torrey equation, which shows that the extra time derivative terms impact the relaxation process.',
        citation: null,
        type: 'JOURNAL_ARTICLE',
        'publication-date': {
          year: { value: '2018' },
          month: { value: '03' },
          day: null,
          'media-type': null,
        },
        'external-ids': {
          'external-id': [
            {
              'external-id-type': 'bibcode',
              'external-id-value': '2018CNSNS..56..270Q',
              'external-id-url': null,
              'external-id-relationship': 'SELF',
            },
            {
              'external-id-type': 'doi',
              'external-id-value': '10.1016/j.cnsns.2017.08.014',
              'external-id-url': null,
              'external-id-relationship': 'SELF',
            },
          ],
        },
        url: null,
        contributors: {
          contributor: [
            {
              'contributor-orcid': null,
              'credit-name': { value: 'Qin, Shanlin' },
              'contributor-email': null,
              'contributor-attributes': {
                'contributor-sequence': null,
                'contributor-role': 'AUTHOR',
              },
            },
            {
              'contributor-orcid': null,
              'credit-name': { value: 'Liu, Fawang' },
              'contributor-email': null,
              'contributor-attributes': {
                'contributor-sequence': null,
                'contributor-role': 'AUTHOR',
              },
            },
            {
              'contributor-orcid': null,
              'credit-name': { value: 'Turner, Ian W.' },
              'contributor-email': null,
              'contributor-attributes': {
                'contributor-sequence': null,
                'contributor-role': 'AUTHOR',
              },
            },
          ],
        },
        'language-code': null,
        country: null,
        visibility: 'PUBLIC',
      },
      oAuth: {
        access_token: '4274a0f1-36a1-4152-9a6b-4246f166bafe',
        token_type: 'Bearer',
        expires_in: 3599,
        scope:
          '/orcid-works/create /orcid-profile/read-limited /orcid-works/update',
        orcid: '0000-0001-8178-9506',
        name: 'Roman Chyla',
      },
      adsResponse: {
        response: {
          docs: [
            {
              pubdate: '2018-03-00',
              abstract:
                "Unintended motions of a ship operating in steep and long following waves are investigated. A well-known such case is ;surf-riding; where a ship is carried forward by a single wave, an event invoking sometimes lateral instability and even capsize. The dynamics underlying this behavior has been clarified earlier for monochromatic waves. However, the unsteadiness of the phase space associated with ship behavior in a multichromatic sea, combined with the intrinsically strong system nonlinearity, pose new challenges. Here, current theory is extended to cover surging and surf-riding behavior in unidirectional bi-chromatic waves encountering a ship from the stern. Excitation is provided by two unidirectional harmonic wave components having their lengths comparable to the ship length and their frequencies in rational ratio. The techniques applied include (a) continuation analysis; (b) tracking of Lagrangian coherent structures in phase space, approximated through a finite-time Lyapunov exponents' calculation; and (c) large scale simulation. A profound feature of surf-riding in bi-chromatic waves is that it is turned oscillatory. Initially it appears as a frequency-locked motion, ruled by the harmonic wave component dominating the excitation. Transformations of oscillatory surf-riding are realized as the waves become steeper. In particular, heteroclinic tanglings are identified, governing abrupt transitions between qualitatively different motions. Chaotic transients, as well as long-term chaotic motions, exist near to these events. Some extraordinary patterns of ship motion are discovered. These include a counterintuitive low speed motion at very high wave excitation level; and a hybrid motion characterized by a wildly fluctuating velocity. Due to the quite generic nature of the core mathematical model of our investigation, the current results are believed to offer clues about the behavior of a class of nonlinear dynamical systems having in their modeling some analogy with a perturbed pendulum with bias.",
              links_data: [
                '{"title":"", "type":"electr", "instances":"", "access":""}',
              ],
              pub:
                'Communications in Nonlinear Science and Numerical Simulations',
              citation_count: 0,
              volume: '56',
              doi: ['10.1016/j.cnsns.2017.08.013'],
              keyword: ['Ship motions', 'Surf-riding', 'Continuation', 'LCS'],
              property: ['REFEREED', 'ARTICLE'],
              id: '12454270',
              page: ['296'],
              bibcode: '2018CNSNS..56..296S',
              author: [
                'Spyrou, Kostas J.',
                'Themelis, Nikos',
                'Kontolefas, Ioannis',
              ],
              aff: [
                'School of Naval Architecture and Marine Engineering, National Technical University of Athens, 9 Iroon Polytechneiou, Zographos, Athens 15780, Greece',
                'School of Naval Architecture and Marine Engineering, National Technical University of Athens, 9 Iroon Polytechneiou, Zographos, Athens 15780, Greece',
                'School of Naval Architecture and Marine Engineering, National Technical University of Athens, 9 Iroon Polytechneiou, Zographos, Athens 15780, Greece',
              ],
              pub_raw:
                'Communications in Nonlinear Science and Numerical Simulation, Volume 56, p. 296-313.',
              title: [
                'Nonlinear surge motions of a ship in bi-chromatic following waves',
              ],
              '[citations]': { num_references: 4, num_citations: 0 },
              identifier: '2018CNSNS..56..296S',
              resultsIndex: 0,
              indexToShow: 1,
              encodedIdentifier: '2018CNSNS..56..296S',
              authorFormatted: [
                'Spyrou, Kostas J.;',
                'Themelis, Nikos;',
                'Kontolefas, Ioannis',
              ],
              formattedDate: '2018/03',
              shortAbstract:
                'Unintended motions of a ship operating in steep and long following waves are investigated. A well-known such case is ;surf-riding; where a ship is carried forward by a single wave, an event invoking sometimes lateral instability and even capsize. The dynamics underlying this behavior has been ...',
              links: {
                list: [
                  {
                    letter: 'R',
                    title: 'References (4)',
                    link: '#abs/2018CNSNS..56..296S/references',
                  },
                ],
                data: [],
                text: [
                  {
                    openAccess: false,
                    title: 'Publisher Article',
                    link:
                      'http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=2018CNSNS..56..296S&link_type=EJOURNAL',
                  },
                ],
              },
              emptyPlaceholder: false,
              visible: true,
              actionsVisible: true,
            },
            {
              pubdate: '2018-03-00',
              abstract:
                'The consideration of diffusion processes in magnetic resonance imaging (MRI) signal attenuation is classically described by the Bloch-Torrey equation. However, many recent works highlight the distinct deviation in MRI signal decay due to anomalous diffusion, which motivates the fractional order generalization of the Bloch-Torrey equation. In this work, we study the two-dimensional multi-term time and space fractional diffusion equation generalized from the time and space fractional Bloch-Torrey equation. By using the Galerkin finite element method with a structured mesh consisting of rectangular elements to discretize in space and the L1 approximation of the Caputo fractional derivative in time, a fully discrete numerical scheme is derived. A rigorous analysis of stability and error estimation is provided. Numerical experiments in the square and L-shaped domains are performed to give an insight into the efficiency and reliability of our method. Then the scheme is applied to solve the multi-term time and space fractional Bloch-Torrey equation, which shows that the extra time derivative terms impact the relaxation process.',
              links_data: [
                '{"title":"", "type":"electr", "instances":"", "access":""}',
              ],
              pub:
                'Communications in Nonlinear Science and Numerical Simulations',
              citation_count: 0,
              volume: '56',
              doi: ['10.1016/j.cnsns.2017.08.014'],
              keyword: [
                'Time and space fractional Bloch-Torrey equation',
                'Finite element method',
                'Multi-term',
                'Bilinear rectangular elements',
                'Stability and convergence',
              ],
              property: ['REFEREED', 'ARTICLE'],
              id: '12454243',
              page: ['270'],
              bibcode: '2018CNSNS..56..270Q',
              author: ['Qin, Shanlin', 'Liu, Fawang', 'Turner, Ian W.'],
              aff: [
                'School of Mathematical Sciences, Queensland University of Technology, GPO Box 2434, Brisbane, Qld. 4001, Australia',
                'School of Mathematical Sciences, Queensland University of Technology, GPO Box 2434, Brisbane, Qld. 4001, Australia',
                'School of Mathematical Sciences, Queensland University of Technology, GPO Box 2434, Brisbane, Qld. 4001, Australia; Australian Research Council Centre of Excellence for Mathematical and Statistical Frontiers (ACEMS), Queensland University of Technology, Brisbane, Qld, Australia',
              ],
              pub_raw:
                'Communications in Nonlinear Science and Numerical Simulation, Volume 56, p. 270-286.',
              title: [
                'A 2D multi-term time and space fractional Bloch-Torrey model based on bilinear rectangular finite elements',
              ],
              '[citations]': { num_references: 13, num_citations: 0 },
              identifier: '2018CNSNS..56..270Q',
              resultsIndex: 1,
              indexToShow: 2,
              encodedIdentifier: '2018CNSNS..56..270Q',
              authorFormatted: [
                'Qin, Shanlin;',
                'Liu, Fawang;',
                'Turner, Ian W.',
              ],
              formattedDate: '2018/03',
              shortAbstract:
                'The consideration of diffusion processes in magnetic resonance imaging (MRI) signal attenuation is classically described by the Bloch-Torrey equation. However, many recent works highlight the distinct deviation in MRI signal decay due to anomalous diffusion, which motivates the fractional order ...',
              links: {
                list: [
                  {
                    letter: 'R',
                    title: 'References (13)',
                    link: '#abs/2018CNSNS..56..270Q/references',
                  },
                ],
                data: [],
                text: [
                  {
                    openAccess: false,
                    title: 'Publisher Article',
                    link:
                      'http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=2018CNSNS..56..270Q&link_type=EJOURNAL',
                  },
                ],
              },
              emptyPlaceholder: false,
              visible: true,
              actionsVisible: true,
            },
          ],
        },
      },
      bio: {
        'last-modified-date': { value: 1505492311122 },
        name: {
          'created-date': { value: 1505492311122 },
          'last-modified-date': { value: 1505492311122 },
          'given-names': { value: 'Tim' },
          'family-name': { value: 'Hostetler' },
          'credit-name': null,
          source: null,
          visibility: 'PUBLIC',
          path: '0000-0001-9790-1275',
        },
        'other-names': {
          'last-modified-date': 1505492311122,
          'other-name': [],
          path: '/0000-0001-9790-1275/other-names',
        },
        biography: null,
        path: '/0000-0001-9790-1275/personal-details',
      },
    };
    mocks.bulk = { bulk: mocks.work };

    return mocks[name];
  };

  var profile = {
    getWorks: function() {
      return [];
    },
  };

  var api = {
    getWork: function(putCode) {
      return $.Deferred()
        .resolve(getMock('work'))
        .promise();
    },
    getUserProfile: function() {
      return $.Deferred()
        .resolve(profile)
        .promise();
    },
  };

  _.reduce(
    api,
    function(res, v, k) {
      var parts = k.split('');
      var prop = parts[0].toUpperCase() + parts.splice(1).join('');
      res['fail' + prop] = _.bind(
        function() {
          return $.Deferred()
            .reject()
            .promise();
        },
        null,
        v
      );
      return res;
    },
    api
  );

  var exports = {
    api: api,
    getMock: getMock,
  };

  return exports;
});
