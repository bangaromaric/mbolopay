package ga.banga.mbolopay.identite.domain.model;

import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import org.jmolecules.ddd.annotation.AggregateRoot;
import org.jmolecules.ddd.annotation.Identity;
import org.jspecify.annotations.NonNull;

import java.time.Instant;

/**
 * Agrégat racine représentant un abonné MboloPay.
 *
 * <p>Un abonné est identifié de façon unique par son {@link AbonneId}, possède un nom et un
 * numéro de téléphone gabonais validés. Sa création passe obligatoirement par la fabrique
 * {@link #creer(NomGabonais, NumeroTelephoneGabonais)}, la reconstitution depuis la persistance
 * par le constructeur public.
 *
 * @author BANGA Romaric
 */
@AggregateRoot
public class Abonne {

    @Identity
    private final @NonNull AbonneId id;
    private final @NonNull NomGabonais nom;
    private final @NonNull NumeroTelephoneGabonais numeroTelephone;
    private final @NonNull Instant dateInscription;
    private boolean actif;

    /**
     * Fabrique un nouvel abonné avec un identifiant généré et le statut actif par défaut.
     *
     * @param nom             nom complet gabonais (prénom + nom)
     * @param numeroTelephone numéro de téléphone gabonais valide
     * @return un nouvel agrégat {@link Abonne}, actif, daté de l'instant courant
     */
    public static @NonNull Abonne creer(
            @NonNull NomGabonais nom,
            @NonNull NumeroTelephoneGabonais numeroTelephone
    ) {
        return new Abonne(
                AbonneId.generer(),
                nom,
                numeroTelephone,
                Instant.now(),
                true
        );
    }

    /**
     * Constructeur pour reconstitution depuis la persistance.
     *
     * <p>À n'utiliser que par les adaptateurs secondaires (mapping JPA → domaine).
     * Pour créer un nouvel abonné, préférer la fabrique {@link #creer(NomGabonais, NumeroTelephoneGabonais)}.
     *
     * @param id              identifiant de l'abonné
     * @param nom             nom complet
     * @param numeroTelephone numéro de téléphone
     * @param dateInscription date et heure d'inscription
     * @param actif           statut d'activation
     */
    public Abonne(
            @NonNull AbonneId id,
            @NonNull NomGabonais nom,
            @NonNull NumeroTelephoneGabonais numeroTelephone,
            @NonNull Instant dateInscription,
            boolean actif
    ) {
        this.id = id;
        this.nom = nom;
        this.numeroTelephone = numeroTelephone;
        this.dateInscription = dateInscription;
        this.actif = actif;
    }

    /**
     * Désactive l'abonné. Opération idempotente : appeler plusieurs fois reste sans effet
     * si l'abonné est déjà inactif.
     */
    public void desactiver() {
        this.actif = false;
    }

    /**
     * Réactive l'abonné. Opération idempotente.
     */
    public void reactiver() {
        this.actif = true;
    }

    /** @return l'identifiant unique de l'abonné */
    public @NonNull AbonneId id() { return id; }

    /** @return le nom complet gabonais */
    public @NonNull NomGabonais nom() { return nom; }

    /** @return le numéro de téléphone gabonais */
    public @NonNull NumeroTelephoneGabonais numeroTelephone() { return numeroTelephone; }

    /** @return l'horodatage d'inscription */
    public @NonNull Instant dateInscription() { return dateInscription; }

    /** @return {@code true} si l'abonné est actif, {@code false} sinon */
    public boolean estActif() { return actif; }
}
