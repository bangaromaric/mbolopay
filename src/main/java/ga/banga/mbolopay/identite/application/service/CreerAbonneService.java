package ga.banga.mbolopay.identite.application.service;

import ga.banga.mbolopay.identite.domain.command.CommandeCreerAbonne;
import ga.banga.mbolopay.identite.domain.event.EvenementAbonneCree;
import ga.banga.mbolopay.identite.domain.exception.NumeroDejaUtiliseException;
import ga.banga.mbolopay.identite.domain.exception.NumeroNonAutoriseException;
import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.port.in.CreerAbonneUseCase;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;
import ga.banga.mbolopay.identite.domain.port.out.PublieurEvenements;
import ga.banga.mbolopay.identite.domain.service.ServiceValidationAbonne;

/**
 * Implémentation du cas d'usage de création d'abonné.
 *
 * <p>POJO pur sans dépendance framework : orchestration uniquement. La gestion transactionnelle
 * est assurée par un décorateur situé dans la couche infrastructure (secondary/transaction).
 *
 * @author BANGA Romaric
 */
public class CreerAbonneService implements CreerAbonneUseCase {

    private final DepotAbonne depotAbonne;
    private final ServiceValidationAbonne serviceValidation;
    private final PublieurEvenements evenements;

    /**
     * Construit le service avec ses dépendances via les ports.
     *
     * @param depotAbonne       port de persistance des abonnés
     * @param serviceValidation service de validation métier
     * @param evenements        port de publication d'événements
     */
    public CreerAbonneService(
            DepotAbonne depotAbonne,
            ServiceValidationAbonne serviceValidation,
            PublieurEvenements evenements
    ) {
        this.depotAbonne = depotAbonne;
        this.serviceValidation = serviceValidation;
        this.evenements = evenements;
    }

    @Override
    public Abonne executer(CommandeCreerAbonne commande) {
        if (depotAbonne.existeParNumero(commande.numeroTelephone())) {
            throw new NumeroDejaUtiliseException(
                    "Le numéro " + commande.numeroTelephone().valeur() + " est déjà enregistré"
            );
        }

        if (!serviceValidation.estNumeroAutorise(commande.numeroTelephone())) {
            throw new NumeroNonAutoriseException(
                    "Le numéro " + commande.numeroTelephone().valeur() + " n'est pas autorisé"
            );
        }

        Abonne nouvelAbonne = Abonne.creer(commande.nom(), commande.numeroTelephone());
        Abonne abonneSauvegarde = depotAbonne.sauvegarder(nouvelAbonne);
        evenements.publier(new EvenementAbonneCree(abonneSauvegarde.id().toString()));
        return abonneSauvegarde;
    }
}
