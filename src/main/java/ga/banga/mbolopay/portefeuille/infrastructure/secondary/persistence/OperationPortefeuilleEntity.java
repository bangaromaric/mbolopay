package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;

import ga.banga.mbolopay.portefeuille.domain.model.TypeOperation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Entité JPA pour la persistance des opérations effectuées sur les portefeuilles.
 *
 * <p>Stocke le type ({@link TypeOperation}), le montant impliqué et le solde
 * <i>résultant</i> de l'opération. L'index sur {@code portefeuille_id} accélère les
 * requêtes d'historique par portefeuille ; l'index secondaire sur
 * {@code date_operation} permet le tri DESC efficace.
 *
 * <p>Comme {@code PortefeuilleEntity}, cette classe vit dans l'adaptateur secondaire
 * et reste invisible au domaine. Le mapping bidirectionnel domaine ↔ entité est
 * assuré par {@link DepotOperationsJpa}.
 *
 * @author BANGA Romaric
 */
@Entity
@Table(
        name = "operations_portefeuille",
        indexes = {
                @Index(name = "idx_operations_portefeuille", columnList = "portefeuille_id"),
                @Index(name = "idx_operations_date_desc", columnList = "date_operation DESC")
        }
)
public class OperationPortefeuilleEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "portefeuille_id", nullable = false)
    private UUID portefeuilleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 16)
    private TypeOperation type;

    @Column(name = "montant", nullable = false, precision = 15, scale = 0)
    private BigDecimal montant;

    @Column(name = "solde_apres", nullable = false, precision = 15, scale = 0)
    private BigDecimal soldeApres;

    @Column(name = "date_operation", nullable = false)
    private Instant dateOperation;

    // Constructeur par défaut requis par JPA
    protected OperationPortefeuilleEntity() {}

    public OperationPortefeuilleEntity(
            UUID id,
            UUID portefeuilleId,
            TypeOperation type,
            BigDecimal montant,
            BigDecimal soldeApres,
            Instant dateOperation
    ) {
        this.id = id;
        this.portefeuilleId = portefeuilleId;
        this.type = type;
        this.montant = montant;
        this.soldeApres = soldeApres;
        this.dateOperation = dateOperation;
    }

    public UUID getId() { return id; }
    protected void setId(UUID id) { this.id = id; }

    public UUID getPortefeuilleId() { return portefeuilleId; }
    protected void setPortefeuilleId(UUID portefeuilleId) { this.portefeuilleId = portefeuilleId; }

    public TypeOperation getType() { return type; }
    protected void setType(TypeOperation type) { this.type = type; }

    public BigDecimal getMontant() { return montant; }
    protected void setMontant(BigDecimal montant) { this.montant = montant; }

    public BigDecimal getSoldeApres() { return soldeApres; }
    protected void setSoldeApres(BigDecimal soldeApres) { this.soldeApres = soldeApres; }

    public Instant getDateOperation() { return dateOperation; }
    protected void setDateOperation(Instant dateOperation) { this.dateOperation = dateOperation; }
}
