package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;

import ga.banga.mbolopay.portefeuille.domain.model.OperationId;
import ga.banga.mbolopay.portefeuille.domain.model.OperationPortefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PageOperations;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.model.RequetePagination;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotOperations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adaptateur secondaire JPA pour le port {@link DepotOperations}.
 *
 * <p>Traduit les abstractions de pagination domaine ({@link RequetePagination},
 * {@link PageOperations}) en API Spring Data ({@link Pageable}, {@link Page}) et
 * vice-versa, sans jamais laisser fuiter ces types vers les couches supérieures.
 *
 * @author BANGA Romaric
 */
@Component
public class DepotOperationsJpa implements DepotOperations {

    private final OperationsJpaRepository jpaRepository;

    public DepotOperationsJpa(OperationsJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public OperationPortefeuille enregistrer(OperationPortefeuille operation) {
        OperationPortefeuilleEntity entity = versEntity(operation);
        jpaRepository.save(entity);
        return operation;
    }

    @Override
    public PageOperations trouverParPortefeuille(
            PortefeuilleId portefeuilleId,
            RequetePagination requete
    ) {
        Pageable pageable = PageRequest.of(requete.page(), requete.taille());
        Page<OperationPortefeuilleEntity> page = jpaRepository
                .findByPortefeuilleIdOrderByDateOperationDescIdDesc(portefeuilleId.valeur(), pageable);

        List<OperationPortefeuille> contenu = page.getContent().stream()
                .map(this::versDomaine)
                .toList();

        return new PageOperations(
                contenu,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    // === Mapping Domain ↔ Entity ===

    private OperationPortefeuilleEntity versEntity(OperationPortefeuille operation) {
        return new OperationPortefeuilleEntity(
                operation.id().valeur(),
                operation.portefeuilleId().valeur(),
                operation.type(),
                operation.montant().montant(),
                operation.soldeApres().montant(),
                operation.dateOperation()
        );
    }

    private OperationPortefeuille versDomaine(OperationPortefeuilleEntity entity) {
        return new OperationPortefeuille(
                new OperationId(entity.getId()),
                new PortefeuilleId(entity.getPortefeuilleId()),
                entity.getType(),
                new Argent(entity.getMontant()),
                new Argent(entity.getSoldeApres()),
                entity.getDateOperation()
        );
    }
}
