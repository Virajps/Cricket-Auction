package com.auction.cricket.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.auction.cricket.dto.RowError;
import com.auction.cricket.exception.InvalidFileException;

/**
 * Utility class to parse Excel (.xlsx) files into a list of maps keyed by
 * entity field names.
 * Uses header-based mapping: header names are normalized and mapped to target
 * fields.
 */
public class ExcelHelper {

    public static class ParseResult {
        public final List<Map<String, String>> rows = new ArrayList<>();
        public final List<RowError> errors = new ArrayList<>();
    }

    private static final DataFormatter FORMATTER = new DataFormatter();

    /**
     * Parses the first sheet of the given .xlsx InputStream using the provided
     * headerMapping.
     * headerMapping should map normalized header -> entity field name.
     */
    public static ParseResult parse(InputStream is, Map<String, String> headerMapping) {
        Objects.requireNonNull(is, "InputStream cannot be null");
        Objects.requireNonNull(headerMapping, "headerMapping cannot be null");

        ParseResult result = new ParseResult();

        try (Workbook workbook = new XSSFWorkbook(is)) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new InvalidFileException("Excel file contains no sheets");
            }
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new InvalidFileException("Excel file is empty");
            }

            Row headerRow = rowIterator.next();
            Map<Integer, String> colIndexToField = new HashMap<>();

            for (Cell headerCell : headerRow) {
                String rawHeader = FORMATTER.formatCellValue(headerCell);
                String normalized = normalizeHeader(rawHeader);
                if (normalized.isEmpty())
                    continue;
                String mappedField = headerMapping.get(normalized);
                if (mappedField != null) {
                    colIndexToField.put(headerCell.getColumnIndex(), mappedField);
                }
                // unknown columns are simply ignored
            }

            if (colIndexToField.isEmpty()) {
                throw new InvalidFileException(
                        "No recognizable columns found in header. Ensure headers match supported columns.");
            }

            int rowNum = 1; // considering header at row 0, but we will report 1-based row numbers for
                            // readability
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNum++;
                boolean emptyRow = true;
                Map<String, String> rowMap = new HashMap<>();
                for (Map.Entry<Integer, String> entry : colIndexToField.entrySet()) {
                    Cell cell = row.getCell(entry.getKey(), Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String cellValue = cell == null ? "" : FORMATTER.formatCellValue(cell).trim();
                    if (!cellValue.isEmpty())
                        emptyRow = false;
                    rowMap.put(entry.getValue(), cellValue);
                }
                if (emptyRow)
                    continue; // skip empty rows silently

                // Basic validation at parsing layer for required columns presence (but not
                // value format)
                List<String> rowErrors = new ArrayList<>();
                if (!rowMap.containsKey("name") || rowMap.get("name").isEmpty()) {
                    rowErrors.add("Missing required field: name");
                }
                // basePrice is now optional - it will use auction's default if missing

                if (!rowErrors.isEmpty()) {
                    RowError re = new RowError(rowNum, rowErrors);
                    result.errors.add(re);
                    continue; // skip invalid rows
                }

                result.rows.add(rowMap);
            }

        } catch (IOException e) {
            throw new InvalidFileException("Failed to read Excel file", e);
        }

        return result;
    }

    /**
     * Normalizes header by trimming, lowercasing and removing non-alphanumeric
     * chars.
     */
    public static String normalizeHeader(String header) {
        if (header == null)
            return "";
        return header.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}