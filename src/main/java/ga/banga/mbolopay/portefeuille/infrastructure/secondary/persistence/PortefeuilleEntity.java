package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Entité JPA pour la persistance des portefeuilles.
 *
 * <p>Cette classe vit dans l'adaptateur secondaire : elle est invisible au domaine et au
 * service d'application. Le mapping bidirectionnel domaine ↔ entité est assuré par
 * {@link DepotPortefeuilleJpa}.
 *
 * @author BANGA Romaric
 */
@Entity
@Table(name = "portefeuilles")
public class PortefeuilleEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "abonne_id", nullable = false, unique = true)
    private String abonneId;

    @Column(name = "solde", nullable = false, precision = 15, scale = 0)
    private BigDecimal solde;

    @Column(name = "date_creation", nullable = false)
    private Instant dateCreation;

    // Constructeur par défaut requis par JPA
    protected PortefeuilleEntity() {}

    public PortefeuilleEntity(
            UUID id,
            String abonneId,
            BigDecimal solde,
            Instant dateCreation
    ) {
        this.id = id;
        this.abonneId = abonneId;
        this.solde = solde;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public UUID getId() { return id; }
    protected void setId(UUID id) { this.id = id; }

    public String getAbonneId() { return abonneId; }
    protected void setAbonneId(String abonneId) { this.abonneId = abonneId; }

    public BigDecimal getSolde() { return solde; }
    protected void setSolde(BigDecimal solde) { this.solde = solde; }

    public Instant getDateCreation() { return dateCreation; }
    protected void setDateCreation(Instant dateCreation) { this.dateCreation = dateCreation; }
}
