package com.auction.cricket.exception;

public class ImportProcessingException extends RuntimeException {
    public ImportProcessingException(String message) {
        super(message);
    }

    public ImportProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}