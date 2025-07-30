type Role = "Admin" | "Search" | "Add" | "Manage" | "Print" | "Statistic";

const ALL_ROLES: Role[] = ['Admin', 'Search', 'Add', 'Manage', 'Print', 'Statistic'];

interface MontakhibDTO extends MontakhibInputDTO {
  id: number;
}

interface MontakhibInputDTO {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  sex: Sex;
  education: Education;
  situationFamiliale: SituationFamiliale;
  jamaaId: number;
}

interface EmployerInputDTO {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  telephone: string;
  username: string;
  password: string;
  roles: string; // Comma-separated string for backend
}

interface EmployerDTO {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  telephone: string;
  username: string;
  roles: Role[]; // Array of roles
}

enum Sex {
  Homme = 'Homme',
  Femme = 'Femme'
}

enum SituationFamiliale {
  MARIE = 'MARIE',
  DIVORCE = 'DIVORCE',
  CELIBATAIRE = 'CELIBATAIRE',
  VEUF = 'VEUF'
}

enum Education {
  SANS = 'SANS',
  PRIMAIRE = 'PRIMAIRE',
  COLLEGE = 'COLLEGE',
  LYCEE = 'LYCEE',
  UNIVERSITAIRE = 'UNIVERSITAIRE'
}

interface JamaaDTO {
  id: number;
  nom: string;
  lastId: number;
}