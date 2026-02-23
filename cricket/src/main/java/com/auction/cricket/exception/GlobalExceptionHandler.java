package com.auction.cricket.exception;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private Map<String, Object> baseBody(String error, String message, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", (message == null || message.isBlank()) ? "An unexpected error occurred." : message);
        if (request != null) {
            body.put("path", request.getDescription(false).replace("uri=", ""));
        }
        return body;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        return new ResponseEntity<>(
                baseBody("Resource Not Found", ex.getMessage(), HttpStatus.NOT_FOUND, request),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        String summary = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Request validation failed.");
        Map<String, Object> body = baseBody("Validation Failed", summary, HttpStatus.BAD_REQUEST, request);
        body.put("details", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        logger.warn("Bad request: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(
                baseBody("Bad Request", ex.getMessage(), HttpStatus.BAD_REQUEST, request),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex, WebRequest request) {
        return new ResponseEntity<>(
                baseBody("Forbidden", ex.getMessage(), HttpStatus.FORBIDDEN, request),
                HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        logger.error("Data integrity violation", ex);
        Map<String, Object> body = baseBody(
                "Data Integrity Violation",
                "Cannot complete request due to related records. Delete dependent data first.",
                HttpStatus.BAD_REQUEST,
                request);
        body.put("details", ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(com.auction.cricket.exception.InvalidFileException.class)
    public ResponseEntity<?> handleInvalidFile(com.auction.cricket.exception.InvalidFileException ex, WebRequest request) {
        return new ResponseEntity<>(
                baseBody("Invalid File", ex.getMessage(), HttpStatus.BAD_REQUEST, request),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(com.auction.cricket.exception.ImportProcessingException.class)
    public ResponseEntity<?> handleImportProcessing(com.auction.cricket.exception.ImportProcessingException ex, WebRequest request) {
        return new ResponseEntity<>(
                baseBody("Import Processing Error", ex.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY, request),
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex, WebRequest request) {
        logger.error("Unhandled runtime exception", ex);
        return new ResponseEntity<>(
                baseBody("Internal Server Error", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex, WebRequest request) {
        logger.error("Unhandled exception", ex);
        return new ResponseEntity<>(
                baseBody("Unexpected Error", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
