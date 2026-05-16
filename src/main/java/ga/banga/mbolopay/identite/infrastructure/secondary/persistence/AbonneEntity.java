package ga.banga.mbolopay.identite.infrastructure.secondary.persistence;

import jakarta.persistence.*;
import org.jspecify.annotations.NonNull;

import java.time.Instant;
import java.util.UUID;

/**
 * Entité JPA pour la persistance des abonnés.
 *
 * <p>Cette classe vit dans l'adaptateur secondaire : elle est invisible au domaine et au
 * service d'application. Le mapping bidirectionnel domaine ↔ entité est assuré par
 * {@link DepotAbonneJpa}.
 *
 * @author BANGA Romaric
 */
@Entity
@Table(name = "abonnes")
public class AbonneEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "numero_telephone", nullable = false, unique = true, length = 20)
    private String numeroTelephone;

    @Column(name = "date_inscription", nullable = false)
    private Instant dateInscription;

    @Column(name = "actif", nullable = false)
    private boolean actif;

    // Constructeur par défaut requis par JPA
    protected AbonneEntity() {}

    public AbonneEntity(
            @NonNull UUID id,
            @NonNull String prenom,
            @NonNull String nom,
            @NonNull String numeroTelephone,
            @NonNull Instant dateInscription,
            boolean actif
    ) {
        this.id = id;
        this.prenom = prenom;
        this.nom = nom;
        this.numeroTelephone = numeroTelephone;
        this.dateInscription = dateInscription;
        this.actif = actif;
    }

    // Getters et Setters
    public UUID getId() { return id; }
    protected void setId(UUID id) { this.id = id; }

    public String getPrenom() { return prenom; }
    protected void setPrenom(String prenom) { this.prenom = prenom; }

    public String getNom() { return nom; }
    protected void setNom(String nom) { this.nom = nom; }

    public String getNumeroTelephone() { return numeroTelephone; }
    protected void setNumeroTelephone(String numeroTelephone) { this.numeroTelephone = numeroTelephone; }

    public Instant getDateInscription() { return dateInscription; }
    protected void setDateInscription(Instant dateInscription) { this.dateInscription = dateInscription; }

    public boolean isActif() { return actif; }
    protected void setActif(boolean actif) { this.actif = actif; }
}
