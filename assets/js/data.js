/* =====================================================================
   SITE CONTENT: edit this file to update the website.
   ---------------------------------------------------------------------
   Everything that changes over time lives here: publications, projects,
   people, map places and the timeline. You never need to touch the
   HTML or the other scripts to add a paper or a collaborator.

   Rules used when this file was written:
   - Facts come from Chaitanya’s CV, his previous website, the AQUARIUS
     lab pages (fzp.czu.cz), or public records cited in a comment.
   - Anything not known is left as null. A null field simply isn’t shown.
   - Search for "TODO" to find the gaps that still need input.
   ===================================================================== */

window.SITE = {
  lastUpdated: "November 2026",

  links: {
    email: "chaitanyaraj238@gmail.com",
    linkedin: "https://www.linkedin.com/in/chaitanya-raj-8bb1a2297/",
    scholar: "https://scholar.google.com/citations?user=_9G_vBkAAAAJ&hl=en",
    researchgate: "https://www.researchgate.net/profile/Chaitanya-Raj",
    github: "https://github.com/chaitanyaraj238",
    orcid: null, // TODO: add "https://orcid.org/0000-...." and an ORCID button appears automatically
    cv: "assets/docs/Chaitanya_Raj_CV.pdf",
    lab: "https://www.fzp.czu.cz/en/r-9409-science-research/r-9674-leading-research-groups/r-23077-aquarius-research-lab/r-23078-about",
    labPeople: "https://www.fzp.czu.cz/en/r-9409-science-research/r-9674-leading-research-groups/r-23077-aquarius-research-lab/r-23079-people",
    labPublications: "https://www.fzp.czu.cz/en/r-9409-science-research/r-9674-leading-research-groups/r-23077-aquarius-research-lab/r-23085-publications",
    supervisor: "https://home.czu.cz/rakovec",
    supervisorScholar: "https://scholar.google.com/citations?user=_Fm2984AAAAJ",
    supervisorOrcid: "https://orcid.org/0000-0003-2451-3305"
  },

  /* ------------------------------------------------------------------
     CURRENT PhD. Fill the null fields when you are ready to share them.
     ------------------------------------------------------------------ */
  phd: {
    title: null,            // TODO: official PhD project title
    questions: [],          // TODO: 2–4 short research questions, e.g. ["How does ...?"]
    studyDomain: null,      // TODO: e.g. "Czech catchments", "European river basins"
    models: [],             // TODO: models/tools you actually use in the PhD (e.g. "mHM") — only once confirmed
    funding: null           // TODO: e.g. a grant or programme, if you want it shown
  },

  /* ------------------------------------------------------------------
     PUBLICATIONS
     type: "journal" | "chapter" | "review" | "conference"
     featured: true puts it in the highlighted row at the top.
     me: how your name is written in the author string (gets bolded).
     ------------------------------------------------------------------ */
  publications: [
    {
      type: "journal", year: 2026, featured: true,
      title: "From episodic to recurrent: progression of compound dry-hot hydroclimatic stress in Delhi, India",
      authors: "Sahu, V., Raj, C., Swarnkar, S. et al.",
      venue: "Regional Environmental Change", details: "26, 227. Published 29 October 2026",
      doi: "10.1007/s10113-026-02712-w",
      summary: "Tracks how compound dry–hot conditions over Delhi have shifted from occasional episodes to a recurring stress on the city’s hydroclimate."
    },
    {
      type: "journal", year: 2025, featured: true,
      title: "Compound dry and hot events in Madhya Pradesh: temporal shifts, regional hotspots, and adaptation strategies",
      authors: "Raj, C., Swarnkar, S., Poonia, V. et al.",
      venue: "Theoretical and Applied Climatology", details: "156, 333",
      doi: "10.1007/s00704-025-05573-1",
      summary: "Uses 1958–2022 precipitation and temperature records with SPI, STI and a bivariate empirical probability approach to show a sharp post-1990 rise in compound dry–hot events, with hotspots in northern and eastern Madhya Pradesh."
    },
    {
      type: "review", year: 2025, featured: false,
      title: "Hydroclimatic Extremes and Water Stress Under Warming: Combined Vulnerability Assessment for Madhya Pradesh, India",
      authors: "Raj, C., Swarnkar, S., Poonia, V.",
      venue: "Journal of Environmental Management", details: "Under review",
      url: "https://docs.google.com/document/d/1KxUUDvCAGUUewa2O6jLmYFUKYoRZWC8T/edit?usp=drive_link&ouid=102770727824463189859&rtpof=true&sd=true",
      urlLabel: "Abstract",
      summary: null
    },
    {
      type: "chapter", year: 2024, featured: false,
      title: "Evaluating Compound Dry and Hot Events in Bhopal: Past Trends and Insights from Future Climate Projections",
      authors: "Raj, C., Sahu, V., Swarnkar, S., Poonia, V. et al.",
      venue: "Blue Sky, Blue Water: Strategies for Protecting Air and Water Quality in the 21st Century", details: "Taylor & Francis",
      doi: "10.1201/9781003613183-7",
      summary: "Examines historical compound dry–hot events in Bhopal alongside what future climate projections suggest for the city."
    },
    {
      type: "conference", year: 2025, featured: false,
      title: "Understanding Compound Dry-Hot Events in New Delhi: Historical Trends and Projections under +2°C and +4°C Warming Scenarios",
      authors: "Sahu, V., Swarnkar, S., Raj, C.",
      venue: "EGU General Assembly 2025, Vienna", details: "Poster, EGU25-1044",
      doi: "10.5194/egusphere-egu25-1044",
      // Found in the public EGU25 programme; not listed in the CV. TODO: confirm you want it shown.
      summary: null
    },
    {
      type: "conference", year: 2024, featured: false,
      title: "District-wise Evaluation of Compound Drought and Heatwaves (CDHW) Events in the Central Indian Region",
      authors: "Presented by Raj, C.",  // TODO: replace with the full author list from the AGU abstract
      venue: "AGU Annual Meeting 2024", details: "Presentation of MS thesis work",
      summary: null
    },
    {
      type: "conference", year: 2023, featured: false,
      title: "Satellite-Derived Bathymetry (SDB) Analysis along the Rameshwaram Coast with Sentinel-2 Data",
      authors: "Presented by Raj, C.",  // TODO: replace with the full author list from the abstract
      venue: "Conference abstract", details: null,
      url: "https://docs.google.com/document/d/1JYE1rPGhZCbrw0eoVyQcFzLfiTgGvlcX/edit?usp=drive_link&ouid=102770727824463189859&rtpof=true&sd=true",
      urlLabel: "Abstract",
      summary: null
    }
  ],

  /* ------------------------------------------------------------------
     PROJECTS (newest first). Leave a field null if you don’t have it.
     ------------------------------------------------------------------ */
  projects: [
    {
      id: "phd", status: "Ongoing", period: "Oct 2026 – present",
      title: "Hydrological forecasting and early warning",
      place: "AQUARIUS Research Lab, CZU Prague", supervisor: "Dr. Oldřich Rakovec",
      overview: "PhD research within the AQUARIUS lab’s forecasting theme: how hydrological models, weather forecasts and observations can help anticipate floods and droughts, how updating models with recent observations improves forecasts, and how predictive skill and uncertainty change with forecast lead time.",
      question: null, data: null, outcome: null,
      role: "PhD researcher. The lab lists this theme as led by Chaitanya Raj.",
      themes: ["forecasting", "modelling"],
      outputs: []
    },
    {
      id: "s2s", status: "Completed", period: "Nov 2025 – Sep 2026",
      title: "Seasonal to subseasonal forecasting of pre-monsoon heatwaves over India",
      place: "IIT Hyderabad", supervisor: "Dr. R. Maheswaran",
      overview: "Forecast skill and predictability of pre-monsoon heatwaves over India at seasonal to subseasonal lead times.",
      question: null, data: null, outcome: null,
      role: "Junior Research Fellow",
      themes: ["forecasting", "extremes"],
      outputs: []
    },
    {
      id: "multihazard", status: "Completed", period: "May – Nov 2025",
      title: "Multi-hazard climate extremes across India",
      place: "IIT Jodhpur", supervisor: "Dr. Saran Aadhar",
      overview: "Large-scale analysis of droughts, heatwaves, extreme precipitation and streamflow over India, using advanced statistical indices and hydrological modelling.",
      question: null, data: null, outcome: null,
      role: "Project Associate",
      themes: ["extremes", "modelling", "impacts"],
      outputs: []
    },
    {
      id: "cdhe-mp", status: "Completed", period: "Jul 2024 – May 2025",
      title: "Compound dry and hot extremes in Madhya Pradesh",
      place: "IISER Bhopal (MS thesis)", supervisor: "Dr. Somil Swarnkar",
      overview: "Modelling and evaluating the vulnerability of Madhya Pradesh to compound dry and hot extremes (CDHEs): droughts and heat occurring together.",
      question: "How have the frequency and severity of compound dry–hot events changed across Madhya Pradesh, and which districts are most exposed?",
      data: "Monthly precipitation and temperature, 1958–2022. Standardized Precipitation Index (SPI), Standardized Temperature Index (STI) and a bivariate empirical probability distribution.",
      outcome: "A sharp increase in compound event frequency and severity after 1990, with hotspots in northern (Bhind, Morena, Gwalior) and eastern (Sidhi, Shahdol, Satna) districts; Sidhi was the most affected.",
      role: "MS thesis researcher and first author of the resulting paper. The work was covered by The Times of India and Ground Report.",
      themes: ["extremes", "impacts"],
      outputs: ["Theoretical and Applied Climatology (2025)", "AGU 2024 presentation", "IAHS 2025 presentation"],
      press: [
        { label: "IISER Bhopal research highlight", url: "https://www.iiserb.ac.in/highlightsdetails/47" },
        // TODO: these two short links come from the CV; please confirm which outlet each one is.
        { label: "Media coverage (1)", url: "https://lnkd.in/emTUWkZe" },
        { label: "Media coverage (2)", url: "https://lnkd.in/gjXdAtS5" }
      ]
    },
    {
      id: "shoreline", status: "Completed", period: "May – Jul 2024",
      title: "Satellite-derived shoreline trends along the Gujarat coast",
      place: "IIT Gandhinagar", supervisor: "Dr. Vikrant Jain",
      overview: "Geospatial mapping of satellite-derived shoreline positions to describe long-term shoreline trends and variability along the Gujarat coast of India.",
      question: null, data: null, outcome: null,
      role: "Research intern",
      themes: ["geospatial"],
      outputs: []
    },
    {
      id: "sdb", status: "Completed", period: "Jun – Aug 2023",
      title: "Satellite-derived bathymetry over the Rameshwaram coast",
      place: "CSIR–National Institute of Oceanography, Goa", supervisor: "Dr. Komal Rani",
      overview: "Estimating nearshore water depth from multispectral satellite imagery over the Rameshwaram coast, Tamil Nadu.",
      question: null,
      data: "Sentinel-2 and Landsat 8 imagery.",
      outcome: null,
      role: "Research intern. Presented at the Samudra Manthan national conference (2023).",
      themes: ["geospatial"],
      outputs: ["Conference abstract"]
    }
  ],

  /* ------------------------------------------------------------------
     PEOPLE. group: "supervision" | "coauthor" | "lab"
     For co-authors, "match" is how their name appears in author strings;
     the site counts shared outputs automatically.
     Only people supported by the CV, publications or the lab website.
     ------------------------------------------------------------------ */
  people: [
    { name: "Dr. Oldřich Rakovec", group: "supervision", role: "PhD supervisor", org: "AQUARIUS Research Lab, CZU Prague", url: "https://home.czu.cz/rakovec" },
    { name: "Dr. R. Maheswaran", group: "supervision", role: "JRF supervisor (2025–26)", org: "IIT Hyderabad", url: null },
    { name: "Dr. Saran Aadhar", group: "supervision", role: "Project supervisor (2025)", org: "IIT Jodhpur", url: null },
    { name: "Dr. Somil Swarnkar", group: "supervision", role: "MS thesis supervisor; co-author", org: "IISER Bhopal", url: null },
    { name: "Dr. Vikrant Jain", group: "supervision", role: "Internship supervisor (2024)", org: "IIT Gandhinagar", url: null },
    { name: "Dr. Komal Rani", group: "supervision", role: "Internship supervisor (2023)", org: "CSIR–NIO, Goa", url: null },

    { name: "Dr. Somil Swarnkar", group: "coauthor", role: "Co-author", match: "Swarnkar, S.", org: "IISER Bhopal", url: null },
    { name: "Dr. Vikas Poonia", group: "coauthor", role: "Co-author", match: "Poonia, V.", org: "Centre of Excellence in Water Management, MANIT Bhopal", url: null },
    { name: "Vaishnavi Sahu", group: "coauthor", role: "Co-author", match: "Sahu, V.", org: "IISER Bhopal", url: null },
    // TODO: add the remaining "et al." co-authors of the 2025 and 2026 papers here.

    { name: "Devvrat Yadav", group: "lab", role: "PhD researcher, rapidly developing hydroclimatic extremes", org: "AQUARIUS Research Lab", url: "https://home.czu.cz/yadavd" },
    { name: "Ray Kettaren", group: "lab", role: "PhD researcher, climate change and hydrological extremes", org: "AQUARIUS Research Lab", url: "https://home.czu.cz/kettaren" },
    { name: "Vít Šťovíček", group: "lab", role: "PhD researcher, spatiotemporal drought dynamics", org: "AQUARIUS Research Lab", url: "https://orcid.org/0000-0002-4997-8056" }
  ],

  /* ------------------------------------------------------------------
     MAP PLACES. Each place can hold several entries of different kinds.
     kind: "home" | "research" | "coauthor" | "study" | "event"
     ------------------------------------------------------------------ */
  places: [
    { name: "Prague, Czechia", lat: 50.130, lon: 14.374, entries: [
      { kind: "home", text: "PhD research, AQUARIUS Research Lab, Faculty of Environmental Sciences, CZU Prague (2026–)" } ] },
    { name: "Bhopal, India", lat: 23.27, lon: 77.33, entries: [
      { kind: "research", text: "IISER Bhopal: Integrated BS–MS (2020–25) and MS thesis" },
      { kind: "coauthor", text: "Dr. Somil Swarnkar and Vaishnavi Sahu (IISER Bhopal)" },
      { kind: "coauthor", text: "Dr. Vikas Poonia (MANIT Bhopal)" },
      { kind: "study", text: "Bhopal city: compound dry–hot events (book chapter, 2024)" },
      { kind: "event", text: "IPWE 2025 conference (Jan 2025)" } ] },
    { name: "Madhya Pradesh", lat: 23.6, lon: 79.4, region: true, entries: [
      { kind: "study", text: "State-wide compound dry–hot extremes and water stress (MS thesis, 2025 paper, manuscript under review)" } ] },
    { name: "Delhi", lat: 28.61, lon: 77.21, region: true, entries: [
      { kind: "study", text: "Compound dry–hot stress in Delhi (2026 paper, EGU 2025 poster)" } ] },
    { name: "Hyderabad, India", lat: 17.59, lon: 78.12, entries: [
      { kind: "research", text: "IIT Hyderabad: Junior Research Fellow, S2S heatwave forecasting (2025–26)" } ] },
    { name: "Jodhpur, India", lat: 26.47, lon: 73.11, entries: [
      { kind: "research", text: "IIT Jodhpur: Project Associate, multi-hazard extremes over India (2025)" } ] },
    { name: "Gandhinagar, India", lat: 23.21, lon: 72.68, entries: [
      { kind: "research", text: "IIT Gandhinagar: research internship (2024)" } ] },
    { name: "Gujarat coast", lat: 21.3, lon: 70.0, region: true, entries: [
      { kind: "study", text: "Satellite-derived shoreline trends" } ] },
    { name: "Goa, India", lat: 15.46, lon: 73.80, entries: [
      { kind: "research", text: "CSIR–National Institute of Oceanography: research internship (2023)" } ] },
    { name: "Rameshwaram coast", lat: 9.29, lon: 79.31, region: true, entries: [
      { kind: "study", text: "Satellite-derived bathymetry from Sentinel-2 and Landsat 8" } ] },
    { name: "Jhansi, India", lat: 25.45, lon: 78.57, region: true, entries: [
      { kind: "study", text: "Advanced field work and survey (Jan 2024)" } ] },
    { name: "Roorkee, India", lat: 29.87, lon: 77.90, entries: [
      { kind: "event", text: "IAHS 2025 international conference, IIT Roorkee: presented MS thesis work (Oct 2025)" } ] },
    { name: "Dehradun, India", lat: 30.34, lon: 78.04, entries: [
      { kind: "event", text: "AI/ML for Geodata Analysis, IIRS–ISRO (Aug 2024)" } ] },
    { name: "Mohali, India", lat: 30.67, lon: 76.73, entries: [
      { kind: "event", text: "SURE-ALERT landslide early-warning programme, ISRO Disaster Management Program, IISER Mohali (Oct 2024)" } ] },
    { name: "Dhanbad, India", lat: 23.81, lon: 86.44, entries: [
      { kind: "event", text: "Geo-Confluence, IIT (ISM) Dhanbad (Sep 2023)" } ] },
    { name: "Washington, D.C., USA", lat: 38.90, lon: -77.02, entries: [
      { kind: "event", text: "AGU Annual Meeting 2024: presented MS thesis work (Dec 2024)" } ] },
    { name: "Vienna, Austria", lat: 48.23, lon: 16.42, entries: [
      { kind: "event", text: "EGU General Assembly 2025: co-authored poster on compound dry–hot events in Delhi" } ] }
  ],

  /* ------------------------------------------------------------------
     TIMELINE. kind: "position" | "education" | "talk" | "publication" | "training"
     date is "YYYY-MM" (used for sorting); label is what is shown.
     ------------------------------------------------------------------ */
  timeline: [
    { date: "2026-10", label: "Oct 2026", kind: "position", title: "PhD researcher, AQUARIUS Research Lab", org: "Czech University of Life Sciences Prague" },
    { date: "2026-10", label: "Oct 2026", kind: "publication", title: "Delhi compound dry–hot paper published", org: "Regional Environmental Change" },
    { date: "2025-11", label: "Nov 2025", kind: "position", title: "Junior Research Fellow", org: "IIT Hyderabad" },
    { date: "2025-10", label: "Oct 2025", kind: "talk", title: "Presented MS thesis work at IAHS 2025", org: "IIT Roorkee" },
    { date: "2025-05", label: "May 2025", kind: "position", title: "Project Associate", org: "IIT Jodhpur" },
    { date: "2025-05", label: "2025", kind: "education", title: "Completed Integrated BS–MS, Earth and Environmental Sciences", org: "IISER Bhopal" },
    { date: "2025-03", label: "2025", kind: "publication", title: "First-author paper on compound dry–hot events in Madhya Pradesh", org: "Theoretical and Applied Climatology" },
    { date: "2025-01", label: "Jan 2025", kind: "training", title: "Teaching assistant, Google Earth Engine for Hydro-Climatological Applications", org: "Hands-on course" },
    { date: "2025-01", label: "Jan 2025", kind: "training", title: "International Perspectives in Water and Environment (IPWE) 2025", org: "Bhopal" },
    { date: "2024-12", label: "Dec 2024", kind: "talk", title: "Presented district-wise CDHW evaluation at AGU 2024", org: "AGU Annual Meeting" },
    { date: "2024-10", label: "Oct 2024", kind: "training", title: "SURE-ALERT landslide early-warning programme", org: "ISRO Disaster Management Program, IISER Mohali" },
    { date: "2024-08", label: "Aug 2024", kind: "training", title: "AI/ML for Geodata Analysis", org: "IIRS–ISRO, Dehradun" },
    { date: "2024-07", label: "Jul 2024", kind: "position", title: "MS thesis on compound dry and hot extremes", org: "IISER Bhopal" },
    { date: "2024-06", label: "2024", kind: "publication", title: "Book chapter on compound events in Bhopal", org: "Taylor & Francis" },
    { date: "2024-05", label: "May 2024", kind: "position", title: "Research intern, shoreline mapping", org: "IIT Gandhinagar" },
    { date: "2024-03", label: "Mar 2024", kind: "training", title: "Application of Machine Learning in Hydrology", org: "Stochastic Hydrology Lab, IISER Bhopal" },
    { date: "2024-01", label: "Jan 2024", kind: "training", title: "Advanced field work and survey", org: "Jhansi" },
    { date: "2023-09", label: "Sep 2023", kind: "talk", title: "Presented internship work at Samudra Manthan", org: "National conference" },
    { date: "2023-06", label: "Jun 2023", kind: "position", title: "Research intern, satellite-derived bathymetry", org: "CSIR–NIO, Goa" },
    { date: "2023-01", label: "Jan 2023", kind: "training", title: "Hydro-geological and environmental field work", org: "Bhopal" },
    { date: "2020-08", label: "2020", kind: "education", title: "Began Integrated BS–MS", org: "IISER Bhopal" }
  ]
};
