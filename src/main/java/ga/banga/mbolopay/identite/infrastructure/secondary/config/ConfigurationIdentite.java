package ga.banga.mbolopay.identite.infrastructure.secondary.config;

import ga.banga.mbolopay.identite.domain.service.ServiceValidationAbonne;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Spring pour le module Identité.
 *
 * <p>Câble les POJO de domaine non auto-scannables (ex. {@link ServiceValidationAbonne}).
 * Les cas d'usage sont fournis par les décorateurs transactionnels Spring placés dans
 * {@code infrastructure/secondary/transaction/}.
 *
 * <p>Localisée dans {@code infrastructure/secondary/config/} car le wiring Spring est une
 * préoccupation technique sortante — conforme à la spec « infrastructure = primary + secondary ».
 *
 * @author BANGA Romaric
 */
@Configuration
public class ConfigurationIdentite {

    /**
     * Bean du service de validation des abonnés (POJO domaine, sans annotation Spring).
     *
     * @return instance de {@link ServiceValidationAbonne}
     */
    @Bean
    public ServiceValidationAbonne serviceValidationAbonne() {
        return new ServiceValidationAbonne();
    }
}
