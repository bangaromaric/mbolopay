package ga.banga.mbolopay.identite.domain.service;

import ga.banga.mbolopay.identite.domain.model.vo.NumeroTelephoneGabonais;

/**
 * Service de domaine portant les règles métier de validation d'un abonné.
 *
 * <p>POJO pur sans dépendance framework — contient uniquement de la logique métier.
 *
 * @author BANGA Romaric
 */
public class ServiceValidationAbonne {

    /**
     * Vérifie si un numéro est autorisé (règle métier pure).
     * Les numéros commençant par +24177 sont réservés/sur liste noire.
     *
     * @param numero le numéro à valider
     * @return true si le numéro est autorisé
     */
    public boolean estNumeroAutorise(NumeroTelephoneGabonais numero) {
        return !numero.versFormatInternational().startsWith("+24177");
    }
}
