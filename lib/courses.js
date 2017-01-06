module.exports.semesters = {
	"Εξάμηνο A": [
		"Γραμμική Άλγεβρα",
		"Μαθηματικά Ι",
		"Ηλεκτρονική Φυσική",
		"Φυσική",
		"Προγραμματισμός Ι",
		"Εισαγωγή στα Συστήματα Υπολογιστών"
	],
	"Εξάμηνο Β": [
		"Μαθηματικά ΙΙ",
		"Διακριτά Μαθηματικά",
		"Αρχιτεκτονική Υπολογιστών Ι",
		"Ψηφιακά Συστήματα Ι",
		"Προγραμματισμός ΙΙ",
		"Δομές Δεδομένων"
	],
	"Εξάμηνο Γ": [
		"Αρχιτεκτονική Υπολογιστών ΙΙ",
		"Πιθανότητες-Στατιστική",
		"Αγγλική Ορολογία Πληροφορικής",
		"Ψηφιακά Συστήματα ΙΙ",
		"Σχεδιασμός και Ανάλυση Αλγορίθμων",
		"Προγραμματισμός ΙΙΙ"
	],
	"Εξάμηνο Δ": [
		"Λειτουργικά Συστήματα",
		"Γραμμικά Συστήματα - Γραμμικοί Μετασχηματισμοί",
		"Βάσεις Δεδομένων",
		"Δίκτυα Δεδομένων Ι",
		"Εισαγωγή στη Φιλοσοφία",
		"Επιχειρισιακή Έρευνα"
	],
	"Εξάμηνο Ε": [
		"Τεχνητή Νοημοσύνη",
		"Μικροεπεξεργαστές - Μικροελεγκτές",
		"Τεχνολογία Λογισμικού",
		"Ψηφιακή Επεξεργασία Σήματος",
		"Δίκτυα Δεδομένων ΙΙ"
	],
	"Εξάμηνο ΣΤ": [
		"Κατανεμημένα Συστήματα",
		"Ασφάλεια και προστασία Δεδομένων",
		"Τηλεπικοινωνίες",
		"Συστήματα Αυτόματου Ελέγχου",
		"Αυτόματα και Τυπικές Γλώσσες",
		"Ολοκληρωμένα Κυκλώματα Μεγάλης Κλίμακας"
	],
	"Εξάμηνο Ζ": [
		"Σχεδίαση Δικτύων Υπολογιστών",
		"Ηλεκτρονικό Εμπόριο & Τεχνολογίες Διαδικτύου",
		"Ψηφιακή Επεξεργασία Εικόνας",
		"Ειδικά Θέματα Κατανεμημένων Συστημάτων",
		"Πληροφοριακά Συστήματα Διοικησης",
		"Πληροφορική στην Εκπαίδευση"
	]
};

module.exports.exists = function (name){
	return (module.exports.courses.indexOf(name) !== -1);
};

module.exports.all = getRawCourses();

function getRawCourses(){
	const keys = Object.keys(module.exports.semesters);
	const valuesAsArray = keys.map((sem) => {return module.exports.semesters[sem];}) //Object.values() shim
	return [].concat(...valuesAsArray);
}