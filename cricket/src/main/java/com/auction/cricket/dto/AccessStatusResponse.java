package com.auction.cricket.dto;

public class AccessStatusResponse {
    private boolean admin;
    private boolean fullAccessActive;
    private boolean auctionAccessActive;
    private boolean premiumAccessActive;

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public boolean isFullAccessActive() {
        return fullAccessActive;
    }

    public void setFullAccessActive(boolean fullAccessActive) {
        this.fullAccessActive = fullAccessActive;
    }

    public boolean isAuctionAccessActive() {
        return auctionAccessActive;
    }

    public void setAuctionAccessActive(boolean auctionAccessActive) {
        this.auctionAccessActive = auctionAccessActive;
    }

    public boolean isPremiumAccessActive() {
        return premiumAccessActive;
    }

    public void setPremiumAccessActive(boolean premiumAccessActive) {
        this.premiumAccessActive = premiumAccessActive;
    }
}
