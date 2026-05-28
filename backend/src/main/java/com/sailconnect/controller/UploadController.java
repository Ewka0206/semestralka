package com.sailconnect.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Tag(name = "Upload", description = "Nahrávání obrázků")
@SecurityRequirement(name = "bearerAuth")
public class UploadController {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "webp");

    @Value("${upload.dir}")
    private String uploadDir;

    @Operation(
        summary     = "Nahrání obrázku",
        description = "Přijme soubor formátu jpg, png nebo webp (max 10 MB). "
                    + "Vrátí URL uloženého souboru (relativní cesta přístupná z frontendu)."
    )
    @ApiResponse(responseCode = "200", description = "Soubor nahrán – vrátí { \"url\": \"/images/uploads/...\" }")
    @ApiResponse(responseCode = "400", description = "Nepodporovaný formát souboru")
    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String ext = original.contains(".")
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase()
                : "";

        if (!ALLOWED.contains(ext)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Povolené formáty: jpg, png, webp"));
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + "." + ext;
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(Map.of("url", "/images/uploads/" + filename));
    }
}
