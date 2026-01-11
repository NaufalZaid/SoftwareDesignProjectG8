package com.kallavaninc.backend.Observer;

import com.kallavaninc.backend.Entities.Order.Order;

public interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers(Order order);
}

