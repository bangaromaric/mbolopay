package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository Spring Data JPA pour les opérations sur les portefeuilles.
 *
 * <p>Package-private : seul {@link DepotOperationsJpa} y accède pour implémenter
 * le port {@code DepotOperations}. Le tri secondaire par {@code id} garantit un
 * ordre déterministe quand plusieurs opérations partagent la même {@code dateOperation}
 * (collision possible en cas d'enregistrement à la milliseconde près).
 *
 * @author BANGA Romaric
 */
@Repository
interface OperationsJpaRepository extends JpaRepository<OperationPortefeuilleEntity, UUID> {

    Page<OperationPortefeuilleEntity> findByPortefeuilleIdOrderByDateOperationDescIdDesc(
            UUID portefeuilleId, Pageable pageable);
}
