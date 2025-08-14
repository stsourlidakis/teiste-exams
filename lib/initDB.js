require('dotenv').config({ silent: process.env.NODE_ENV === 'production' }); //don't forget to add env variables for the db if there is no .env file
const db = require('./mongo');
let semestersCollection = db.get('semesters');

let semesters = [
  {
    key: 'a',
    name: 'Εξάμηνο A',
    courses: [
      {
        name: 'Γραμμική Άλγεβρα',
        key: 'grammikhAlgevra',
        searchStr: 'ΠΠΣPPS,Γραμμική Άλγεβρα,Grammikh Algevra',
      },
      {
        name: 'Μαθηματικά Ι',
        key: 'mathimatikaI',
        searchStr: 'ΠΠΣPPS,Μαθηματικά Ι,Mathimatika I',
      },
      {
        name: 'Ηλεκτρονική Φυσική',
        key: 'hlektronikhFysikh',
        searchStr:
          'ΠΠΣPPS,Ηλεκτρονική Φυσική,Hlektronikh Fysikh,Hlektronikh Fusikh',
      },
      {
        name: 'Φυσική',
        key: 'fysikh',
        searchStr: 'ΠΠΣPPS,Φυσική,Fysikh,Fusikh',
      },
      {
        name: 'Προγραμματισμός Ι',
        key: 'programmatismosI',
        searchStr: 'ΠΠΣPPS,Προγραμματισμός Ι,Programmatismos I',
      },
      {
        name: 'Εισαγωγή Συστήματα Υπολογιστών',
        key: 'eisagwghStaSysthmataYpologistwn',
        searchStr:
          'ΠΠΣPPS,Εισαγωγή στα Συστήματα Υπολογιστών,Eisagwgh sta Systhmata Ypologistwn',
      },
    ],
  },
  {
    key: 'b',
    name: 'Εξάμηνο Β',
    courses: [
      {
        name: 'Μαθηματικά ΙΙ',
        key: 'mathhmatikaII',
        searchStr: 'ΠΠΣPPS,Μαθηματικά ΙΙ,Mathhmatika II',
      },
      {
        name: 'Διακριτά Μαθηματικά',
        key: 'diakritaMathhmatika',
        searchStr: 'ΠΠΣPPS,Διακριτά Μαθηματικά,Diakrita Mathhmatika',
      },
      {
        name: 'Αρχιτεκτονική Υπολογιστών Ι',
        key: 'arxitektonikhYpologistwnI',
        searchStr:
          'ΠΠΣPPS,Αρχιτεκτονική Υπολογιστών Ι,Arxitektonikh Ypologistwn I',
      },
      {
        name: 'Ψηφιακά Συστήματα Ι',
        key: 'psifiakaSystimataI',
        searchStr: 'ΠΠΣPPS,Ψηφιακά Συστήματα Ι,Psifiaka Systimata I',
      },
      {
        name: 'Προγραμματισμός ΙΙ',
        key: 'programmatismosII',
        searchStr: 'ΠΠΣPPS,Προγραμματισμός ΙΙ,Programmatismos II',
      },
      {
        name: 'Δομές Δεδομένων',
        key: 'domesDedomenwn',
        searchStr: 'ΠΠΣPPS,Δομές Δεδομένων,Domes Dedomenwn',
      },
    ],
  },
  {
    key: 'c',
    name: 'Εξάμηνο Γ',
    courses: [
      {
        name: 'Αρχιτεκτονική Υπολογιστών ΙΙ',
        key: 'arxitektonikhYpologistwnII',
        searchStr:
          'ΠΠΣPPS,Αρχιτεκτονική Υπολογιστών ΙΙ,Arxitektonikh Ypologistwn II',
      },
      {
        name: 'Πιθανότητες-Στατιστική',
        key: 'pithanothtesStatistikh',
        searchStr: 'ΠΠΣPPS,Πιθανότητες-Στατιστική,Pithanothtes-Statistikh',
      },
      {
        name: 'Αγγλική Ορολογία Πληροφορικής',
        key: 'agglikhOrologiaPlhroforikhs',
        searchStr:
          'ΠΠΣPPS,Αγγλική Ορολογία Πληροφορικής,Agglikh Orologia Plhroforikhs',
      },
      {
        name: 'Ψηφιακά Συστήματα ΙΙ',
        key: 'psifiakaSysthmataII',
        searchStr: 'ΠΠΣPPS,Ψηφιακά Συστήματα ΙΙ,Psifiaka Systhmata II',
      },
      {
        name: 'Σχεδιασμός Αλγορίθμων',
        key: 'sxediasmosAlgorithmwn',
        searchStr: 'ΠΠΣPPS,Σχεδιασμός Αλγορίθμων,Sxediasmos Algorithmwn',
      },
      {
        name: 'Προγραμματισμός ΙΙΙ',
        key: 'programmatismosIII',
        searchStr: 'ΠΠΣPPS,Προγραμματισμός ΙΙΙ,Programmatismos III',
      },
    ],
  },
  {
    key: 'd',
    name: 'Εξάμηνο Δ',
    courses: [
      {
        name: 'Λειτουργικά Συστήματα',
        key: 'leitourgikaSysthmata',
        searchStr: 'ΠΠΣPPS,Λειτουργικά Συστήματα,Leitourgika Systhmata',
      },
      {
        name: 'Γραμμικά Συστήματα-Μετασχηματισμοί',
        key: 'grammikaSysthmata',
        searchStr:
          'ΠΠΣPPS,Γραμμικά Συστήματα - Γραμμικοί Μετασχηματισμοί,Grammika Systhmata - Grammikoi Metasxhmatismoi',
      },
      {
        name: 'Βάσεις Δεδομένων',
        key: 'vaseisDedomenwn',
        searchStr: 'ΠΠΣPPS,Βάσεις Δεδομένων,Vaseis Dedomenwn',
      },
      {
        name: 'Δίκτυα Δεδομένων Ι',
        key: 'diktyaDedomenwnI',
        searchStr: 'ΠΠΣPPS,Δίκτυα Δεδομένων Ι,Diktya Dedomenwn I,diktua',
      },
      {
        name: 'Εισαγωγή στη Φιλοσοφία',
        key: 'eisagwghSthFilosofia',
        searchStr: 'ΠΠΣPPS,Εισαγωγή στη Φιλοσοφία,Eisagwgh sth Filosofia',
      },
      {
        name: 'Επιχειρισιακή Έρευνα',
        key: 'epixeirisiakhEreuna',
        searchStr: 'ΠΠΣPPS,Επιχειρισιακή Έρευνα,Epixeirisiakh Ereuna',
      },
    ],
  },
  {
    key: 'e',
    name: 'Εξάμηνο Ε',
    courses: [
      {
        name: 'Τεχνητή Νοημοσύνη',
        key: 'texnhthNohmosynh',
        searchStr: 'ΠΠΣPPS,Τεχνητή Νοημοσύνη,Texnhth Nohmosynh',
      },
      {
        name: 'Μικροεπεξεργαστές - Μικροελεγκτές',
        key: 'mikroepeksergastesMikroelegktes',
        searchStr:
          'ΠΠΣPPS,Μικροεπεξεργαστές - Μικροελεγκτές,Mikroepeksergastes - Mikroelegktes',
      },
      {
        name: 'Τεχνολογία Λογισμικού',
        key: 'texnologiaLogismikoy',
        searchStr: 'ΠΠΣPPS,Τεχνολογία Λογισμικού,Texnologia Logismikoy',
      },
      {
        name: 'Ψηφιακή Επεξεργασία Σήματος',
        key: 'pshfiakhEpeksergasiaShmatos',
        searchStr:
          'ΠΠΣPPS,Ψηφιακή Επεξεργασία Σήματος,Pshfiakh Epeksergasia Shmatos',
      },
      {
        name: 'Δίκτυα Δεδομένων ΙΙ',
        key: 'diktyaDedomenwnII',
        searchStr: 'ΠΠΣPPS,Δίκτυα Δεδομένων ΙΙ,Diktya Dedomenwn II,diktua',
      },
      {
        name: 'Θεωρία Πληροφορίας και Κώδικες',
        key: 'thewriaPlhroforiasKwdikes',
        searchStr:
          'ΝΠΣNPS,Θεωρία Πληροφορίας και Κώδικες,Thewria Plhroforias kai Kwdikes',
      },
      {
        name: 'Συστήματα Μετρήσεων',
        key: 'systhmataMetrhsewn',
        searchStr: 'ΝΠΣNPS,Συστήματα Μετρήσεων,Systhmata Metrhsewn,sistimata',
      },
      {
        name: 'Προγραμματισμός σε Συμβολική Γλώσσα',
        key: 'programmatismosSeSymvolikhGlwssa',
        searchStr:
          'ΝΠΣNPS,Προγραμματισμός σε Συμβολική Γλώσσα,Programmatismos se Symvolikh Glwssa',
      },
      {
        name: 'Ανάπτυξη Ψηφιακών Συστημάτων',
        key: 'anaptykshPshfiakwnSysthmatwn',
        searchStr:
          'ΝΠΣNPS,Ανάπτυξη Ψηφιακών Συστημάτων,Anaptyksh Pshfiakwn Systhmatwn',
      },
      {
        name: 'Προχωρημένα Θέματα Αντ/φούς Προγραμματισμού',
        key: 'proxwrhmenaThemataAntikeimProgr',
        searchStr:
          'ΝΠΣNPS,,Προχωρημένα Θέματα Αντικειμενοστρεφούς Προγραμματισμού,Proxwrhmena Themata Antikeimenostrefoys Programmatismoy',
      },
      {
        name: 'Κατασκευή Λογισμικού',
        key: 'kataskevhLogismikoy',
        searchStr: 'ΝΠΣNPS,Κατασκευή Λογισμικού,Kataskevh Logismikoy',
      },
    ],
  },
  {
    key: 'st',
    name: 'Εξάμηνο ΣΤ',
    courses: [
      {
        name: 'Κατανεμημένα Συστήματα',
        key: 'katanemhmenaSysthmata',
        searchStr: 'ΠΠΣPPS,Κατανεμημένα Συστήματα,Katanemhmena Systhmata',
      },
      {
        name: 'Ασφάλεια & προστασία Δεδομένων',
        key: 'asfaleiaKaiProstasiaDedomenwn',
        searchStr:
          'ΠΠΣPPS,Ασφάλεια και προστασία Δεδομένων,Asfaleia kai prostasia Dedomenwn',
      },
      {
        name: 'Τηλεπικοινωνίες',
        key: 'thlepikoinwnies',
        searchStr: 'ΠΠΣPPS,Τηλεπικοινωνίες,Thlepikoinwnies',
      },
      {
        name: 'Συστήματα Αυτόματου Ελέγχου',
        key: 'SysthmataAftomatouElenxou',
        searchStr:
          'ΠΠΣPPS,Συστήματα Αυτόματου Ελέγχου,Systhmata Aftomatou Elenxou',
      },
      {
        name: 'Αυτόματα και Τυπικές Γλώσσες',
        key: 'AutomataKaiTypikesGlwsses',
        searchStr:
          'ΠΠΣPPS,Αυτόματα και Τυπικές Γλώσσες,Automata,Aftomata kai Typikes Glwsses',
      },
      {
        name: 'Ολοκληρωμένα Κυκλώματα',
        key: 'OloklhrwmenaKyklwmataMegalhsKlimakas',
        searchStr:
          'ΠΠΣPPS,Ολοκληρωμένα Κυκλώματα Μεγάλης Κλίμακας,Oloklhrwmena Kyklwmata Megalhs Klimakas',
      },
      {
        name: 'Τεχνολογίες WWW',
        key: 'texnologiesWWW',
        searchStr: 'ΝΠΣNPS,Τεχνολογίες WWW,Texnologies WWW',
      },
      {
        name: 'Ασύρματα Δίκτυα',
        key: 'asyrmataDiktya',
        searchStr: 'ΝΠΣNPS,Ασύρματα Δίκτυα,asirmata',
      },
      {
        name: 'Διαδικτυακός Προγραμματισμός',
        key: 'diadiktyakosProgrammatismos',
        searchStr:
          'ΝΠΣNPS,Διαδικτυακός Προγραμματισμός,Diadiktyakos Programmatismos',
      },
      {
        name: 'Αλγοριθμικά Θέματα Δικτύων',
        key: 'algorithmikaThemataDiktywn',
        searchStr:
          'ΝΠΣNPS,Αλγοριθμικά Θέματα Δικτύων,Algorithmika THemata Diktywn',
      },
      {
        name: 'Σχεδίαση Κυκλωμάτων με Η/Υ',
        key: 'sxediashKyklwmatwnMeHY',
        searchStr:
          'ΝΠΣNPS,Σχεδίαση Κυκλωμάτων με Η/Υ,Sxediash Kyklwmatwn me H/Y',
      },
      {
        name: 'Παράλληλα Συστήματα',
        key: 'parallhlaSysthmata',
        searchStr: 'ΝΠΣNPS,Παράλληλα Συστήματα,Parallhla Systhmata,sistimata',
      },
      {
        name: 'Συστήματα Πραγματικού Χρόνου',
        key: 'systhmataPragmatikoyXronou',
        searchStr:
          'ΝΠΣNPS,Συστήματα Πραγματικού Χρόνου,Systhmata Pragmatikoy Xronou,sistimata',
      },
      {
        name: 'Αλληλεπίδραση Ανθρώπου‐Μηχανής',
        key: 'allhlepidrashAnthrwpouMhxanhs',
        searchStr:
          'ΝΠΣNPS,Αλληλεπίδραση Ανθρώπου-Μηχανής,Allhlepidrash Anthrwpou-Mhxanhs,allilepidrash',
      },
      {
        name: 'Ανάλυση Απαιτήσεων/Έλεγχος Λογισμικού',
        key: 'analyshApaithsewnElenxosLogismikoy',
        searchStr:
          'ΝΠΣNPS,Ανάλυση Απαιτήσεων Διασφάλιση Ποιότητας και Έλεγχος Λογισμικού,Analysh Apaithsewn Elenxos Logismikoy,analish',
      },
      {
        name: 'Λογικός Προγραμματισμός',
        key: 'logikosProgrammatismos',
        searchStr: 'ΝΠΣNPS,Λογικός Προγραμματισμός,Logikos Programmatismos',
      },
    ],
  },
  {
    key: 'z',
    name: 'Εξάμηνο Ζ',
    courses: [
      {
        name: 'Σχεδίαση Δικτύων',
        key: 'SxediashDiktywnYpologistwn',
        searchStr:
          'ΠΠΣPPS,Σχεδίαση Δικτύων Υπολογιστών,Sxediash Diktywn Ypologistwn',
      },
      {
        name: 'Ηλεκτρονικό Εμπόριο',
        key: 'HlektronikoEmporio',
        searchStr:
          'ΠΠΣPPS,Ηλεκτρονικό Εμπόριο & Τεχνολογίες Διαδικτύου,Hlektroniko Emporio & Texnologies Diadiktyou',
      },
      {
        name: 'Ψηφιακή Επεξεργασία Εικόνας',
        key: 'PsifiakhEpeksergasiaEikonas',
        searchStr:
          'ΠΠΣPPS,Ψηφιακή Επεξεργασία Εικόνας,Pshfiakh,Psifiakh Epeksergasia Eikonas',
      },
      {
        name: 'Ειδικά Θέματα Κατανεμημένων',
        key: 'EidikaThemataKatanemhmenwnSysthmatwn',
        searchStr:
          'ΠΠΣPPS,Ειδικά Θέματα Κατανεμημένων Συστημάτων,Eidika Themata Katanemhmenwn Systhmatwn',
      },
      {
        name: 'Πληροφοριακά Συστήματα Διοικησης',
        key: 'PliroforiakaSysthmataDioikhshs',
        searchStr:
          'ΠΠΣPPS,Πληροφοριακά Συστήματα Διοικησης,Pliroforiaka Systhmata Dioikhshs',
      },
      {
        name: 'Πληροφορική στην Εκπαίδευση',
        key: 'PliroforikhSthnEkpaidefsh',
        searchStr:
          'ΠΠΣPPS,Πληροφορική στην Εκπαίδευση,Pliroforikh sthn Ekpaidefsh',
      },
      {
        name: 'Ενσωματωμένα Συστήματα',
        key: 'enswmatwmenaSysthmata',
        searchStr:
          'ΝΠΣNPS,Ενσωματωμένα Συστήματα,Enswmatwmena Systhmata,ensomatomena sistimata',
      },
      {
        name: 'Κινητά και Δορυφορικά Δίκτυα',
        key: 'kinhtaDoryforikaDiktya',
        searchStr:
          'ΝΠΣNPS,Κινητά και Δορυφορικά Δίκτυα,Kinhta kai Doryforika Diktya,diktua',
      },
      {
        name: 'Ευρυζωνικά Δίκτυα',
        key: 'evryzwnikaDiktya',
        searchStr:
          'ΝΠΣNPS,Ευρυζωνικά Δίκτυα,Evryzwnika Diktya,eurizonika diktua',
      },
      {
        name: 'Ανάπτυξη Συστημάτων Αισθητήρων',
        key: 'anaptykshSysthmatwnAisthhthrwn',
        searchStr:
          'ΝΠΣNPS,Ανάπτυξη Συστημάτων Αισθητήρων,Anaptyksh Systhmatwn Aisthhthrwn',
      },
      {
        name: 'Βιομηχανική Πληροφορική',
        key: 'viomhxanikhPlhroforikh',
        searchStr:
          'ΝΠΣNPS,Βιομηχανική Πληροφορική,Viomhxanikh Plhroforikh,Biomixaniki',
      },
      {
        name: 'Εισαγωγή στη Ρομποτική',
        key: 'eisagwghSthRompotikh',
        searchStr:
          'ΝΠΣNPS,Εισαγωγή στη Ρομποτική,Eisagwgh sth Rompotikh,isagogi,robotiki',
      },
      {
        name: 'Προχωρημένα θέματα Προγρ σε Συμβ Γλώσσα',
        key: 'proxwrhmenaThemataprogrSeSymvGlwssa',
        searchStr:
          'ΝΠΣNPS,Προχωρημένα θέματα Προγραμματισμού σε Συμβολική Γλώσσα,Proxwrhmena themata Programmatismoy se Symvolikh Glwssa',
      },
      {
        name: 'Διαχείριση Έργων Λογισμικού',
        key: 'diaxeirishErgwnLogismikoy',
        searchStr:
          'ΝΠΣNPS,Διαχείριση Έργων Λογισμικού,Diaxeirish Ergwn Logismikoy',
      },
      {
        name: 'Υπολογιστική Όραση',
        key: 'ypologistikhOrash',
        searchStr: 'ΝΠΣNPS,Υπολογιστική Όραση,Ypologistikh Orash,upologistiki',
      },
      {
        name: 'Εξόρυξη Γνώσης από Δεδομένα/Γραφικά',
        key: 'eksorykshGnwshsDedomenaGrafika',
        searchStr:
          'ΝΠΣNPS,Εξόρυξη Γνώσης από Δεδομένα ή Γραφικά,Eksoryksh Gnwshs apo Dedomena h Grafika',
      },
    ],
  },
];

function semestersWithItemCount() {
  return semesters.map(function (semester) {
    semester.courses = semester.courses.map(function (course) {
      course.items = 0;
      course.itemsForYear = {};
      return course;
    });
    return semester;
  });
}

const full = semestersWithItemCount();

function insertToDB() {
  full.forEach(function (semester) {
    semestersCollection
      .insert(semester)
      .then((docs) => {
        console.log('Semester ' + semester.key + ' inserted successfully!');
      })
      .catch((err) => {
        console.log('Error on semester: ' + semester.key);
        console.log(err);
      });
  });
}

insertToDB();
