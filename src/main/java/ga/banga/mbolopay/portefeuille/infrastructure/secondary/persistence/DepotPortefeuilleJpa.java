package ga.banga.mbolopay.portefeuille.infrastructure.secondary.persistence;


import ga.banga.mbolopay.portefeuille.domain.model.AbonneIdReference;
import ga.banga.mbolopay.portefeuille.domain.model.Portefeuille;
import ga.banga.mbolopay.portefeuille.domain.model.PortefeuilleId;
import ga.banga.mbolopay.portefeuille.domain.model.vo.Argent;
import ga.banga.mbolopay.portefeuille.domain.port.out.DepotPortefeuille;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adaptateur secondaire JPA pour le port {@link DepotPortefeuille}.
 *
 * <p>Réalise le mapping bidirectionnel entre l'agrégat domaine {@code Portefeuille} et
 * l'entité JPA {@code PortefeuilleEntity}. La référence {@code AbonneIdReference} est
 * convertie en {@code String} pour la persistance et reconstituée à la lecture.
 *
 * @author BANGA Romaric
 */
@Component
public class DepotPortefeuilleJpa implements DepotPortefeuille {

    private final PortefeuilleJpaRepository jpaRepository;

    public DepotPortefeuilleJpa(PortefeuilleJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Portefeuille sauvegarder(Portefeuille portefeuille) {
        PortefeuilleEntity entity = versEntity(portefeuille);
        PortefeuilleEntity entitySauvegardee = jpaRepository.save(entity);
        return versDomaine(entitySauvegardee);
    }

    @Override
    public Optional<Portefeuille> trouverParId(PortefeuilleId id) {
        return jpaRepository.findById(id.valeur())
                .map(this::versDomaine);
    }

    @Override
    public Optional<Portefeuille> trouverParAbonneId(AbonneIdReference abonneId) {
        return jpaRepository.findByAbonneId(abonneId.valeur())
                .map(this::versDomaine);
    }

    @Override
    public boolean existePourAbonne(AbonneIdReference abonneId) {
        return jpaRepository.existsByAbonneId(abonneId.valeur());
    }

    // === Mapping Domain ↔ Entity ===

    private PortefeuilleEntity versEntity(Portefeuille portefeuille) {
        return new PortefeuilleEntity(
                portefeuille.id().valeur(),
                portefeuille.abonneId().valeur(),
                portefeuille.solde().montant(),
                portefeuille.dateCreation()
        );
    }

    private Portefeuille versDomaine(PortefeuilleEntity entity) {
        return new Portefeuille(
                new PortefeuilleId(entity.getId()),
                new AbonneIdReference(entity.getAbonneId()),
                new Argent(entity.getSolde()),
                entity.getDateCreation()
        );
    }
}
