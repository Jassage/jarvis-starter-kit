<div class="chapitre-titre-num">ANNEXE B</div>

# Cheat sheet des commandes

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de cette annexe</span>
Un aide-mémoire imprimable, regroupant les commandes les plus utilisées de ce manuel par outil : Linux, SSH, Git, Docker, Docker Compose, Nginx, systemctl, journalctl, curl, réseau, Terraform, AWS CLI, Kubernetes/kubectl, Helm. Chaque ligne indique la commande, son rôle, et un exemple d'usage réel.
</div>

## Linux (chapitre 4)

| Commande | Rôle | Exemple |
|---|---|---|
| `pwd` | Afficher le répertoire courant | `pwd` |
| `ls -lah` | Lister en détail, avec fichiers cachés | `ls -lah /var/log` |
| `cd` | Changer de répertoire | `cd /etc/nginx` |
| `mkdir -p` | Créer un dossier (et ses parents) | `mkdir -p projets/api/src` |
| `cp -r` | Copier récursivement | `cp -r source/ destination/` |
| `mv` | Déplacer ou renommer | `mv fichier.log archives/` |
| `rm -rf` | Supprimer récursivement (destructif) | `rm -rf dossier-a-supprimer/` |
| `cat` | Afficher un fichier entier | `cat /etc/os-release` |
| `less` | Lire un fichier page par page | `less /var/log/syslog` |
| `tail -f` | Suivre un fichier en temps réel | `tail -f error.log` |
| `grep -rn` | Rechercher dans des fichiers | `grep -rn "TODO" ./src` |
| `find` | Rechercher des fichiers par critère | `find . -name "*.log" -mtime -1` |
| `chmod` | Modifier les permissions | `chmod 600 ~/.ssh/id_ed25519` |
| `chown -R` | Changer le propriétaire | `chown -R www-data:www-data /var/www` |
| `sudo` | Exécuter avec privilèges admin | `sudo apt update` |
| `df -h` | Espace disque disponible | `df -h` |
| `du -sh` | Espace utilisé par un dossier | `du -sh /var/log/*` |
| `free -h` | Utilisation de la RAM | `free -h` |
| `ps aux` | Lister les processus | `ps aux | grep node` |
| `top` / `htop` | Surveiller les processus en temps réel | `htop` |
| `ss -tulpn` | Ports en écoute | `sudo ss -tulpn` |
| `tar -czvf` | Créer une archive compressée | `tar -czvf sauvegarde.tar.gz dossier/` |

## SSH (chapitre 6)

| Commande | Rôle | Exemple |
|---|---|---|
| `ssh-keygen -t ed25519` | Générer une paire de clés | `ssh-keygen -t ed25519 -C "email"` |
| `ssh-copy-id` | Installer sa clé publique sur un serveur | `ssh-copy-id user@ip` |
| `ssh` | Se connecter à un serveur distant | `ssh user@ip` |
| `ssh-agent` / `ssh-add` | Ne pas retaper sa phrase de passe | `eval "$(ssh-agent -s)"; ssh-add ~/.ssh/id_ed25519` |

## Git (chapitre 7)

| Commande | Rôle | Exemple |
|---|---|---|
| `git init` | Initialiser un dépôt | `git init` |
| `git clone` | Cloner un dépôt distant | `git clone url` |
| `git status` | État du répertoire de travail | `git status` |
| `git add` | Indexer des changements | `git add .` |
| `git commit -m` | Enregistrer un commit | `git commit -m "message"` |
| `git log --oneline --graph` | Historique condensé et visuel | `git log --oneline --graph` |
| `git diff` | Différences non indexées | `git diff` |
| `git switch -c` | Créer et basculer sur une branche | `git switch -c ma-branche` |
| `git merge` | Fusionner une branche | `git merge ma-branche` |
| `git push -u origin` | Pousser et lier une branche | `git push -u origin main` |
| `git pull` / `git fetch` | Synchroniser avec le distant | `git pull` |
| `git stash` | Mettre de côté un travail en cours | `git stash` |
| `git tag -a` | Créer un tag annoté | `git tag -a v1.0.0 -m "message"` |

## Docker (chapitres 11-12)

| Commande | Rôle | Exemple |
|---|---|---|
| `docker build -t` | Construire une image | `docker build -t mon-app:1.0 .` |
| `docker run -d -p` | Lancer un conteneur en arrière-plan | `docker run -d -p 8080:80 nginx` |
| `docker ps` | Lister les conteneurs actifs | `docker ps` |
| `docker logs -f` | Suivre les logs d'un conteneur | `docker logs -f mon-conteneur` |
| `docker exec -it ... bash` | Ouvrir un terminal dans un conteneur | `docker exec -it mon-conteneur bash` |
| `docker stop` / `start` | Arrêter / redémarrer un conteneur existant | `docker stop mon-conteneur` |
| `docker rm -f` | Supprimer un conteneur | `docker rm -f mon-conteneur` |
| `docker volume create` | Créer un volume nommé | `docker volume create mes-donnees` |
| `docker network create` | Créer un réseau | `docker network create mon-reseau` |
| `docker system df` | Espace utilisé par Docker | `docker system df` |
| `docker image prune -a` | Nettoyer les images inutilisées (destructif) | `docker image prune -a` |

## Docker Compose (chapitre 13)

| Commande | Rôle | Exemple |
|---|---|---|
| `docker compose up -d` | Démarrer tous les services | `docker compose up -d --build` |
| `docker compose down` | Arrêter et supprimer les conteneurs | `docker compose down` |
| `docker compose down -v` | Idem + supprimer les volumes (destructif) | `docker compose down -v` |
| `docker compose ps` | État des services | `docker compose ps` |
| `docker compose logs -f` | Logs d'un service précis | `docker compose logs -f api` |
| `docker compose exec` | Terminal dans un service | `docker compose exec api sh` |

## Nginx (chapitre 15)

| Commande | Rôle | Exemple |
|---|---|---|
| `nginx -t` | Tester la configuration | `sudo nginx -t` |
| `systemctl reload nginx` | Recharger sans interruption | `sudo systemctl reload nginx` |

## systemctl / journalctl (chapitres 4-5)

| Commande | Rôle | Exemple |
|---|---|---|
| `systemctl status` | État d'un service | `systemctl status nginx` |
| `systemctl start/stop/restart` | Gérer un service maintenant | `sudo systemctl restart nginx` |
| `systemctl enable` | Démarrage automatique au boot | `sudo systemctl enable nginx` |
| `journalctl -u ... -f` | Suivre les logs d'un service | `journalctl -u nginx -f` |
| `journalctl -p err` | Filtrer par niveau de gravité | `journalctl -p err -n 20` |

## curl (chapitre 4)

| Commande | Rôle | Exemple |
|---|---|---|
| `curl -I` | En-têtes HTTP uniquement | `curl -I https://exemple.com` |
| `curl -f` | Échouer sur une erreur HTTP | `curl -f http://localhost:3000/health` |
| `curl -X POST -d` | Requête POST avec données | `curl -X POST -d '{"a":1}' url` |

## Réseau (chapitre 4, 17)

| Commande | Rôle | Exemple |
|---|---|---|
| `ip a` | Interfaces et adresses IP | `ip a` |
| `dig` | Résolution DNS détaillée | `dig monsite.com A` |
| `ping` | Tester la connectivité | `ping adresse_ip` |

## Terraform (chapitre 38)

| Commande | Rôle | Exemple |
|---|---|---|
| `terraform init` | Initialiser le projet | `terraform init` |
| `terraform plan` | Prévisualiser sans exécuter | `terraform plan` |
| `terraform apply` | Appliquer réellement | `terraform apply` |
| `terraform destroy` | Détruire (destructif) | `terraform plan -destroy` puis `terraform destroy` |
| `terraform state list` | Lister les ressources gérées | `terraform state list` |

## AWS CLI (chapitre 40)

| Commande | Rôle | Exemple |
|---|---|---|
| `aws s3 cp` | Copier vers/depuis S3 | `aws s3 cp fichier s3://bucket/` |
| `aws ec2 describe-instances` | Lister les instances EC2 | `aws ec2 describe-instances` |

## Kubernetes / kubectl (chapitres 41-42)

| Commande | Rôle | Exemple |
|---|---|---|
| `kubectl apply -f` | Appliquer une description | `kubectl apply -f deployment.yaml` |
| `kubectl get pods` | Lister les pods | `kubectl get pods` |
| `kubectl logs --previous` | Logs avant le dernier redémarrage | `kubectl logs mon-pod --previous` |
| `kubectl describe pod` | Diagnostic détaillé | `kubectl describe pod mon-pod` |
| `kubectl rollout status` | Suivre un déploiement | `kubectl rollout status deployment/api` |

## Helm (chapitre 43)

| Commande | Rôle | Exemple |
|---|---|---|
| `helm install` | Installer une release | `helm install app ./chart` |
| `helm upgrade --install` | Installer ou mettre à jour | `helm upgrade --install app ./chart` |
| `helm rollback` | Revenir à une révision précédente | `helm rollback app 1` |
| `helm history` | Historique des révisions | `helm history app` |

*Annexe suivante : C — Neuf architectures comparées.*
