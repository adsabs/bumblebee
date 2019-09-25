define([], function() {
  const ARXIV_CLASSES = {
    "astro-ph": {
      "key": "astro-ph",
      "label": "Astrophysics",
      "selected": false,
      "indeterminate": false,
      "children": {
        "astro-ph.CO": {
          "key": "astro-ph.CO",
          "label": "Cosmology and Nongalactic Astrophysics",
          "selected": false
        },
        "astro-ph.EP": {
          "key": "astro-ph.EP",
          "label": "Earth and Planetary Astrophysics",
          "selected": false
        },
        "astro-ph.GA": {
          "key": "astro-ph.GA",
          "label": "Astrophysics of Galaxies",
          "selected": false
        },
        "astro-ph.HE": {
          "key": "astro-ph.HE",
          "label": "High Energy Astrophysical Phenomena",
          "selected": false
        },
        "astro-ph.IM": {
          "key": "astro-ph.IM",
          "label": "Instrumentation and Methods for Astrophysics",
          "selected": false
        },
        "astro-ph.SR": {
          "key": "astro-ph.SR",
          "label": "Solar and Stellar Astrophysics",
          "selected": false
        }
      }
    },
    "cond-mat": {
      "key": "cond-mat",
      "label": "Condensed Matter",
      "selected": false,
      "indeterminate": false,
      "children": {
        "cond-mat.dis-nn": {
          "key": "cond-mat.dis-nn",
          "label": "Disordered Systems and Neural Networks",
          "selected": false
        },
        "cond-mat.mtrl-sci": {
          "key": "cond-mat.mtrl-sci",
          "label": "Materials Science",
          "selected": false
        },
        "cond-mat.mes-hall": {
          "key": "cond-mat.mes-hall",
          "label": "Mesoscopic Systems and Quantum Hall Effect",
          "selected": false
        },
        "cond-mat.other": {
          "key": "cond-mat.other",
          "label": "Other",
          "selected": false
        },
        "cond-mat.quant-gas": {
          "key": "cond-mat.quant-gas",
          "label": "Quantum Gases",
          "selected": false
        },
        "cond-mat.soft": {
          "key": "cond-mat.soft",
          "label": "Soft Condensed Matter",
          "selected": false
        },
        "cond-mat.stat-mech": {
          "key": "cond-mat.stat-mech",
          "label": "Statistical Mechanics",
          "selected": false
        },
        "cond-mat.str-el": {
          "key": "cond-mat.str-el",
          "label": "Strongly Correlated Electrons",
          "selected": false
        },
        "cond-mat.supr-con": {
          "key": "cond-mat.supr-con",
          "label": "Superconductivity",
          "selected": false
        }
      }
    },
    "gr-qc": {
      "key": "gr-qc",
      "label": "General Relativity and Quantum Cosmology",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "hep-ex": {
      "key": "hep-ex",
      "label": "High Energy Physics (Experiment)",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "hep-lat": {
      "key": "hep-lat",
      "label": "High Energy Physics (Lattice)",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "hep-ph": {
      "key": "hep-ph",
      "label": "High Energy Physics (Phenomenology)",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "hep-th": {
      "key": "hep-th",
      "label": "High Energy Physics (Theory)",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "math-ph": {
      "key": "math-ph",
      "label": "Mathematical Physics",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "nucl-ex": {
      "key": "nucl-ex",
      "label": "Nuclear Experiment",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "nucl-th": {
      "key": "nucl-th",
      "label": "Nuclear Theory",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "econ": {
      "key": "econ",
      "label": "Economics",
      "selected": false,
      "indeterminate": false,
      "children": {
        "econ.EM": {
          "key": "econ.EM",
          "label": "Econometrics",
          "selected": false
        },
        "econ.GN": {
          "key": "econ.GN",
          "label": "General Economics",
          "selected": false
        },
        "econ.TH": {
          "key": "econ.TH",
          "label": "Theoretical Economics",
          "selected": false
        }
      }
    },
    "eess": {
      "key": "eess",
      "label": "Electrical Engineering and Systems Science",
      "selected": false,
      "indeterminate": false,
      "children": {
        "eess.AS": {
          "key": "eess.AS",
          "label": "Audio and Speech Processing",
          "selected": false
        },
        "eess.IV": {
          "key": "eess.IV",
          "label": "Image and Video Processing",
          "selected": false
        },
        "eess.SP": {
          "key": "eess.SP",
          "label": "Signal Processing",
          "selected": false
        },
        "eess.SY": {
          "key": "eess.SY",
          "label": "Systems and Control",
          "selected": false
        }
      }
    },
    "physics": {
      "key": "physics",
      "label": "Physics",
      "selected": false,
      "indeterminate": false,
      "children": {
        "physics.acc-ph": {
          "key": "physics.acc-ph",
          "label": "Accelerator Physics",
          "selected": false
        },
        "physics.app-ph": {
          "key": "physics.app-ph",
          "label": "Applied Physics",
          "selected": false
        },
        "physics.ao-ph": {
          "key": "physics.ao-ph",
          "label": "Atmospheric and Oceanic Physics",
          "selected": false
        },
        "physics.atom-ph": {
          "key": "physics.atom-ph",
          "label": "Atomic Physics",
          "selected": false
        },
        "physics.atm-clus": {
          "key": "physics.atm-clus",
          "label": "Atomic and Molecular Clusters",
          "selected": false
        },
        "physics.bio-ph": {
          "key": "physics.bio-ph",
          "label": "Biological Physics",
          "selected": false
        },
        "physics.chem-ph": {
          "key": "physics.chem-ph",
          "label": "Chemical Physics",
          "selected": false
        },
        "physics.class-ph": {
          "key": "physics.class-ph",
          "label": "Classical Physics",
          "selected": false
        },
        "physics.comp-ph": {
          "key": "physics.comp-ph",
          "label": "Computational Physics",
          "selected": false
        },
        "physics.data-an": {
          "key": "physics.data-an",
          "label": "Data Analysis, Statistics and Probability",
          "selected": false
        },
        "physics.flu-dyn": {
          "key": "physics.flu-dyn",
          "label": "Fluid Dynamics",
          "selected": false
        },
        "physics.gen-ph": {
          "key": "physics.gen-ph",
          "label": "General Physics",
          "selected": false
        },
        "physics.geo-ph": {
          "key": "physics.geo-ph",
          "label": "Geophysics",
          "selected": false
        },
        "physics.hist-ph": {
          "key": "physics.hist-ph",
          "label": "History and Philosophy of Physics",
          "selected": false
        },
        "physics.ins-det": {
          "key": "physics.ins-det",
          "label": "Instrumentation and Detectors",
          "selected": false
        },
        "physics.med-ph": {
          "key": "physics.med-ph",
          "label": "Medical Physics",
          "selected": false
        },
        "physics.optics": {
          "key": "physics.optics",
          "label": "Optics",
          "selected": false
        },
        "physics.ed-ph": {
          "key": "physics.ed-ph",
          "label": "Physics Education",
          "selected": false
        },
        "physics.soc-ph": {
          "key": "physics.soc-ph",
          "label": "Physics and Society",
          "selected": false
        },
        "physics.plasm-ph": {
          "key": "physics.plasm-ph",
          "label": "Plasma Physics",
          "selected": false
        },
        "physics.pop-ph": {
          "key": "physics.pop-ph",
          "label": "Popular Physics",
          "selected": false
        },
        "physics.space-ph": {
          "key": "physics.space-ph",
          "label": "Space Physics",
          "selected": false
        }
      }
    },
    "quant-ph": {
      "key": "quant-ph",
      "label": "Quantum Physics",
      "selected": false,
      "indeterminate": false,
      "children": {}
    },
    "math": {
      "key": "math",
      "label": "Mathematics",
      "selected": false,
      "indeterminate": false,
      "children": {
        "math.AG": {
          "key": "math.AG",
          "label": "Algebraic Geometry",
          "selected": false
        },
        "math.AT": {
          "key": "math.AT",
          "label": "Algebraic Topology",
          "selected": false
        },
        "math.AP": {
          "key": "math.AP",
          "label": "Analysis of PDEs",
          "selected": false
        },
        "math.CT": {
          "key": "math.CT",
          "label": "Category Theory",
          "selected": false
        },
        "math.CA": {
          "key": "math.CA",
          "label": "Classical Analysis and ODEs",
          "selected": false
        },
        "math.CO": {
          "key": "math.CO",
          "label": "Combinatorics",
          "selected": false
        },
        "math.AC": {
          "key": "math.AC",
          "label": "Commutative Algebra",
          "selected": false
        },
        "math.CV": {
          "key": "math.CV",
          "label": "Complex Variables",
          "selected": false
        },
        "math.DG": {
          "key": "math.DG",
          "label": "Differential Geometry",
          "selected": false
        },
        "math.DS": {
          "key": "math.DS",
          "label": "Dynamical Systems",
          "selected": false
        },
        "math.FA": {
          "key": "math.FA",
          "label": "Functional Analysis",
          "selected": false
        },
        "math.GM": {
          "key": "math.GM",
          "label": "General Mathematics",
          "selected": false
        },
        "math.GN": {
          "key": "math.GN",
          "label": "General Topology",
          "selected": false
        },
        "math.GT": {
          "key": "math.GT",
          "label": "Geometric Topology",
          "selected": false
        },
        "math.GR": {
          "key": "math.GR",
          "label": "Group Theory",
          "selected": false
        },
        "math.HO": {
          "key": "math.HO",
          "label": "History and Overview",
          "selected": false
        },
        "math.IT": {
          "key": "math.IT",
          "label": "Information Theory",
          "selected": false
        },
        "math.KT": {
          "key": "math.KT",
          "label": "K-Theory and Homology",
          "selected": false
        },
        "math.LO": {
          "key": "math.LO",
          "label": "Logic",
          "selected": false
        },
        "math.MP": {
          "key": "math.MP",
          "label": "Mathematical Physics",
          "selected": false
        },
        "math.MG": {
          "key": "math.MG",
          "label": "Metric Geometry",
          "selected": false
        },
        "math.NT": {
          "key": "math.NT",
          "label": "Number Theory",
          "selected": false
        },
        "math.NA": {
          "key": "math.NA",
          "label": "Numerical Analysis",
          "selected": false
        },
        "math.OA": {
          "key": "math.OA",
          "label": "Operator Algebras",
          "selected": false
        },
        "math.OC": {
          "key": "math.OC",
          "label": "Optimization and Control",
          "selected": false
        },
        "math.PR": {
          "key": "math.PR",
          "label": "Probability",
          "selected": false
        },
        "math.QA": {
          "key": "math.QA",
          "label": "Quantum Algebra",
          "selected": false
        },
        "math.RT": {
          "key": "math.RT",
          "label": "Representation Theory",
          "selected": false
        },
        "math.RA": {
          "key": "math.RA",
          "label": "Rings and Algebras",
          "selected": false
        },
        "math.SP": {
          "key": "math.SP",
          "label": "Spectral Theory",
          "selected": false
        },
        "math.ST": {
          "key": "math.ST",
          "label": "Statistics Theory",
          "selected": false
        },
        "math.SG": {
          "key": "math.SG",
          "label": "Symplectic Geometry",
          "selected": false
        }
      }
    },
    "nlin": {
      "key": "nlin",
      "label": "Nonlinear Sciences",
      "selected": false,
      "indeterminate": false,
      "children": {
        "nlin.AO": {
          "key": "nlin.AO",
          "label": "Adaptation and Self-Organizing Systems",
          "selected": false
        },
        "nlin.CG": {
          "key": "nlin.CG",
          "label": "Cellular Automata and Lattice Gases",
          "selected": false
        },
        "nlin.CD": {
          "key": "nlin.CD",
          "label": "Chaotic Dynamics",
          "selected": false
        },
        "nlin.SI": {
          "key": "nlin.SI",
          "label": "Exactly Solvable and Integrable Systems",
          "selected": false
        },
        "nlin.PS": {
          "key": "nlin.PS",
          "label": "Pattern Formation and Solitons",
          "selected": false
        }
      }
    },
    "cs": {
      "key": "cs",
      "label": "Computer Science",
      "selected": false,
      "indeterminate": false,
      "children": {
        "cs.AR": {
          "key": "cs.AR",
          "label": "Hardware Architecture",
          "selected": false
        },
        "cs.AI": {
          "key": "cs.AI",
          "label": "Artificial Intelligence",
          "selected": false
        },
        "cs.CL": {
          "key": "cs.CL",
          "label": "Computation and Language",
          "selected": false
        },
        "cs.CC": {
          "key": "cs.CC",
          "label": "Computational Complexity",
          "selected": false
        },
        "cs.CE": {
          "key": "cs.CE",
          "label": "Computational Engineering",
          "selected": false
        },
        "cs.CG": {
          "key": "cs.CG",
          "label": "Computational Geometry",
          "selected": false
        },
        "cs.GT": {
          "key": "cs.GT",
          "label": "Computer Science and Game Theory",
          "selected": false
        },
        "cs.CV": {
          "key": "cs.CV",
          "label": "Computer Vision and Pattern Recognition",
          "selected": false
        },
        "cs.CY": {
          "key": "cs.CY",
          "label": "Computers and Society",
          "selected": false
        },
        "cs.CR": {
          "key": "cs.CR",
          "label": "Cryptography and Security",
          "selected": false
        },
        "cs.DS": {
          "key": "cs.DS",
          "label": "Data Structures and Algorithms",
          "selected": false
        },
        "cs.DB": {
          "key": "cs.DB",
          "label": "Databases",
          "selected": false
        },
        "cs.DL": {
          "key": "cs.DL",
          "label": "Digital Libraries",
          "selected": false
        },
        "cs.DM": {
          "key": "cs.DM",
          "label": "Discrete Mathematics",
          "selected": false
        },
        "cs.DC": {
          "key": "cs.DC",
          "label": "Distributed",
          "selected": false
        },
        "cs.ET": {
          "key": "cs.ET",
          "label": "Emerging Technologies",
          "selected": false
        },
        "cs.FL": {
          "key": "cs.FL",
          "label": "Formal Languages and Automata Theory",
          "selected": false
        },
        "cs.GL": {
          "key": "cs.GL",
          "label": "General Literature",
          "selected": false
        },
        "cs.GR": {
          "key": "cs.GR",
          "label": "Graphics",
          "selected": false
        },
        "cs.HC": {
          "key": "cs.HC",
          "label": "Human-Computer Interaction",
          "selected": false
        },
        "cs.IR": {
          "key": "cs.IR",
          "label": "Information Retrieval",
          "selected": false
        },
        "cs.IT": {
          "key": "cs.IT",
          "label": "Information Theory",
          "selected": false
        },
        "cs.LG": {
          "key": "cs.LG",
          "label": "Machine Learning",
          "selected": false
        },
        "cs.LO": {
          "key": "cs.LO",
          "label": "Logic in Computer Science",
          "selected": false
        },
        "cs.MS": {
          "key": "cs.MS",
          "label": "Mathematical Software",
          "selected": false
        },
        "cs.MA": {
          "key": "cs.MA",
          "label": "Multiagent Systems",
          "selected": false
        },
        "cs.MM": {
          "key": "cs.MM",
          "label": "Multimedia",
          "selected": false
        },
        "cs.NI": {
          "key": "cs.NI",
          "label": "Networking and Internet Architecture",
          "selected": false
        },
        "cs.NE": {
          "key": "cs.NE",
          "label": "Neural and Evolutionary Computing",
          "selected": false
        },
        "cs.NA": {
          "key": "cs.NA",
          "label": "Numerical Analysis",
          "selected": false
        },
        "cs.OS": {
          "key": "cs.OS",
          "label": "Operating Systems",
          "selected": false
        },
        "cs.OH": {
          "key": "cs.OH",
          "label": "Other",
          "selected": false
        },
        "cs.PF": {
          "key": "cs.PF",
          "label": "Performance",
          "selected": false
        },
        "cs.PL": {
          "key": "cs.PL",
          "label": "Programming Languages",
          "selected": false
        },
        "cs.RO": {
          "key": "cs.RO",
          "label": "Robotics",
          "selected": false
        },
        "cs.SE": {
          "key": "cs.SE",
          "label": "Software Engineering",
          "selected": false
        },
        "cs.SD": {
          "key": "cs.SD",
          "label": "Sound",
          "selected": false
        },
        "cs.SC": {
          "key": "cs.SC",
          "label": "Symbolic Computation",
          "selected": false
        },
        "cs.SI": {
          "key": "cs.SI",
          "label": "Social and Information Networks",
          "selected": false
        },
        "cs.SY": {
          "key": "cs.SY",
          "label": "Systems and Control",
          "selected": false
        }
      }
    },
    "q-bio": {
      "key": "q-bio",
      "label": "Quantitative Biology",
      "selected": false,
      "indeterminate": false,
      "children": {
        "q-bio.BM": {
          "key": "q-bio.BM",
          "label": "Biomolecules",
          "selected": false
        },
        "q-bio.CB": {
          "key": "q-bio.CB",
          "label": "Cell Behavior",
          "selected": false
        },
        "q-bio.GN": {
          "key": "q-bio.GN",
          "label": "Genomics",
          "selected": false
        },
        "q-bio.MN": {
          "key": "q-bio.MN",
          "label": "Molecular Networks",
          "selected": false
        },
        "q-bio.NC": {
          "key": "q-bio.NC",
          "label": "Neurons and Cognition",
          "selected": false
        },
        "q-bio.OT": {
          "key": "q-bio.OT",
          "label": "Other Quantitative Biology",
          "selected": false
        },
        "q-bio.PE": {
          "key": "q-bio.PE",
          "label": "Populations and Evolution",
          "selected": false
        },
        "q-bio.QM": {
          "key": "q-bio.QM",
          "label": "Quantitative Methods",
          "selected": false
        },
        "q-bio.SC": {
          "key": "q-bio.SC",
          "label": "Subcellular Processes",
          "selected": false
        },
        "q-bio.TO": {
          "key": "q-bio.TO",
          "label": "Tissues and Organs",
          "selected": false
        }
      }
    },
    "q-fin": {
      "key": "q-fin",
      "label": "Quantitative Finance",
      "selected": false,
      "indeterminate": false,
      "children": {
        "q-fin.CP": {
          "key": "q-fin.CP",
          "label": "Computational Finance",
          "selected": false
        },
        "q-fin.EC": {
          "key": "q-fin.EC",
          "label": "Economics",
          "selected": false
        },
        "q-fin.GN": {
          "key": "q-fin.GN",
          "label": "General Finance",
          "selected": false
        },
        "q-fin.MF": {
          "key": "q-fin.MF",
          "label": "Mathematical Finance",
          "selected": false
        },
        "q-fin.PM": {
          "key": "q-fin.PM",
          "label": "Portfolio Management",
          "selected": false
        },
        "q-fin.PR": {
          "key": "q-fin.PR",
          "label": "Pricing of Securities",
          "selected": false
        },
        "q-fin.RM": {
          "key": "q-fin.RM",
          "label": "Risk Management",
          "selected": false
        },
        "q-fin.ST": {
          "key": "q-fin.ST",
          "label": "Statistical Finance",
          "selected": false
        },
        "q-fin.TR": {
          "key": "q-fin.TR",
          "label": "Trading and Market Microstructure",
          "selected": false
        }
      }
    },
    "stat": {
      "key": "stat",
      "label": "Statistics",
      "selected": false,
      "indeterminate": false,
      "children": {
        "stat.AP": {
          "key": "stat.AP",
          "label": "Applications",
          "selected": false
        },
        "stat.CO": {
          "key": "stat.CO",
          "label": "Computation",
          "selected": false
        },
        "stat.ML": {
          "key": "stat.ML",
          "label": "Machine Learning",
          "selected": false
        },
        "stat.ME": {
          "key": "stat.ME",
          "label": "Methodology",
          "selected": false
        },
        "stat.TH": {
          "key": "stat.TH",
          "label": "Theory",
          "selected": false
        },
        "stat.OT": {
          "key": "stat.OT",
          "label": "Other Statistics",
          "selected": false
        }
      }
    }
  };

  return ARXIV_CLASSES;
});
