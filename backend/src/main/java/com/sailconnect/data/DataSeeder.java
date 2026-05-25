package com.sailconnect.data;

import com.sailconnect.model.Trip;
import com.sailconnect.model.TripType;
import com.sailconnect.model.TripTypeDef;
import com.sailconnect.repository.TripRepository;
import com.sailconnect.repository.TripTypeDefRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Naplní databázi výchozími daty, pokud je prázdná. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final TripRepository tripRepo;
    private final TripTypeDefRepository tripTypeRepo;

    public DataSeeder(TripRepository tripRepo, TripTypeDefRepository tripTypeRepo) {
        this.tripRepo = tripRepo;
        this.tripTypeRepo = tripTypeRepo;
    }

    @Override
    public void run(String... args) {
        if (tripTypeRepo.count() == 0) {
            tripTypeRepo.saveAll(List.of(
                new TripTypeDef("Training", "Trénink dovedností"),
                new TripTypeDef("Adventure", "Dobrodružství"),
                new TripTypeDef("Relax", "Rekreační plavba")
            ));
        }

        if (tripRepo.count() > 0) return;

        Trip korfu = new Trip();
        korfu.setId("korfu-2026-06");
        korfu.setTitle("Korfu – start léta v azurových zátokách");
        korfu.setImageUrl("/images/trips/zapad_slunce_plaz");
        korfu.setLocation("Korfu");
        korfu.setCountry("Řecko");
        korfu.setType(TripType.RELAX);
        korfu.setStartDate("2026-06-06");
        korfu.setEndDate("2026-06-13");
        korfu.setPriceCzk(17000);
        korfu.setCapacity(8);
        korfu.setBooked(3);
        korfu.setSkipperIncluded(true);
        korfu.setHighlights(List.of("4 kajuty", "V ceně loď + kapitán", "Ideální na rozjezd sezóny"));
        korfu.setDescription("Týdenní pohodová plavba po Korfu a okolních zátokách.");

        Trip saronic = new Trip();
        saronic.setId("saronic-2026-05");
        saronic.setTitle("Saronský záliv – plachetní trénink a manévry");
        saronic.setImageUrl("/images/trips/sailing");
        saronic.setLocation("Saronský záliv");
        saronic.setCountry("Řecko");
        saronic.setType(TripType.TRAINING);
        saronic.setStartDate("2026-05-16");
        saronic.setEndDate("2026-05-23");
        saronic.setPriceCzk(16500);
        saronic.setCapacity(10);
        saronic.setBooked(7);
        saronic.setSkipperIncluded(true);
        saronic.setHighlights(List.of("Kotvení a manévry", "Trim plachet", "Rychlé přesuny mezi ostrovy"));
        saronic.setDescription("Tréninková plavba zaměřená na manévry, trim a praktickou plavbu.");

        Trip stockholm = new Trip();
        stockholm.setId("stockholm-2026-07");
        stockholm.setTitle("Stockholmské souostroví – severské dobrodružství");
        stockholm.setImageUrl("/images/trips/lod_u_skaly_v_zatoce");
        stockholm.setLocation("Stockholmské souostroví");
        stockholm.setCountry("Švédsko");
        stockholm.setType(TripType.ADVENTURE);
        stockholm.setStartDate("2026-07-04");
        stockholm.setEndDate("2026-07-11");
        stockholm.setPriceCzk(19000);
        stockholm.setCapacity(8);
        stockholm.setBooked(2);
        stockholm.setSkipperIncluded(true);
        stockholm.setHighlights(List.of("Skerries a zátoky", "Sauna vibes", "Dlouhé dny a světlo"));
        stockholm.setDescription("Severské souostroví, dlouhé dny, krásné kotviště a dobrodružství.");

        tripRepo.saveAll(List.of(korfu, saronic, stockholm));
    }
}
