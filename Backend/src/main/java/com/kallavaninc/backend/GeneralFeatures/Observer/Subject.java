package com.kallavaninc.backend.GeneralFeatures.Observer;

import com.kallavaninc.backend.Entities.Order.Order;

public interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers(Order order, String eventType);
}

