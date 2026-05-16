package ga.banga.mbolopay.identite.infrastructure.secondary.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository Spring Data JPA pour les abonnés.
 *
 * <p>Package-private : seul {@link DepotAbonneJpa} y accède pour implémenter le port
 * {@code DepotAbonne}.
 *
 * @author BANGA Romaric
 */
@Repository
interface AbonneJpaRepository extends JpaRepository<AbonneEntity, UUID> {

    Optional<AbonneEntity> findByNumeroTelephone(String numeroTelephone);

    boolean existsByNumeroTelephone(String numeroTelephone);
}
