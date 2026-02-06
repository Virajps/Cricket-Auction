package com.auction.cricket.dto;

import java.util.ArrayList;
import java.util.List;

public class RowError {
    private int rowNumber;
    private List<String> errors = new ArrayList<>();

    public RowError() {
    }

    public RowError(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public RowError(int rowNumber, List<String> errors) {
        this.rowNumber = rowNumber;
        this.errors = errors;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public void addError(String error) {
        this.errors.add(error);
    }
}