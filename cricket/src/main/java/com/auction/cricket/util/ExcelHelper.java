package com.auction.cricket.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.auction.cricket.dto.RowError;

public final class ExcelHelper {
    private ExcelHelper() {
    }

    public static class ParseResult {
        public final List<Map<String, String>> rows = new ArrayList<>();
        public final List<RowError> errors = new ArrayList<>();
    }

    public static String normalizeHeader(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase().replaceAll("[^a-z0-9]+", "");
    }

    public static ParseResult parse(InputStream inputStream, Map<String, String> headerMappingNormalized) throws IOException {
        ParseResult result = new ParseResult();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                result.errors.add(new RowError(1, List.of("No worksheet found in workbook")));
                return result;
            }

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                result.errors.add(new RowError(1, List.of("Header row is missing")));
                return result;
            }

            Map<Integer, String> indexToField = new HashMap<>();
            short firstCell = headerRow.getFirstCellNum();
            short lastCell = headerRow.getLastCellNum();
            for (int c = Math.max(0, firstCell); c < Math.max(0, lastCell); c++) {
                Cell cell = headerRow.getCell(c);
                String header = normalizeHeader(formatter.formatCellValue(cell));
                if (header.isEmpty()) {
                    continue;
                }
                String canonicalField = headerMappingNormalized.get(header);
                if (canonicalField != null) {
                    indexToField.put(c, canonicalField);
                }
            }

            if (!indexToField.containsValue("name")) {
                result.errors.add(new RowError(1, List.of("Missing required header: name")));
            }

            int lastRow = sheet.getLastRowNum();
            for (int r = 1; r <= lastRow; r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }

                Map<String, String> parsedRow = new HashMap<>();
                boolean hasData = false;
                for (Map.Entry<Integer, String> entry : indexToField.entrySet()) {
                    String raw = formatter.formatCellValue(row.getCell(entry.getKey()));
                    if (raw != null && !raw.trim().isEmpty()) {
                        hasData = true;
                    }
                    parsedRow.put(entry.getValue(), raw);
                }
                if (hasData) {
                    result.rows.add(parsedRow);
                }
            }
        }

        return result;
    }
}
