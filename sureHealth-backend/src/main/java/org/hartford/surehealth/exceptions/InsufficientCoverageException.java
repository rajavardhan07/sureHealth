package org.hartford.surehealth.exceptions;

public class InsufficientCoverageException extends RuntimeException {
    public InsufficientCoverageException(String message) {
        super(message);
    }
}
