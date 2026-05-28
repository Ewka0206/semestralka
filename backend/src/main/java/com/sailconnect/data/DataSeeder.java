package com.sailconnect.data;

import com.sailconnect.model.Country;
import com.sailconnect.model.Trip;
import com.sailconnect.model.TripType;
import com.sailconnect.model.TripTypeDef;
import com.sailconnect.repository.CountryRepository;
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
    private final CountryRepository countryRepo;

    public DataSeeder(TripRepository tripRepo, TripTypeDefRepository tripTypeRepo, CountryRepository countryRepo) {
        this.tripRepo = tripRepo;
        this.tripTypeRepo = tripTypeRepo;
        this.countryRepo = countryRepo;
    }

    @Override
    public void run(String... args) {
        if (countryRepo.count() == 0) {
            countryRepo.saveAll(List.of(
                new Country("AF", "Afghánistán"),
                new Country("AL", "Albánie"),
                new Country("DZ", "Alžírsko"),
                new Country("AD", "Andorra"),
                new Country("AO", "Angola"),
                new Country("AG", "Antigua a Barbuda"),
                new Country("AR", "Argentina"),
                new Country("AM", "Arménie"),
                new Country("AU", "Austrálie"),
                new Country("AZ", "Ázerbájdžán"),
                new Country("BS", "Bahamy"),
                new Country("BH", "Bahrajn"),
                new Country("BD", "Bangladéš"),
                new Country("BB", "Barbados"),
                new Country("BE", "Belgie"),
                new Country("BZ", "Belize"),
                new Country("BY", "Bělorusko"),
                new Country("BJ", "Benin"),
                new Country("BO", "Bolívie"),
                new Country("BA", "Bosna a Hercegovina"),
                new Country("BW", "Botswana"),
                new Country("BR", "Brazílie"),
                new Country("BN", "Brunej"),
                new Country("BG", "Bulharsko"),
                new Country("BF", "Burkina Faso"),
                new Country("BI", "Burundi"),
                new Country("CL", "Chile"),
                new Country("HR", "Chorvatsko"),
                new Country("CY", "Kypr"),
                new Country("TD", "Čad"),
                new Country("ME", "Černá Hora"),
                new Country("CZ", "Česká republika"),
                new Country("CN", "Čína"),
                new Country("DK", "Dánsko"),
                new Country("CD", "Demokratická republika Kongo"),
                new Country("DO", "Dominikánská republika"),
                new Country("DM", "Dominika"),
                new Country("DJ", "Džibutsko"),
                new Country("EG", "Egypt"),
                new Country("EC", "Ekvádor"),
                new Country("ER", "Eritrea"),
                new Country("EE", "Estonsko"),
                new Country("ET", "Etiopie"),
                new Country("FJ", "Fidži"),
                new Country("PH", "Filipíny"),
                new Country("FI", "Finsko"),
                new Country("FR", "Francie"),
                new Country("GA", "Gabon"),
                new Country("GM", "Gambie"),
                new Country("GH", "Ghana"),
                new Country("GD", "Grenada"),
                new Country("GE", "Gruzie"),
                new Country("GT", "Guatemala"),
                new Country("GN", "Guinea"),
                new Country("GW", "Guinea-Bissau"),
                new Country("GY", "Guyana"),
                new Country("HT", "Haiti"),
                new Country("HN", "Honduras"),
                new Country("IN", "Indie"),
                new Country("ID", "Indonésie"),
                new Country("IQ", "Irák"),
                new Country("IR", "Írán"),
                new Country("IE", "Irsko"),
                new Country("IS", "Island"),
                new Country("IT", "Itálie"),
                new Country("IL", "Izrael"),
                new Country("JM", "Jamajka"),
                new Country("JP", "Japonsko"),
                new Country("YE", "Jemen"),
                new Country("JO", "Jordánsko"),
                new Country("ZA", "Jihoafrická republika"),
                new Country("SS", "Jižní Súdán"),
                new Country("KH", "Kambodža"),
                new Country("CM", "Kamerun"),
                new Country("CA", "Kanada"),
                new Country("CV", "Kapverdy"),
                new Country("QA", "Katar"),
                new Country("KZ", "Kazachstán"),
                new Country("KE", "Keňa"),
                new Country("KI", "Kiribati"),
                new Country("CO", "Kolumbie"),
                new Country("KM", "Komory"),
                new Country("CG", "Kongo"),
                new Country("KP", "Korejská lidově demokratická republika"),
                new Country("KR", "Korejská republika"),
                new Country("XK", "Kosovo"),
                new Country("CR", "Kostarika"),
                new Country("CU", "Kuba"),
                new Country("KW", "Kuvajt"),
                new Country("LA", "Laos"),
                new Country("LS", "Lesotho"),
                new Country("LB", "Libanon"),
                new Country("LR", "Libérie"),
                new Country("LY", "Libye"),
                new Country("LI", "Lichtenštejnsko"),
                new Country("LT", "Litva"),
                new Country("LV", "Lotyšsko"),
                new Country("LU", "Lucembursko"),
                new Country("MK", "Severní Makedonie"),
                new Country("MG", "Madagaskar"),
                new Country("HU", "Maďarsko"),
                new Country("MY", "Malajsie"),
                new Country("MW", "Malawi"),
                new Country("MV", "Maledivy"),
                new Country("ML", "Mali"),
                new Country("MT", "Malta"),
                new Country("MA", "Maroko"),
                new Country("MH", "Marshallovy ostrovy"),
                new Country("MR", "Mauritánie"),
                new Country("MU", "Mauricius"),
                new Country("MX", "Mexiko"),
                new Country("FM", "Mikronésie"),
                new Country("MD", "Moldavsko"),
                new Country("MC", "Monako"),
                new Country("MN", "Mongolsko"),
                new Country("MZ", "Mosambik"),
                new Country("MM", "Myanmar"),
                new Country("NA", "Namibie"),
                new Country("NR", "Nauru"),
                new Country("DE", "Německo"),
                new Country("NP", "Nepál"),
                new Country("NE", "Niger"),
                new Country("NG", "Nigérie"),
                new Country("NI", "Nikaragua"),
                new Country("NO", "Norsko"),
                new Country("NZ", "Nový Zéland"),
                new Country("OM", "Omán"),
                new Country("PK", "Pákistán"),
                new Country("PW", "Palau"),
                new Country("PS", "Palestina"),
                new Country("PA", "Panama"),
                new Country("PG", "Papua Nová Guinea"),
                new Country("PY", "Paraguay"),
                new Country("PE", "Peru"),
                new Country("PL", "Polsko"),
                new Country("PT", "Portugalsko"),
                new Country("AT", "Rakousko"),
                new Country("GQ", "Rovníková Guinea"),
                new Country("RO", "Rumunsko"),
                new Country("RW", "Rwanda"),
                new Country("RU", "Rusko"),
                new Country("SB", "Šalamounovy ostrovy"),
                new Country("WS", "Samoa"),
                new Country("SM", "San Marino"),
                new Country("ST", "Svatý Tomáš a Princův ostrov"),
                new Country("SA", "Saúdská Arábie"),
                new Country("SN", "Senegal"),
                new Country("KN", "Svatý Kryštof a Nevis"),
                new Country("LC", "Svatá Lucie"),
                new Country("VC", "Svatý Vincenc a Grenadiny"),
                new Country("SC", "Seychely"),
                new Country("SL", "Sierra Leone"),
                new Country("SG", "Singapur"),
                new Country("SK", "Slovensko"),
                new Country("SI", "Slovinsko"),
                new Country("SO", "Somálsko"),
                new Country("RS", "Srbsko"),
                new Country("LK", "Srí Lanka"),
                new Country("CF", "Středoafrická republika"),
                new Country("SD", "Súdán"),
                new Country("SR", "Surinam"),
                new Country("SZ", "Svazijsko"),
                new Country("SY", "Sýrie"),
                new Country("ES", "Španělsko"),
                new Country("SE", "Švédsko"),
                new Country("CH", "Švýcarsko"),
                new Country("TJ", "Tádžikistán"),
                new Country("TZ", "Tanzanie"),
                new Country("TH", "Thajsko"),
                new Country("TW", "Tchaj-wan"),
                new Country("TL", "Východní Timor"),
                new Country("TG", "Togo"),
                new Country("TO", "Tonga"),
                new Country("TT", "Trinidad a Tobago"),
                new Country("TN", "Tunisko"),
                new Country("TR", "Turecko"),
                new Country("TM", "Turkmenistán"),
                new Country("TV", "Tuvalu"),
                new Country("UG", "Uganda"),
                new Country("UA", "Ukrajina"),
                new Country("UY", "Uruguay"),
                new Country("UZ", "Uzbekistán"),
                new Country("VU", "Vanuatu"),
                new Country("VA", "Vatikán"),
                new Country("VE", "Venezuela"),
                new Country("VN", "Vietnam"),
                new Country("GB", "Velká Británie"),
                new Country("US", "USA"),
                new Country("ZM", "Zambie"),
                new Country("ZW", "Zimbabwe")
            ));
        }

        if (tripTypeRepo.count() == 0) {
            tripTypeRepo.saveAll(List.of(
                new TripTypeDef("Training", "Trénink dovedností"),
                new TripTypeDef("Adventure", "Dobrodružství"),
                new TripTypeDef("Relax", "Rekreační plavba")
            ));
        }

        if (tripRepo.count() > 0) return;

        tripRepo.saveAll(List.of(

            trip("korfu-2026-06",
                "Korfu – start léta v azurových zátokách",
                "/images/trips/zapad_slunce_plaz_800.webp", "Korfu", "Řecko",
                TripType.RELAX, "2026-06-06", "2026-06-13", 17000, 8, 3,
                List.of("4 kajuty", "V ceně loď + kapitán", "Ideální na rozjezd sezóny"),
                "Týdenní pohodová plavba po Korfu a okolních zátokách."),

            trip("saronic-2026-05",
                "Saronský záliv – plachetní trénink a manévry",
                "/images/trips/sailing_800.webp", "Saronský záliv", "Řecko",
                TripType.TRAINING, "2026-05-16", "2026-05-23", 16500, 10, 7,
                List.of("Kotvení a manévry", "Trim plachet", "Rychlé přesuny mezi ostrovy"),
                "Tréninková plavba zaměřená na manévry, trim a praktickou plavbu."),

            trip("stockholm-2026-07",
                "Stockholmské souostroví – severské dobrodružství",
                "/images/trips/lod_u_skaly_v_zatoce_800.webp", "Stockholmské souostroví", "Švédsko",
                TripType.ADVENTURE, "2026-07-04", "2026-07-11", 19000, 8, 2,
                List.of("Skerries a zátoky", "Sauna vibes", "Dlouhé dny a světlo"),
                "Severské souostroví, dlouhé dny, krásné kotviště a dobrodružství."),

            trip("kanary-2026-03",
                "Kanárské ostrovy – zimní útěk na moře",
                "/images/trips/kanary_800.webp", "Gran Canaria", "Španělsko",
                TripType.RELAX, "2026-03-07", "2026-03-14", 21000, 8, 5,
                List.of("Teplé moře v březnu", "Pasátový vítr", "Fuerteventura a Lanzarote"),
                "Únorový útěk před zimou – pasáty, teplé vody a krásné kotviště."),

            trip("dubrovnik-2026-08",
                "Dalmácie – ostrovy a středověká města",
                "/images/trips/epidauros_800.webp", "Dubrovník", "Chorvatsko",
                TripType.RELAX, "2026-08-01", "2026-08-08", 18500, 10, 4,
                List.of("Hvar a Korčula", "Plávání ve skrytých zátokách", "Lokální víno a mořské plody"),
                "Plavba podél dalmatského pobřeží s návštěvou nejkrásnějších ostrovů."),

            trip("skotsko-2026-07",
                "Skotsko – divoké pobřeží a whisky plavba",
                "/images/trips/Skotsko_zatoka_Tarbert_800.webp", "Tarbert", "Skotsko",
                TripType.ADVENTURE, "2026-07-18", "2026-07-25", 22000, 6, 1,
                List.of("Zátoky a fjordy", "Ochutnávka skotské whisky", "Plavba za tuleňů a delfíny"),
                "Divoké skotské pobřeží plné záhad, mlhy a nezapomenutelných zážitků."),

            trip("montenegro-2026-09",
                "Černá Hora – skryté zátoky Jadranu",
                "/images/trips/sami_v_zatoce_800.webp", "Kotor", "Černá Hora",
                TripType.RELAX, "2026-09-06", "2026-09-13", 15500, 8, 6,
                List.of("Bokelský záliv", "Stará města UNESCO", "Klidné září bez turistů"),
                "Plavba po méně navštívené části Jadranu s nádhernou přírodou a historií."),

            trip("azory-2026-05",
                "Azory – atlantická odysea uprostřed oceánu",
                "/images/trips/sailing_800.webp", "Ponta Delgada", "Portugaltsko",
                TripType.ADVENTURE, "2026-05-02", "2026-05-16", 28000, 6, 2,
                List.of("Přeplavy mezi ostrovy", "Velryby a delfíni", "Vulkanická krajina"),
                "Dvoutýdenní plavba Azorskými ostrovy – divočina, oceán a sopky."),

            trip("finsko-2026-06",
                "Finské souostroví – 1000 ostrovů na dosah",
                "/images/trips/zatoka_Karingsund_800.webp", "Turku", "Finsko",
                TripType.ADVENTURE, "2026-06-20", "2026-06-27", 20000, 8, 3,
                List.of("Bílé noci", "Tradiční sauny na ostrovech", "Klid a příroda"),
                "Létání mezi tisíci ostrovy finského souostroví za bílých nocí."),

            trip("maldives-2026-02",
                "Maledivy – luxusní plavba v Indickém oceánu",
                "/images/trips/zapad_slunce_plaz_800.webp", "Malé", "Maledivy",
                TripType.RELAX, "2026-02-14", "2026-02-21", 45000, 6, 0,
                List.of("Snorkeling na korálovém útesu", "Západ slunce na palubě", "Luxusní katamaran"),
                "Romantická plavba pro milovníky moře a exotické přírody."),

            trip("baleary-2026-07",
                "Baleárské ostrovy – Ibiza, Mallorca a Formentera",
                "/images/trips/marina_LasGaletas_800.webp", "Palma de Mallorca", "Španělsko",
                TripType.RELAX, "2026-07-12", "2026-07-19", 23000, 10, 7,
                List.of("Party i relax podle nálady", "Krystalicky čistá voda", "Formentera – pláže jako z Karibiku"),
                "Plavba po nejkrásnějších baleárských ostrovech v srdci léta."),

            trip("norsko-2026-08",
                "Norské fjordy – majestátní příroda severu",
                "/images/trips/lod_u_skaly_v_zatoce_800.webp", "Bergen", "Norsko",
                TripType.ADVENTURE, "2026-08-09", "2026-08-16", 26000, 6, 2,
                List.of("Geirangerfjord a Nærøyfjord", "Vodopády přímo z vody", "Tradiční rybářské vesničky"),
                "Nezapomenutelná plavba norskými fjordy – přírodou, která bere dech."),

            trip("kreta-2026-05",
                "Kréta – mýty, história a Egejské moře",
                "/images/trips/epidauros_800.webp", "Heraklion", "Řecko",
                TripType.TRAINING, "2026-05-23", "2026-05-30", 15000, 10, 5,
                List.of("Navigace bez GPS jako trénink", "Minojská civilizace", "Víno a olivový olej"),
                "Tréninková plavba s historickými zastávkami kolem největšího řeckého ostrova."),

            trip("turecko-2026-09",
                "Turecká riviéra – tyrkysová pobřeží",
                "/images/trips/sami_v_zatoce_800.webp", "Bodrum", "Turecko",
                TripType.RELAX, "2026-09-13", "2026-09-20", 17500, 8, 3,
                List.of("Guletová atmosféra", "Antická ruiniště u vody", "Čerstvé ryby každý den"),
                "Pohodlná plavba podél tureckého pobřeží plného zátoček a antické histórie."),

            trip("sicilie-2026-06",
                "Sicílie a Liparské ostrovy – sopky v moři",
                "/images/trips/kanary_800.webp", "Palermo", "Itálie",
                TripType.ADVENTURE, "2026-06-27", "2026-07-04", 19500, 8, 4,
                List.of("Stromboli – aktivní sopka", "Aeolské ostrovy", "Sicilská kuchyně"),
                "Plavba kolem sicilského pobřeží a návštěva aktivní sopky Stromboli."),

            trip("bretagne-2026-08",
                "Bretaň – atlantické vlny a plody moře",
                "/images/trips/Skotsko_zatoka_Tarbert_800.webp", "Brest", "Francie",
                TripType.TRAINING, "2026-08-22", "2026-08-29", 18000, 8, 1,
                List.of("Oceánská plavba s vlnami", "Mlhy a majáky", "Humři a ústřice v přístavu"),
                "Náročnější tréninková plavba v Atlantiku – skvělá příprava na otevřené moře."),

            trip("kapverdy-2026-11",
                "Kapverdské ostrovy – africký rytmus na vlnách",
                "/images/trips/marina_LasGaletas_800.webp", "Mindelo", "Kapverdy",
                TripType.ADVENTURE, "2026-11-01", "2026-11-15", 32000, 6, 0,
                List.of("Pasátový vítr ideální pro plachtění", "Místní hudba a kultura", "Žraloci velrybí"),
                "Dvoutýdenní plavba karibskými bratrankyněmi – africká duše s atlantickým větrem."),

            trip("malta-2026-04",
                "Malta a Gozo – rytíři, modré laguny a historie",
                "/images/trips/zapad_slunce_plaz_800.webp", "Valletta", "Malta",
                TripType.RELAX, "2026-04-18", "2026-04-25", 16000, 8, 5,
                List.of("Modrá laguna na Cominu", "Středověká Valletta", "Potápění ve vraku"),
                "Jarní plavba kolem maltského souostroví – história, příroda a křišťálové moře."),

            trip("polska-2026-07",
                "Mazurská jezera – plachetnice v srdci Polska",
                "/images/trips/zatoka_Karingsund_800.webp", "Giżycko", "Polsko",
                TripType.TRAINING, "2026-07-26", "2026-08-02", 9500, 10, 6,
                List.of("Ideální pro začátečníky", "Jezera propojená kanály", "Kemping na břehu"),
                "Dostupná jezerní plavba – skvělý start pro ty, kteří s plachtěním teprve začínají."),

            trip("jadran-2026-06",
                "Istrie – perla severního Jadranu",
                "/images/trips/sailing_800.webp", "Pula", "Chorvatsko",
                TripType.RELAX, "2026-06-13", "2026-06-20", 14500, 8, 2,
                List.of("Antický amfiteátr v Pule", "Rovinj a Poreč", "Svěží červnové moře"),
                "Klidná plavba kolem istrského poloostrova – dostupná cena, krásná příroda.")
        ));
    }

    private Trip trip(String id, String title, String imageUrl,
                      String location, String country, TripType type,
                      String startDate, String endDate,
                      int priceCzk, int capacity, int booked,
                      List<String> highlights, String description) {
        Trip t = new Trip();
        t.setId(id);
        t.setTitle(title);
        t.setImageUrl(imageUrl);
        t.setLocation(location);
        t.setCountry(country);
        t.setType(type);
        t.setStartDate(startDate);
        t.setEndDate(endDate);
        t.setPriceCzk(priceCzk);
        t.setCapacity(capacity);
        t.setBooked(booked);
        t.setSkipperIncluded(true);
        t.setHighlights(highlights);
        t.setDescription(description);
        return t;
    }
}
