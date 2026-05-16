package ga.banga.mbolopay.portefeuille.domain.model;

import ga.banga.mbolopay.portefeuille.domain.exception.MontantInvalideException;
import ga.banga.mbolopay.portefeuille.domain.exception.SoldeInsuffisantException;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import org.jmolecules.ddd.annotation.AggregateRoot;
import org.jmolecules.ddd.annotation.Identity;
import org.jspecify.annotations.NonNull;

import java.time.Instant;

/**
 * Agrégat représentant le portefeuille d'un abonné MboloPay.
 * Contient le solde en FCFA et les opérations financières associées.
 *
 * @author BANGA Romaric
 */
@AggregateRoot
public class Portefeuille {

    @Identity
    private final @NonNull PortefeuilleId id;
    private final @NonNull AbonneIdReference abonneId; // Référence valuée vers le module Identité
    private @NonNull Argent solde;
    private final @NonNull Instant dateCreation;

    /**
     * Crée un portefeuille vide pour un abonné.
     *
     * @param abonneId référence valuée vers l'abonné propriétaire
     * @return nouveau portefeuille avec solde à zéro
     */
    public static Portefeuille creerVide(@NonNull AbonneIdReference abonneId) {
        return new Portefeuille(
                PortefeuilleId.generer(),
                abonneId,
                Argent.zero(),
                Instant.now()
        );
    }

    /**
     * Reconstruit un portefeuille depuis la persistance.
     *
     * @param id           identifiant du portefeuille
     * @param abonneId     référence valuée vers l'abonné propriétaire
     * @param solde        solde actuel
     * @param dateCreation date de création du portefeuille
     */
    public Portefeuille(
            @NonNull PortefeuilleId id,
            @NonNull AbonneIdReference abonneId,
            @NonNull Argent solde,
            @NonNull Instant dateCreation
    ) {
        this.id = id;
        this.abonneId = abonneId;
        this.solde = solde;
        this.dateCreation = dateCreation;
    }

    /**
     * Crédite le portefeuille d'un montant donné.
     *
     * @param montant montant à déposer (doit être positif)
     * @throws MontantInvalideException si le montant est négatif
     */
    public void deposer(@NonNull Argent montant) {
        if (montant.estNegatif()) {
            throw new MontantInvalideException("Impossible de déposer un montant négatif");
        }
        this.solde = this.solde.ajouter(montant);
    }

    /**
     * Débite le portefeuille d'un montant donné.
     *
     * @param montant montant à retirer (doit être positif et inférieur au solde)
     * @throws MontantInvalideException    si le montant est négatif
     * @throws SoldeInsuffisantException   si le solde est insuffisant
     */
    public void retirer(@NonNull Argent montant) {
        if (montant.estNegatif()) {
            throw new MontantInvalideException("Impossible de retirer un montant négatif");
        }

        Argent nouveauSolde = this.solde.soustraire(montant);
        if (nouveauSolde.estNegatif()) {
            throw new SoldeInsuffisantException(
                    "Solde insuffisant. Disponible: " + solde + ", Demandé: " + montant
            );
        }

        this.solde = nouveauSolde;
    }

    // Getters
    public @NonNull PortefeuilleId id() { return id; }
    public @NonNull AbonneIdReference abonneId() { return abonneId; }
    public @NonNull Argent solde() { return solde; }
    public @NonNull Instant dateCreation() { return dateCreation; }
}
