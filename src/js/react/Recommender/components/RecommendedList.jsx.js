define(['react', 'react-prop-types', 'react-redux', '../actions'], function(
  React,
  PropTypes,
  { useSelector, useDispatch },
  { getRecommendations }
) {
  const papers = [
    {
      title:
        'New BVR photometry and first light curve analysis of the W UMa type eclipsing binary V2240 Cyg',
      bibcode: '2020NewA...7901391O',
      author: ['Ostadnezhad, S.', 'Forozani, Gh.', 'Ghanaatian, M.'],
    },
    {
      title:
        'Multi-wavelength study in the region of IRAS 16571-4029 and 16575-4023 sources',
      bibcode: '2020NewA...7901384B',
      author: [
        'Baume, G.',
        'Corti, M. A.',
        'Borissova, J.',
        'Ramirez Alegria, S.',
        'Corvera, A. V.',
      ],
    },
    {
      title:
        'Miscellaneous photometric variations in cataclysmic variables: V455 And, SS Cyg, AQ Men, LQ Peg, RW Tri and UX UMa',
      bibcode: '2020NewA...7801369B',
      author: ['Bruch, Albert'],
    },
    {
      title:
        'Study of open cluster King 13 using CCD VI, 2MASS and Gaia DR2 Astrometry.',
      bibcode: '2020NewA...7801364D',
      author: [
        'Durgapal, Alok',
        'Bisht, D.',
        'Rangwal, Geeta',
        'Kaur, Harmeen',
        'Yadav, R. K. S.',
      ],
    },
    {
      title:
        'Photometric study and kinematics of the EL CVn type eclipsing binary: WASP 1628+10',
      bibcode: '2020NewA...7801363L',
      author: ['Luo, Yangping'],
    },
    {
      title:
        'Photometric and periodic investigations of W-type W UMa eclipsing binary BB Peg',
      bibcode: '2020NewA...7801354K',
      author: ['Kamalifar, Z.', 'Abedi, A.', 'Roobiat, K. Y.'],
    },
    {
      title:
        'End-of-mission calibration of the Cassini Imaging Science Subsystem',
      bibcode: '2020P&SS..18504898K',
      author: [
        'Knowles, Benjamin',
        'West, Robert',
        'Helfenstein, Paul',
        'Verbiscer, Anne',
        'Wilson, Daren',
        'Porco, Carolyn',
      ],
    },
    {
      title:
        'Dark matter stars from beyond General Relativity models: Magnetosphere dynamics and torsion fields',
      bibcode: '2020JHEAp..26...21C',
      author: ['Cirilo-Lombardo, D. J.'],
    },
    {
      title:
        'NIKA2 observations around LBV stars Emission from stars and circumstellar material',
      bibcode: '2020EPJWC.22800023R',
      author: ['Ricardo Rizzo, J.', 'Ritacco, Alessia', 'Bordiu, Cristobal'],
    },
    {
      title:
        'Observing with NIKA2Pol from the IRAM 30m telescope : Early results on the commissioning phase',
      bibcode: '2020EPJWC.22800022R',
      author: [
        'Ritacco, A.',
        'Adam, R.',
        'Ade, P.',
        'Ajeddig, H.',
        'André, P.',
        'Andrianasolo, A.',
        'Aussel, H.',
        'Beelen, A.',
        'Benoît, A.',
        'Bideaud, A.',
        'Bourrion, O.',
        'Calvo, M.',
        'Catalano, A.',
        'Comis, B.',
        'De Petris, M.',
        'Désert, F. -X.',
        'Doyle, S.',
        'Driessen, E. F. C.',
        'Gomez, A.',
        'Goupy, J.',
        'Kéruzoré, F.',
        'Kramer, C.',
        'Ladjelate, B.',
        'Lagache, G.',
        'Leclercq, S.',
        'Lestrade, J. -F.',
        'Macías-Pérez, J. F.',
        'Mauskopf, P.',
        'Maury, A.',
        'Mayet, F.',
        'Monfardini, A.',
        'Perotto, L.',
        'Pisano, G.',
        'Ponthieu, N.',
        'Revéret, V.',
        'Romero, C.',
        'Roussel, H.',
        'Ruppin, F.',
        'Schuster, K.',
        'Shimajiri, Y.',
        'Shu, S.',
        'Sievers, A.',
        'Tucker, C.',
        'Zylka, R.',
      ],
    },
    {
      title:
        'Analysis of Galactic molecular cloud polarization maps: a review of the methods',
      bibcode: '2020EPJWC.22800019P',
      author: ['Poidevin, Frédérick'],
    },
    {
      title:
        'GASTON: Galactic Star Formation with NIKA2 A new population of cold massive sources discovered',
      bibcode: '2020EPJWC.22800018P',
      author: [
        'Peretto, N.',
        'Rigby, A.',
        'Adam, R.',
        'Ade, P.',
        'André, P.',
        'Andrianasolo, A.',
        'Aussel, H.',
        'Bacmann, A.',
        'Beelen, A.',
        'Benoît, A.',
        'Bideaud, A.',
        'Bourrion, O.',
        'Calvo, M.',
        'Catalano, A.',
        'Comis, B.',
        'De Petris, M.',
        'Désert, F. -X.',
        'Doyle, S.',
        'Driessen, E. F. C.',
        'Gomez, A.',
        'Goupy, J.',
        'Kéruzoré, F.',
        'Kramer, C.',
        'Ladjelate, B.',
        'Lagache, G.',
        'Leclercq, S.',
        'Lestrade, J. -F.',
        'Macías-Pérez, J. F.',
        'Mauskopf, P.',
        'Mayet, F.',
        'Monfardini, A.',
        'Motte, F.',
        'Perotto, L.',
        'Pisano, G.',
        'Ponthieu, N.',
        'Revéret, V.',
        'Ristorcelli, I.',
        'Ritacco, A.',
        'Romero, C.',
        'Roussel, H.',
        'Ruppin, F.',
        'Schuster, K.',
        'Shu, S.',
        'Sievers, A.',
        'Tucker, C.',
        'Zylka, R.',
      ],
    },
    {
      title: 'Debris disks around stars in the NIKA2 era',
      bibcode: '2020EPJWC.22800015L',
      author: [
        'Lestrade, J. -F.',
        'Augereau, J. -C.',
        'Booth, M.',
        'Adam, R.',
        'Ade, P.',
        'André, P.',
        'Andrianasolo, A.',
        'Aussel, H.',
        'Beelen, A.',
        'Benoît, A.',
        'Bideaud, A.',
        'Bourrion, O.',
        'Calvo, M.',
        'Catalano, A.',
        'Comis, B.',
        'De Petris, M.',
        'Désert, F. -X.',
        'Doyle, S.',
        'Driessen, E. F. C.',
        'Gomez, A.',
        'Goupy, J.',
        'Holland, W.',
        'Kéruzoré, F.',
        'Kramer, C.',
        'Ladjelate, B.',
        'Lagache, G.',
        'Leclercq, S.',
        'Lefèvre, C.',
        'Macías-Pérez, J. F.',
        'Mauskopf, P.',
        'Mayet, F.',
        'Monfardini, A.',
        'Perotto, L.',
        'Pisano, G.',
        'Ponthieu, N.',
        'Revéret, V.',
        'Ritacco, A.',
        'Romero, C.',
        'Roussel, H.',
        'Ruppin, F.',
        'Schuster, K.',
        'Shu, S.',
        'Sievers, A.',
        'Thébault, P.',
        'Tucker, C.',
        'Zylka, R.',
      ],
    },
    {
      title: 'NOEMA complementarity with NIKA2',
      bibcode: '2020EPJWC.22800014L',
      author: [
        'Lefèvre, Charlène',
        'Kramer, Carsten',
        'Neri, Roberto',
        'Berta, Stefano',
        'Schuster, Karl',
      ],
    },
    {
      title: 'Dust evolution in pre-stellar cores',
      bibcode: '2020EPJWC.22800013L',
      author: [
        'Lefèvre, Charlène',
        'Pagani, Laurent',
        'Ladjelate, Bilal',
        'Min, Michiel',
        'Hirashita, Hiroyuki',
        'Zylka, Robert',
      ],
    },
    {
      title:
        'Preliminary results on the instrumental polarization of NIKA2-Pol at the IRAM 30m telescope',
      bibcode: '2020EPJWC.22800002A',
      author: [
        'Ajeddig, H.',
        'Adam, R.',
        'Ade, P.',
        'André, Ph.',
        'Andrianasolo, A.',
        'Aussel, H.',
        'Beelen, A.',
        'Benoît, A.',
        'Bideaud, A.',
        'Bourrion, O.',
        'Calvo, M.',
        'Catalano, A.',
        'Comis, B.',
        'De Petris, M.',
        'Désert, F. -X.',
        'Doyle, S.',
        'Driessen, E. F. C.',
        'Gomez, A.',
        'Goupy, J.',
        'Kéruzoré, F.',
        'Kramer, C.',
        'Ladjelate, B.',
        'Lagache, G.',
        'Leclercq, S.',
        'Lestrade, J. -F.',
        'Macías-Pérez, J. F.',
        'Maury, A.',
        'Mauskopf, P.',
        'Mayet, F.',
        'Monfardini, A.',
        'Perotto, L.',
        'Pisano, G.',
        'Ponthieu, N.',
        'Revéret, V.',
        'Ritacco, A.',
        'Romero, C.',
        'Roussel, H.',
        'Ruppin, F.',
        'Schuster, K.',
        'Shimajiri, Y.',
        'Shu, S.',
        'Sievers, A.',
        'Tucker, C.',
        'Zylka, R.',
      ],
    },
    {
      title:
        'Preliminary results for the <SUP>19</SUP>F(ρ,α)<SUP>16</SUP>O reaction cross section measured at INFN-LNS',
      bibcode: '2020EPJWC.22702009P',
      author: [
        'Petruse, T.',
        'Guardo, G. L.',
        'Cognata, M. La',
        'Lattuada, D.',
        'Spitalieri, C.',
        'Balabanski, D. L.',
        'Agiksoz, E.',
        'Acosta, L.',
        'Capponi, L.',
        'Carbone, D.',
        'Cherubini, S.',
        'Choudhury, D.',
        "D'Agata, G.",
        'Pietro, A. Di',
        'Figuera, P.',
        'Gulino, M.',
        'Kilik, A. I.',
        'Commara, M. La',
        'Lamia, L.',
        'Matei, C.',
        'Palmerini, S.',
        'Pizzone, R. G.',
        'Romano, S.',
        'Soderstrom, P. -A.',
        'Sparta, R.',
        'Tumino, A.',
        'Onses, S. Vinales',
      ],
    },
    {
      title:
        'Study of the neutron induced reaction <SUP>17</SUP>O(n,α)<SUP>14</SUP>C at astrophysical energies via the Trojan Horse Method',
      bibcode: '2020EPJWC.22702007O',
      author: [
        'Oliva, A. A.',
        'Lamia, L.',
        'Guardo, G. L.',
        'Spitaleri, C.',
        'Cherubini, S.',
        'Cvetinovic, A.',
        "D'Agata, G.",
        'de Sereville, N.',
        'Pietro, A. Di',
        'Figuera, P.',
        'Gulino, M.',
        'Hammache, F.',
        'Hayakawa, S.',
        'Indelicato, I.',
        'Cognata, M. La',
        'Commara, M. La',
        'Lattuada, D.',
        'Lattuada, M.',
        'Manico, G.',
        'Mazzocco, M.',
        'Messina, S.',
        'Palmerini, S.',
        'Pizzone, R. G.',
        'Pumo, M. L.',
        'Rapisarda, G. G.',
        'Romano, S.',
        'Sergi, M. L.',
        'Soic, N.',
        'Spartà, R.',
        'Tumino, A.',
      ],
    },
    {
      title:
        'Nuclear β-decays in plasmas: how to correlate plasma density and temperature to the activity',
      bibcode: '2020EPJWC.22702006N',
      author: [
        'Naselli, Eugenia',
        'Mascali, David',
        'Caliri, Claudia',
        'Castro, Giuseppe',
        'Celona, Luigi',
        'Galatá, Alessio',
        'Gammino, Santo',
        'Mazzaglia, Maria',
        'Romano, Francesco Paolo',
        'Giuseppe, Torrisi',
        'Santonocito, Domenico',
        'Cosentino, Gianluigi',
        'Amaducci, Simone',
      ],
    },
    {
      title:
        'Study of the <SUP>22</SUP>Ne(α , γ)<SUP>26</SUP>Mg reaction at LUNA',
      bibcode: '2020EPJWC.22702004M',
      author: ['Masha, Eliana'],
    },
    {
      title:
        'Dispersion (asymptotic) theory of charged-particle transfer reactions and nuclear astrophysics',
      bibcode: '2020EPJWC.22701019Y',
      author: ['Yarmukhamedov, R.', 'Tursunmakhatov, K. I.', 'Igamov, S. B.'],
    },
    {
      title: 'Short introduction to the physics of neutron stars',
      bibcode: '2020EPJWC.22701018V',
      author: ['Vidaña, Isaac'],
    },
    {
      title:
        'Underground Nuclear Astrophysics: pushing direct measurements toward the Gamow window',
      bibcode: '2020EPJWC.22701015P',
      author: ['Prati, Paolo'],
    },
    {
      title:
        'The PANDORA project: an experimental setup for measuring in-plasma β-decays of astrophysical interest',
      bibcode: '2020EPJWC.22701013M',
      author: [
        'Mascali, David',
        'Busso, Maurizio',
        'Mengoni, Alberto',
        'Amaducci, Simone',
        'Giuseppe, Castro',
        'Celona, Luigi',
        'Cosentino, Gianluigi',
        'Cristallo, Sergio',
        'Finocchiaro, Paolo',
        'Galata, Alessio',
        'Gammino, Santo',
        'Massimi, Cristian',
        'Maggiore, Mario',
        'Mauro, Giorgio',
        'Maria, Mazzaglia',
        'Naselli, Eugenia',
        'Odorici, Fabrizio',
        'Palmerini, Sara',
        'Santonocito, Domenico',
        'Giuseppe, Torrisi',
      ],
    },
    {
      title:
        'Resonant reactions of astrophysical interest studied by means of the Trojan Horse Method. Two case studies',
      bibcode: '2020EPJWC.22701011L',
      author: [
        'La Cognata, Marco',
        'Spitaleri, Claudio',
        'Cherubini, Silvio',
        'Gulino, Marisa',
        'Lamia, Livio',
        'Pizzone, Rosario G.',
        'Romano, Stefano',
        'Tumino, Aurora',
      ],
    },
  ];

  const Paper = ({ title, bibcode, author }) => {
    return (
      <li style={{ marginTop: '1rem' }}>
        <a href={`/abs/${bibcode}/abstract`}>{title}</a>
        <ul className="list-inline">
          {author.slice(0, 3).map((entry, i) => (
            <li>{`${entry}${i < 2 ? ';' : ''}`}</li>
          ))}
          {author.length > 3 && <li>...</li>}
        </ul>
      </li>
    );
  };
  Paper.defaultProps = {
    title: '',
    bibcode: '',
    author: [],
  };

  Paper.propTypes = {
    title: PropTypes.string,
    bibcode: PropTypes.string,
    author: PropTypes.arrayOf(PropTypes.string),
  };

  const selector = (state) => {
    return {
      getRecommendationsRequest: state.requests.GET_RECOMMENDATIONS,
    };
  };

  const RecommendedList = () => {
    const dispatch = useDispatch();
    const { getRecommendationsRequest } = useSelector(selector);
    React.useEffect(() => {
      console.log('getting recommendations');
      dispatch(
        getRecommendations({
          function: 'similar',
          sort: 'entry_date',
          numDocs: 5,
          cutoffDays: 5,
          topNReads: 10,
        })
      );
    }, []);

    console.log(getRecommendationsRequest);

    if (getRecommendationsRequest.status === 'pending') {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem 0',
          }}
        >
          <span>
            <i className="fa fa-spinner fa-spin" aria-hidden="true" />{' '}
            Loading...
          </span>
        </div>
      );
    }

    if (getRecommendationsRequest.status === 'failure') {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem 0',
          }}
        >
          <span>
            <i
              className="fa fa-exclamation-triangle text-danger"
              aria-hidden="true"
            />{' '}
            {getRecommendationsRequest.error}
          </span>
        </div>
      );
    }

    return (
      <ul className="list-unstyled">
        {papers.map(({ title, bibcode, author }) => (
          <Paper title={title} bibcode={bibcode} author={author} />
        ))}
      </ul>
    );
  };

  return RecommendedList;
});
