require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });	//don't forget to add env variables for the db if there is no .env file
const db = require('./mongo');

let semesters = [
	{
		key: "a",
		name: "Εξάμηνο A",
		courses: [
			{
				name: "Γραμμική Άλγεβρα",
				key: "grammikhAlgevra",
				searchStr: "Γραμμική Άλγεβρα,Grammikh Algevra",
			},
			{
				name: "Μαθηματικά Ι",
				key: "mathimatikaI",
				searchStr: "Μαθηματικά Ι,Mathimatika I",
			},
			{
				name: "Ηλεκτρονική Φυσική",
				key: "hlektronikhFysikh",
				searchStr: "Ηλεκτρονική Φυσική,Hlektronikh Fysikh,Hlektronikh Fusikh",
			},
			{
				name: "Φυσική",
				key: "fysikh",
				searchStr: "Φυσική,Fysikh,Fusikh",
			},
			{
				name: "Προγραμματισμός Ι",
				key: "programmatismosI",
				searchStr: "Προγραμματισμός Ι,Programmatismos I",
			},
			{
				name: "Εισαγωγή Συστήματα Υπολογιστών",
				key: "eisagwghStaSysthmataYpologistwn",
				searchStr: "Εισαγωγή στα Συστήματα Υπολογιστών,Eisagwgh sta Systhmata Ypologistwn",
			}
		]
	},
	{
		key: "b",
		name: "Εξάμηνο Β",
		courses: [
			{
				name: "Μαθηματικά ΙΙ",
				key: "mathhmatikaII",
				searchStr: "Μαθηματικά ΙΙ,Mathhmatika II",
			},
			{
				name: "Διακριτά Μαθηματικά",
				key: "diakritaMathhmatika",
				searchStr: "Διακριτά Μαθηματικά,Diakrita Mathhmatika",
			},
			{
				name: "Αρχιτεκτονική Υπολογιστών Ι",
				key: "arxitektonikhYpologistwnI",
				searchStr: "Αρχιτεκτονική Υπολογιστών Ι,Arxitektonikh Ypologistwn I",
			},
			{
				name: "Ψηφιακά Συστήματα Ι",
				key: "psifiakaSystimataI",
				searchStr: "Ψηφιακά Συστήματα Ι,Psifiaka Systimata I",
			},
			{
				name: "Προγραμματισμός ΙΙ",
				key: "programmatismosII",
				searchStr: "Προγραμματισμός ΙΙ,Programmatismos II",
			},
			{
				name: "Δομές Δεδομένων",
				key: "domesDedomenwn",
				searchStr: "Δομές Δεδομένων,Domes Dedomenwn",
			}
		]
	},
	{
		key: "c",
		name: "Εξάμηνο Γ",
		courses: [
			{
				name: "Αρχιτεκτονική Υπολογιστών ΙΙ",
				key: "arxitektonikhYpologistwnΙΙ",
				searchStr: "Αρχιτεκτονική Υπολογιστών ΙΙ,Arxitektonikh Ypologistwn ΙΙ",
			},
			{
				name: "Πιθανότητες-Στατιστική",
				key: "pithanothtesStatistikh",
				searchStr: "Πιθανότητες-Στατιστική,Pithanothtes-Statistikh",
			},
			{
				name: "Αγγλική Ορολογία Πληροφορικής",
				key: "agglikhOrologiaPlhroforikhs",
				searchStr: "Αγγλική Ορολογία Πληροφορικής,Agglikh Orologia Plhroforikhs",
			},
			{
				name: "Ψηφιακά Συστήματα ΙΙ",
				key: "psifiakaSysthmataII",
				searchStr: "Ψηφιακά Συστήματα ΙΙ,Psifiaka Systhmata II",
			},
			{
				name: "Σχεδιασμός Αλγορίθμων",
				key: "sxediasmosAlgorithmwn",
				searchStr: "Σχεδιασμός Αλγορίθμων,Sxediasmos Algorithmwn",
			},
			{
				name: "Προγραμματισμός ΙΙΙ",
				key: "programmatismosIII",
				searchStr: "Προγραμματισμός ΙΙΙ,Programmatismos III",
			}
		]
	},
	{
		key: "d",
		name: "Εξάμηνο Δ",
		courses: [
			{
				name: "Λειτουργικά Συστήματα",
				key: "leitourgikaSysthmata",
				searchStr: "Λειτουργικά Συστήματα,Leitourgika Systhmata",
			},
			{
				name: "Γραμμικά Συστήματα-Μετασχηματισμοί",
				key: "grammikaSysthmata",
				searchStr: "Γραμμικά Συστήματα - Γραμμικοί Μετασχηματισμοί,Grammika Systhmata - Grammikoi Metasxhmatismoi",
			},
			{
				name: "Βάσεις Δεδομένων",
				key: "vaseisDedomenwn",
				searchStr: "Βάσεις Δεδομένων,Vaseis Dedomenwn",
			},
			{
				name: "Δίκτυα Δεδομένων Ι",
				key: "diktyaDedomenwnI",
				searchStr: "Δίκτυα Δεδομένων Ι,Diktya Dedomenwn I",
			},
			{
				name: "Εισαγωγή στη Φιλοσοφία",
				key: "eisagwghSthFilosofia",
				searchStr: "Εισαγωγή στη Φιλοσοφία,Eisagwgh sth Filosofia",
			},
			{
				name: "Επιχειρισιακή Έρευνα",
				key: "epixeirisiakh Ereuna",
				searchStr: "Επιχειρισιακή Έρευνα,Epixeirisiakh Ereuna",
			}
		]
	},
	{
		key: "e",
		name: "Εξάμηνο Ε",
		courses: [
			{
				name: "Τεχνητή Νοημοσύνη",
				key: "texnhthNohmosynh",
				searchStr: "Τεχνητή Νοημοσύνη,Texnhth Nohmosynh",
			},
			{
				name: "Μικροεπεξεργαστές - Μικροελεγκτές",
				key: "mikroepeksergastesMikroelegktes",
				searchStr: "Μικροεπεξεργαστές - Μικροελεγκτές,Mikroepeksergastes - Mikroelegktes",
			},
			{
				name: "Τεχνολογία Λογισμικού",
				key: "texnologiaLogismikoy",
				searchStr: "Τεχνολογία Λογισμικού,Texnologia Logismikoy",
			},
			{
				name: "Ψηφιακή Επεξεργασία Σήματος",
				key: "pshfiakhEpeksergasiaShmatos",
				searchStr: "Ψηφιακή Επεξεργασία Σήματος,Pshfiakh Epeksergasia Shmatos",
			},
			{
				name: "Δίκτυα Δεδομένων ΙΙ",
				key: "diktyaDedomenwnII",
				searchStr: "Δίκτυα Δεδομένων ΙΙ,Diktya Dedomenwn II",
			}
		]
	},
	{
		key: "st",
		name: "Εξάμηνο ΣΤ",
		courses: [
			{
				name: "Κατανεμημένα Συστήματα",
				key: "katanemhmenaSysthmata",
				searchStr: "Κατανεμημένα Συστήματα,Katanemhmena Systhmata",
			},
			{
				name: "Ασφάλεια & προστασία Δεδομένων",
				key: "asfaleiaKaiProstasiaDedomenwn",
				searchStr: "Ασφάλεια και προστασία Δεδομένων,Asfaleia kai prostasia Dedomenwn",
			},
			{
				name: "Τηλεπικοινωνίες",
				key: "thlepikoinwnies",
				searchStr: "Τηλεπικοινωνίες,Thlepikoinwnies",
			},
			{
				name: "Συστήματα Αυτόματου Ελέγχου",
				key: "SysthmataAftomatouElenxou",
				searchStr: "Συστήματα Αυτόματου Ελέγχου,Systhmata Aftomatou Elenxou",
			},
			{
				name: "Αυτόματα και Τυπικές Γλώσσες",
				key: "AutomataKaiTypikesGlwsses",
				searchStr: "Αυτόματα και Τυπικές Γλώσσες,Automata,Aftomata kai Typikes Glwsses",
			},
			{
				name: "Ολοκληρωμένα Κυκλώματα",
				key: "OloklhrwmenaKyklwmataMegalhsKlimakas",
				searchStr: "Ολοκληρωμένα Κυκλώματα Μεγάλης Κλίμακας,Oloklhrwmena Kyklwmata Megalhs Klimakas",
			}
		]
	},
	{
		key: "z",
		name: "Εξάμηνο Ζ",
		courses: [
			{
				name: "Σχεδίαση Δικτύων",
				key: "SxediashDiktywnYpologistwn",
				searchStr: "Σχεδίαση Δικτύων Υπολογιστών,Sxediash Diktywn Ypologistwn",
			},
			{
				name: "Ηλεκτρονικό Εμπόριο",
				key: "HlektronikoEmporio",
				searchStr: "Ηλεκτρονικό Εμπόριο & Τεχνολογίες Διαδικτύου,Hlektroniko Emporio & Texnologies Diadiktyou",
			},
			{
				name: "Ψηφιακή Επεξεργασία Εικόνας",
				key: "PsifiakhEpeksergasiaEikonas",
				searchStr: "Ψηφιακή Επεξεργασία Εικόνας,Pshfiakh,Psifiakh Epeksergasia Eikonas",
			},
			{
				name: "Ειδικά Θέματα Κατανεμημένων",
				key: "EidikaThemataKatanemhmenwnSysthmatwn",
				searchStr: "Ειδικά Θέματα Κατανεμημένων Συστημάτων,Eidika Themata Katanemhmenwn Systhmatwn",
			},
			{
				name: "Πληροφοριακά Συστήματα Διοικησης",
				key: "PliroforiakaSysthmataDioikhshs",
				searchStr: "Πληροφοριακά Συστήματα Διοικησης,Pliroforiaka Systhmata Dioikhshs",
			},
			{
				name: "Πληροφορική στην Εκπαίδευση",
				key: "PliroforikhSthnEkpaidefsh",
				searchStr: "Πληροφορική στην Εκπαίδευση,Pliroforikh sthn Ekpaidefsh",
			}
		]
	}
];

function semestersWithItemCount(){
	return semesters.map(function(semester){
		semester.courses = semester.courses.map(function(course){
			course.items = 0;
			course.itemsForYear = {
			};
			return course;
		});
		return semester;
	});
}

const full = semestersWithItemCount();

function insertToDB(){
	let collection = db.get('semesters');
	full.forEach(function(semester){
		collection.insert(semester)
		.then((docs)=>{
			console.log('Semester '+semester.key+' inserted successfully!');
		})
		.catch((err) => {
			console.log('Error on semester: '+semester.key);
			console.log(err);
		});
	});
}

insertToDB();
