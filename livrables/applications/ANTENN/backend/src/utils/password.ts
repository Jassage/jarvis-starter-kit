import { z } from 'zod';

// Politique commune à toutes les entrées de mot de passe (création d'un compte,
// changement par l'intéressé, réinitialisation par lien). Auparavant chaque schéma
// posait sa propre règle, la plus faible étant un simple `min(8)`.
//
// Seuil aligné sur le reste du portefeuille, sans exiger de caractère spécial : la
// régie est utilisée depuis un poste partagé et parfois depuis un téléphone, où un
// mot de passe long reste plus praticable qu'un mot de passe tordu.
export const motDePasseSchema = z
  .string()
  .min(10, 'Le mot de passe doit contenir au moins 10 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre');
