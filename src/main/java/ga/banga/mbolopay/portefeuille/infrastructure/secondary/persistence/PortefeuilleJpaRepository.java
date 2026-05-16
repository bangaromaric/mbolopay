package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository Spring Data JPA pour les portefeuilles.
 *
 * <p>Package-private : seul {@link DepotPortefeuilleJpa} y accède pour implémenter
 * le port {@code DepotPortefeuille}.
 *
 * @author BANGA Romaric
 */
@Repository
interface PortefeuilleJpaRepository extends JpaRepository<PortefeuilleEntity, UUID> {

    Optional<PortefeuilleEntity> findByAbonneId(String abonneId);

    boolean existsByAbonneId(String abonneId);
}
