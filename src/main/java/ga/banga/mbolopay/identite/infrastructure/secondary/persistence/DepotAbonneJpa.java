package ga.banga.mbolopay.identite.infrastructure.secondary.persistence;

import ga.banga.mbolopay.identite.domain.model.Abonne;
import ga.banga.mbolopay.identite.domain.model.AbonneId;
import ga.banga.mbolopay.identite.domain.model.vo.NomGabonais;
import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;
import ga.banga.mbolopay.identite.domain.port.out.DepotAbonne;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adaptateur secondaire JPA pour le port {@link DepotAbonne}.
 *
 * <p>Réalise le mapping bidirectionnel entre l'agrégat domaine {@code Abonne} et
 * l'entité JPA {@code AbonneEntity}, de sorte que le domaine reste totalement
 * découplé de la persistance.
 *
 * @author BANGA Romaric
 */
@Component
public class DepotAbonneJpa implements DepotAbonne {

    private final AbonneJpaRepository jpaRepository;

    public DepotAbonneJpa(AbonneJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Abonne sauvegarder(Abonne abonne) {
        AbonneEntity entity = versEntity(abonne);
        AbonneEntity entitySauvegardee = jpaRepository.save(entity);
        return versDomaine(entitySauvegardee);
    }

    @Override
    public Optional<Abonne> trouverParId(AbonneId id) {
        return jpaRepository.findById(id.valeur())
                .map(this::versDomaine);

    }

    @Override
    public Optional<Abonne> trouverParNumero(NumeroTelephoneGabonais numero) {
        return jpaRepository.findByNumeroTelephone(numero.valeur())
                .map(this::versDomaine);

    }

    @Override
    public boolean existeParNumero(NumeroTelephoneGabonais numero) {
        return jpaRepository.existsByNumeroTelephone(numero.valeur());
    }

    // === Mapping Domain ↔ Entity ===

    private AbonneEntity versEntity(Abonne abonne) {
        return new AbonneEntity(
                abonne.id().valeur(),
                abonne.nom().prenom(),
                abonne.nom().nom(),
                abonne.numeroTelephone().valeur(),
                abonne.dateInscription(),
                abonne.estActif()
        );
    }

    private Abonne versDomaine(AbonneEntity entity) {
        return new Abonne(
                new AbonneId(entity.getId()),
                new NomGabonais(entity.getPrenom(), entity.getNom()),
                new NumeroTelephoneGabonais(entity.getNumeroTelephone()),
                entity.getDateInscription(),
                entity.isActif()
        );
    }
}
