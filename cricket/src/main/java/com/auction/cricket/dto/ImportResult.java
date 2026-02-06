package com.auction.cricket.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportResult {
    private int totalRows;
    private int successfulRows;
    private List<RowError> failedRows = new ArrayList<>();

    public ImportResult() {
    }

    public ImportResult(int totalRows, int successfulRows, List<RowError> failedRows) {
        this.totalRows = totalRows;
        this.successfulRows = successfulRows;
        this.failedRows = failedRows;
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getSuccessfulRows() {
        return successfulRows;
    }

    public void setSuccessfulRows(int successfulRows) {
        this.successfulRows = successfulRows;
    }

    public List<RowError> getFailedRows() {
        return failedRows;
    }

    public void setFailedRows(List<RowError> failedRows) {
        this.failedRows = failedRows;
    }
}